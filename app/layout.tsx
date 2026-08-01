import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ServiceWorkerRegister } from '@/components/app/service-worker-register'

export const metadata: Metadata = {
  title: 'Sistema de Comissionamento',
  description: 'Sistema PWA de Comissionamento Industrial',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
