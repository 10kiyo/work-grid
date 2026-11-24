'use client'

import { useFormStatus } from 'react-dom'
import { ArrowRight, Loader2 } from 'lucide-react'

export default function DemoLoginButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2.5 btn-warm-cta text-white font-semibold px-8 py-3.5 rounded-2xl cursor-pointer text-base disabled:opacity-85"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Menyiapkan Workspace...</span>
        </>
      ) : (
        <>
          <span>Masuk dengan Akun Demo (1-Klik)</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  )
}
