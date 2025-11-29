"""
Script to start the FastAPI server for AI Time Management Agent
"""
import os
import sys
import uvicorn

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "timemanage-agent-backend", "src"))

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    host = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    
    print(f"🚀 Starting AI Time Management Agent API server on {host}:{port}")
    print(f"📝 Make sure you have set up .env file with GROQ_API_KEY and SUPABASE credentials")
    
    uvicorn.run(
        "api_server:app",
        host=host,
        port=port,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )

