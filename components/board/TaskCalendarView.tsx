'use client'

import { useState } from 'react'
import { Task } from '@/components/task/TaskCard'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface TaskCalendarViewProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
}

const priorityDot = {
  low: 'bg-sky-500',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
}

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function TaskCalendarView({
  tasks,
  onSelectTask,
}: TaskCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthLabel = currentMonth.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  const tasksWithDate = tasks.filter((t) => Boolean(t.due_date))
  const unscheduledTasks = tasks.filter((t) => !t.due_date)

  const getTasksForDay = (day: number) => {
    return tasksWithDate.filter((t) => {
      const d = new Date(t.due_date!)
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      )
    })
  }

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 animate-fade-up">
      {/* Kalender Utama */}
      <div className="xl:col-span-3 rounded-3xl light-glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-800 capitalize">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="p-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const now = new Date()
                setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
              }}
              className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="p-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 text-slate-600 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Header Nama Hari */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {dayNames.map((name) => (
            <div
              key={name}
              className="text-xs font-bold text-slate-500 py-1.5"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Grid Tanggal */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-24 rounded-2xl bg-white/30 border border-white/40"
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1
            const dayTasks = getTasksForDay(day)
            return (
              <div
                key={day}
                className={`min-h-24 rounded-2xl p-2 border transition flex flex-col gap-1.5 ${
                  isToday(day)
                    ? 'bg-blue-50/90 border-blue-300'
                    : 'bg-white/75 border-slate-200/70'
                }`}
              >
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday(day)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700'
                  }`}
                >
                  {day}
                </span>

                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="w-full text-left px-2 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200/80 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          priorityDot[task.priority]
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {task.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sidebar: Tugas Tanpa Tenggat */}
      <div className="rounded-3xl light-glass-panel p-5 space-y-3 h-fit">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm">Belum Terjadwal</h3>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
            {unscheduledTasks.length}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Klik tugas untuk menambahkan tenggat waktu agar muncul di kalender.
        </p>

        <div className="space-y-2 pt-1">
          {unscheduledTasks.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Semua tugas sudah memiliki tenggat waktu!
            </p>
          ) : (
            unscheduledTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="w-full text-left p-3 rounded-2xl bg-white/85 hover:bg-white border border-slate-200/80 transition cursor-pointer space-y-1"
              >
                <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                  {task.title}
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Prioritas {task.priority}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
