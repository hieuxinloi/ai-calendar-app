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
     ```
   - Select: ✅ "Production", ✅ "Preview", ✅ "Development"
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
https://your-app-name.vercel.app
```

**Webhook URL** sẽ là:
```
https://your-app-name.vercel.app/api/payment/payos/webhook
```

**Làm theo:**
1. Vào PayOS Dashboard: https://my.payos.vn
2. Vào **"Kênh thanh toán"** → Click kênh của bạn
3. Tìm **"Webhook Url"**
4. **Paste** URL: `https://your-app-name.vercel.app/api/payment/payos/webhook`
5. **Click** "Lưu"
6. PayOS sẽ tự test → Phải thấy ✅ xanh!

---

### Bước 5: Test Production

1. **Truy cập**: `https://your-app-name.vercel.app`
2. **Đăng ký** tài khoản mới
3. **Vào** `/payment?plan=pro`
4. **Click** "Thanh toán PayOS"
5. **Test** thanh toán với PayOS sandbox

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

**Lỗi**: Webhook không nhận được
- Check URL: Phải bắt đầu bằng `https://`
- Check PayOS Dashboard có lưu URL chưa
- Test webhook thủ công:
  ```bash
  curl -X POST https://your-app.vercel.app/api/payment/payos/webhook \
    -H "Content-Type: application/json" \
    -d '{"code":"00","desc":"Test","data":{"orderCode":123,"amount":99000}}'
  ```

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

App của bạn đã live tại: `https://your-app-name.vercel.app`

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

