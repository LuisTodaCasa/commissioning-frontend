# Sistema de Comissionamento — Frontend PWA

Frontend PWA (Progressive Web App) do Sistema de Pastas de Teste de Comissionamento
Industrial, construído com **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**
e componentes no estilo **shadcn/ui**.

## ✨ Funcionalidades

- **Autenticação JWT real** contra a API do backend (sem modo demonstração).
- **PWA** com Service Worker para funcionamento offline e cache de assets.
- **IndexedDB** com 4 stores (`pastas`, `linhas`, `relatorios`, `sync_queue`).
- **Dashboard** com estatísticas reais.
- **Tubulação (STHs)** com busca e criação de pastas por STH.
- **Pastas de Teste** com listagem, filtros e detalhe.
- **Relatórios** com listagem e busca.
- Interface responsiva (desktop e tablet/campo).

## 🏗️ Estrutura do Projeto

```
commissioning-frontend/
├── app/
│   ├── layout.tsx               # Layout raiz + registro do Service Worker
│   ├── page.tsx                 # Redireciona para /login ou /dashboard
│   ├── login/page.tsx           # Login REAL (sem botão "Modo Demonstração")
│   └── (app)/                   # Área autenticada
│       ├── layout.tsx           # Shell da aplicação
│       ├── dashboard/page.tsx
│       ├── tubulacao/page.tsx           # Lista de STHs
│       ├── tubulacao/[id]/page.tsx      # Detalhe do STH + criar pasta
│       ├── pastas/page.tsx              # Lista de pastas
│       ├── pastas/[id]/page.tsx         # Detalhe da pasta
│       └── relatorios/page.tsx
├── components/
│   ├── app/app-shell.tsx        # Navegação (SEM badge DEMO)
│   ├── app/service-worker-register.tsx
│   └── ui/                      # Button, Input, Card
├── lib/
│   ├── data-service.ts          # _mode = 'real' FORÇADO, sem dados mockados
│   ├── indexed-db.ts            # 4 stores do IndexedDB
│   ├── api.ts                   # Cliente da API (NEXT_PUBLIC_BACKEND_URL)
│   └── utils.ts
├── public/
│   ├── sw.js                    # Service Worker
│   ├── manifest.json            # Manifesto PWA
│   ├── icon-192.png
│   └── icon-512.png
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .env.local.example
└── .gitignore
```

## 🚀 Como executar localmente

### 1. Pré-requisitos
- Node.js 18+ (recomendado 20+)

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.local.example .env.local
# Edite .env.local e defina NEXT_PUBLIC_BACKEND_URL apontando para o backend
```

### 4. Ambiente de desenvolvimento
```bash
npm run dev
# Aplicação disponível em http://localhost:3000
```

### 5. Build de produção
```bash
npm run build
npm run start
```

## 🔧 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_BACKEND_URL` | URL base da API do backend (ex: `https://commissioning-backend.abacusai.app`) |
| `NEXTAUTH_URL` | URL pública do frontend (para callbacks) |

> **Importante:** a URL do backend é lida **exclusivamente** de
> `NEXT_PUBLIC_BACKEND_URL` em `lib/api.ts`.

## 📴 Modo Offline (PWA)

- O **Service Worker** (`public/sw.js`) é registrado automaticamente em
  `app/layout.tsx` e faz cache dos assets estáticos e rotas de API.
- O **IndexedDB** (`lib/indexed-db.ts`) mantém 4 stores para uso offline:
  `pastas`, `linhas`, `relatorios` e `sync_queue` (fila de sincronização).
- Quando offline, as listagens de pastas, linhas e relatórios usam o cache local.

## 🔐 Autenticação

O login autentica sempre contra a API real (`/api/v1/auth/login`) e o token JWT é
persistido no `localStorage`. **Não existe modo demonstração** — nenhum dado mockado
é exibido em nenhuma tela.

## 🚀 Deploy no Abacus.AI

1. Configure a variável `NEXT_PUBLIC_BACKEND_URL` no painel do Abacus apontando
   para o backend em produção.
2. Faça o build com `npm run build` (a saída usa `output: 'standalone'`).
3. Sirva a aplicação com `npm run start` (porta 3000) ou via o runtime standalone
   do Next.js.

## 👥 Roles de Usuário (backend)

Administrador · Engenharia · Comissionamento · Campo · CQ
