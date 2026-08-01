'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, FolderOpen, FileText, Waves } from 'lucide-react'
import dataService from '@/lib/data-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PastaDetalhe {
  id: number
  numero_pasta: string
  sth?: string
  descricao_sistema?: string
  status?: string
  pressao_teste?: number
  data_criacao?: string
  linhas?: any[]
  documentos?: any[]
  testes?: any[]
}

export default function PastaDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [pasta, setPasta] = useState<PastaDetalhe | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    dataService
      .detalharPasta(id)
      .then((d) => setPasta(d))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar pasta'))
      .finally(() => setCarregando(false))
  }, [id])

  if (carregando) return <p className="text-slate-500">Carregando…</p>
  if (erro && !pasta)
    return <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
  if (!pasta) return <p className="text-slate-500">Pasta não encontrada.</p>

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="flex items-start gap-3">
        <FolderOpen className="mt-1 h-6 w-6 text-amber-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{pasta.numero_pasta}</h2>
          <p className="text-sm text-slate-500">
            {pasta.sth ? `STH ${pasta.sth}` : ''}
            {pasta.status ? ` · ${pasta.status}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Pressão de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-800">
              {pasta.pressao_teste != null ? `${pasta.pressao_teste} bar` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Linhas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-800">{pasta.linhas?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-800">{pasta.documentos?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {pasta.descricao_sistema && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descrição do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{pasta.descricao_sistema}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Waves className="h-4 w-4 text-sky-600" /> Linhas ({pasta.linhas?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(pasta.linhas ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma linha associada.</p>
            ) : (
              (pasta.linhas ?? []).map((l: any, i: number) => (
                <div key={i} className="rounded-md border border-border px-3 py-2 text-sm text-slate-700">
                  {l.linha?.numero_linha || l.numero_linha || `Linha ${i + 1}`}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-violet-600" /> Documentos ({pasta.documentos?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(pasta.documentos ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum documento.</p>
            ) : (
              (pasta.documentos ?? []).map((d: any, i: number) => (
                <div key={i} className="rounded-md border border-border px-3 py-2 text-sm text-slate-700">
                  {d.nome_arquivo || `Documento ${i + 1}`}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
