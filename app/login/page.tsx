'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dataService from '@/lib/data-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Página de login REAL.
 * TAREFA 10 — SEM MODO DEMONSTRAÇÃO: não há nenhum botão de "Modo Demo".
 * O login sempre autentica contra a API real e persiste o token JWT.
 */
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      await dataService.login(email, senha)
      router.replace('/dashboard')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao entrar. Verifique suas credenciais.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sistema de Comissionamento</CardTitle>
          <CardDescription>Entre com suas credenciais para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="senha" className="text-sm font-medium text-slate-700">
                Senha
              </label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            {erro && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
            )}

            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
