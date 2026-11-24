'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

interface AddTaskFormProps {
  onAdd: (title: string, priority: 'low' | 'medium' | 'high') => Promise<void>
}

export default function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || loading) return
    setLoading(true)
    await onAdd(title.trim(), priority)
    setTitle('')
    setPriority('medium')
    setLoading(false)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 py-2 px-3 rounded-xl hover:bg-white/80 transition cursor-pointer"
      >
        <Plus className="w-4 h-4 text-blue-500" />
        <span>Tambah tugas</span>
      </button>
    )
  }

  return (
    <div className="p-3.5 rounded-2xl light-glass-card space-y-2.5">
      <input
        type="text"
        placeholder="Judul tugas baru..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') setIsOpen(false)
        }}
        autoFocus
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
      />
      <div className="flex items-center justify-between gap-2">
        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as 'low' | 'medium' | 'high')
          }
          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsOpen(false)}
            className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3.5 py-1 text-xs font-semibold btn-warm-cta text-white rounded-xl cursor-pointer disabled:opacity-60"
          >
            {loading ? '...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
