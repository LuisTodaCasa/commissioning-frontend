/**
 * Cliente HTTP da API do Sistema de Comissionamento.
 *
 * TAREFA 7 — BACKEND_URL:
 * A URL base é obtida EXCLUSIVAMENTE de `process.env.NEXT_PUBLIC_BACKEND_URL`.
 * O fallback para localhost serve apenas para desenvolvimento local.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const TOKEN_STORAGE_KEY = 'comm_token'

class ApiClient {
  private token: string | null = null

  constructor() {
    // Recupera o token persistido (executa apenas no navegador)
    if (typeof window !== 'undefined') {
      this.token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    }
  }

  /** Define e persiste o token JWT. */
  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    }
  }

  /** Remove o token (logout). */
  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }

  /** Retorna o token atual (ou null). */
  getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      this.token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    }
    return this.token
  }

  /** Retorna a URL base configurada. */
  get baseUrl(): string {
    return BASE_URL
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.getToken() ? { Authorization: `Bearer ${this.getToken()}` } : {}),
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...((options.headers as Record<string, string>) || {}) },
    })

    if (res.status === 401) {
      // Token inválido/expirado — limpa sessão
      this.clearToken()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }))
      const msg = typeof err.detail === 'string' ? err.detail : `Erro ${res.status}`
      throw new Error(msg)
    }

    // Alguns endpoints podem não retornar corpo
    const text = await res.text()
    return (text ? JSON.parse(text) : {}) as T
  }

  // ── Autenticação ──────────────────────────────────────────────
  async login(email: string, senha: string) {
    return this.request<{ access_token: string; token_type?: string; usuario?: any }>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      },
    )
  }

  async meuPerfil() {
    return this.request<any>('/api/v1/auth/me')
  }

  // ── Dashboard ─────────────────────────────────────────────────
  async dashboard() {
    return this.request<any>('/api/v1/dashboard')
  }

  // ── Tubulação (STHs) ──────────────────────────────────────────
  async listarSTHs(params?: { busca?: string; skip?: number; limit?: number }) {
    const q = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return this.request<any[]>(`/api/v1/tubulacao/sths${q ? '?' + q : ''}`)
  }

  async detalheSTH(id: number) {
    return this.request<any>(`/api/v1/tubulacao/sths/${id}`)
  }

  async criarPastaPorSTH(payload: any) {
    return this.request<any>('/api/v1/tubulacao/criar-pasta-por-sth', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  // ── Pastas de Teste ───────────────────────────────────────────
  async listarPastas(params?: Record<string, string | number>) {
    const q = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return this.request<any[]>(`/api/v1/pastas${q ? '?' + q : ''}`)
  }

  async detalharPasta(id: number) {
    return this.request<any>(`/api/v1/pastas/${id}`)
  }

  // ── Linhas de Tubulação ───────────────────────────────────────
  async listarLinhas(params?: Record<string, string | number>) {
    const q = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return this.request<any[]>(`/api/v1/linhas${q ? '?' + q : ''}`)
  }

  // ── Relatórios ────────────────────────────────────────────────
  async listarRelatorios(params?: Record<string, string | number>) {
    const q = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return this.request<any[]>(`/api/v1/relatorios${q ? '?' + q : ''}`)
  }

  async detalharRelatorio(id: number) {
    return this.request<any>(`/api/v1/relatorios/${id}`)
  }

  // ── Sincronização offline ─────────────────────────────────────
  async sincronizar(payload: any) {
    return this.request<any>('/api/v1/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}

export const api = new ApiClient()
export default api
