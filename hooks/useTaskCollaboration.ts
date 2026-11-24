'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export type TaskComment = {
  id: string
  task_id: string
  user_id: string
  author_email: string
  content: string
  created_at: string
}

export type TaskActivity = {
  id: string
  task_id: string
  actor_email: string
  action: string
  created_at: string
}

export type TaskAttachment = {
  id: string
  task_id: string
  file_name: string
  file_path: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: string
  created_at: string
}

export function useTaskCollaboration(taskId: string, userEmail: string) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [comments, setComments] = useState<TaskComment[]>([])
  const [activities, setActivities] = useState<TaskActivity[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const fetchAll = async () => {
      setLoadingFeed(true)
      const [commentsRes, activitiesRes, attachmentsRes] = await Promise.all([
        supabase
          .from('task_comments')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true }),
        supabase
          .from('task_activities')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false }),
        supabase
          .from('task_attachments')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false }),
      ])

      if (!isMounted) return
      if (commentsRes.data) setComments(commentsRes.data as TaskComment[])
      if (activitiesRes.data) setActivities(activitiesRes.data as TaskActivity[])
      if (attachmentsRes.data)
        setAttachments(attachmentsRes.data as TaskAttachment[])
      setLoadingFeed(false)
    }

    fetchAll()

    const channel = supabase
      .channel(`task-feed-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          const inserted = payload.new as TaskComment
          setComments((prev) =>
            prev.some((c) => c.id === inserted.id) ? prev : [...prev, inserted]
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== payload.old.id))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_activities',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          const inserted = payload.new as TaskActivity
          setActivities((prev) =>
            prev.some((a) => a.id === inserted.id) ? prev : [inserted, ...prev]
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_attachments',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const inserted = payload.new as TaskAttachment
            setAttachments((prev) =>
              prev.some((f) => f.id === inserted.id) ? prev : [inserted, ...prev]
            )
          } else if (payload.eventType === 'DELETE') {
            setAttachments((prev) =>
              prev.filter((f) => f.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase, taskId])

  const uploadAttachment = async (file: File): Promise<string | null> => {
    if (file.size > 5 * 1024 * 1024) {
      return 'Ukuran file maksimal 5 MB.'
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${taskId}/${Date.now()}-${safeName}`

    const { error: storageError } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file)

    if (storageError) {
      return 'Gagal mengunggah file. Pastikan bucket sudah dibuat.'
    }

    const { data: publicData } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath)

    const { data: row, error: dbError } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_path: filePath,
        file_url: publicData.publicUrl,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        uploaded_by: userEmail,
      })
      .select()
      .single()

    if (dbError || !row) {
      return 'Gagal menyimpan metadata lampiran.'
    }

    setAttachments((prev) =>
      prev.some((f) => f.id === row.id) ? prev : [row as TaskAttachment, ...prev]
    )

    await supabase.from('task_activities').insert({
      task_id: taskId,
      actor_email: userEmail,
      action: `melampirkan berkas "${file.name}"`,
    })

    return null
  }

  const deleteAttachment = async (att: TaskAttachment) => {
    setAttachments((prev) => prev.filter((f) => f.id !== att.id))
    await supabase.storage.from('task-attachments').remove([att.file_path])
    await supabase.from('task_attachments').delete().eq('id', att.id)
  }

  const sendComment = async (content: string) => {
    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        author_email: userEmail,
        content,
      })
      .select()
      .single()

    if (!error && data) {
      setComments((prev) =>
        prev.some((c) => c.id === data.id) ? prev : [...prev, data as TaskComment]
      )
    }
  }

  const deleteComment = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    await supabase.from('task_comments').delete().eq('id', commentId)
  }

  return {
    attachments,
    comments,
    activities,
    loadingFeed,
    uploadAttachment,
    deleteAttachment,
    sendComment,
    deleteComment,
  }
}
