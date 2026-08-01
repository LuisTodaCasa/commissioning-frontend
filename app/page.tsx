'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dataService from '@/lib/data-service'

/**
 * Página raiz: redireciona para /dashboard (autenticado) ou /login.
 */
export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (dataService.isAuthenticated()) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-500">Carregando…</p>
    </div>
  )
}
