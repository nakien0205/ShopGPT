import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

# Import core logic from main
from main.main import (
    create_client,
    create_async_client,
    get_model,
    process_chat,
    stream_chat,
    Message,
    ChatResponse,
)
from database.Supabase.store_chat import retrieve_chat_history

# --- Initialize ---
load_dotenv()

client = create_client()
async_client = create_async_client()
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
    """Handle chat messages and return responses with products (non-streaming)."""
    if not message.content.strip():
        raise HTTPException(status_code=422, detail="Message content cannot be empty.")
    try:
        # Run the synchronous process_chat in a thread so the event loop is free
        response = await asyncio.to_thread(
            process_chat,
            client,
            model_name,
            message.content,
            message.session_id,
        )
        return response
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error in /api/chat: {type(e).__name__}: {e}"
        )


@app.post("/api/chat/stream")
async def chat_stream(message: Message):
    """
    Handle chat messages and return a Server-Sent Events (SSE) stream.

    Event types:
      {"type": "meta",  "session_id": "...", "products": [...]}
      {"type": "token", "content": "..."}
      {"type": "error", "content": "..."}
      {"type": "done"}
    """
    if not message.content.strip():
        raise HTTPException(status_code=422, detail="Message content cannot be empty.")

    return StreamingResponse(
        stream_chat(
            sync_client=client,
            async_client=async_client,
            model_name=model_name,
            user_message=message.content,
            session_id=message.session_id,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disable nginx buffering if behind proxy
        },
    )


@app.get("/api/history/{session_id}")
async def get_history(session_id: str):
    """Retrieve chat history for a session."""
    try:
        history = retrieve_chat_history(session_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve history for session '{session_id}': {type(e).__name__}: {e}"
        )


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "model": model_name}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
