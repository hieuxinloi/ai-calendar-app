# 🚀 Hướng dẫn Deploy AI Calendar lên Vercel

## ✅ Các bước deploy

### Bước 1: Chuẩn bị GitHub repository

```bash
# Tạo repository mới trên GitHub
# https://github.com/new

# Khởi tạo git trong thư mục ai-calendar-app (thư mục chứa package.json)
cd "D:\FPT\EXE\AI Calendar\ai-calendar-app"
git init
git add .
git commit -m "Initial commit"

# Link với GitHub (thay YOUR_USERNAME và YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**⚠️ QUAN TRỌNG**: Repo root **PHẢI** là thư mục `ai-calendar-app` chứa `package.json`, KHÔNG phải thư mục parent!

---

### Bước 2: Tạo file `.env.local` cho environment variables

Tạo file `.env.local` trong thư mục `ai-calendar-app`:

```env
# Supabase (đã có sẵn trong code nhưng để khai báo rõ)
NEXT_PUBLIC_SUPABASE_URL=https://dnjynpcgpkeggnevdnpm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanlucGNncGtlZ2duZXZkbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzMTAsImV4cCI6MjA3NzY4MTMxMH0.jAr6T4kzAk3HqlYEaDdS23Y7jVgd4KVoiD8K8vB0wAg

# URL của app (Vercel sẽ tự động fill)
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

**⚠️ LƯU Ý**: `NEXT_PUBLIC_SITE_URL` sẽ được Vercel tự động thay khi deploy!

---

### Bước 3: Deploy lên Vercel

#### Cách 1: Deploy qua Vercel Dashboard (Khuyến nghị) ✅

1. **Đăng ký/Đăng nhập**: https://vercel.com
2. **Click** "Add New..." → "Project"
3. **Import** repository từ GitHub
4. **Cấu hình project**:
   - **Framework Preset**: Next.js (tự động detect)
   - **Root Directory**: `./ai-calendar-app` (nếu repo có parent folder)
   - **Install Command**: `npm install`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. **Environment Variables**: Click "Environment Variables"
   - Thêm từng biến:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://dnjynpcgpkeggnevdnpm.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanlucGNncGtlZ2duZXZkbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzMTAsImV4cCI6MjA3NzY4MTMxMH0.jAr6T4kzAk3HqlYEaDdS23Y7jVgd4KVoiD8K8vB0wAg
     NEXT_PUBLIC_SITE_URL = https://ai-calendar-app-v3.vercel.app
     ```
   - Select: ✅ "Production", ✅ "Preview", ✅ "Development"
   - **⚠️ LƯU Ý**: `NEXT_PUBLIC_SITE_URL` dùng cho PayOS returnUrl và cancelUrl
6. **Click** "Deploy"
7. **Đợi** 2-3 phút build
8. **Copy URL**: `https://your-app-name.vercel.app` ✨

#### Cách 2: Deploy qua Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd ai-calendar-app
vercel --prod
```

---

### Bước 4: Cấu hình PayOS Webhook

Sau khi deploy xong, bạn sẽ có URL production:

```
https://ai-calendar-app-v3.vercel.app
```

**⚠️ QUAN TRỌNG: Cấu hình Environment Variable trong Vercel**

Trước khi cấu hình PayOS, bạn cần set biến môi trường `NEXT_PUBLIC_SITE_URL`:

1. Vào **Vercel Dashboard** → Project của bạn → **Settings** → **Environment Variables**
2. Thêm biến mới:
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://ai-calendar-app-v3.vercel.app`
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
3. **Click** "Save"
4. **Redeploy** project (Vercel sẽ tự động redeploy hoặc bạn có thể click "Redeploy" từ Deployments)

---

**Webhook URL** sẽ là:
```
https://ai-calendar-app-v3.vercel.app/api/payment/payos/webhook
```

**Cấu hình PayOS Webhook:**

1. **Đăng nhập** PayOS Dashboard: https://my.payos.vn
2. Vào **"Kênh thanh toán"** → Click vào kênh của bạn
3. Tìm mục **"Webhook Url"** (thường ở phần "Cài đặt kênh" hoặc "Webhook & Callback")
4. **Paste** URL webhook:
   ```
   https://ai-calendar-app-v3.vercel.app/api/payment/payos/webhook
   ```
5. **Click** "Lưu" hoặc "Cập nhật"
6. PayOS sẽ tự động test webhook → Phải thấy ✅ **"Test thành công"** hoặc trạng thái xanh!

**🔍 Lưu ý:**
- URL phải bắt đầu bằng `https://` (không dùng `http://`)
- Không có dấu `/` ở cuối URL
- Sau khi lưu, PayOS sẽ gửi một request test đến webhook của bạn
- Kiểm tra Vercel Logs để xem webhook có nhận được request không

---

### Bước 5: Test Production

1. **Truy cập**: `https://ai-calendar-app-v3.vercel.app`
2. **Đăng ký** tài khoản mới hoặc đăng nhập
3. **Vào** `/payment?plan=pro`
4. **Click** "Thanh toán PayOS (Tự động)"
5. **Kiểm tra**:
   - Redirect đến PayOS checkout page ✅
   - Thanh toán thành công → Redirect về `/payment/success` ✅
   - Webhook nhận được callback từ PayOS ✅
   - Subscription tự động được kích hoạt ✅

**Test Webhook thủ công:**
```bash
curl -X POST https://ai-calendar-app-v3.vercel.app/api/payment/payos/webhook \
  -H "Content-Type: application/json" \
  -d '{"code":"00","desc":"Success","data":{"orderCode":12345678,"amount":99000}}'
```

---

## 🔧 Troubleshooting

### Build Error

**Lỗi**: `Error: Unable to locate `@next/swc-darwin-x64` binary`
```bash
# Fix: Install node_modules mới
rm -rf node_modules package-lock.json
npm install
```

**Lỗi**: `Module not found: Can't resolve '@/lib/xxx'`
```bash
# Fix: Check tsconfig.json paths
# Đảm bảo có:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Environment Variables

**Lỗi**: Supabase không kết nối
- Check Vercel Dashboard → Settings → Environment Variables
- Đảm bảo biến có `NEXT_PUBLIC_` prefix cho client-side
- Redeploy sau khi thêm biến mới

### PayOS Webhook 404

**Lỗi**: Webhook không nhận được (404 Not Found)

**Nguyên nhân thường gặp:**
1. PayOS test webhook bằng GET request, nhưng route chỉ có POST handler
2. Code chưa được deploy lên Vercel
3. URL không đúng format

**Giải pháp:**
1. ✅ **Đảm bảo route có cả GET và POST handlers** (đã được thêm trong code)
2. **Redeploy code lên Vercel:**
   ```bash
   # Commit và push code mới
   git add .
   git commit -m "Fix PayOS webhook: Add GET handler for testing"
   git push origin main
   ```
   Vercel sẽ tự động deploy sau khi push
3. **Kiểm tra URL:**
   - Phải bắt đầu bằng `https://`
   - Không có dấu `/` ở cuối
   - URL đúng: `https://ai-calendar-app-v3.vercel.app/api/payment/payos/webhook`
4. **Test webhook sau khi deploy:**
   ```bash
   # Test GET request (PayOS test)
   curl https://ai-calendar-app-v3.vercel.app/api/payment/payos/webhook
   
   # Test POST request
   curl -X POST https://ai-calendar-app-v3.vercel.app/api/payment/payos/webhook \
     -H "Content-Type: application/json" \
     -d '{"code":"00","desc":"Test","data":{"orderCode":123,"amount":99000}}'
   ```
5. **Kiểm tra Vercel Logs** để xem webhook có nhận được requests không

---

## 📊 Monitoring & Logs

### Xem logs production
1. Vào Vercel Dashboard
2. Click project → "Deployments"
3. Click vào deployment mới nhất
4. Xem logs real-time

### Check database
1. Vào Supabase Dashboard
2. "Table Editor" → Xem dữ liệu
3. "Logs" → Xem SQL queries

---

## ✅ Checklist sau khi deploy

- [ ] App chạy trên production URL
- [ ] Đăng ký/Đăng nhập hoạt động
- [ ] Calendar load được tasks
- [ ] Chat AI hoạt động
- [ ] Payment page load được
- [ ] PayOS webhook được lưu trong PayOS Dashboard
- [ ] Test thanh toán thành công
- [ ] Webhook tự động kích hoạt subscription

---

## 🎉 Hoàn thành!

App của bạn đã live tại: `https://ai-calendar-app-v3.vercel.app`

**Features:**
- ✅ Next.js 15 + React 18
- ✅ Supabase Auth + Database
- ✅ PayOS Payment Gateway
- ✅ AI Chat
- ✅ Responsive UI
- ✅ Dark/Light Mode

**Environment:**
- Free tier Vercel = **Unlimited bandwidth** ✅
- Free tier Supabase = **500MB database + 2GB bandwidth** ✅
- PayOS = **Free processing** ✅

**Chi phí = 0đ/tháng!** 🎉

