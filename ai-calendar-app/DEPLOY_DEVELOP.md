# 🚀 Hướng Dẫn Deploy Nhánh Develop Lên Vercel

Để deploy nhánh `develop` lên Vercel mà vẫn giữ nguyên domain `https://ai-calendar-app-v3.vercel.app`, bạn có 2 cách:

---

## ✅ Cách 1: Merge `develop` vào `main` (Khuyến nghị)

Vercel mặc định deploy production từ nhánh `main`. Cách này đơn giản nhất:

### Bước 1: Merge develop vào main

```powershell
# Đảm bảo đang ở nhánh develop và đã commit/push tất cả changes
cd "D:\FPT\EXE\AI Calendar\ai-calendar-app"
git checkout develop
git pull origin develop

# Switch sang main và merge
git checkout main
git pull origin main

# Merge develop vào main
git merge develop

# Push lên GitHub
git push origin main
```

### Bước 2: Vercel sẽ tự động deploy

Vercel sẽ tự động detect push vào `main` và deploy production. Đợi 2-3 phút để build.

### Bước 3: Kiểm tra

- Vào https://vercel.com/dashboard
- Chọn project `ai-calendar-app-v3`
- Xem deployment mới nhất
- Website sẽ tự động update tại: https://ai-calendar-app-v3.vercel.app

---

## ✅ Cách 2: Cấu hình Vercel để deploy từ nhánh `develop`

Nếu muốn giữ `develop` làm production branch:

### Bước 1: Vào Vercel Dashboard

1. Truy cập: https://vercel.com/dashboard
2. Chọn project: **ai-calendar-app-v3**

### Bước 2: Cấu hình Production Branch

1. Vào **Settings** → **Git**
2. Tìm mục **"Production Branch"**
3. Đổi từ `main` → `develop`
4. Click **"Save"**

### Bước 3: Trigger Deployment

Có 2 cách:

**Cách A: Push vào develop để trigger auto-deploy**
```powershell
# Make a small change hoặc empty commit để trigger
git checkout develop
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin develop
```

**Cách B: Deploy thủ công từ Vercel Dashboard**
1. Vào tab **"Deployments"**
2. Click **"..."** (3 dots) trên deployment mới nhất
3. Chọn **"Redeploy"**
4. Chọn branch `develop`
5. Click **"Redeploy"**

### Bước 4: Kiểm tra

- Đợi build xong (2-3 phút)
- Website sẽ update tại: https://ai-calendar-app-v3.vercel.app

---

## ⚠️ Lưu Ý Quan Trọng

### Environment Variables

Đảm bảo các biến môi trường đã được cấu hình trong Vercel:

1. Vào **Settings** → **Environment Variables**
2. Kiểm tra các biến sau đã có:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://ai-calendar-app-v3.vercel.app`
   - `AI_SERVICE_URL` (nếu cần cho AI chat)

3. **Select environments**: ✅ Production, ✅ Preview, ✅ Development

### Root Directory

Nếu cấu trúc project là:
```
ai-calendar-app/
  ├── frontend/
  ├── backend/
  └── AI_service/
```

Thì trong Vercel Settings → General → **Root Directory** phải set là:
- `frontend` (nếu deploy frontend)
- Hoặc để mặc định nếu repo root đã là frontend

---

## 🔍 Kiểm Tra Deployment

### 1. Xem Build Logs

Vào Vercel Dashboard → Deployments → Click vào deployment mới nhất → Xem logs

### 2. Test Website

- Homepage: https://ai-calendar-app-v3.vercel.app
- Features: https://ai-calendar-app-v3.vercel.app/#features
- Chat: https://ai-calendar-app-v3.vercel.app/chat

### 3. Kiểm Tra Console

Mở DevTools (F12) → Console tab → Xem có lỗi không

---

## 🐛 Troubleshooting

### Build Failed

**Lỗi**: "Build Command failed"

**Giải pháp**:
1. Kiểm tra logs trong Vercel Dashboard
2. Test build local:
   ```powershell
   cd frontend
   npm install
   npm run build
   ```
3. Fix lỗi nếu có
4. Commit và push lại

### Environment Variables Not Found

**Lỗi**: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Giải pháp**:
1. Vào Vercel → Settings → Environment Variables
2. Đảm bảo tất cả biến đã được thêm
3. Click "Redeploy" để apply changes

### Domain Not Updated

**Lỗi**: Website vẫn hiển thị code cũ

**Giải pháp**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hoặc test ở Incognito mode
3. Kiểm tra deployment status trong Vercel

---

## 📝 Khuyến Nghị

**Nên dùng Cách 1** (merge vào main):
- ✅ Đơn giản hơn
- ✅ Tuân theo convention (main = production)
- ✅ Dễ quản lý hơn
- ✅ Preview deployments vẫn có thể từ develop

**Workflow đề xuất**:
```
develop (development) → merge → main (production) → Vercel auto-deploy
```

---

## 🎉 Hoàn Thành!

Sau khi deploy, website sẽ live tại:
**https://ai-calendar-app-v3.vercel.app**

Mọi thay đổi trên nhánh `main` sẽ tự động deploy production!
