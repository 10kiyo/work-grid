# WorkGrid — Real-time Collaborative Kanban

Platform manajemen proyek berbasis Kanban dengan sinkronisasi langsung antar pengguna, *optimistic drag-and-drop*, serta isolasi keamanan multi-tenant di level database menggunakan PostgreSQL Row Level Security (RLS).

## Fitur Utama

- **1-Click Demo Workspace**: Autentikasi otomatis berbasis Supabase SSR untuk memudahkan pengujian langsung tanpa registrasi manual.
- **Real-time Synchronization**: Pembaruan kartu (tambah, ubah, geser kolom, hapus) langsung tersinkronisasi ke seluruh klien aktif via Supabase Realtime (`postgres_changes`).
- **Optimistic Drag & Drop**: Perpindahan posisi kartu terasa instan menggunakan kalkulasi indeks *fractional/float* sehingga tidak perlu memperbarui seluruh baris kolom saat urutan berubah.
- **Multi-Tenant Row Level Security (RLS)**: Kebijakan akses di PostgreSQL memvalidasi keanggotaan `workspace_members` pada setiap operasi baca/tulis.
- **Filter & Pencarian Instan**: Penyaringan kartu berdasarkan tingkat prioritas (`High`, `Medium`, `Low`) dan kata kunci secara real-time.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions, SSR)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime, RLS)
- **Styling**: Tailwind CSS v4 (Custom `@layer components` Daylight Glass UI)
- **Drag & Drop**: `@hello-pangea/dnd`
- **Icons**: Lucide React

## Menjalankan Secara Lokal

1. Salin `.env.example` menjadi `.env.local` dan isi kredensial Supabase:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
