import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import KanbanBoard from '@/components/KanbanBoard'

export const instant = false

export default async function BoardPage() {
  await connection()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id, name, boards(id, title)')
    .limit(1)

  const workspace = workspaces?.[0]
  const board = workspace?.boards?.[0]

  if (!board) {
    return (
      <div className="min-h-screen text-white/80 flex items-center justify-center">
        <p>Belum ada papan proyek ditemukan.</p>
      </div>
    )
  }

  const { data: columns } = await supabase
    .from('columns')
    .select('id, title, position, board_id')
    .eq('board_id', board.id)
    .order('position', { ascending: true })

  const columnIds = columns?.map((c) => c.id) ?? []

  const { data: tasks } =
    columnIds.length > 0
      ? await supabase
          .from('tasks')
          .select('id, column_id, title, description, priority, position')
          .in('column_id', columnIds)
          .order('position', { ascending: true })
      : { data: [] }

  return (
    <KanbanBoard
      workspaceName={workspace.name}
      boardTitle={board.title}
      userEmail={user.email ?? 'Demo User'}
      initialColumns={columns ?? []}
      initialTasks={tasks ?? []}
    />
  )
}
