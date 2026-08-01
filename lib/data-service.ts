/**
 * Serviço de dados central do Sistema de Comissionamento.
 *
 * TAREFA 10 — SEM MODO DEMONSTRAÇÃO:
 * O modo é FORÇADO para 'real' permanentemente. Não existe modo demo,
 * nenhum dado mockado é retornado — todos os métodos fazem chamadas reais
 * à API do backend (via lib/api.ts). Quando offline, os dados são lidos
 * do cache IndexedDB.
 *
 * Implementado como singleton.
 */

import api from './api'
import {
  dbGetAll,
  dbBulkPut,
  dbGet,
  enqueueSync,
} from './indexed-db'

type Mode = 'real'

class DataService {
  // _mode é 'real' PERMANENTEMENTE. Não há setter público que permita 'demo'.
  private readonly _mode: Mode = 'real'

  constructor() {
    // Reforço explícito: o modo real é fixado no init e nunca é alterado.
    this._mode = 'real'
  }

  /** Sempre retorna 'real'. Não existe modo demonstração. */
  get mode(): Mode {
    return this._mode
  }

  /** Indica se o navegador está online. */
  private get online(): boolean {
    return typeof navigator === 'undefined' ? true : navigator.onLine
  }

  // ── Autenticação ──────────────────────────────────────────────
  async login(email: string, senha: string) {
    const data = await api.login(email, senha)
    if (data.access_token) api.setToken(data.access_token)
    return data
  }

  logout() {
    api.clearToken()
  }

  isAuthenticated(): boolean {
    return !!api.getToken()
  }

  // ── Dashboard ─────────────────────────────────────────────────
  async getDashboard() {
    return api.dashboard()
  }

  // ── Tubulação (STHs) ──────────────────────────────────────────
  async listarSTHs(busca?: string) {
    return api.listarSTHs(busca ? { busca } : undefined)
  }

  async detalheSTH(id: number) {
    return api.detalheSTH(id)
  }

  async criarPastaPorSTH(payload: any) {
    return api.criarPastaPorSTH(payload)
  }

  // ── Pastas de Teste ───────────────────────────────────────────
  async listarPastas(params?: Record<string, string | number>) {
    if (this.online) {
      const pastas = await api.listarPastas(params)
      // Atualiza o cache offline
      try {
        if (Array.isArray(pastas)) await dbBulkPut('pastas', pastas)
      } catch {
        /* cache é best-effort */
      }
      return pastas
    }
    // Offline: usa o cache local
    return dbGetAll<any>('pastas')
  }

  async detalharPasta(id: number) {
    if (this.online) {
      return api.detalharPasta(id)
    }
    return dbGet<any>('pastas', id)
  }

  // ── Linhas de Tubulação ───────────────────────────────────────
  async listarLinhas(params?: Record<string, string | number>) {
    if (this.online) {
      const linhas = await api.listarLinhas(params)
      try {
        if (Array.isArray(linhas)) await dbBulkPut('linhas', linhas)
      } catch {
        /* best-effort */
      }
      return linhas
    }
    return dbGetAll<any>('linhas')
  }

  // ── Relatórios ────────────────────────────────────────────────
  async listarRelatorios(params?: Record<string, string | number>) {
    if (this.online) {
      const relatorios = await api.listarRelatorios(params)
      try {
        if (Array.isArray(relatorios)) await dbBulkPut('relatorios', relatorios)
      } catch {
        /* best-effort */
      }
      return relatorios
    }
    return dbGetAll<any>('relatorios')
  }

  async detalharRelatorio(id: number) {
    if (this.online) {
      return api.detalharRelatorio(id)
    }
    return dbGet<any>('relatorios', id)
  }

  /** Enfileira uma operação para sincronização quando voltar a ficar online. */
  async enfileirarSync(tipo: string, payload: unknown) {
    return enqueueSync({ tipo, payload })
  }
}

// Singleton
export const dataService = new DataService()
export default dataService
