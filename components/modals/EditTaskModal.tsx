'use client'

import { useState } from 'react'
import { Task } from '@/components/task/TaskCard'
import { breakdownTaskAction } from '@/app/actions/ai'
import { useTaskCollaboration } from '@/hooks/useTaskCollaboration'
import TaskAttachmentsSection from '@/components/task/TaskAttachmentsSection'
import TaskFeedSidebar from '@/components/task/TaskFeedSidebar'
import { X, Trash2, Sparkles } from 'lucide-react'

interface EditTaskModalProps {
  task: Task
  userEmail: string
  onClose: () => void
  onSave: (
    taskId: string,
    updates: {
      title: string
      description: string | null
      priority: 'low' | 'medium' | 'high'
      due_date: string | null
    }
  ) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
}

export default function EditTaskModal({
  task,
  userEmail,
  onClose,
  onSave,
  onDelete,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    task.priority
  )
  const [dueDate, setDueDate] = useState(
    task.due_date ? task.due_date.slice(0, 10) : ''
  )
  const [saving, setSaving] = useState(false)
  const [generatingChecklist, setGeneratingChecklist] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const {
    attachments,
    comments,
    activities,
    loadingFeed,
    uploadAttachment,
    deleteAttachment,
    sendComment,
    deleteComment,
  } = useTaskCollaboration(task.id, userEmail)

  const handleAiBreakdown = async () => {
    if (!title.trim() || generatingChecklist) return
    setGeneratingChecklist(true)
    setAiError(null)
    const res = await breakdownTaskAction(title.trim(), description.trim())
    if (res.ok) {
      setDescription((prev) =>
        prev.trim()
          ? `${prev.trim()}\n\nLangkah Kerja (AI):\n${res.checklist}`
          : `Langkah Kerja (AI):\n${res.checklist}`
      )
    } else {
      setAiError(res.error)
    }
    setGeneratingChecklist(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || saving) return
    setSaving(true)
    await onSave(task.id, {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      priority,
      due_date: dueDate ? new Date(`${dueDate}T12:00:00Z`).toISOString() : null,
    })
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    await onDelete(task.id)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <h3 className="font-bold text-base text-slate-900">
            Detail &amp; Kolaborasi Tugas
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Konten 2 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri: Form Edit + Lampiran */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Judul Tugas
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  Deskripsi
                </label>
                <button
                  type="button"
                  disabled={generatingChecklist || !title.trim()}
                  onClick={handleAiBreakdown}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {generatingChecklist ? 'Menyusun...' : 'Pecah Sub-tugas'}
                  </span>
                </button>
              </div>
              <textarea
                rows={4}
                placeholder="Tambahkan catatan atau kriteria selesai..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 resize-none"
              />
              {aiError && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {aiError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Prioritas
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`py-2 rounded-xl text-[11px] font-semibold capitalize border transition cursor-pointer ${
                        priority === level
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">
                    Tenggat
                  </label>
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="text-[10px] font-medium text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <TaskAttachmentsSection
              attachments={attachments}
              onUpload={uploadAttachment}
              onDelete={deleteAttachment}
            />

            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold btn-warm-cta text-white rounded-xl cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </form>

          {/* Kolom Kanan: Komentar & Riwayat Aktivitas */}
          <TaskFeedSidebar
            userEmail={userEmail}
            comments={comments}
            activities={activities}
            loadingFeed={loadingFeed}
            onSendComment={sendComment}
            onDeleteComment={deleteComment}
          />
        </div>
      </div>
    </div>
  )
}
