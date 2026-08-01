'use client'

import { useEffect, useState } from 'react'
import { FileText, Search } from 'lucide-react'
import dataService from '@/lib/data-service'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Relatorio {
  id: number
  pasta_id?: number
  modelo_id?: number
  resultado?: string
  status?: string
  criado_em?: string
}

const STATUS_CORES: Record<string, string> = {
  rascunho: 'bg-slate-100 text-slate-700',
  preenchido: 'bg-sky-100 text-sky-700',
  sincronizado: 'bg-indigo-100 text-indigo-700',
  aprovado: 'bg-emerald-100 text-emerald-700',
  rejeitado: 'bg-red-100 text-red-700',
}

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    setCarregando(true)
    dataService
      .listarRelatorios()
      .then((d) => setRelatorios(Array.isArray(d) ? d : []))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar relatórios'))
      .finally(() => setCarregando(false))
  }, [])

  const filtrados = relatorios.filter(
    (r) => !busca || String(r.id).includes(busca) || r.status?.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Relatórios</h2>
        <p className="text-sm text-slate-500">Relatórios de campo e execução de testes</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por ID ou status…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {erro && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="text-slate-500">Carregando…</p>
      ) : filtrados.length === 0 ? (
        <p className="text-slate-500">Nenhum relatório encontrado.</p>
      ) : (
        <div className="space-y-3">
          {filtrados.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 text-violet-600" />
                  <div>
                    <p className="font-semibold text-slate-800">Relatório #{r.id}</p>
                    <p className="text-xs text-slate-500">
                      {r.pasta_id ? `Pasta ${r.pasta_id}` : ''}
                      {r.resultado ? ` · ${r.resultado}` : ''}
                    </p>
                  </div>
                </div>
                {r.status && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_CORES[r.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {r.status}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
