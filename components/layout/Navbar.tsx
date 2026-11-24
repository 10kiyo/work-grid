'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import InviteTeamModal from '@/components/modals/InviteTeamModal'
import { Kanban, LogOut, UserPlus, Pencil } from 'lucide-react'

interface NavbarProps {
  variant?: 'sky' | 'light'
  title?: string
  badge?: string
  userEmail?: string
  showLogout?: boolean
  isRealtimeConnected?: boolean
  inviteCode?: string | null
  canManage?: boolean
  workspaceId?: string
  boardId?: string
}

export default function Navbar({
  variant = 'light',
  title = 'WorkGrid',
  badge,
  userEmail,
  showLogout = false,
  isRealtimeConnected = false,
  inviteCode,
  canManage = false,
  workspaceId,
  boardId,
}: NavbarProps) {
  const supabase = createClient()
  const router = useRouter()
  const [showInviteModal, setShowInviteModal] = useState(false)

  // State inline-edit judul board & nama workspace (khusus leader)
  const [currentTitle, setCurrentTitle] = useState(title)
  const [editingTitle, setEditingTitle] = useState(false)
  const [currentBadge, setCurrentBadge] = useState(badge ?? '')
  const [editingBadge, setEditingBadge] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const saveBoardTitle = async () => {
    setEditingTitle(false)
    const trimmed = currentTitle.trim()
    if (!trimmed || trimmed === title || !boardId || !canManage) {
      setCurrentTitle(title)
      return
    }
    const { error } = await supabase
      .from('boards')
      .update({ title: trimmed })
      .eq('id', boardId)

    if (error) {
      setCurrentTitle(title)
    } else {
      router.refresh()
    }
  }

  const saveWorkspaceName = async () => {
    setEditingBadge(false)
    const trimmed = currentBadge.trim()
    if (!trimmed || trimmed === badge || !workspaceId || !canManage) {
      setCurrentBadge(badge ?? '')
      return
    }
    const { error } = await supabase
      .from('workspaces')
      .update({ name: trimmed })
      .eq('id', workspaceId)

    if (error) {
      setCurrentBadge(badge ?? '')
    } else {
      router.refresh()
    }
  }

  const isSky = variant === 'sky'

  return (
    <>
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
              {canManage && editingTitle && !isSky ? (
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  onBlur={saveBoardTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveBoardTitle()
                    if (e.key === 'Escape') {
                      setCurrentTitle(title)
                      setEditingTitle(false)
                    }
                  }}
                  autoFocus
                  className="font-bold text-base text-slate-900 bg-white border border-blue-400 rounded-lg px-2 py-0.5 focus:outline-none"
                />
              ) : (
                <button
                  type="button"
                  disabled={!canManage || isSky}
                  onClick={() => canManage && !isSky && setEditingTitle(true)}
                  title={canManage && !isSky ? 'Klik untuk ubah judul proyek' : undefined}
                  className={`group inline-flex items-center gap-1.5 font-bold tracking-tight ${
                    isSky
                      ? 'text-lg text-white'
                      : canManage
                        ? 'text-base text-slate-900 hover:text-blue-600 cursor-pointer'
                        : 'text-base text-slate-900 cursor-default'
                  }`}
                >
                  <span>{currentTitle}</span>
                  {canManage && !isSky && (
                    <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  )}
                </button>
              )}

              {(currentBadge || badge) &&
                (canManage && editingBadge && !isSky ? (
                  <input
                    type="text"
                    value={currentBadge}
                    onChange={(e) => setCurrentBadge(e.target.value)}
                    onBlur={saveWorkspaceName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveWorkspaceName()
                      if (e.key === 'Escape') {
                        setCurrentBadge(badge ?? '')
                        setEditingBadge(false)
                      }
                    }}
                    autoFocus
                    className="text-xs font-semibold text-sky-800 bg-white border border-blue-400 rounded-full px-3 py-0.5 focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    disabled={!canManage || isSky}
                    onClick={() => canManage && !isSky && setEditingBadge(true)}
                    title={canManage && !isSky ? 'Klik untuk ubah nama tim' : undefined}
                    className={`group inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                      isSky
                        ? 'bg-white/25 border border-white/40 text-white backdrop-blur-md'
                        : canManage
                          ? 'bg-sky-100 hover:bg-sky-200/80 text-sky-700 cursor-pointer transition'
                          : 'bg-sky-100 text-sky-700 cursor-default'
                    }`}
                  >
                    <span>{currentBadge || badge}</span>
                    {canManage && !isSky && (
                      <Pencil className="w-2.5 h-2.5 text-sky-600 opacity-0 group-hover:opacity-100 transition" />
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Kanan: Indikator Live Sync, Undang Tim, Email & Tombol Keluar */}
          {(userEmail || showLogout) && (
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRealtimeConnected
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span>
                  {isRealtimeConnected ? 'Live • Synced' : 'Connecting...'}
                </span>
              </div>

              {inviteCode && (
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Undang Tim</span>
                </button>
              )}

              {userEmail && (
                <span className="hidden lg:inline text-xs font-medium text-slate-500">
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

      {showInviteModal && inviteCode && (
        <InviteTeamModal
          workspaceName={currentBadge || currentTitle}
          inviteCode={inviteCode}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </>
  )
}
