# 🚀 Khởi Động AI Service Server

## ✅ Đã Hoàn Thành

- ✅ API key đã được cấu hình
- ✅ Models đã được cập nhật (llama-3.1-8b-instant, llama-3.3-70b-versatile)
- ✅ Supabase đã được cấu hình

## 🏃 Khởi Động Server

### Cách 1: Dùng Script (Khuyến nghị)

```bash
cd AI_service
python start_server.py
```

### Cách 2: Chạy Trực Tiếp

```bash
cd AI_service/timemanage-agent-backend/src
python api_server.py
```

### Cách 3: Dùng Uvicorn

```bash
cd AI_service/timemanage-agent-backend/src
uvicorn api_server:app --reload --port 8000
```

## ✅ Kiểm Tra Server Đã Chạy

Sau khi khởi động, bạn sẽ thấy:
```
🚀 Starting AI Time Management Agent API server on 0.0.0.0:8000
📝 Make sure you have set up .env file with GROQ_API_KEY and SUPABASE credentials
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## 🧪 Test Server

1. **Health Check**:
   - Mở browser: http://localhost:8000/health
   - Hoặc: http://localhost:8000/

2. **Test Chat API**:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Chào em", "thread_id": "test"}'
```

## 🔗 Kết Nối với Next.js

1. **Thêm vào `.env.local` của Next.js** (trong thư mục `frontend/`):
```env
AI_SERVICE_URL=http://localhost:8000
```

2. **Khởi động Next.js**:
```bash
cd frontend
npm run dev
```

3. **Test tại**: http://localhost:3000/chat

## ⚠️ Lưu Ý

- Server Python phải chạy trước khi test frontend
- Nếu port 8000 bị chiếm, đổi `AI_SERVICE_PORT` trong `.env`
- Kiểm tra logs nếu có lỗi

## 🐛 Troubleshooting

### Lỗi "Module not found"
```bash
cd AI_service
pip install -r requirements.txt
```

### Lỗi "Port already in use"
- Đổi port trong `.env`: `AI_SERVICE_PORT=8001`
- Hoặc tắt service đang dùng port 8000

### Lỗi "GROQ_API_KEY is not set"
- Kiểm tra file `.env` có đúng đường dẫn không
- Kiểm tra tên biến có đúng không

