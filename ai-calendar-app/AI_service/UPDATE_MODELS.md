# 🔄 Cập Nhật Models - Groq Deprecated Models

## ⚠️ Vấn Đề

Model `gemma2-9b-it` đã bị **deprecated** (ngừng hỗ trợ) bởi Groq.

## ✅ Models Mới Được Khuyến Nghị

### Thay Thế `gemma2-9b-it`:
- `llama-3.1-8b-instant` (nhanh, nhẹ)
- `llama-3.3-70b-versatile` (mạnh hơn)
- `llama-3.1-70b-versatile` (mạnh nhất)

### Thay Thế `llama-70b-versatile`:
- `llama-3.3-70b-versatile` (mới nhất)
- `llama-3.1-70b-versatile` (vẫn còn hỗ trợ)

## 📝 Cập Nhật File .env

Cập nhật file `.env` trong `AI_service/timemanage-agent-backend/src/`:

```env
GROQ_API_KEY=gsk_your_key_here
GROQ_LLM_MODEL_GEMMA2_9B=llama-3.1-8b-instant
GROQ_LLM_MODEL_LLAMA_70B=llama-3.3-70b-versatile

SUPABASE_URL=https://dnjynpcgpkeggnevdnpm.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanlucGNncGtlZ2duZXZkbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzMTAsImV4cCI6MjA3NzY4MTMxMH0.jAr6T4kzAk3HqlYEaDdS23Y7jVgd4KVoiD8K8vB0wAg

AI_SERVICE_PORT=8000
```

## 🔧 Cập Nhật Code (Nếu Cần)

Nếu code có hardcode model names, cần sửa:

File: `nodes/router.py`, `nodes/subgraph/*.py`:

```python
# Cũ (sẽ lỗi):
model="gemma2-9b-it"

# Mới:
model="groq/llama-3.1-8b-instant"
```

Hoặc dùng từ config:
```python
from config import LLM_MODELS
model = LLM_MODELS['router']['router_node']
```

## 📚 Danh Sách Models Groq Hiện Tại

Xem tại: https://console.groq.com/docs/models

Các models phổ biến:
- `llama-3.1-8b-instant` - Nhanh, nhẹ
- `llama-3.1-70b-versatile` - Mạnh, đa năng
- `llama-3.3-70b-versatile` - Mới nhất, mạnh nhất
- `mixtral-8x7b-32768` - Tốt cho context dài

