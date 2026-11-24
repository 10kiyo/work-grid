import { loginAsDemo } from './actions/demo-auth'
import Navbar from '@/components/Navbar'
import DemoLoginButton from '@/components/DemoLoginButton'
import { Zap, ShieldCheck, Cloud, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col justify-between overflow-x-clip">
      {/* Bagian Atas: Langit Biru Cerah dengan Awan Melayang */}
      <div className="sky-hero-bg relative pb-20 pt-1">
        {/* Dekorasi Awan Melayang */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute top-24 left-12 w-48 h-16 rounded-full bg-white/25 blur-xl" />
          <div className="animate-float-delayed absolute top-36 right-16 w-64 h-20 rounded-full bg-white/30 blur-xl" />
          <div className="animate-float absolute bottom-28 left-1/3 w-72 h-20 rounded-full bg-white/35 blur-2xl" />
        </div>

        <Navbar
          variant="sky"
          title="WorkGrid"
          badge="Next.js + Supabase Portfolio"
        />

        {/* Hero Copy */}
        <section className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-6 text-center space-y-4 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/25 border border-white/45 text-white text-sm font-medium backdrop-blur-md shadow-sm">
            <Cloud className="w-4 h-4 text-amber-200" />
            <span>Real-time Collaborative Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-xs">
            Kelola alur kerja tim secara{' '}
            <span className="text-amber-200">
              cerah & terstruktur.
            </span>
          </h1>

          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Platform manajemen proyek berbasis Kanban dengan sinkronisasi langsung,
            drag-and-drop mulus, serta isolasi keamanan multi-tenant menggunakan Row Level Security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <form action={loginAsDemo}>
              <DemoLoginButton />
            </form>
          </div>
        </section>
      </div>

      {/* Bagian Bawah: Kartu Mengambang di atas Kanvas Cerah */}
      <section className="relative z-10 max-w-5xl mx-auto w-full px-6 -mt-14 pb-10">
        <div className="grid sm:grid-cols-3 gap-5 text-left">
          <div className="p-6 rounded-3xl light-glass-card space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">
              Live Sync
            </div>
            <h3 className="font-bold text-lg text-slate-900">Supabase Realtime</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Perubahan kartu dan kolom langsung tersinkronisasi ke seluruh anggota tanpa memuat ulang halaman.
            </p>
          </div>

          <div className="p-6 rounded-3xl light-glass-card space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Multi-Tenant
            </div>
            <h3 className="font-bold text-lg text-slate-900">Row Level Security</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Hak akses data divalidasi langsung di level database PostgreSQL berdasarkan peran masing-masing tim.
            </p>
          </div>

          <div className="p-6 rounded-3xl light-glass-card space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
              Smooth Motion
            </div>
            <h3 className="font-bold text-lg text-slate-900">Optimistic Drag & Drop</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Perpindahan posisi tugas terasa instan di antarmuka dengan kalkulasi indeks float presisi.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-4 text-center text-xs text-slate-400">
        Dibangun dengan Next.js App Router, Tailwind CSS, dan Supabase
      </footer>
    </main>
  )
}