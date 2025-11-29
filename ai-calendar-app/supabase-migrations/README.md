# Supabase Migrations

Các file SQL migration để setup database.

## 001_auto_create_user_profile.sql

Tự động tạo user profile trong `users` table khi user đăng ký.

**Cách sử dụng:**
1. Vào Supabase Dashboard → SQL Editor
2. Copy nội dung file `001_auto_create_user_profile.sql`
3. Paste vào SQL Editor và chạy

**Lưu ý:**
- Trigger này chỉ hoạt động khi user được tạo trực tiếp trong `auth.users`
- Nếu dùng Supabase Auth API, app đã có API route `/api/user/create-profile` để tự động tạo profile
- Cả hai cách đều hoạt động, nhưng API route linh hoạt hơn

**Nếu không muốn dùng trigger:**
- App đã tự động tạo profile qua API route khi đăng ký/đăng nhập
- Không cần chạy SQL này

