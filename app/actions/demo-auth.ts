'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const DEMO_EMAIL = 'recruiter.demo@workgrid.app'
const DEMO_PASSWORD = 'DemoPassword123!'

export async function loginAsDemo() {
  const admin = createAdminClient()
  const supabase = await createClient()

  // 1. Cek atau buat akun demo menggunakan Admin API (bypass email confirmation)
  const { data: usersData } = await admin.auth.admin.listUsers()
  let demoUser = usersData?.users.find((u) => u.email === DEMO_EMAIL)

  if (!demoUser) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Alex Morgan (Demo Recruiter)' },
    })
    if (createError) throw new Error(createError.message)
    demoUser = created.user
  }

  // 2. Cek apakah user demo sudah punya workspace; jika belum, buat data awal
  const { data: existingWorkspaces } = await admin
    .from('workspaces')
    .select('id')
    .eq('owner_id', demoUser.id)
    .limit(1)

  if (!existingWorkspaces || existingWorkspaces.length === 0) {
    const { data: workspace } = await admin
      .from('workspaces')
      .insert({ name: 'Acme Product Team', owner_id: demoUser.id })
      .select()
      .single()

    if (workspace) {
      await admin.from('workspace_members').insert({
        workspace_id: workspace.id,
        user_id: demoUser.id,
        role: 'admin',
      })

      const { data: board } = await admin
        .from('boards')
        .insert({ workspace_id: workspace.id, title: 'Q4 Platform Launch' })
        .select()
        .single()

      if (board) {
        const { data: cols } = await admin
          .from('columns')
          .insert([
            { board_id: board.id, title: 'To Do', position: 1000 },
            { board_id: board.id, title: 'In Progress', position: 2000 },
            { board_id: board.id, title: 'Done', position: 3000 },
          ])
          .select()

        if (cols && cols.length === 3) {
          const todoCol = cols.find((c) => c.title === 'To Do')!
          const progressCol = cols.find((c) => c.title === 'In Progress')!
          const doneCol = cols.find((c) => c.title === 'Done')!

          await admin.from('tasks').insert([
            {
              column_id: todoCol.id,
              title: 'Audit performa query RLS Supabase',
              description: 'Pastikan indeks composite terpasang di workspace_members.',
              priority: 'high',
              position: 1000,
              assignee_id: demoUser.id,
            },
            {
              column_id: todoCol.id,
              title: 'Tambahkan filter tugas berdasarkan prioritas',
              description: 'Memudahkan tim menyaring task mendesak di papan sprint.',
              priority: 'medium',
              position: 2000,
            },
            {
              column_id: progressCol.id,
              title: 'Sinkronisasi drag-and-drop via Supabase Realtime',
              description: 'Pembaruan posisi kartu secara instan ke seluruh anggota.',
              priority: 'high',
              position: 1000,
              assignee_id: demoUser.id,
            },
            {
              column_id: doneCol.id,
              title: 'Setup autentikasi SSR Next.js & skema database',
              description: 'Integrasi @supabase/ssr dan trigger profil otomatis.',
              priority: 'low',
              position: 1000,
              assignee_id: demoUser.id,
            },
          ])
        }
      }
    }
  }

  // 3. Login-kan sesi user demo ke browser
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })

  if (signInError) throw new Error(signInError.message)

  redirect('/board')
}
