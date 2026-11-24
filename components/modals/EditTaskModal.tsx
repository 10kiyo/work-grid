'use client'

import { useState } from 'react'
import { Task } from '@/components/task/TaskCard'
import { breakdownTaskAction } from '@/app/actions/ai'
import { useTaskCollaboration } from '@/hooks/useTaskCollaboration'
import TaskAttachmentsSection from '@/components/task/TaskAttachmentsSection'
import TaskFeedSidebar from '@/components/task/TaskFeedSidebar'
import { X, Trash2, Sparkles, Check, Plus } from 'lucide-react'

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

type ChecklistItem = {
  id: string
  text: string
  done: boolean
}

function parseChecklistFromDescription(raw: string | null): {
  notes: string
  items: ChecklistItem[]
} {
  if (!raw) return { notes: '', items: [] }

  const [notesPart, checklistPart] = raw.split('Langkah Kerja (AI):')
  const sourceLines = (checklistPart ?? raw).split('\n')

  const items: ChecklistItem[] = []
  sourceLines.forEach((line, idx) => {
    const match = line.trim().match(/^-\s*\[([ xX])\]\s*(.+)$/)
    if (match) {
      items.push({
        id: `item-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        done: match[1].toLowerCase() === 'x',
        text: match[2].trim(),
      })
    }
  })

  // Jika tidak ada marker "Langkah Kerja (AI):", bersihkan baris checklist dari catatan
  const cleanNotes = checklistPart
    ? notesPart.trim()
    : notesPart
        .split('\n')
        .filter((l) => !/^-\s*\[([ xX])\]\s*/.test(l.trim()))
        .join('\n')
        .trim()

  return { notes: cleanNotes, items }
}

function serializeDescription(notes: string, items: ChecklistItem[]): string | null {
  const cleanNotes = notes.trim()
  const cleanItems = items.filter((item) => item.text.trim().length > 0)

  if (!cleanNotes && cleanItems.length === 0) return null

  if (cleanItems.length === 0) return cleanNotes

  const checklistBlock = [
    'Langkah Kerja (AI):',
    ...cleanItems.map((item) => `- [${item.done ? 'x' : ' '}] ${item.text.trim()}`),
  ].join('\n')

  return cleanNotes ? `${cleanNotes}\n\n${checklistBlock}` : checklistBlock
}

export default function EditTaskModal({
  task,
  userEmail,
  onClose,
  onSave,
  onDelete,
}: EditTaskModalProps) {
  const initialParsed = parseChecklistFromDescription(task.description)

  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(initialParsed.notes)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    initialParsed.items
  )
  const [newSubtask, setNewSubtask] = useState('')
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

    const res = await breakdownTaskAction(title.trim(), notes.trim())
    if (res.ok) {
      const parsed = parseChecklistFromDescription(res.checklist)
      setChecklist((prev) => [...prev, ...parsed.items])
    } else {
      setAiError(res.error)
    }
    setGeneratingChecklist(false)
  }

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    )
  }

  const removeChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id))
  }

  const handleAddSubtask = () => {
    const trimmed = newSubtask.trim()
    if (!trimmed) return
    setChecklist((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        text: trimmed,
        done: false,
      },
    ])
    setNewSubtask('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || saving) return
    setSaving(true)

    await onSave(task.id, {
      title: title.trim(),
      description: serializeDescription(notes, checklist),
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

  const completedCount = checklist.filter((c) => c.done).length

    return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden"
      >
        {/* Header Fixed */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-white">
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

        {/* Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri: Form Edit + Checklist + Lampiran */}
            <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-4">
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

              {/* Deskripsi Utama */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">
                    Deskripsi
                  </label>
                  <button
                    type="button"
                    disabled={generatingChecklist || !title.trim()}
                    onClick={handleAiBreakdown}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {generatingChecklist ? 'Menyusun...' : 'Pecah Sub-tugas'}
                    </span>
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Tambahkan ringkasan atau konteks tugas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 resize-y"
                />
                {aiError && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {aiError}
                  </p>
                )}
              </div>

              {/* Sub-tugas Interaktif */}
              <div className="space-y-2 rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Sub-tugas
                  </span>
                  {checklist.length > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {completedCount}/{checklist.length} selesai
                    </span>
                  )}
                </div>

                {checklist.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className="group flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200/70 hover:border-blue-300 transition cursor-pointer"
                      >
                        <button
                          type="button"
                          aria-label="Tandai selesai"
                          className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition ${
                            item.done
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-slate-300 group-hover:border-blue-400'
                          }`}
                        >
                          {item.done && <Check className="w-3 h-3 stroke-3" />}
                        </button>
                        <span
                          className={`flex-1 text-xs leading-relaxed transition ${
                            item.done
                              ? 'line-through text-slate-400'
                              : 'text-slate-700'
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeChecklistItem(item.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Hapus sub-tugas"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input Tambah Sub-tugas Manual */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSubtask()
                      }
                    }}
                    placeholder="Tambah sub-tugas baru..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
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

        {/* Footer Action Bar Fixed */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Tugas</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="edit-task-form"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold btn-warm-cta text-white rounded-xl cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
