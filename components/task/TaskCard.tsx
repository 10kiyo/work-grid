'use client'

import { Draggable } from '@hello-pangea/dnd'
import { GripVertical, Trash2, Calendar } from 'lucide-react'

export type Task = {
  id: string
  column_id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  position: number
  due_date: string | null
}

interface TaskCardProps {
  task: Task
  index: number
  onSelect: (task: Task) => void
  onDelete: (taskId: string) => void
}

const priorityStyles = {
  low: 'bg-sky-50 text-sky-700 border-sky-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
}

export function getDueDateBadge(dueDate: string | null) {
  if (!dueDate) return null
  const dateObj = new Date(dueDate)
  if (Number.isNaN(dateObj.getTime())) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateObj)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  const label = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })

  if (diffDays < 0) {
    return {
      label: `Terlambat • ${label}`,
      className: 'bg-rose-50 text-rose-600 border-rose-200',
    }
  }
  if (diffDays === 0) {
    return {
      label: `Hari ini • ${label}`,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    }
  }
  return {
    label,
    className: 'bg-slate-50 text-slate-600 border-slate-200',
  }
}

export default function TaskCard({
  task,
  index,
  onSelect,
  onDelete,
}: TaskCardProps) {
  const dueBadge = getDueDateBadge(task.due_date)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(dragProvided, dragSnapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          onClick={() => onSelect(task)}
          className={`group p-4 rounded-2xl cursor-pointer ${
            dragSnapshot.isDragging
              ? 'light-glass-card-dragging'
              : 'light-glass-card'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <span
                {...dragProvided.dragHandleProps}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 text-slate-300 hover:text-blue-500 cursor-grab transition"
              >
                <GripVertical className="w-4 h-4" />
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                {task.title}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition cursor-pointer"
              title="Hapus tugas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 mt-1.5 pl-6 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="mt-3.5 pl-6 flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                priorityStyles[task.priority]
              }`}
            >
              {task.priority}
            </span>

            {dueBadge && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${dueBadge.className}`}
              >
                <Calendar className="w-3 h-3" />
                <span>{dueBadge.label}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
