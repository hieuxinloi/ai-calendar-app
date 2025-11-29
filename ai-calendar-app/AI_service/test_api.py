"""
Test Groq API với key đã có
"""
import os
import sys
from dotenv import load_dotenv, find_dotenv

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add src to path
src_path = os.path.join(os.path.dirname(__file__), "timemanage-agent-backend", "src")
sys.path.insert(0, src_path)

# Load .env from src directory
env_path = os.path.join(src_path, ".env")
load_dotenv(env_path)

def test_groq_api():
    """Test Groq API"""
    try:
        from litellm import completion
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("❌ GROQ_API_KEY chưa được set")
            return False
        
        print("🔄 Đang test Groq API...")
        print(f"📝 API Key: {api_key[:10]}...{api_key[-5:]}")
        
        # Test với model mới (gemma2-9b-it đã deprecated)
        response = completion(
            api_key=api_key,
            model="groq/llama-3.1-8b-instant",  # Model mới, nhanh hơn
            messages=[
                {"role": "user", "content": "Xin chào! Bạn có thể trả lời bằng tiếng Việt không? Chỉ cần trả lời 'Có' hoặc 'Không'."}
            ],
            temperature=0.7,
        )
        
        result = response.choices[0].message.content
        print("✅ Groq API hoạt động bình thường!")
        print(f"📤 Response: {result}")
        return True
        
    except Exception as e:
        print(f"❌ Groq API lỗi: {str(e)}")
        return False

if __name__ == "__main__":
    test_groq_api()

