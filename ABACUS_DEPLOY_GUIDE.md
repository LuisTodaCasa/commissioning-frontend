# 🚀 Guia de Deploy no Abacus.AI — Sistema de Comissionamento

> **Status dos repositórios GitHub:**
> - `LuisTodaCasa/commissioning-backend` — ✅ commit `a9a6b43` na `main`
> - `LuisTodaCasa/commissioning-frontend` — ✅ commit `cad377f` na `main`

---

## Pré-requisito — Gerar o JWT_SECRET_KEY

Antes de criar os apps, gere a chave secreta para o backend:

```bash
openssl rand -hex 32
```

Copie o resultado (64 caracteres hexadecimais). Você usará no **Passo 2**.

---

## Passo 1 — Criar o App do Backend no Abacus

1. Acesse o painel do Abacus.AI → **Apps** → **New App**
2. Conecte o repositório: `LuisTodaCasa/commissioning-backend`
3. Configure:

   | Campo | Valor |
   |-------|-------|
   | **Nome** | `commissioning-backend` |
   | **Tipo** | Python / FastAPI |
   | **Branch** | `main` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | **Deploy Script** | `./deploy.sh` |

4. Configure as **variáveis de ambiente**:

   | Variável | Valor |
   |----------|-------|
   | `DATABASE_URL` | `postgresql://USER:PASS@EP-HOST.neon.tech/neondb?sslmode=require` |
   | `JWT_SECRET_KEY` | resultado do `openssl rand -hex 32` |
   | `CORS_ORIGINS` | `["https://commissioning-frontend-XXXX.abacus.ai"]` *(preencher depois)* |
   | `APP_ENV` | `production` |
   | `APP_DEBUG` | `false` |
   | `UPLOAD_DIR` | `/app/uploads` |
   | `LOG_LEVEL` | `INFO` |

   > ⚠️ Deixe `CORS_ORIGINS` com o placeholder por enquanto. Você atualizará no Passo 4.

5. Clique em **Deploy** e aguarde a conclusão.
6. Copie a **URL pública gerada** (ex: `https://commissioning-backend-abc123.abacus.ai`).

---

## Passo 2 — Criar o App do Frontend no Abacus

1. Ainda no painel do Abacus.AI → **Apps** → **New App**
2. Conecte o repositório: `LuisTodaCasa/commissioning-frontend`
3. Configure:

   | Campo | Valor |
   |-------|-------|
   | **Nome** | `commissioning-frontend` |
   | **Tipo** | Next.js |
   | **Branch** | `main` |
   | **Build Command** | `npm run build` |
   | **Start Command** | `npm run start` |

4. Configure as **variáveis de ambiente**:

   | Variável | Valor |
   |----------|-------|
   | `NEXT_PUBLIC_BACKEND_URL` | URL do backend do Passo 1 (ex: `https://commissioning-backend-abc123.abacus.ai`) |
   | `NEXTAUTH_URL` | URL do próprio frontend (você saberá após criar o app) |
   | `NODE_ENV` | `production` |

5. Clique em **Deploy** e aguarde a conclusão.
6. Copie a **URL pública gerada** do frontend.

---

## Passo 3 — Atualizar as URLs cruzadas

Após ter as duas URLs reais, você precisará atualizar dois lugares:

### 3a. Atualizar `CORS_ORIGINS` no backend

No painel do Abacus, vá ao app `commissioning-backend` → **Environment Variables** → edite:

```
CORS_ORIGINS=["https://commissioning-frontend-XXXX.abacus.ai"]
```

Substitua pelo URL real do frontend e faça **Redeploy**.

### 3b. Atualizar `NEXTAUTH_URL` no frontend

No painel do Abacus, vá ao app `commissioning-frontend` → **Environment Variables** → edite:

```
NEXTAUTH_URL=https://commissioning-frontend-XXXX.abacus.ai
```

Substitua pelo URL real do próprio frontend e faça **Redeploy**.

---

## Passo 4 — Ativar Auto-deploy

Em cada app no Abacus:

1. Vá em **Settings** → **Deployment**
2. Ative **"Auto-deploy on push to main"**

A partir de agora, cada `git push origin main` disparará um deploy automático.

---

## Passo 5 — Testar o Sistema

Execute esta checklist na ordem:

### ✅ Backend
- [ ] `GET https://SEU-BACKEND.abacus.ai/health`
  → Deve retornar `{"status": "ok", "database": "connected"}`
- [ ] `GET https://SEU-BACKEND.abacus.ai/docs`
  → Deve abrir o Swagger UI
- [ ] Login via Swagger:
  ```json
  POST /api/v1/auth/login
  { "email": "admin@commissioning.com", "senha": "admin123" }
  ```
  → Deve retornar `access_token`
- [ ] `GET /api/v1/debug/diagnostico` sem token
  → Deve retornar `401` (endpoint protegido ✅)

### ✅ Frontend
- [ ] Página de login abre sem erros no console
- [ ] Login com `admin@commissioning.com` / `admin123` autentica com sucesso
- [ ] Dashboard exibe estatísticas (dados reais do banco)
- [ ] Não há botão "Modo Demonstração" em nenhuma tela
- [ ] PWA instalável (ícone na barra de endereços do Chrome)
- [ ] DevTools → Application → Service Workers → SW registrado como "activated"
- [ ] DevTools → Application → IndexedDB → 4 stores: `pastas`, `linhas`, `relatorios`, `sync_queue`

### ✅ Integração
- [ ] Console do navegador sem erros de CORS
- [ ] Domínio do frontend presente em `CORS_ORIGINS` do backend
- [ ] Tabelas criadas pelo Alembic (checar via `/api/v1/debug/diagnostico`)

---

## Referência rápida — Comandos úteis

```bash
# Gerar JWT_SECRET_KEY
openssl rand -hex 32

# Testar backend localmente
uvicorn app.main:app --reload --port 8000

# Testar frontend localmente
cd commissioning-frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 npm run dev

# Ver logs do Alembic
alembic history
alembic current
```

---

## Credenciais de teste (criadas pelo seed.py)

| Campo | Valor |
|-------|-------|
| **E-mail** | `admin@commissioning.com` |
| **Senha** | `admin123` |
| **Role** | Administrador |

> ⚠️ Altere a senha do admin assim que o sistema estiver em produção.
