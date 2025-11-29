# 🔄 Hướng Dẫn Switch Sang Gemini Pro

## Tại sao switch sang Gemini Pro?
- Gemini Pro thường cho kết quả chính xác hơn Groq
- Hiểu context tốt hơn
- Ít tạo tasks giả hơn

## Cách Setup Gemini Pro

### Bước 1: Lấy Gemini API Key
1. Vào Google AI Studio: https://aistudio.google.com/
2. Đăng nhập bằng Google account
3. Click **"Get API Key"** hoặc vào **API Keys** trong menu bên trái
4. Click nút **"Create API key"**
5. Trong modal "Create a new key":
   - **Name your key**: Đặt tên (ví dụ: "AI_calendar_app") - đã có sẵn
   - **Choose an imported project**: 
     - Nếu không có project: Click **"Create project"** hoặc để trống (có thể tạo key mà không cần project)
     - Hoặc chọn project có sẵn nếu có
6. Click **"Create API key"** (hoặc nút tương tự)
7. **Copy API key ngay lập tức** (chỉ hiển thị 1 lần!)
   - Format: `AIza...` (bắt đầu bằng AIza)
   - Lưu key này vào nơi an toàn

### Bước 2: Cập nhật .env
Mở file `AI_service/timemanage-agent-backend/src/.env` và thêm:

```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### Bước 3: Cập nhật config.py
Sửa file `AI_service/timemanage-agent-backend/src/config.py`:

```python
LLM_MODELS = {
    "router": {
        "router_node": f"gemini/{os.getenv('GEMINI_MODEL', 'gemini-1.5-pro')}"
    },
    "greeting_subgraph": {
        "greeting_node": f"gemini/{os.getenv('GEMINI_MODEL', 'gemini-1.5-pro')}"
    },
    "off_topic_subgraph": {
        "off_topic_node": f"gemini/{os.getenv('GEMINI_MODEL', 'gemini-1.5-pro')}"
    },
    "task_subgraph": {
        "add_task_node": f"gemini/{os.getenv('GEMINI_MODEL', 'gemini-1.5-pro')}"
    }
}
```

### Bước 4: Cập nhật API key trong code
Tìm tất cả chỗ dùng `GROQ_API_KEY` và thay bằng `GEMINI_API_KEY`:

```python
# Thay vì:
api_key=os.getenv("GROQ_API_KEY")

# Dùng:
api_key=os.getenv("GEMINI_API_KEY")
```

### Bước 5: Restart Python server
```powershell
# Dừng server (Ctrl+C)
cd "D:\FPT\EXE\AI Calendar\ai-calendar-app\AI_service\timemanage-agent-backend\src"
python api_server.py
```

## Models có sẵn
- `gemini-1.5-flash` - **Khuyến nghị dùng** - Nhanh, free tier, available với Google AI Studio API key
- `gemini-pro` - Model ổn định, có thể không available với free tier
- `gemini-1.5-pro` - Có thể không available với API key miễn phí

**Lưu ý:** 
- Với API key từ Google AI Studio (miễn phí), `gemini-1.5-flash` thường available và hoạt động tốt
- Nếu `gemini-1.5-flash` không hoạt động, thử `gemini-pro`
- Nếu muốn dùng `gemini-1.5-pro`, cần upgrade account hoặc dùng Vertex AI

## Lưu ý
- Gemini có rate limit, nhưng đủ dùng cho development
- Có thể dùng cả Groq và Gemini (chỉ cần đổi model name)
- LiteLLM tự động detect provider từ model name (`gemini/...`)

