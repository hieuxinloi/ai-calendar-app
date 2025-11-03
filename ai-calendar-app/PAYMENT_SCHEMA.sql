-- ============================================
-- PAYMENT SCHEMA: Bảng subscriptions và payments
-- Chạy SQL này trong Supabase SQL Editor
-- ============================================

-- 1. Tạo bảng subscriptions (Gói đăng ký của user)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes cho subscriptions
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_end_date_idx ON public.subscriptions(end_date);

-- Unique constraint: Mỗi user chỉ có 1 subscription active
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_subscription 
ON public.subscriptions(user_id) 
WHERE status = 'active';

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies cho subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================

-- 2. Tạo bảng payments (Lịch sử thanh toán)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL, -- Lưu theo cents (ví dụ: 99000 = 99.000đ)
  currency TEXT DEFAULT 'VND',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('qr_code', 'bank_transfer', 'card', 'other')),
  transaction_id TEXT UNIQUE, -- Mã giao dịch từ ngân hàng/payment gateway
  qr_code TEXT, -- Mã QR hoặc reference code
  notes TEXT,
  metadata JSONB, -- Thông tin thêm (IP, user agent, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes cho payments
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_subscription_id_idx ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON public.payments(created_at);
CREATE INDEX IF NOT EXISTS payments_transaction_id_idx ON public.payments(transaction_id) WHERE transaction_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies cho payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================

-- 3. Function để kích hoạt subscription sau khi thanh toán thành công
CREATE OR REPLACE FUNCTION activate_subscription()
RETURNS TRIGGER AS $$
DECLARE
  plan_type TEXT;
BEGIN
  -- Chỉ xử lý khi payment chuyển sang completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Nếu có subscription_id, cập nhật subscription
    IF NEW.subscription_id IS NOT NULL THEN
      -- Lấy thông tin plan từ subscription
      SELECT plan INTO plan_type FROM public.subscriptions WHERE id = NEW.subscription_id;
      
      -- Cập nhật subscription thành active
      UPDATE public.subscriptions
      SET 
        status = 'active',
        start_date = NOW(),
        end_date = CASE 
          WHEN plan_type = 'pro' THEN NOW() + INTERVAL '1 month'
          ELSE NULL
        END,
        updated_at = NOW()
      WHERE id = NEW.subscription_id;
      
      -- Kết thúc các subscription khác của user
      UPDATE public.subscriptions
      SET 
        status = 'expired',
        updated_at = NOW()
      WHERE user_id = (SELECT user_id FROM public.subscriptions WHERE id = NEW.subscription_id)
        AND id != NEW.subscription_id
        AND status = 'active';
    END IF;
    
    -- Ghi nhận thời gian hoàn thành
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger tự động kích hoạt subscription
DROP TRIGGER IF EXISTS trigger_activate_subscription ON public.payments;
CREATE TRIGGER trigger_activate_subscription
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION activate_subscription();

-- ============================================

-- 4. Function tự động update updated_at cho subscriptions và payments
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================

-- 5. Function để kiểm tra và tự động expire subscriptions hết hạn
CREATE OR REPLACE FUNCTION expire_old_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE 
    status = 'active'
    AND end_date IS NOT NULL
    AND end_date < NOW()
    AND auto_renew = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================

-- 6. Tạo subscription mặc định FREE cho tất cả users hiện tại
INSERT INTO public.subscriptions (user_id, plan, status, auto_renew)
SELECT id, 'free', 'active', TRUE
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT DO NOTHING;

-- ============================================
-- HOÀN THÀNH!
-- 
-- Kiểm tra:
-- SELECT * FROM public.subscriptions;
-- SELECT * FROM public.payments;
-- 
-- Xem subscription của user hiện tại:
-- SELECT * FROM public.subscriptions WHERE user_id = auth.uid();
-- 
-- Xem payment history:
-- SELECT * FROM public.payments WHERE user_id = auth.uid() ORDER BY created_at DESC;
-- ============================================

