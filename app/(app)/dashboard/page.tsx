'use client'

import { useEffect, useState } from 'react'
import { Waves, FolderOpen, FileText, CheckCircle2 } from 'lucide-react'
import dataService from '@/lib/data-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardData {
  total_sths?: number
  total_pastas?: number
  total_relatorios?: number
  total_linhas?: number
  pastas_concluidas?: number
  [key: string]: unknown
}

export default function DashboardPage() {
  const [dados, setDados] = useState<DashboardData | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    dataService
      .getDashboard()
      .then((d) => setDados(d))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar o dashboard'))
      .finally(() => setCarregando(false))
  }, [])

  const cards = [
    { label: 'STHs', valor: dados?.total_sths, icon: Waves, cor: 'text-sky-600' },
    { label: 'Pastas de Teste', valor: dados?.total_pastas, icon: FolderOpen, cor: 'text-amber-600' },
    { label: 'Relatórios', valor: dados?.total_relatorios, icon: FileText, cor: 'text-violet-600' },
    { label: 'Pastas Concluídas', valor: dados?.pastas_concluidas, icon: CheckCircle2, cor: 'text-emerald-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <p className="text-sm text-slate-500">Estatísticas gerais do sistema</p>
      </div>

      {erro && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{c.label}</CardTitle>
                <Icon className={`h-5 w-5 ${c.cor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {carregando ? '—' : (c.valor ?? 0).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
