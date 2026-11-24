'use client'

import { useState } from 'react'
import { TaskComment, TaskActivity } from '@/hooks/useTaskCollaboration'
import {
  MessageSquare,
  History,
  Send,
  Clock,
  Trash2,
} from 'lucide-react'

interface TaskFeedSidebarProps {
  userEmail: string
  comments: TaskComment[]
  activities: TaskActivity[]
  loadingFeed: boolean
  onSendComment: (content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
}

function formatRelativeTime(isoString: string) {
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diffSec < 60) return 'Baru saja'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} mnt lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TaskFeedSidebar({
  userEmail,
  comments,
  activities,
  loadingFeed,
  onSendComment,
  onDeleteComment,
}: TaskFeedSidebarProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'activities'>(
    'comments'
  )
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = newComment.trim()
    if (!content || sendingComment) return

    setSendingComment(true)
    setNewComment('')
    await onSendComment(content)
    setSendingComment(false)
  }

  return (
    <div className="flex flex-col rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3.5 min-h-90">
      <div className="grid grid-cols-2 gap-1.5 bg-slate-200/60 p-1 rounded-xl mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'comments'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Komentar ({comments.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'activities'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Aktivitas ({activities.length})</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-64 pr-1">
        {loadingFeed ? (
          <p className="text-xs text-slate-400 text-center py-8">
            Memuat riwayat...
          </p>
        ) : activeTab === 'comments' ? (
          comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              Belum ada komentar. Mulai diskusi dengan tim!
            </p>
          ) : (
            comments.map((comment) => {
              const isOwn = comment.author_email === userEmail
              return (
                <div
                  key={comment.id}
                  className="bg-white rounded-xl p-2.5 border border-slate-200/70 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-700 truncate">
                      {comment.author_email.split('@')[0]}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                      {isOwn && (
                        <button
                          type="button"
                          onClick={() => onDeleteComment(comment.id)}
                          title="Hapus komentar"
                          className="text-slate-300 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              )
            })
          )
        ) : activities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            Belum ada catatan aktivitas pada tugas ini.
          </p>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-2 bg-white/80 rounded-xl px-3 py-2 border border-slate-200/60"
            >
              <Clock className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs text-slate-700 leading-snug">
                  <span className="font-semibold">
                    {act.actor_email.split('@')[0]}
                  </span>{' '}
                  {act.action}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  {formatRelativeTime(act.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {activeTab === 'comments' && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Tulis komentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || sendingComment}
            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  )
}
