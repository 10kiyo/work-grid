'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Kanban, LogOut } from 'lucide-react'

interface NavbarProps {
  variant?: 'sky' | 'light'
  title?: string
  badge?: string
  userEmail?: string
  showLogout?: boolean
  isRealtimeConnected?: boolean
}

export default function Navbar({
  variant = 'light',
  title = 'WorkGrid',
  badge,
  userEmail,
  showLogout = false,
  isRealtimeConnected = false,
}: NavbarProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isSky = variant === 'sky'

  return (
    <header
      className={`sticky top-5 z-30 ${
        isSky ? 'max-w-5xl mx-auto w-full px-6' : 'mx-6 mt-5'
      }`}
    >
      <nav
        className={`${
          isSky ? 'sky-glass-nav' : 'light-glass-nav'
        } rounded-2xl px-5 py-3.5 flex items-center justify-between transition-all`}
      >
        {/* Kiri: Logo, Judul & Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl shadow-sm ${
              isSky
                ? 'bg-white text-blue-600'
                : 'bg-linear-to-br from-blue-500 to-sky-500 text-white shadow-blue-500/20'
            }`}
          >
            <Kanban className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`font-bold tracking-tight ${
                isSky ? 'text-lg text-white' : 'text-base text-slate-900'
              }`}
            >
              {title}
            </span>

            {badge && (
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  isSky
                    ? 'bg-white/25 border border-white/40 text-white backdrop-blur-md'
                    : 'bg-sky-100 text-sky-700'
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Kanan: Indikator Live Sync, Email & Tombol Keluar */}
        {(userEmail || showLogout) && (
          <div className="flex items-center gap-3.5">
            <div className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRealtimeConnected
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <span>{isRealtimeConnected ? 'Live • Synced' : 'Connecting...'}</span>
            </div>

            {userEmail && (
              <span className="hidden sm:inline text-xs font-medium text-slate-500">
                {userEmail}
              </span>
            )}

            {showLogout && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
