'use client'

import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/utils/supabase/client'
import Navbar from '@/components/Navbar'
import BoardToolbar, { PriorityFilter } from '@/components/BoardToolbar'
import TaskCard, { Task } from '@/components/TaskCard'
import AddTaskForm from '@/components/AddTaskForm'
import EditTaskModal from '@/components/EditTaskModal'

type Column = {
  id: string
  title: string
  position: number
  board_id: string
}

interface KanbanBoardProps {
  workspaceName: string
  boardTitle: string
  userEmail: string
  initialColumns: Column[]
  initialTasks: Task[]
}

export default function KanbanBoard({
  workspaceName,
  boardTitle,
  userEmail,
  initialColumns,
  initialTasks,
}: KanbanBoardProps) {
  const [columns] = useState<Column[]>(initialColumns)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const inserted = payload.new as Task
            setTasks((prev) =>
              prev.some((t) => t.id === inserted.id) ? prev : [...prev, inserted]
            )
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Task
            setTasks((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setTasks((prev) => prev.filter((t) => t.id !== deletedId))
          }
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q ||
      task.title.toLowerCase().includes(q) ||
      (task.description?.toLowerCase().includes(q) ?? false)

    return matchesPriority && matchesSearch
  })

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const destColumnId = destination.droppableId
    const destTasks = tasks
      .filter((t) => t.column_id === destColumnId && t.id !== draggableId)
      .sort((a, b) => a.position - b.position)

    let newPosition = 1000
    if (destTasks.length === 0) {
      newPosition = 1000
    } else if (destination.index === 0) {
      newPosition = destTasks[0].position / 2
    } else if (destination.index >= destTasks.length) {
      newPosition = destTasks[destTasks.length - 1].position + 1000
    } else {
      const prevPos = destTasks[destination.index - 1].position
      const nextPos = destTasks[destination.index].position
      newPosition = (prevPos + nextPos) / 2
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId
          ? { ...t, column_id: destColumnId, position: newPosition }
          : t
      )
    )

    await supabase
      .from('tasks')
      .update({ column_id: destColumnId, position: newPosition })
      .eq('id', draggableId)
  }

  const handleAddTask = async (
    columnId: string,
    title: string,
    priority: 'low' | 'medium' | 'high'
  ) => {
    const colTasks = tasks.filter((t) => t.column_id === columnId)
    const maxPos = colTasks.reduce((max, t) => Math.max(max, t.position), 0)

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        column_id: columnId,
        title,
        priority,
        position: maxPos + 1000,
      })
      .select()
      .single()

    if (!error && data) {
      setTasks((prev) =>
        prev.some((t) => t.id === data.id) ? prev : [...prev, data as Task]
      )
    }
  }

  const handleUpdateTask = async (
    taskId: string,
    updates: {
      title: string
      description: string | null
      priority: 'low' | 'medium' | 'high'
    }
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    )

    await supabase.from('tasks').update(updates).eq('id', taskId)
  }

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  return (
    <div className="relative min-h-screen daylight-board-bg text-slate-900 flex flex-col overflow-x-clip">
      <Navbar
        variant="light"
        title={boardTitle}
        badge={workspaceName}
        userEmail={userEmail}
        showLogout
        isRealtimeConnected={isRealtimeConnected}
      />

      <BoardToolbar
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalVisible={filteredTasks.length}
        totalTasks={tasks.length}
      />

      <main className="relative z-10 flex-1 p-6 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-5 items-start min-w-max animate-fade-up">
            {columns.map((col) => {
              const colTasks = filteredTasks
                .filter((t) => t.column_id === col.id)
                .sort((a, b) => a.position - b.position)

              return (
                <div
                  key={col.id}
                  className="w-80 rounded-3xl p-4 flex flex-col gap-3 light-glass-panel"
                >
                  <div className="flex items-center justify-between px-1.5 pt-0.5">
                    <h2 className="font-bold text-sm tracking-tight text-slate-800">
                      {col.title}
                    </h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      {colTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-30 rounded-2xl p-1 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-sky-100/60' : ''
                        }`}
                      >
                        {colTasks.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onSelect={setEditingTask}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <AddTaskForm
                    onAdd={(title, priority) =>
                      handleAddTask(col.id, title, priority)
                    }
                  />
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </main>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  )
}
