/*
 * Service Worker do Sistema de Comissionamento (PWA).
 *
 * TAREFA 9 — Service Worker:
 *  - Faz cache dos assets estáticos no evento de install.
 *  - No fetch: estratégia network-first para chamadas de API (com fallback
 *    para o cache quando offline) e cache-first para os assets estáticos.
 */

const CACHE_NAME = 'comm-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/manifest.json',
]

// Instala e faz cache dos assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Falha ao pré-cachear alguns assets:', err)
      })
    }),
  )
  self.skipWaiting()
})

// Ativa e limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativo')
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      ),
    ),
  )
  self.clients.claim()
})

// Estratégia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Ignora requisições não-GET (POST/PUT/DELETE não são cacheáveis)
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const isApi = url.pathname.includes('/api/')

  if (isApi) {
    // API: network-first com fallback para cache (rotas de API offline)
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || Response.error())),
    )
    return
  }

  // Assets estáticos: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match('/'))
    }),
  )
})
