# 🔧 Fix: Query không tìm thấy tasks

## Vấn đề
Python service query Supabase trả về 0 tasks mặc dù có tasks trong database.

## Nguyên nhân
Đang dùng **anon key** thay vì **service_role key**. Anon key bị giới hạn bởi RLS (Row Level Security) policies, nên không thể query tasks mà không có authenticated user session.

## Giải pháp

### Bước 1: Lấy Service Role Key
1. Vào Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Settings** → **API** → **API Keys**
4. **Click vào tab "Legacy anon, service_role API keys"** (tab thứ 2, bên cạnh "Publishable and secret API keys")
5. Tìm phần **service_role key**:
   - Copy key có label **"service_role"** (không phải "anon" key!)
   - Service role key bắt đầu bằng `eyJ...` (giống anon key nhưng khác nội dung)
   - Có thể có nút "Reveal" để hiện key nếu bị ẩn

### Bước 2: Cập nhật .env
Mở file `AI_service/timemanage-agent-backend/src/.env` và cập nhật:

```env
SUPABASE_URL=https://dnjynpcgpkeggnevdnpm.supabase.co
SUPABASE_KEY=<service_role_key_here>  # Thay bằng service_role key, KHÔNG phải anon key
```

### Bước 3: Test lại
Chạy test script:
```powershell
cd "D:\FPT\EXE\AI Calendar\ai-calendar-app\AI_service"
python test_query_tasks.py
```

Nếu thấy tasks → ✅ Đã fix!
Nếu vẫn 0 tasks → Kiểm tra:
- Service role key có đúng không
- RLS policies có cho phép service role không

## Lưu ý bảo mật
- **Service role key** có quyền cao, bypass tất cả RLS
- Chỉ dùng ở backend (Python service)
- **KHÔNG** commit service role key vào git
- **KHÔNG** dùng ở frontend (Next.js)

