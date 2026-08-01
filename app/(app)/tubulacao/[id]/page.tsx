'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Waves, FolderPlus } from 'lucide-react'
import dataService from '@/lib/data-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface STHDetalhe {
  id: number
  codigo: string
  sop?: string
  sub_sop?: string
  descricao?: string
  status?: string
  sth_linhas?: any[]
  spools?: any[]
}

export default function STHDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [sth, setSth] = useState<STHDetalhe | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    dataService
      .detalheSTH(id)
      .then((d) => setSth(d))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar STH'))
      .finally(() => setCarregando(false))
  }, [id])

  async function handleCriarPasta() {
    if (!sth) return
    setCriando(true)
    setMensagem(null)
    setErro(null)
    try {
      const pasta = await dataService.criarPastaPorSTH({ sth_id: sth.id })
      setMensagem(`Pasta criada com sucesso${pasta?.numero_pasta ? `: ${pasta.numero_pasta}` : ''}.`)
      if (pasta?.id) {
        setTimeout(() => router.push(`/pastas/${pasta.id}`), 800)
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar pasta')
    } finally {
      setCriando(false)
    }
  }

  if (carregando) return <p className="text-slate-500">Carregando…</p>
  if (erro && !sth) return <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
  if (!sth) return <p className="text-slate-500">STH não encontrado.</p>

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Waves className="mt-1 h-6 w-6 text-sky-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{sth.codigo}</h2>
            <p className="text-sm text-slate-500">
              {sth.sop ? `SOP ${sth.sop}` : ''}
              {sth.sub_sop ? ` · Sub ${sth.sub_sop}` : ''}
              {sth.status ? ` · ${sth.status}` : ''}
            </p>
          </div>
        </div>
        <Button onClick={handleCriarPasta} disabled={criando}>
          <FolderPlus className="h-4 w-4" />
          {criando ? 'Criando…' : 'Criar Pasta'}
        </Button>
      </div>

      {mensagem && (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{mensagem}</p>
      )}
      {erro && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}

      {sth.descricao && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{sth.descricao}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Linhas ({sth.sth_linhas?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(sth.sth_linhas ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma linha associada.</p>
            ) : (
              (sth.sth_linhas ?? []).map((l: any, i: number) => (
                <div key={i} className="rounded-md border border-border px-3 py-2 text-sm text-slate-700">
                  {l.linha_cat?.numero_linha || l.numero_linha || `Linha ${i + 1}`}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spools ({sth.spools?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(sth.spools ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum spool cadastrado.</p>
            ) : (
              (sth.spools ?? []).map((s: any, i: number) => (
                <div key={i} className="rounded-md border border-border px-3 py-2 text-sm text-slate-700">
                  {s.codigo_spool || `Spool ${i + 1}`}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
