'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Waves, FolderOpen, FileText, LogOut, Menu, X } from 'lucide-react'
import dataService from '@/lib/data-service'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tubulacao', label: 'Tubulação', icon: Waves },
  { href: '/pastas', label: 'Pastas de Teste', icon: FolderOpen },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
]

/**
 * Shell de navegação da aplicação.
 * TAREFA 10 — SEM MODO DEMONSTRAÇÃO: não há badge "DEMO" nem botão de sair
 * do modo demo. Apenas informações reais do usuário e logout real.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [usuario, setUsuario] = useState<{ nome?: string; role?: string } | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    // Protege as rotas: sem token, volta para o login
    if (!dataService.isAuthenticated()) {
      router.replace('/login')
      return
    }
    // Busca o perfil real do usuário
    api
      .meuPerfil()
      .then((u) => setUsuario(u))
      .catch(() => {
        /* mantém shell mesmo se o perfil falhar */
      })
  }, [router])

  function handleLogout() {
    dataService.logout()
    router.replace('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-100 transition-transform lg:translate-x-0',
          menuAberto ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          <span className="text-lg font-semibold">Comissionamento</span>
          <button className="lg:hidden" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const ativo = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuAberto(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  ativo ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-slate-700 p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium text-white">
              {usuario?.nome || 'Usuário'}
            </p>
            <p className="truncate text-xs text-slate-400">{usuario?.role || '—'}</p>
          </div>
          <Button
            variant="outline"
            className="w-full border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-white px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800">
            {navItems.find((i) => pathname.startsWith(i.href))?.label || 'Sistema de Comissionamento'}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
