"""
FastAPI Server for AI Time Management Agent
Exposes REST API endpoints for Next.js frontend
"""
import os
import sys
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
from dotenv import load_dotenv, find_dotenv
from langchain_core.messages import HumanMessage
from genai.time_management_agent.agent import build_graph
from logger import logger
from datetime import datetime

load_dotenv(find_dotenv())

app = FastAPI(title="AI Time Management Agent API", version="1.0.0")

# CORS configuration
# Allow requests from localhost (dev) and Vercel domains (production)
vercel_domain = os.getenv("VERCEL_URL", "https://ai-calendar-app-v3.vercel.app")
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ai-calendar-app-v3.vercel.app",
    "https://*.vercel.app",  # Allow all Vercel preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"
    history: list = []  # Optional chat history
    user_id: Optional[str] = None  # Optional user ID for filtering tasks

class ChatResponse(BaseModel):
    message: str
    role: str = "assistant"

# Initialize graph
logger.info("Initializing LangGraph agent...")
graph = build_graph()
logger.info("✅ Agent initialized successfully")

@app.get("/")
async def root():
    return {
        "status": "active",
        "service": "AI Time Management Agent API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint that processes user messages through the LangGraph agent
    """
    try:
        # Debug: Log parsed request data
        logger.info(f"📥 Received request - user_id type: {type(request.user_id)}, value: {repr(request.user_id)}")
        logger.info(f"📥 Full request model dump: {request.model_dump()}")
        
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        logger.info(f"📨 Message: {request.message[:50]}...")
        logger.info(f"👤 User ID: {request.user_id if request.user_id else 'None (not provided)'}")
        logger.info(f"🧵 Thread ID: {request.thread_id}")
        
        # Prepare configurable for thread management
        configurable = {
            "configurable": {
                "thread_id": request.thread_id
            }
        }
        
        # Build messages list
        messages = []
        
        # Add history if provided
        if request.history:
            for msg in request.history:
                if msg.get("role") == "user":
                    messages.append(HumanMessage(
                        content=msg.get("content", ""),
                        additional_kwargs={"current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
                    ))
                elif msg.get("role") == "assistant":
                    from langchain_core.messages import AIMessage
                    messages.append(AIMessage(
                        content=msg.get("content", ""),
                        additional_kwargs={"current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
                    ))
        
        # Add current user message
        messages.append(
            HumanMessage(
                content=request.message,
                additional_kwargs={"current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
            )
        )
        
        # Invoke graph with user_id if provided
        graph_input = {"messages": messages}
        if request.user_id:
            graph_input["user_id"] = request.user_id
            logger.info(f"✅ Adding user_id to graph_input: {request.user_id}")
        else:
            logger.warning(f"⚠️ No user_id in request - graph_input will not have user_id")
        
        logger.info(f"🔍 Graph input keys: {list(graph_input.keys())}")
        
        # Invoke graph
        try:
            response = graph.invoke(
                graph_input,
                config=configurable
            )
        except Exception as graph_error:
            logger.error(f"❌ Graph invoke error: {str(graph_error)}")
            logger.error(f"❌ Error type: {type(graph_error).__name__}")
            import traceback
            logger.error(f"❌ Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"AI processing error: {str(graph_error)}"
            )
        
        # Extract AI reply
        ai_reply = response.get('ai_reply', None)
        
        if ai_reply is None:
            logger.warning("⚠️ No AI reply in response")
            logger.warning(f"⚠️ Response keys: {response.keys() if hasattr(response, 'keys') else 'N/A'}")
            return ChatResponse(
                message="Xin lỗi, em không thể xử lý yêu cầu này. Anh/Chị có thể thử lại không ạ?",
                role="assistant"
            )
        
        ai_message_content = ai_reply.content if hasattr(ai_reply, 'content') else str(ai_reply)
        
        logger.info(f"✅ Response generated: {ai_message_content[:50]}...")
        
        return ChatResponse(
            message=ai_message_content,
            role="assistant"
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"❌ Error processing chat request: {str(e)}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

