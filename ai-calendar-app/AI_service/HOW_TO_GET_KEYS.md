# 🔑 Hướng Dẫn Lấy API Keys và Credentials

## 1. GROQ_API_KEY (Groq API Key)

### Bước 1: Đăng ký/Đăng nhập Groq
- Truy cập: https://console.groq.com
- Đăng nhập bằng Google/GitHub hoặc tạo tài khoản mới

### Bước 2: Tạo API Key
1. Vào **API Keys** trong menu bên trái
2. Click **"Create API Key"**
3. Đặt tên cho key (ví dụ: "AI Calendar Service")
4. Click **"Submit"**
5. **Copy API Key** ngay lập tức (chỉ hiển thị 1 lần!)
   - Format: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Bước 3: Sử dụng
- Dán key vào file `.env`:
```env
GROQ_API_KEY=gsk_your_actual_key_here
```

**💡 Lưu ý**: Groq có giới hạn rate limit miễn phí, nhưng đủ dùng cho development và testing.

---

## 2. SUPABASE_URL và SUPABASE_KEY

### Cách 1: Sử dụng Supabase đã có trong project (Khuyến nghị) ✅

Project của bạn đã có cấu hình Supabase sẵn:

```env
SUPABASE_URL=https://dnjynpcgpkeggnevdnpm.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanlucGNncGtlZ2duZXZkbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzMTAsImV4cCI6MjA3NzY4MTMxMH0.jAr6T4kzAk3HqlYEaDdS23Y7jVgd4KVoiD8K8vB0wAg
```

**Bạn có thể dùng trực tiếp các giá trị này!**

### Cách 2: Lấy từ Supabase Dashboard (nếu muốn tạo mới)

1. Truy cập: https://supabase.com/dashboard
2. Đăng nhập hoặc tạo tài khoản
3. Chọn project của bạn (hoặc tạo project mới)
4. Vào **Settings** → **API** → **API Keys**
5. **Click vào tab "Legacy anon, service_role API keys"** (tab thứ 2)
6. Tìm:
   - **Project URL** → Copy vào `SUPABASE_URL`
   - **service_role key** (QUAN TRỌNG: không phải anon key!) → Copy vào `SUPABASE_KEY`
     - Có thể cần click "Reveal" để hiện key nếu bị ẩn
   
   ⚠️ **LƯU Ý QUAN TRỌNG:**
   - Python AI service cần **service_role key** (không phải anon key)
   - Service role key có quyền bypass RLS (Row Level Security)
   - **KHÔNG** share service_role key ở client-side (chỉ dùng ở backend)
   - Anon key chỉ dùng cho frontend (Next.js)

---

## 3. AI_SERVICE_PORT

Đây là port để chạy Python FastAPI server. Bạn có thể:
- Giữ mặc định: `8000`
- Hoặc đổi sang port khác nếu 8000 đã được dùng (ví dụ: `8001`, `8080`)

```env
AI_SERVICE_PORT=8000
```

---

## 📝 File .env Hoàn Chỉnh

Tạo file `.env` trong thư mục `AI_service/timemanage-agent-backend/src/`:

```env
# Groq API Configuration
GROQ_API_KEY=gsk_your_groq_key_here
GROQ_LLM_MODEL_GEMMA2_9B=gemma2-9b-it
GROQ_LLM_MODEL_LLAMA_70B=llama-70b-versatile

# Supabase Configuration (dùng giá trị từ project)
SUPABASE_URL=https://dnjynpcgpkeggnevdnpm.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanlucGNncGtlZ2duZXZkbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzMTAsImV4cCI6MjA3NzY4MTMxMH0.jAr6T4kzAk3HqlYEaDdS23Y7jVgd4KVoiD8K8vB0wAg

# AI Service Server Configuration
AI_SERVICE_PORT=8000
AI_SERVICE_HOST=0.0.0.0

# Application Configuration (optional)
APP_ROOT_PATH=/path/to/AI_service/timemanage-agent-backend
```

---

## ✅ Kiểm Tra Sau Khi Cấu Hình

1. **Kiểm tra file .env tồn tại**:
   ```bash
   cd AI_service/timemanage-agent-backend/src
   ls .env  # hoặc dir .env trên Windows
   ```

2. **Test Groq API Key** (tùy chọn):
   - Vào https://console.groq.com/playground
   - Thử chat với model để đảm bảo key hoạt động

3. **Test Supabase Connection** (tùy chọn):
   - Vào https://supabase.com/dashboard
   - Kiểm tra project có hoạt động không

---

## 🚨 Lưu Ý Bảo Mật

- ⚠️ **KHÔNG** commit file `.env` lên Git
- ⚠️ **KHÔNG** chia sẻ API keys công khai
- ✅ File `.env` đã được thêm vào `.gitignore` tự động
- ✅ Chỉ dùng keys trong môi trường development/local

---

## 🆘 Gặp Vấn Đề?

### Lỗi "GROQ_API_KEY is not set"
- Kiểm tra file `.env` có đúng đường dẫn không
- Kiểm tra tên biến có đúng không (phải là `GROQ_API_KEY`)

### Lỗi "Supabase connection error"
- Kiểm tra `SUPABASE_URL` và `SUPABASE_KEY` có đúng không
- Kiểm tra network/firewall có chặn không

### Lỗi "Port already in use"
- Đổi `AI_SERVICE_PORT` sang port khác (ví dụ: 8001)
- Hoặc tắt service đang dùng port 8000

