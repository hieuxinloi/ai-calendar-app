import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

APP_ROOT_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quay lại Groq vì Gemini không hoạt động với API key hiện tại
# Dùng model lớn hơn (llama-3.3-70b) cho các task quan trọng để có kết quả tốt hơn
LLM_MODELS = {
    "router": {
        "router_node": f"groq/{os.getenv('GROQ_LLM_MODEL', 'llama-3.3-70b-versatile')}"  # Model lớn hơn cho classification
    },
    "greeting_subgraph": {
        "greeting_node": f"groq/{os.getenv('GROQ_LLM_MODEL', 'llama-3.3-70b-versatile')}"
    },
    "off_topic_subgraph": {
        "off_topic_node": f"groq/{os.getenv('GROQ_LLM_MODEL', 'llama-3.1-8b-instant')}"  # Model nhỏ cho off-topic
    },
    "task_subgraph": {
        "add_task_node": f"groq/{os.getenv('GROQ_LLM_MODEL', 'llama-3.3-70b-versatile')}"  # Model lớn cho task processing
    }
}