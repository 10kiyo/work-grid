'use client'

import { useState } from 'react'
import { X, Copy, Check, Link2, Users } from 'lucide-react'

interface InviteTeamModalProps {
  workspaceName: string
  inviteCode: string
  onClose: () => void
}

export default function InviteTeamModal({
  workspaceName,
  inviteCode,
  onClose,
}: InviteTeamModalProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join?code=${inviteCode}`
      : `/join?code=${inviteCode}`

  const copyText = async (text: string, type: 'code' | 'link') => {
    await navigator.clipboard.writeText(text)
    if (type === 'code') {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Undang ke {workspaceName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Bagikan kode atau tautan di bawah ini kepada rekan tim Anda agar
          mereka dapat langsung bergabung dan berkolaborasi secara real-time.
        </p>

        {/* Kode Undangan */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Kode Undangan
          </label>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
            <span className="font-mono text-base font-bold tracking-widest text-slate-900">
              {inviteCode}
            </span>
            <button
              type="button"
              onClick={() => copyText(inviteCode, 'code')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Link Undangan Langsung */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tautan Undangan Langsung
          </label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 pl-3.5">
            <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600 truncate flex-1">
              {inviteUrl}
            </span>
            <button
              type="button"
              onClick={() => copyText(inviteUrl, 'link')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shrink-0 cursor-pointer"
            >
              {copiedLink ? 'Tersalin!' : 'Salin Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
