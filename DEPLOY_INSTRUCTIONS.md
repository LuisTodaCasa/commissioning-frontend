# Instruções de Deploy — Sistema de Comissionamento

Este documento explica como enviar o **frontend** e o **backend** para o GitHub e
configurá-los no Abacus.AI.

---

## ✅ Situação atual

| Repositório | Status | Detalhe |
|-------------|--------|---------|
| **commissioning-backend** | ✅ **Já enviado ao GitHub** | Commit `a9a6b43` está em `main` no repositório existente `LuisTodaCasa/commissioning-backend` |
| **commissioning-frontend** | ⏳ **Aguardando criação do repositório** | O repositório ainda não existe no GitHub e não pôde ser criado automaticamente (ver problema abaixo) |

O código do frontend está pronto localmente, commitado na branch `main` (commit `f3a36a7`).

---

## ⚠️ Problema identificado

O token do GitHub disponível no ambiente automatizado tem **escopo vazio**
(`x-oauth-scopes:` em branco) e pertence a uma *GitHub App integration*. Por isso:

- ✅ Consegue fazer **push para repositórios que já existem** (por isso o backend foi enviado).
- ❌ **Não consegue criar novos repositórios** (`POST /user/repos` retorna `403 – Resource not accessible by integration`).

Como o repositório `commissioning-frontend` ainda não existe, é preciso **criá-lo**
usando um token pessoal seu (ou pela interface do GitHub) antes de enviar o código.

---

## 🔑 Passo 1 — Gerar um Personal Access Token (PAT)

1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token** → **Generate new token (classic)**
3. Dê um nome (ex.: `deploy-comissionamento`)
4. Marque o escopo **`repo`** (acesso completo a repositórios)
5. Clique em **Generate token** e **copie o token** (começa com `ghp_...`)

> Guarde o token com segurança — ele não será exibido novamente.

---

## 🚀 Passo 2 — Criar o repositório e fazer push (forma automática)

Na sua máquina local, coloque as duas pastas de repositório lado a lado:

```
minha-pasta/
├── commissioning-backend/
├── commissioning-frontend/
└── push_to_github.sh
```

Copie o script `push_to_github.sh` (fornecido junto a estas instruções) para essa
pasta e execute, passando o seu token:

```bash
chmod +x push_to_github.sh
./push_to_github.sh ghp_SEU_TOKEN_PESSOAL
```

O script irá:
1. Criar o repositório `commissioning-frontend` na sua conta.
2. Configurar os remotes com o seu token.
3. Fazer push de **backend** e **frontend** para a branch `main`.

---

## 🛠️ Passo 2 (alternativa manual) — Comandos individuais

Se preferir executar manualmente:

### a) Criar o repositório do frontend

```bash
curl -X POST \
  -H "Authorization: token ghp_SEU_TOKEN_PESSOAL" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{"name":"commissioning-frontend","description":"Frontend PWA do Sistema de Comissionamento Industrial","private":false}'
```

> Ou crie pela interface: https://github.com/new → nome `commissioning-frontend` → **Create repository** (sem README).

### b) Push do frontend

```bash
cd commissioning-frontend
git remote add origin https://github.com/LuisTodaCasa/commissioning-frontend.git
git branch -M main
git push -u https://LuisTodaCasa:ghp_SEU_TOKEN_PESSOAL@github.com/LuisTodaCasa/commissioning-frontend.git main
```

### c) Push do backend (caso precise reenviar)

O backend **já foi enviado** (commit `a9a6b43`). Se houver novas alterações:

```bash
cd commissioning-backend
git push https://LuisTodaCasa:ghp_SEU_TOKEN_PESSOAL@github.com/LuisTodaCasa/commissioning-backend.git main
```

---

## ⚙️ Passo 3 — Configuração no Abacus.AI

### Backend (`commissioning-backend`)

Configure as variáveis de ambiente:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string do Neon PostgreSQL (`postgresql://...?sslmode=require`) |
| `JWT_SECRET_KEY` | Chave secreta forte — gere com `openssl rand -hex 32` |
| `CORS_ORIGINS` | JSON array com o domínio do frontend, ex.: `["https://seu-frontend.abacusai.app"]` |
| `APP_ENV` | `production` |
| `UPLOAD_DIR` | `/app/uploads` |

O script de deploy (`deploy.sh`) executa automaticamente as migrações
(`alembic upgrade head`) e o seed inicial (`seed.py`).

### Frontend (`commissioning-frontend`)

Configure as variáveis de ambiente:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_BACKEND_URL` | URL pública do backend, ex.: `https://seu-backend.abacusai.app` |
| `NEXTAUTH_URL` | URL pública do frontend, ex.: `https://seu-frontend.abacusai.app` |

Build e start:

```bash
npm install
npm run build
npm run start
```

### Auto-deploy

Em cada repositório no Abacus.AI, ative **"Auto-deploy on push"** na branch `main`
para que novos commits sejam publicados automaticamente.

---

## ✔️ Passo 4 — Checklist de validação pós-deploy

**Backend:**
- [ ] `GET /health` retorna `{"status": "ok", "database": "connected"}`
- [ ] `GET /docs` abre o Swagger UI
- [ ] Login com o admin padrão funciona (ver `seed.py`)
- [ ] `GET /api/v1/debug/diagnostico` exige autenticação de Administrador (retorna 401/403 sem token)

**Frontend:**
- [ ] Página de login abre corretamente
- [ ] Login autentica contra o backend real e redireciona ao `/dashboard`
- [ ] Dashboard exibe as estatísticas vindas da API
- [ ] Service Worker é registrado (PWA instalável)
- [ ] `NEXT_PUBLIC_BACKEND_URL` aponta para o backend correto

**Integração:**
- [ ] O domínio do frontend está presente em `CORS_ORIGINS` do backend
- [ ] Não há erros de CORS no console do navegador
