'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Users, ArrowRight, Loader2, ArrowLeft, User } from 'lucide-react'

function JoinWorkspaceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [code, setCode] = useState('')
  const [guestName, setGuestName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const queryCode = searchParams.get('code')
    if (queryCode) {
      setCode(queryCode.toUpperCase())
    }

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
    })
  }, [searchParams, supabase])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || loading) return

    setLoading(true)
    setError(null)

    let {
      data: { user },
    } = await supabase.auth.getUser()

    // Jika belum login, buat sesi tamu (Anonymous Auth) otomatis tanpa email/password
    if (!user) {
      const displayName = guestName.trim() || 'Tamu Tim'
      const { data: anonData, error: anonError } =
        await supabase.auth.signInAnonymously({
          options: {
            data: {
              full_name: displayName,
            },
          },
        })

      if (anonError) {
        setError(
          anonError.message ||
            'Pastikan fitur "Allow anonymous sign-ins" sudah aktif di Supabase.'
        )
        setLoading(false)
        return
      }
      user = anonData.user
    }

    if (!user) {
      setError('Gagal membuat sesi tamu.')
      setLoading(false)
      return
    }

    // Gabung ke workspace menggunakan kode undangan
    const { data: workspaceId, error: rpcError } = await supabase.rpc(
      'join_workspace_by_code',
      {
        p_code: code.trim(),
      }
    )

    if (rpcError) {
      setError(rpcError.message || 'Kode undangan tidak valid.')
      setLoading(false)
      return
    }

    router.push(`/board?workspace=${workspaceId}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen daylight-board-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl p-7 space-y-5 animate-fade-up">
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900">
            Gabung ke Workspace Tim
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Masukkan kode undangan dari admin tim Anda untuk langsung masuk
            sebagai tamu dan berkolaborasi secara real-time.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Kode Undangan Workspace
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: 3BACE9A6"
              maxLength={12}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center font-mono text-base font-bold tracking-widest uppercase text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {isLoggedIn === false && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Nama Tampilan (Opsional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Contoh: Kiyo"
                  maxLength={40}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyiapkan akses tamu...</span>
              </>
            ) : (
              <>
                <span>
                  {isLoggedIn
                    ? 'Gabung Sekarang'
                    : 'Masuk sebagai Tamu & Gabung'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinWorkspaceForm />
    </Suspense>
  )
}
