-- Migration: Tự động tạo user profile khi user đăng ký
-- Chạy SQL này trong Supabase SQL Editor để setup trigger tự động

-- Function để tạo user profile tự động
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Nếu đã có thì không làm gì
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger để tự động gọi function khi có user mới trong auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: Trigger này chỉ hoạt động khi user được tạo trực tiếp trong auth.users
-- Nếu dùng Supabase Auth API, có thể cần dùng API route thay vì trigger

