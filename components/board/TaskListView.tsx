'use client'

import { Task, getDueDateBadge } from '@/components/task/TaskCard'
import { Calendar, Trash2 } from 'lucide-react'

type Column = {
  id: string
  title: string
}

interface TaskListViewProps {
  columns: Column[]
  tasks: Task[]
  onSelectTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onChangeColumn: (taskId: string, newColumnId: string) => void
}

const priorityBadge = {
  low: 'bg-sky-50 text-sky-700 border-sky-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function TaskListView({
  columns,
  tasks,
  onSelectTask,
  onDeleteTask,
  onChangeColumn,
}: TaskListViewProps) {
  return (
    <div className="rounded-3xl light-glass-panel overflow-hidden animate-fade-up">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-white/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-5">Judul Tugas</th>
              <th className="py-3.5 px-4">Status Kolom</th>
              <th className="py-3.5 px-4">Prioritas</th>
              <th className="py-3.5 px-4">Tenggat</th>
              <th className="py-3.5 px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 text-sm">
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-xs text-slate-400"
                >
                  Tidak ada tugas yang sesuai dengan filter saat ini.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const dueBadge = getDueDateBadge(task.due_date)
                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="bg-white/75 hover:bg-white transition cursor-pointer"
                  >
                    <td className="py-3.5 px-5 max-w-md">
                      <p className="font-semibold text-slate-800">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </td>

                    <td
                      className="py-3.5 px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={task.column_id}
                        onChange={(e) =>
                          onChangeColumn(task.id, e.target.value)
                        }
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer"
                      >
                        {columns.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.title}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                          priorityBadge[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {dueBadge ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${dueBadge.className}`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{dueBadge.label}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    <td
                      className="py-3.5 px-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus tugas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
