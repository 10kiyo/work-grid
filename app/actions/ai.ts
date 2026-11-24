'use server'

type BoardTaskSummaryInput = {
  boardTitle: string
  columns: { id: string; title: string }[]
  tasks: {
    title: string
    description: string | null
    priority: string
    due_date: string | null
    column_id: string
  }[]
}

const OPENROUTER_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'openrouter/free',
]

async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY belum ditambahkan di .env.local.')
  }

  let lastError = 'Layanan AI sedang sibuk.'

  for (const model of OPENROUTER_MODELS) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'WorkGrid',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            max_tokens: 1200,
          }),
          cache: 'no-store',
        }
      )

      if (response.ok) {
        const data = await response.json()
        const msg = data?.choices?.[0]?.message
        const text =
          (typeof msg?.content === 'string' && msg.content.trim()) ||
          (typeof msg?.reasoning === 'string' && msg.reasoning.trim())

        if (text) return text
      } else {
        lastError = `(${response.status}) ${await response.text()}`
      }
    } catch (err) {
      lastError =
        err instanceof Error && err.name === 'AbortError'
          ? 'Timeout 15 detik'
          : err instanceof Error
            ? err.message
            : 'Gagal terhubung'
    } finally {
      clearTimeout(timeoutId)
    }
  }

  throw new Error(`OpenRouter gagal: ${lastError}`)
}

export async function generateBoardSummaryAction(
  payload: BoardTaskSummaryInput
) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const columnMap = new Map(payload.columns.map((c) => [c.id, c.title]))

    const formattedTasks = payload.tasks
      .map((t, idx) => {
        const status = columnMap.get(t.column_id) ?? 'Unknown'
        const due = t.due_date ? t.due_date.slice(0, 10) : 'Tanpa tenggat'
        return `${idx + 1}. [${status}] ${t.title} (Prioritas: ${t.priority}, Tenggat: ${due})`
      })
      .join('\n')

    const prompt = `Kamu adalah asisten manajer proyek untuk aplikasi WorkGrid. Hari ini tanggal ${today}.
Analisis kondisi papan kerja "${payload.boardTitle}" berikut:

${formattedTasks || 'Belum ada tugas di board ini.'}

Buat ringkasan singkat, padat, dan profesional dalam Bahasa Indonesia dengan format persis 3 bagian berikut (gunakan bullet point "- ", tanpa markdown heading):
STATUS SAAT INI:
- (1-2 poin gambaran distribusi tugas antar kolom)

PRIORITAS & RISIKO TENGGAT:
- (1-2 poin tugas high priority atau yang mendekati/melewati tenggat ${today})

REKOMENDASI LANGKAH BERIKUTNYA:
- (1-2 poin tindakan konkret yang sebaiknya dikerjakan tim hari ini)`

    const summary = await callAI(prompt)
    return { ok: true as const, summary }
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : 'Gagal membuat ringkasan AI.',
    }
  }
}

export async function breakdownTaskAction(
  title: string,
  currentDescription: string
) {
  try {
    const prompt = `Kamu adalah asisten teknis untuk aplikasi manajemen proyek WorkGrid.
Judul tugas: "${title}"
Catatan saat ini: "${currentDescription || 'Tidak ada'}"

Pecah tugas tersebut menjadi 4 sampai 5 langkah kerja (checklist) yang konkret, singkat, dan siap dieksekusi dalam Bahasa Indonesia.
Format output HANYA daftar checklist menggunakan awalan "- [ ] " per baris, tanpa kalimat pembuka atau penutup.`

    const checklist = await callAI(prompt)
    return { ok: true as const, checklist }
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : 'Gagal memecah sub-tugas.',
    }
  }
}
