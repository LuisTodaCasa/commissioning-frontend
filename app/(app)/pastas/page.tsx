'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, FolderOpen, ChevronRight } from 'lucide-react'
import dataService from '@/lib/data-service'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Pasta {
  id: number
  numero_pasta: string
  sth?: string
  descricao_sistema?: string
  status?: string
  pressao_teste?: number
}

const STATUS_CORES: Record<string, string> = {
  CRIADA: 'bg-slate-100 text-slate-700',
  EM_ANDAMENTO: 'bg-amber-100 text-amber-700',
  CONCLUIDA: 'bg-emerald-100 text-emerald-700',
  CANCELADA: 'bg-red-100 text-red-700',
}

export default function PastasPage() {
  const [pastas, setPastas] = useState<Pasta[]>([])
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    setCarregando(true)
    dataService
      .listarPastas()
      .then((d) => setPastas(Array.isArray(d) ? d : []))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar pastas'))
      .finally(() => setCarregando(false))
  }, [])

  const filtradas = pastas.filter((p) => {
    const matchBusca = !busca || p.numero_pasta?.toLowerCase().includes(busca.toLowerCase()) ||
      p.sth?.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = !statusFiltro || p.status === statusFiltro
    return matchBusca && matchStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Pastas de Teste</h2>
        <p className="text-sm text-slate-500">Gerenciamento de pastas de comissionamento</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Buscar por número ou STH…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="CRIADA">Criada</option>
          <option value="EM_ANDAMENTO">Em andamento</option>
          <option value="CONCLUIDA">Concluída</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>

      {erro && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="text-slate-500">Carregando…</p>
      ) : filtradas.length === 0 ? (
        <p className="text-slate-500">Nenhuma pasta encontrada.</p>
      ) : (
        <div className="space-y-3">
          {filtradas.map((p) => (
            <Link key={p.id} href={`/pastas/${p.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <FolderOpen className="mt-1 h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-slate-800">{p.numero_pasta}</p>
                      <p className="text-xs text-slate-500">
                        {p.sth ? `STH ${p.sth}` : ''}
                        {p.descricao_sistema ? ` · ${p.descricao_sistema}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.status && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_CORES[p.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
