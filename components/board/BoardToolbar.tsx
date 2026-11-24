'use client'

import { Search, X, LayoutGrid, List, CalendarDays, Sparkles } from 'lucide-react'

export type PriorityFilter = 'all' | 'high' | 'medium' | 'low'
export type BoardViewMode = 'board' | 'list' | 'calendar'

interface BoardToolbarProps {
  viewMode: BoardViewMode
  onViewModeChange: (mode: BoardViewMode) => void
  priorityFilter: PriorityFilter
  onPriorityChange: (filter: PriorityFilter) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  totalVisible: number
  totalTasks: number
  onOpenAiSummary: () => void
}

const filterOptions: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const viewOptions: {
  value: BoardViewMode
  label: string
  icon: typeof LayoutGrid
}[] = [
  { value: 'board', label: 'Board', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
  { value: 'calendar', label: 'Kalender', icon: CalendarDays },
]

export default function BoardToolbar({
  viewMode,
  onViewModeChange,
  priorityFilter,
  onPriorityChange,
  searchQuery,
  onSearchChange,
  totalVisible,
  totalTasks,
  onOpenAiSummary,
}: BoardToolbarProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 pt-3">
      <div className="px-3.5 py-2.5 rounded-2xl light-glass-panel flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Switcher */}
          <div className="inline-flex items-center bg-slate-200/70 p-1 rounded-xl">
            {viewOptions.map((item) => {
              const Icon = item.icon
              const active = viewMode === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => onViewModeChange(item.value)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    active
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-0.5">
              Prioritas:
            </span>
            {filterOptions.map((item) => {
              const active = priorityFilter === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => onPriorityChange(item.value)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition cursor-pointer ${
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
        </div>

        {/* Search, Counter & AI Summary */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-56">
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

          <span className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/70 text-[11px] font-semibold text-slate-600 whitespace-nowrap">
            {totalVisible} / {totalTasks} tugas
          </span>

          <button
            type="button"
            onClick={onOpenAiSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Summary</span>
          </button>
        </div>
      </div>
    </div>
  )
}
