# 🚀 Hướng Dẫn Setup AI Service

## Bước 1: Cài Đặt Dependencies

```bash
cd AI_service
pip install -r requirements.txt
```

## Bước 2: Cấu Hình Environment

Tạo file `.env` trong `AI_service/timemanage-agent-backend/src/`:

```env
# Groq API - Lấy từ https://console.groq.com
GROQ_API_KEY=gsk_your_key_here
GROQ_LLM_MODEL_GEMMA2_9B=gemma2-9b-it
GROQ_LLM_MODEL_LLAMA_70B=llama-70b-versatile

# Supabase - Lấy từ Supabase Dashboard
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here

# Server Config (optional)
AI_SERVICE_PORT=8000
AI_SERVICE_HOST=0.0.0.0
```

## Bước 3: Cấu Hình Next.js

Thêm vào `.env.local` của Next.js:

```env
AI_SERVICE_URL=http://localhost:8000
```

## Bước 4: Khởi Động Server

```bash
cd AI_service
python start_server.py
```

Server sẽ chạy tại: `http://localhost:8000`

## Bước 5: Test

1. Khởi động Next.js: `npm run dev`
2. Truy cập: `http://localhost:3000/chat`
3. Thử các câu lệnh:
   - "Chào em"
   - "Thêm việc học tiếng Anh vào tối mai"
   - "Hôm nay tôi có gì cần làm?"

## ⚠️ Lưu Ý về Schema

Xem file `SCHEMA_MIGRATION.md` để biết về vấn đề schema và cách xử lý.

