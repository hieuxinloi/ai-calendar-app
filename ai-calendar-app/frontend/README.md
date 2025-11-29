# AI Calendar App - Frontend

Ứng dụng lịch thông minh với AI, được xây dựng bằng Next.js, TypeScript, và Supabase.

## 📁 Cấu trúc dự án

```
ai-calendar-app/
├── frontend/          # Frontend code (Next.js)
│   ├── app/          # Next.js App Router
│   ├── components/    # React components
│   ├── public/       # Static assets
│   └── styles/       # CSS files
│
├── backend/          # Backend code (bao gồm database)
│   ├── api/          # API route handlers
│   └── lib/          # Backend libraries
│       ├── supabase/ # Database logic
│       └── services/ # Business logic
│
├── AI_service/       # AI services
│   └── services/     # AI service logic
│
└── shared/           # Shared code
    ├── types/        # Shared types
    └── utils/        # Shared utilities
```

## 🚀 Cài đặt

```bash
cd frontend
npm install
```

## 🔧 Cấu hình

Tạo file `.env.local` trong thư mục `frontend/` với nội dung:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Chạy ứng dụng

```bash
cd frontend
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 📝 Import paths

- Frontend: `@/components/*`, `@/app/*`
- Backend: `@/backend/lib/*`
- AI Service: `@/AI_service/services/*`
- Shared: `@/shared/utils/*`, `@/shared/types/*`

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
