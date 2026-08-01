'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Waves, ChevronRight } from 'lucide-react'
import dataService from '@/lib/data-service'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface STH {
  id: number
  codigo: string
  sop?: string
  sub_sop?: string
  descricao?: string
  status?: string
  total_linhas?: number
  total_spools?: number
}

export default function TubulacaoPage() {
  const [sths, setSths] = useState<STH[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar(termo?: string) {
    setCarregando(true)
    setErro(null)
    try {
      const dados = await dataService.listarSTHs(termo)
      setSths(Array.isArray(dados) ? dados : [])
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar STHs')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => carregar(busca || undefined), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Tubulação — STHs</h2>
        <p className="text-sm text-slate-500">Sistemas de Teste Hidrostático</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por código do STH…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {erro && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}

      {carregando ? (
        <p className="text-slate-500">Carregando…</p>
      ) : sths.length === 0 ? (
        <p className="text-slate-500">Nenhum STH encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sths.map((sth) => (
            <Link key={sth.id} href={`/tubulacao/${sth.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <Waves className="mt-1 h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-semibold text-slate-800">{sth.codigo}</p>
                      <p className="text-xs text-slate-500">
                        {sth.sop ? `SOP ${sth.sop}` : ''}
                        {sth.sub_sop ? ` · Sub ${sth.sub_sop}` : ''}
                      </p>
                      {sth.descricao && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{sth.descricao}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
