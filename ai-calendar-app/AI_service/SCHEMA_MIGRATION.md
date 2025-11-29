# ⚠️ Lưu Ý về Database Schema

## Vấn Đề Schema Không Khớp

AI Service hiện tại được thiết kế với schema khác với database hiện tại của project:

### Schema AI Service (mong đợi):
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    start_at TIMESTAMP WITH TIME ZONE,
    due_at TIMESTAMP WITH TIME ZONE,
    task_date DATE,
    created_at TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN
);
```

### Schema Project Hiện Tại:
```typescript
{
  id: string
  user_id: string  // ⚠️ Bắt buộc
  title: string
  description: string | null
  time: string | null  // ⚠️ Khác với start_at/due_at
  priority: 'high' | 'medium' | 'low'  // ⚠️ Không có trong AI service
  category: string | null  // ⚠️ Không có trong AI service
  completed: boolean
  date: string  // ⚠️ Khác với task_date
  created_at: string
  updated_at: string
}
```

## Giải Pháp

### Option 1: Cập Nhật AI Service để Phù Hợp với Schema Hiện Tại (Khuyến nghị)

Cần sửa các file:
- `add_task_nodes.py`: Map `start_at`/`due_at` → `date`/`time`
- `get_tasks_nodes.py`: Query theo `date` thay vì `due_date`
- Thêm `user_id` khi insert tasks
- Xử lý `priority` và `category`

### Option 2: Tạo Bảng Tasks Mới cho AI Service

Tạo bảng `ai_tasks` riêng cho AI service, sau đó sync với `tasks` chính.

### Option 3: Migrate Database Schema

Cập nhật schema database để hỗ trợ cả hai format (không khuyến nghị vì phức tạp).

## Khuyến Nghị

Nên chọn **Option 1** để đảm bảo tính nhất quán và tích hợp tốt với frontend hiện tại.

