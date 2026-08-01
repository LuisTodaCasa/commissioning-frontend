'use client'

import { useEffect } from 'react'

/**
 * Registra o Service Worker do PWA no carregamento da aplicação.
 * TAREFA 9 — Registro do Service Worker.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('[SW] Service Worker registrado com sucesso'))
        .catch((err) => console.error('[SW] Erro ao registrar:', err))
    }
  }, [])

  return null
}
