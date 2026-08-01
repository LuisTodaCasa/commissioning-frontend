/**
 * Camada de acesso ao IndexedDB para uso offline (PWA).
 *
 * TAREFA 9 — IndexedDB com exatamente 4 stores:
 *   1. pastas
 *   2. linhas
 *   3. relatorios
 *   4. sync_queue  (fila de sincronização; chave auto-incremental)
 */

const DB_NAME = 'commissioning_db'
const DB_VERSION = 1
const STORES = ['pastas', 'linhas', 'relatorios', 'sync_queue'] as const

export type StoreName = (typeof STORES)[number]

let db: IDBDatabase | null = null

/** Abre (ou cria) o banco IndexedDB e garante os 4 object stores. */
export async function openDB(): Promise<IDBDatabase> {
  if (db) return db
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB não está disponível neste ambiente.')
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => {
      db = req.result
      resolve(db)
    }
    req.onupgradeneeded = (e) => {
      const database = (e.target as IDBOpenDBRequest).result
      for (const store of STORES) {
        if (!database.objectStoreNames.contains(store)) {
          const s = database.createObjectStore(store, {
            keyPath: 'id',
            autoIncrement: store === 'sync_queue',
          })
          if (store === 'pastas') s.createIndex('numero_pasta', 'numero_pasta', { unique: false })
          if (store === 'linhas') s.createIndex('numero_linha', 'numero_linha', { unique: false })
          if (store === 'sync_queue') s.createIndex('status', 'status', { unique: false })
        }
      }
    }
  })
}

/** Recupera um registro pela chave. */
export async function dbGet<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(store, 'readonly')
    const req = tx.objectStore(store).get(key)
    req.onsuccess = () => resolve(req.result as T)
    req.onerror = () => reject(req.error)
  })
}

/** Recupera todos os registros de um store. */
export async function dbGetAll<T>(store: StoreName): Promise<T[]> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(store, 'readonly')
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

/** Insere ou atualiza um registro. */
export async function dbPut<T>(store: StoreName, value: T): Promise<void> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(store, 'readwrite')
    tx.objectStore(store).put(value)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Insere ou atualiza vários registros de uma vez. */
export async function dbBulkPut<T>(store: StoreName, values: T[]): Promise<void> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(store, 'readwrite')
    const objStore = tx.objectStore(store)
    for (const v of values) objStore.put(v)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Remove um registro pela chave. */
export async function dbDelete(store: StoreName, key: IDBValidKey): Promise<void> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(store, 'readwrite')
    tx.objectStore(store).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Limpa todos os registros de um store. */
export async function dbClear(store: StoreName): Promise<void> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction(store, 'readwrite')
    tx.objectStore(store).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Adiciona uma operação à fila de sincronização offline. */
export async function enqueueSync(operacao: {
  tipo: string
  payload: unknown
  criado_em?: string
}): Promise<void> {
  await dbPut('sync_queue', {
    ...operacao,
    status: 'pendente',
    criado_em: operacao.criado_em || new Date().toISOString(),
  } as any)
}

export { STORES }
