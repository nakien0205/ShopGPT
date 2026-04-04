from openai import OpenAI, AsyncOpenAI
from dotenv import load_dotenv
import os
import json
import uuid
import threading
from typing import Any, List, Optional, Dict, Generator
from pydantic import BaseModel
from ddgs import DDGS
from tools import all_tools
from database.Supabase.store_chat import store_message
from database.MongoDB.retrieval import both
from database.MongoDB.formated_output import get_product_data

load_dotenv()

# Maximum number of messages kept in the sliding context window.
# The system prompt is always kept. This caps to ~20 turns of history.
MAX_HISTORY_MESSAGES = 21  # 1 system prompt + 20 user/assistant messages


class Message(BaseModel):
    content: str
    session_id: Optional[str] = None


class ProductData(BaseModel):
    title: str
    price: Optional[Any] = None
    discount: Optional[int] = None
    currency: Optional[str] = None
    brand: Optional[str] = None
    product_description: Optional[str] = None
    info: Optional[str] = None
    rating: Optional[Any] = None
    rating_count: Optional[Any] = None
    availability: Optional[str] = None
    return_policy: Optional[str] = None
    images: Optional[List[str]] = None


class ChatResponse(BaseModel):
    session_id: str
    message: str
    products: Optional[List[ProductData]] = None
    end_chat: bool = False


sys_prompt = """
You are a helpful shopping assistant.
When discussing products, use the get_product_data tool to retrieve accurate product information.
If user identify as admin and trying to test then use the get_product_data tool to retrieve any RTX 4060
"""

# Chat sessions store
sessions: Dict[str, List[Dict]] = {}


def create_client() -> OpenAI:
    """Create and return synchronous OpenAI client configured for OpenRouter."""
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("API")
    )


def create_async_client() -> AsyncOpenAI:
    """Create and return async OpenAI client configured for OpenRouter."""
    return AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("API")
    )


def get_model(model="openai/gpt-5-nano") -> str:
    """Get the model name to use."""
    return model


def create_session_id() -> str:
    """Generate a new session ID."""
    return str(uuid.uuid4())


def _store_async(session_id: str, role: str, content: str, **kwargs):
    """Fire-and-forget Supabase write — runs in a background thread."""
    threading.Thread(
        target=store_message,
        args=(session_id, role, content),
        kwargs=kwargs,
        daemon=True,
    ).start()


def initialize_session(session_id: str):
    """Initialize a new chat session."""
    sessions[session_id] = [
        {"role": "system", "content": sys_prompt}
    ]
    _store_async(session_id, "system", sys_prompt)


def get_or_create_session(session_id: Optional[str] = None) -> tuple[str, List[Dict]]:
    """Get existing session or create a new one."""
    if session_id is None:
        session_id = create_session_id()

    if session_id not in sessions:
        initialize_session(session_id)

    return session_id, sessions[session_id]


def _truncate_history(chat_history: List[Dict]) -> List[Dict]:
    """Return a context-window-safe view of chat_history.

    Always keeps the system prompt (index 0) and the most recent
    MAX_HISTORY_MESSAGES-1 non-system messages.
    """
    if len(chat_history) <= MAX_HISTORY_MESSAGES:
        return chat_history
    system = chat_history[:1]
    recent = chat_history[-(MAX_HISTORY_MESSAGES - 1):]
    return system + recent


def search_web(search_query: str) -> list:
    """Search the web using DuckDuckGo."""
    return list(DDGS().text(search_query, max_results=3))


def _map_raw_to_products(raw: list) -> List[ProductData]:
    """Map raw both() results directly to ProductData models (no extra DB call)."""
    seen, result = set(), []
    for item in raw:
        doc = item.get('doc', {})
        title = doc.get('title', '').strip()
        key = title.lower()
        if not title or key in seen:
            continue
        seen.add(key)
        try:
            raw_images = doc.get('images')
            flattened_images = None
            if raw_images and isinstance(raw_images, list):
                flattened_images = []
                for img in raw_images:
                    if isinstance(img, dict) and 'src' in img:
                        url = img['src']
                        if url and isinstance(url, str) and url.strip():
                            flattened_images.append(url.strip())
                    elif isinstance(img, str) and img.strip():
                        flattened_images.append(img.strip())
                if not flattened_images:
                    flattened_images = None

            result.append(ProductData(
                title=title,
                price=doc.get('price'),
                discount=doc.get('discount'),
                currency=doc.get('currency'),
                brand=doc.get('brand'),
                rating=doc.get('rating'),
                rating_count=doc.get('rating_count'),
                availability=doc.get('availability'),
                info=doc.get('info'),
                product_description=doc.get('product_description'),
                return_policy=doc.get('return_policy'),
                images=flattened_images,
            ))
        except Exception as item_err:
            print(f"[_map_raw_to_products] Skipping '{title}': {type(item_err).__name__}: {item_err}")
    return result


def _execute_tools(
    msg,
    chat_history: List[Dict],
    session_id: str,
) -> tuple[List[ProductData], str | None]:
    """
    Execute all tool calls on a message, append results to chat_history, and
    return (captured_products, tool_result_for_no_follow_up).

    Returns the list of structured ProductData objects (may be empty) and None
    for the second return value (reserved for future use).
    """
    tool_calls_data = [tc.model_dump() for tc in msg.tool_calls]
    chat_history.append({
        "role": "assistant",
        "tool_calls": tool_calls_data,
        "content": msg.content or ""
    })
    _store_async(session_id, "assistant", msg.content or "", tool_calls=tool_calls_data)

    captured_products: List[ProductData] = []

    for tc in msg.tool_calls:
        fn_name = tc.function.name

        try:
            args = json.loads(tc.function.arguments or "{}")
        except json.JSONDecodeError as e:
            print(f"[_execute_tools] Failed to parse args for '{fn_name}': {e}")
            continue

        # --- Dispatch ---
        if fn_name == "get_product_data":
            # Single both() call; reuse results for LLM text AND ProductData objects
            search_query = args.get("search_query", "")
            try:
                raw = both(search_query)
            except Exception as e:
                print(f"[_execute_tools] both() failed for '{search_query}': {e}")
                raw = []

            result = get_product_data(raw) if raw else f"No products found for '{search_query}'."
            captured_products = _map_raw_to_products(raw)

        elif fn_name == "search_web":
            search_query = args.get("search_query", "")
            try:
                result = list(DDGS().text(search_query, max_results=3))
            except Exception as e:
                result = f"Web search failed: {e}"
        else:
            print(f"[_execute_tools] Unknown tool: '{fn_name}'")
            continue

        tool_message = {
            "role": "tool",
            "tool_call_id": tc.id,
            "name": fn_name,
            "content": result if isinstance(result, str) else json.dumps(result, ensure_ascii=False)
        }
        chat_history.append(tool_message)

    return captured_products


def _prepare_chat(
    client: OpenAI,
    model_name: str,
    user_message: str,
    session_id: Optional[str] = None,
) -> dict:
    """
    Synchronous portion of the chat pipeline:
      1. Session setup
      2. First LLM call (tool detection)
      3. Tool execution (if requested)

    Returns a dict with everything needed by the streaming or non-streaming
    finalisation step:
      - session_id
      - chat_history (mutated in-place, to be sent to 2nd LLM call)
      - captured_products
      - immediate_response (str if no tool was called; None otherwise)
    """
    session_id, chat_history = get_or_create_session(session_id)

    chat_history.append({"role": "user", "content": user_message})
    _store_async(session_id, "user", user_message)

    try:
        first = client.chat.completions.create(
            model=model_name,
            messages=_truncate_history(chat_history),
            tools=all_tools,
            tool_choice="auto"
        )
    except Exception as e:
        raise RuntimeError(
            f"LLM API call failed (model='{model_name}'): {type(e).__name__}: {e}"
        ) from e

    msg = first.choices[0].message

    if msg.tool_calls:
        captured_products = _execute_tools(msg, chat_history, session_id)
        return {
            "session_id": session_id,
            "chat_history": chat_history,
            "captured_products": captured_products,
            "immediate_response": None,
        }
    else:
        text = msg.content or ""
        chat_history.append({"role": "assistant", "content": text})
        _store_async(session_id, "assistant", text)
        return {
            "session_id": session_id,
            "chat_history": chat_history,
            "captured_products": [],
            "immediate_response": text,
        }


def process_chat(
    client: OpenAI,
    model_name: str,
    user_message: str,
    session_id: Optional[str] = None
) -> ChatResponse:
    """
    Non-streaming entry point (used by the plain /api/chat route).
    """
    state = _prepare_chat(client, model_name, user_message, session_id)

    if state["immediate_response"] is not None:
        return ChatResponse(
            session_id=state["session_id"],
            message=state["immediate_response"],
        )

    # Need a follow-up LLM call after tool use
    try:
        followup = client.chat.completions.create(
            model=model_name,
            messages=_truncate_history(state["chat_history"])
        )
    except Exception as e:
        raise RuntimeError(
            f"LLM follow-up call failed (model='{model_name}'): {type(e).__name__}: {e}"
        ) from e

    final_msg = followup.choices[0].message.content or ""
    state["chat_history"].append({"role": "assistant", "content": final_msg})
    _store_async(state["session_id"], "assistant", final_msg)

    return ChatResponse(
        session_id=state["session_id"],
        message=final_msg,
        products=state["captured_products"] if state["captured_products"] else None,
    )


async def stream_chat(
    sync_client: OpenAI,
    async_client: AsyncOpenAI,
    model_name: str,
    user_message: str,
    session_id: Optional[str] = None,
) -> Generator:
    """
    Async generator for the streaming /api/chat/stream endpoint.

    Yields SSE-formatted strings:
      data: {"type": "meta",  "session_id": "...", "products": [...]}
      data: {"type": "token", "content": "..."}
      data: {"type": "done"}
    """
    import asyncio

    # Run the synchronous first-half (session + 1st LLM + tools) in a thread
    state = await asyncio.to_thread(
        _prepare_chat, sync_client, model_name, user_message, session_id
    )

    # Send metadata (session_id + structured products) immediately so the
    # frontend can render product cards while text is still streaming.
    products_payload = [p.model_dump() for p in state["captured_products"]]
    yield f"data: {json.dumps({'type': 'meta', 'session_id': state['session_id'], 'products': products_payload})}\n\n"

    if state["immediate_response"] is not None:
        # No tool was called — emit the pre-generated text as a single chunk
        yield f"data: {json.dumps({'type': 'token', 'content': state['immediate_response']})}\n\n"
        yield "data: {\"type\": \"done\"}\n\n"
        return

    # Stream the follow-up LLM call asynchronously
    full_text = ""
    try:
        stream = await async_client.chat.completions.create(
            model=model_name,
            messages=_truncate_history(state["chat_history"]),
            stream=True,
        )
        async for chunk in stream:
            content = chunk.choices[0].delta.content or ""
            if content:
                full_text += content
                yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"
    except Exception as e:
        error_msg = f"Streaming failed: {type(e).__name__}: {e}"
        yield f"data: {json.dumps({'type': 'error', 'content': error_msg})}\n\n"
        yield "data: {\"type\": \"done\"}\n\n"
        return

    # Persist the completed message asynchronously
    state["chat_history"].append({"role": "assistant", "content": full_text})
    _store_async(state["session_id"], "assistant", full_text)

    yield "data: {\"type\": \"done\"}\n\n"


def main():
    client = create_client()
    model_name = get_model()
    session_id = create_session_id()

    while True:
        user_text = input("You: ").strip()

        response = process_chat(client, model_name, user_text, session_id)
        print(f"Assistant: {response.message}")
        print("-" * 70)


if __name__ == "__main__":
    main()
