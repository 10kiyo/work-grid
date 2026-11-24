'use client'

import { Sparkles, X, RefreshCw } from 'lucide-react'

interface AiSummaryModalProps {
  boardTitle: string
  summary: string | null
  loading: boolean
  error: string | null
  onRegenerate: () => void
  onClose: () => void
}

export default function AiSummaryModal({
  boardTitle,
  summary,
  loading,
  error,
  onRegenerate,
  onClose,
}: AiSummaryModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                AI Sprint Brief
              </h3>
              <p className="text-[11px] text-slate-500">{boardTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="min-h-48 max-h-[60vh] overflow-y-auto rounded-2xl bg-slate-50/90 border border-slate-200/80 p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-slate-500">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <p className="text-xs font-medium">
                Gemini sedang menganalisis seluruh kartu di board...
              </p>
            </div>
          ) : error ? (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3.5 leading-relaxed">
              {error}
            </div>
          ) : (
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
              {summary}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Analisis Ulang</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
