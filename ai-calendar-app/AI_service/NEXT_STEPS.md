# 🚀 Các Bước Tiếp Theo - Hướng Dẫn Hoàn Chỉnh

## ✅ Đã Hoàn Thành

- ✅ Groq API key đã được cấu hình
- ✅ Models đã được cập nhật
- ✅ Python server đã được khởi động

## 📋 Checklist Các Bước Tiếp Theo

### Bước 1: Kiểm Tra Python Server Đang Chạy

1. **Mở browser**: http://localhost:8000/health
2. **Hoặc test bằng PowerShell**:
```powershell
Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing
```

Nếu thấy `{"status": "healthy"}` → Server đang chạy tốt! ✅

---

### Bước 2: Cấu Hình Next.js

1. **Tạo file `.env.local`** trong thư mục `frontend/`:

```env
AI_SERVICE_URL=http://localhost:8000
```

2. **Kiểm tra file đã tồn tại chưa**:
```powershell
cd frontend
Test-Path .env.local
```

Nếu chưa có, tạo file mới với nội dung trên.

---

### Bước 3: Khởi Động Next.js

1. **Mở terminal mới** (giữ Python server đang chạy):
```powershell
cd frontend
npm run dev
```

2. **Đợi Next.js khởi động** (sẽ hiển thị):
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

---

### Bước 4: Test Chat Interface

1. **Mở browser**: http://localhost:3000/chat
2. **Thử các câu lệnh**:
   - "Chào em"
   - "Thêm việc học tiếng Anh vào tối mai"
   - "Hôm nay tôi có gì cần làm?"

3. **Kiểm tra response**:
   - AI phải trả lời bằng tiếng Việt
   - Phản hồi phải có ý nghĩa

---

### Bước 5: Kiểm Tra Logs

**Python Server Logs** (terminal chạy `start_server.py`):
- Xem có lỗi không
- Xem requests có đến không

**Next.js Logs** (terminal chạy `npm run dev`):
- Xem có lỗi API call không
- Xem response từ Python server

---

## 🐛 Troubleshooting

### Lỗi "AI service is unavailable"

**Nguyên nhân**: Python server chưa chạy hoặc không kết nối được

**Giải pháp**:
1. Kiểm tra Python server có đang chạy không
2. Kiểm tra `AI_SERVICE_URL` trong `.env.local` có đúng không
3. Thử test trực tiếp: http://localhost:8000/health

### Lỗi "Module not found" trong Python

**Giải pháp**:
```powershell
cd AI_service
pip install -r requirements.txt
```

### Lỗi "Port 8000 already in use"

**Giải pháp**:
1. Tìm process đang dùng port 8000:
```powershell
netstat -ano | findstr :8000
```

2. Kill process hoặc đổi port trong `.env`:
```env
AI_SERVICE_PORT=8001
```

Và cập nhật `.env.local`:
```env
AI_SERVICE_URL=http://localhost:8001
```

---

## ✅ Khi Mọi Thứ Hoạt Động

Bạn sẽ thấy:
- ✅ Python server chạy tại port 8000
- ✅ Next.js chạy tại port 3000
- ✅ Chat interface hoạt động
- ✅ AI trả lời bằng tiếng Việt
- ✅ Có thể thêm/xem tasks qua chat

---

## 🎯 Các Tính Năng Có Thể Test

1. **Greeting**: "Chào em", "Hello"
2. **Add Task**: "Thêm việc học tiếng Anh vào tối mai"
3. **Get Tasks**: "Hôm nay tôi có gì cần làm?", "Liệt kê công việc tuần này"
4. **Off Topic**: "Kể chuyện cười" → AI sẽ từ chối nhẹ nhàng

---

## 📝 Lưu Ý

- **Luôn chạy Python server trước** khi test frontend
- **Kiểm tra logs** nếu có lỗi
- **Restart server** nếu thay đổi `.env`

Chúc bạn thành công! 🎉

