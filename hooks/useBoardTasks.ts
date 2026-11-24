'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Task } from '@/components/task/TaskCard'
import { PriorityFilter } from '@/components/board/BoardToolbar'

export type BoardColumn = {
  id: string
  title: string
  position: number
  board_id: string
}

export function useBoardTasks(
  columns: BoardColumn[],
  initialTasks: Task[],
  userEmail: string
) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createClient()

  const logActivity = async (taskId: string, action: string) => {
    await supabase.from('task_activities').insert({
      task_id: taskId,
      actor_email: userEmail,
      action,
    })
  }

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

  const moveTaskToColumn = async (
    taskId: string,
    destColumnId: string,
    newPosition: number
  ) => {
    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask) return

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, column_id: destColumnId, position: newPosition }
          : t
      )
    )

    await supabase
      .from('tasks')
      .update({ column_id: destColumnId, position: newPosition })
      .eq('id', taskId)

    if (targetTask.column_id !== destColumnId) {
      const fromCol = columns.find((c) => c.id === targetTask.column_id)?.title
      const toCol = columns.find((c) => c.id === destColumnId)?.title
      if (fromCol && toCol) {
        await logActivity(
          taskId,
          `memindahkan tugas dari "${fromCol}" ke "${toCol}"`
        )
      }
    }
  }

  const reorderTask = async (
    taskId: string,
    destColumnId: string,
    destIndex: number
  ) => {
    const destTasks = tasks
      .filter((t) => t.column_id === destColumnId && t.id !== taskId)
      .sort((a, b) => a.position - b.position)

    let newPosition = 1000
    if (destTasks.length === 0) {
      newPosition = 1000
    } else if (destIndex === 0) {
      newPosition = destTasks[0].position / 2
    } else if (destIndex >= destTasks.length) {
      newPosition = destTasks[destTasks.length - 1].position + 1000
    } else {
      const prevPos = destTasks[destIndex - 1].position
      const nextPos = destTasks[destIndex].position
      newPosition = (prevPos + nextPos) / 2
    }

    await moveTaskToColumn(taskId, destColumnId, newPosition)
  }

  const changeTaskColumn = async (taskId: string, newColumnId: string) => {
    const colTasks = tasks.filter((t) => t.column_id === newColumnId)
    const maxPos = colTasks.reduce((max, t) => Math.max(max, t.position), 0)
    await moveTaskToColumn(taskId, newColumnId, maxPos + 1000)
  }

  const addTask = async (
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
      const colTitle = columns.find((c) => c.id === columnId)?.title ?? 'board'
      await logActivity(data.id, `membuat tugas ini di kolom "${colTitle}"`)
    }
  }

  const updateTask = async (
    taskId: string,
    updates: {
      title: string
      description: string | null
      priority: 'low' | 'medium' | 'high'
      due_date: string | null
    }
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    )

    await supabase.from('tasks').update(updates).eq('id', taskId)
    await logActivity(
      taskId,
      `memperbarui detail tugas (prioritas: ${updates.priority})`
    )
  }

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  return {
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
  }
}
