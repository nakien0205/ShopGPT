from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import core logic from main
from main.main import (
    create_client,
    get_model,
    process_chat,
    Message,
    ChatResponse,
)
from database.store_chat import retrieve_chat_history

# --- Initialize ---
load_dotenv()

client = create_client()
model_name = get_model()

app = FastAPI(title="ShopGPT API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(message: Message):
    """Handle chat messages and return responses with products."""
    try:
        response = process_chat(
            client=client,
            model_name=model_name,
            user_message=message.content,
            session_id=message.session_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history/{session_id}")
async def get_history(session_id: str):
    """Retrieve chat history for a session."""
    try:
        history = retrieve_chat_history(session_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "model": model_name}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
