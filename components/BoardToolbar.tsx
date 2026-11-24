'use client'

import { Search, X } from 'lucide-react'

export type PriorityFilter = 'all' | 'high' | 'medium' | 'low'

interface BoardToolbarProps {
  priorityFilter: PriorityFilter
  onPriorityChange: (filter: PriorityFilter) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  totalVisible: number
  totalTasks: number
}

const filterOptions: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function BoardToolbar({
  priorityFilter,
  onPriorityChange,
  searchQuery,
  onSearchChange,
  totalVisible,
  totalTasks,
}: BoardToolbarProps) {
  return (
    <div className="mx-6 mt-4 px-4 py-3 rounded-2xl light-glass-panel flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 mr-1.5">
          Prioritas:
        </span>
        {filterOptions.map((item) => {
          const active = priorityFilter === item.value
          return (
            <button
              key={item.value}
              onClick={() => onPriorityChange(item.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Search & Counter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul atau deskripsi..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/90 border border-slate-200/90 rounded-xl pl-8 pr-8 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
          {totalVisible} / {totalTasks} tugas
        </span>
      </div>
    </div>
  )
}
