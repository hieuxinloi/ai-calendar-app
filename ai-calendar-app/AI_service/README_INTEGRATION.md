# Hướng Dẫn Tích Hợp AI Service

## 📋 Tổng Quan

AI Service này đã được tích hợp vào project `ai-calendar-app` thông qua FastAPI server. Frontend Next.js sẽ gọi Python API để xử lý các yêu cầu chat.

## 🚀 Cài Đặt

### 1. Cài đặt Dependencies

```bash
cd AI_service
pip install -r requirements.txt
```

### 2. Cấu Hình Environment Variables

Tạo file `.env` trong thư mục `AI_service/timemanage-agent-backend/src/`:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_LLM_MODEL_GEMMA2_9B=gemma2-9b-it
GROQ_LLM_MODEL_LLAMA_70B=llama-70b-versatile

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# AI Service Server Configuration (optional)
AI_SERVICE_PORT=8000
AI_SERVICE_HOST=0.0.0.0
```

### 3. Cấu Hình Next.js

Thêm biến môi trường vào file `.env.local` của Next.js:

```env
AI_SERVICE_URL=http://localhost:8000
```

## 🏃 Chạy Server

### Cách 1: Sử dụng script (Khuyến nghị)

```bash
cd AI_service
python start_server.py
```

### Cách 2: Chạy trực tiếp

```bash
cd AI_service/timemanage-agent-backend/src
python api_server.py
```

### Cách 3: Sử dụng uvicorn

```bash
cd AI_service/timemanage-agent-backend/src
uvicorn api_server:app --reload --port 8000
```

Server sẽ chạy tại: `http://localhost:8000`

## 📡 API Endpoints

### POST `/chat`

Gửi tin nhắn đến AI agent.

**Request:**
```json
{
  "message": "Thêm việc học tiếng Anh vào tối mai",
  "thread_id": "default",
  "history": [
    {
      "role": "user",
      "content": "Chào em"
    },
    {
      "role": "assistant",
      "content": "Dạ, chào Anh/Chị!"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Dạ, AI Calendar đã ghi lại công việc của Anh/Chị như sau:\n- Học tiếng Anh (bắt đầu: 2025-11-29T19:00:00+07:00, hạn: unknown)",
  "role": "assistant"
}
```

### GET `/health`

Kiểm tra trạng thái server.

**Response:**
```json
{
  "status": "healthy"
}
```

## 🔗 Tích Hợp với Next.js

Frontend đã được cấu hình để gọi API qua route `/api/chat` trong Next.js. Route này sẽ forward request đến Python service.

### Flow:

```
Frontend (chat/page.tsx)
    ↓
Next.js API Route (/api/chat)
    ↓
Python FastAPI Server (/chat)
    ↓
LangGraph Agent
    ↓
Supabase Database
```

## 🐛 Xử Lý Lỗi

- Nếu Python service không khả dụng, Next.js API sẽ trả về message lỗi thân thiện
- Kiểm tra logs trong `AI_service/timemanage-agent-backend/logs/`
- Đảm bảo Supabase credentials đúng và có quyền truy cập

## 📝 Lưu Ý

1. **Port Conflict**: Nếu port 8000 đã được sử dụng, thay đổi `AI_SERVICE_PORT` trong `.env`
2. **CORS**: CORS đã được cấu hình cho `localhost:3000`. Nếu dùng port khác, cập nhật trong `api_server.py`
3. **Thread Management**: Mỗi `thread_id` sẽ có conversation history riêng
4. **Supabase Schema**: Đảm bảo bảng `tasks` đã được tạo với schema đúng (xem README.md gốc)

## 🔄 Development Workflow

1. Khởi động Python server: `python start_server.py`
2. Khởi động Next.js dev server: `npm run dev`
3. Truy cập: `http://localhost:3000/chat`
4. Test các chức năng:
   - Greeting: "Chào em"
   - Add Task: "Thêm việc học tiếng Anh vào tối mai"
   - Get Tasks: "Hôm nay tôi có gì cần làm?"

