from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import inspect
import uuid
from ddgs import DDGS
from typing import Any, List, Optional, Dict
from pydantic import BaseModel
from tools import all_tools
from database.Supabase.store_chat import store_message
from database.MongoDB.connection import both
from database.MongoDB.formated_output import get_product_data

load_dotenv()


class Message(BaseModel):
    content: str
    session_id: Optional[str] = None


class ProductData(BaseModel):
    title: str
    price: Optional[Any] = None
    currency: Optional[str] = None
    product_description: Optional[str] = None
    info: Optional[str] = None
    rating: Optional[Any] = None
    rating_count: Optional[Any] = None
    availability: Optional[str] = None
    return_policy: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    message: str
    products: Optional[List[ProductData]] = None
    end_chat: bool = False


sys_prompt = """
You are a helpful shopping assistant. 
When discussing products, use the get_product_data tool to retrieve accurate product information.
"""

# Chat sessions store
sessions: Dict[str, List[Dict]] = {}


def create_client() -> OpenAI:
    """Create and return OpenAI client configured for OpenRouter."""
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("API")
    )


def get_model(model="openai/gpt-5-nano") -> str:
    """Get the model name to use."""
    return model


def create_session_id() -> str:
    """Generate a new session ID."""
    return str(uuid.uuid4())


def initialize_session(session_id: str):
    """Initialize a new chat session."""
    sessions[session_id] = [
        {"role": "system", "content": sys_prompt}
    ]
    store_message(session_id, "system", sys_prompt)


def get_or_create_session(session_id: Optional[str] = None) -> tuple[str, List[Dict]]:
    """Get existing session or create a new one."""
    if session_id is None:
        session_id = create_session_id()

    if session_id not in sessions:
        initialize_session(session_id)

    return session_id, sessions[session_id]


def search_web(search_query: str) -> list:
    """Search the web using DuckDuckGo."""
    return list(DDGS().text(search_query, max_results=3))


def get_product_data_tool(search_query: str):
    """
    Retrieves top 5 products from MongoDB via hybrid search (lexical + vector RRF),
    then formats them into a readable string for the LLM to use.
    """
    try:
        products_data = both(search_query)
        if not products_data:
            return "No products found for the given query."
        data = get_product_data(products_data)
        return data
    except Exception as e:
        print(f"Error in get_product_data_tool: {e}")
        return "An error occurred while retrieving product data."


tool_functions = {
    "search_web": search_web,
    "get_product_data": get_product_data_tool,
}


def extract_raw_products(search_query: str) -> List[ProductData]:
    """Fetch raw product docs from MongoDB and map them to ProductData models."""
    try:
        raw = both(search_query)
        if not raw:
            return []
        seen, result = set(), []
        for item in raw:
            doc = item.get('doc', {})
            title = doc.get('title', '').strip()
            key = title.lower()
            if title and key not in seen:
                seen.add(key)
                result.append(ProductData(
                    title=title,
                    price=doc.get('price'),
                    currency=doc.get('currency'),
                    product_description=doc.get('product_description'),
                    info=doc.get('info'),
                    rating=doc.get('rating'),
                    rating_count=doc.get('rating_count'),
                    availability=doc.get('availability'),
                    return_policy=doc.get('return_policy'),
                ))
        return result
    except Exception as e:
        print(f"Error extracting raw products: {e}")
        return []


def process_chat(
    client: OpenAI,
    model_name: str,
    user_message: str,
    session_id: Optional[str] = None
) -> ChatResponse:
    """
    Process a chat message and return a response.
    This is the main logic function used by both CLI and API.
    """
    # Get or create session
    session_id, chat_history = get_or_create_session(session_id)

    # Add user message
    chat_history.append({"role": "user", "content": user_message})
    store_message(session_id, "user", user_message)

    # Get AI response
    first = client.chat.completions.create(
        model=model_name,
        messages=chat_history,
        tools=all_tools,
        tool_choice="auto"
    )
    msg = first.choices[0].message

    # Handle tool calls
    if msg.tool_calls:
        tool_calls_data = [tc.model_dump() for tc in msg.tool_calls]
        chat_history.append({
            "role": "assistant",
            "tool_calls": tool_calls_data,
            "content": msg.content or ""
        })
        store_message(session_id, "assistant", msg.content or "", tool_calls=tool_calls_data)

        captured_products: List[ProductData] = []

        for tc in msg.tool_calls:
            fn_name = tc.function.name
            fn = tool_functions.get(fn_name)

            if not fn:
                continue

            args = json.loads(tc.function.arguments or "{}")
            sig = inspect.signature(fn)
            call_args = {
                k: args[k] if k in args else v.default
                for k, v in sig.parameters.items()
                if k in args or v.default is not inspect._empty
            }

            result = fn(**call_args)

            # Capture structured product data when get_product_data is called
            if fn_name == "get_product_data" and "search_query" in args:
                captured_products = extract_raw_products(args["search_query"])

            # Tool result: pass string directly, serialize anything else
            tool_message = {
                "role": "tool",
                "tool_call_id": tc.id,
                "name": fn_name,
                "content": result if isinstance(result, str) else json.dumps(result, ensure_ascii=False)
            }
            chat_history.append(tool_message)

        # Get final response after tool calls
        followup = client.chat.completions.create(
            model=model_name,
            messages=chat_history
        )
        final_msg = followup.choices[0].message.content or ""
        chat_history.append({"role": "assistant", "content": final_msg})
        store_message(session_id, "assistant", final_msg)

        return ChatResponse(
            session_id=session_id,
            message=final_msg,
            products=captured_products if captured_products else None,
        )
    else:
        # No tools used
        text = msg.content or ""
        chat_history.append({"role": "assistant", "content": text})
        store_message(session_id, "assistant", text)

        return ChatResponse(
            session_id=session_id,
            message=text
        )


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