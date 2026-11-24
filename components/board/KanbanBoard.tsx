'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/utils/supabase/client'
import Navbar from '@/components/layout/Navbar'
import BoardToolbar, { BoardViewMode } from '@/components/board/BoardToolbar'
import TaskCard, { Task } from '@/components/task/TaskCard'
import AddTaskForm from '@/components/task/AddTaskForm'
import EditTaskModal from '@/components/modals/EditTaskModal'
import TaskListView from '@/components/board/TaskListView'
import TaskCalendarView from '@/components/board/TaskCalendarView'
import AiSummaryModal from '@/components/modals/AiSummaryModal'
import { generateBoardSummaryAction } from '@/app/actions/ai'
import { useBoardTasks, BoardColumn } from '@/hooks/useBoardTasks'
import { Pencil } from 'lucide-react'

interface KanbanBoardProps {
  workspaceId: string
  workspaceName: string
  inviteCode?: string | null
  boardId: string
  boardTitle: string
  canManage?: boolean
  userEmail: string
  initialColumns: BoardColumn[]
  initialTasks: Task[]
}

export default function KanbanBoard({
  workspaceId,
  workspaceName,
  inviteCode,
  boardId,
  boardTitle,
  canManage = false,
  userEmail,
  initialColumns,
  initialTasks,
}: KanbanBoardProps) {
  const supabase = createClient()
  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns)
  const [editingColId, setEditingColId] = useState<string | null>(null)
  const [editingColTitle, setEditingColTitle] = useState('')

  const [viewMode, setViewMode] = useState<BoardViewMode>('board')
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // State AI Summary Modal
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const {
    tasks,
    filteredTasks,
    isRealtimeConnected,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    reorderTask,
    changeTaskColumn,
    addTask,
    updateTask,
    deleteTask,
  } = useBoardTasks(columns, initialTasks, userEmail)

  const handleSaveColumnTitle = async (col: BoardColumn) => {
    setEditingColId(null)
    const trimmed = editingColTitle.trim()
    if (!trimmed || trimmed === col.title || !canManage) return

    const previousColumns = columns
    setColumns((prev) =>
      prev.map((c) => (c.id === col.id ? { ...c, title: trimmed } : c))
    )

    const { error } = await supabase
      .from('columns')
      .update({ title: trimmed })
      .eq('id', col.id)

    if (error) {
      setColumns(previousColumns)
    }
  }

  const handleOpenAiSummary = async () => {
    setAiModalOpen(true)
    setAiLoading(true)
    setAiError(null)

    const res = await generateBoardSummaryAction({
      boardTitle,
      columns: columns.map((c) => ({ id: c.id, title: c.title })),
      tasks: tasks.map((t) => ({
        title: t.title,
        description: t.description,
        priority: t.priority,
        due_date: t.due_date,
        column_id: t.column_id,
      })),
    })

    if (res.ok) {
      setAiSummary(res.summary)
    } else {
      setAiError(res.error)
    }
    setAiLoading(false)
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    await reorderTask(draggableId, destination.droppableId, destination.index)
  }

  return (
    <div className="relative min-h-screen daylight-board-bg text-slate-900 flex flex-col overflow-x-clip">
      <Navbar
        variant="light"
        title={boardTitle}
        badge={workspaceName}
        inviteCode={inviteCode}
        canManage={canManage}
        workspaceId={workspaceId}
        boardId={boardId}
        userEmail={userEmail}
        showLogout
        isRealtimeConnected={isRealtimeConnected}
      />

      <BoardToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalVisible={filteredTasks.length}
        totalTasks={tasks.length}
        onOpenAiSummary={handleOpenAiSummary}
      />

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-4">
        {viewMode === 'board' && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row gap-5 items-start animate-fade-up">
              {columns.map((col) => {
                const colTasks = filteredTasks
                  .filter((t) => t.column_id === col.id)
                  .sort((a, b) => a.position - b.position)

                return (
                  <div
                    key={col.id}
                    className="w-full md:flex-1 md:min-w-0 rounded-3xl p-4 flex flex-col gap-3 light-glass-panel"
                  >
                    <div className="flex items-center justify-between px-1.5 pt-0.5">
                      {canManage && editingColId === col.id ? (
                        <input
                          type="text"
                          value={editingColTitle}
                          onChange={(e) => setEditingColTitle(e.target.value)}
                          onBlur={() => handleSaveColumnTitle(col)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveColumnTitle(col)
                            if (e.key === 'Escape') setEditingColId(null)
                          }}
                          autoFocus
                          className="font-bold text-sm text-slate-800 bg-white border border-blue-400 rounded-lg px-2 py-0.5 focus:outline-none w-full mr-2"
                        />
                      ) : (
                        <button
                          type="button"
                          disabled={!canManage}
                          onClick={() => {
                            if (!canManage) return
                            setEditingColId(col.id)
                            setEditingColTitle(col.title)
                          }}
                          title={canManage ? 'Klik untuk ubah nama kolom' : undefined}
                          className={`group inline-flex items-center gap-1.5 font-bold text-sm tracking-tight text-slate-800 ${
                            canManage
                              ? 'hover:text-blue-600 cursor-pointer'
                              : 'cursor-default'
                          }`}
                        >
                          <span>{col.title}</span>
                          {canManage && (
                            <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                          )}
                        </button>
                      )}

                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {colTasks.length}
                      </span>
                    </div>

                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-36 rounded-2xl p-1 transition-colors ${
                            snapshot.isDraggingOver ? 'bg-sky-100/60' : ''
                          }`}
                        >
                          {colTasks.map((task, index) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              index={index}
                              onSelect={setEditingTask}
                              onDelete={deleteTask}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    <AddTaskForm
                      onAdd={(title, priority) =>
                        addTask(col.id, title, priority)
                      }
                    />
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        )}

        {viewMode === 'list' && (
          <TaskListView
            columns={columns}
            tasks={filteredTasks}
            onSelectTask={setEditingTask}
            onDeleteTask={deleteTask}
            onChangeColumn={changeTaskColumn}
          />
        )}

        {viewMode === 'calendar' && (
          <TaskCalendarView
            tasks={filteredTasks}
            onSelectTask={setEditingTask}
          />
        )}
      </main>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          userEmail={userEmail}
          onClose={() => setEditingTask(null)}
          onSave={updateTask}
          onDelete={deleteTask}
        />
      )}

      {aiModalOpen && (
        <AiSummaryModal
          boardTitle={boardTitle}
          summary={aiSummary}
          loading={aiLoading}
          error={aiError}
          onRegenerate={handleOpenAiSummary}
          onClose={() => setAiModalOpen(false)}
        />
      )}
    </div>
  )
}
