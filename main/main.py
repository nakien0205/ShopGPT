from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import inspect
import uuid
from ddgs import DDGS
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# Local imports (when running from main folder)
try:
    from tools import all_tools
    from finder import product_retriever
    from database.store_chat import store_message
    from crawler.crawl import crawl
except ImportError:
    # When imported from api.py (parent folder)
    from main.tools import all_tools
    from main.finder import product_retriever
    from database.store_chat import store_message
    from crawler.crawl import crawl

# --- Load environment variables ---
load_dotenv()

# --- Pydantic Models ---
class Message(BaseModel):
    content: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    message: str
    products: Optional[List[Dict[str, Any]]] = None
    end_chat: bool = False

# --- Configuration ---
sys_prompt = """
You are a helpful shopping assistant. 
When discussing products, use the get_product_data tool to retrieve accurate product information.
If the user clearly wants to end the conversation, respond exactly with the token END_CHAT.
"""

# --- Session Storage ---
sessions: Dict[str, List[Dict]] = {}

# --- Client Factory ---
def create_client() -> OpenAI:
    """Create and return OpenAI client configured for OpenRouter."""
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("API")
    )

def get_model(model = "nex-agi/deepseek-v3.1-nex-n1:free") -> str:
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

def get_product_data(search_query: str) -> list:
    """Get product data from database or by crawling."""
    try:
        database_answer = product_retriever(search_query)
        
        if database_answer:
            return database_answer
        else:
            data = crawl(search_query)
            return data
    except Exception as e:
        print(f"Error in get_product_data: {e}")
        return []

tool_functions = {
    "search_web": search_web,
    "get_product_data": get_product_data,
}

def extract_products(result: Any) -> Optional[List[Dict]]:
    """Extract product information from tool results."""
    if not result:
        return None
    
    if isinstance(result, list):
        products = []
        for item in result:
            if isinstance(item, dict) and any(key in item for key in ['title', 'price', 'asin']):
                # Transform images field to be compatible with frontend
                if 'images' in item and item['images']:
                    if isinstance(item['images'], list):
                        if len(item['images']) > 0 and isinstance(item['images'][0], dict):
                            image_urls = [img.get('src') for img in item['images'] if img.get('src')]
                            item['images'] = json.dumps(image_urls)
                        elif isinstance(item['images'][0], str):
                            item['images'] = json.dumps(item['images'])
                    elif isinstance(item['images'], str):
                        try:
                            json.loads(item['images'])
                        except:
                            item['images'] = json.dumps([item['images']])
                
                # Format price to ensure it has dollar sign
                if 'price' in item and item['price']:
                    price_str = str(item['price'])
                    if not price_str.startswith('$'):
                        item['price'] = f"${price_str}"
                
                products.append(item)
        return products if products else None
    
    return None

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
    
    products_list = []
    
    # Handle tool calls
    if msg.tool_calls:
        tool_calls_data = [tc.model_dump() for tc in msg.tool_calls]
        chat_history.append({
            "role": "assistant",
            "tool_calls": tool_calls_data,
            "content": msg.content or ""
        })
        store_message(session_id, "assistant", msg.content or "", tool_calls=tool_calls_data)
        
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
            
            # Extract products from tool result
            if fn_name == 'get_product_data':
                extracted_products = extract_products(result)
                if extracted_products:
                    products_list.extend(extracted_products)
            
            # Add tool message to history
            tool_message = {
                "role": "tool",
                "tool_call_id": tc.id,
                "name": fn_name,
                "content": json.dumps(result, ensure_ascii=False)
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
            products=products_list if products_list else None
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

# --- CLI Entry Point ---
def run_cli():
    """Run the chatbot in CLI mode."""
    client = create_client()
    model_name = get_model()
    session_id = create_session_id()
    
    print("ShopGPT - Shopping Assistant")
    print("Type 'quit' to exit")
    print("-" * 40)
    
    while True:
        try:
            user_text = input("You: ").strip()
            
            if user_text.lower() in ['quit', 'exit', 'bye']:
                print("Goodbye!")
                break
            
            if not user_text:
                continue
            
            response = process_chat(client, model_name, user_text, session_id)
            print(f"Assistant: {response.message}")
            
            if response.products:
                print(f"\n[Found {len(response.products)} products]")
                for i, prod in enumerate(response.products[:3], 1):
                    print(f"  {i}. {prod.get('title', 'N/A')[:60]}... - {prod.get('price', 'N/A')}")
            
            print("-" * 40)
            
            if response.end_chat:
                break
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    run_cli()