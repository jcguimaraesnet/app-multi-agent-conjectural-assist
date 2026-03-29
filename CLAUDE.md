# CLAUDE.md

## Language

Responder sempre em português brasileiro (pt-BR).

## Package Manager

Usar `pnpm` (nunca npm ou yarn).

## Arquitetura do App

O app é composto por 3 partes que rodam em processos separados:

| Parte     | Stack                  | Porta padrão | Diretório        |
|-----------|------------------------|--------------|------------------|
| Frontend  | Next.js + React + Tailwind | 3000    | `/src`           |
| Backend   | Python + FastAPI       | 8000         | `/backend`       |
| Agente    | Python + LangGraph     | 8123         | `/backend` (agent) |

### Princípio: todas as operações de dados passam pelo FastAPI

O frontend **NÃO** deve acessar o Supabase diretamente para operações de dados (CRUD em tabelas).
Toda leitura/escrita de dados deve passar pelo backend FastAPI via `fetch()` com header `Authorization: Bearer {userId}`.

**Exceções permitidas** (apenas auth/sessão, não dados):
- `supabase.auth.*` (getSession, onAuthStateChange, signInWithPassword, signUp, signOut, resetPasswordForEmail) — gerência de sessão/cookies SSR
- Middleware Next.js (`src/lib/supabase/middleware.ts`) — refresh de sessão
- Server actions de auth (`src/app/auth/actions.ts`) — fluxos de login/signup que dependem de cookies

**Proibido no frontend**:
- `supabase.from('tabela')` — qualquer select/insert/update/delete direto em tabelas
- `supabase.rpc()` — chamadas RPC diretas

Se precisar de um dado do Supabase, crie um endpoint no FastAPI (`backend/app/routers/`) e chame via `fetch()` do frontend.

### Rota CopilotKit

A única API route do Next.js que intermedia com serviço externo é `/api/copilotkit` — ela faz proxy para o agente LangGraph. Isso é esperado e correto.

### Padrão de routers no backend

- Auth: usar `get_user_id_from_header` de `app.routers.auth_utils`
- Supabase: usar `get_supabase_client()` de `app.services.supabase_client` (service role key, bypassa RLS)
- Registrar novos routers em `backend/main.py` com `prefix="/api"`

### Provider chain no frontend

```
CopilotKit > ThemeProvider > AuthProvider > ProjectProvider > RequirementsProvider > SettingsProvider
```

## Stack

- Frontend: Next.js 16, React 19, Tailwind CSS v4, App Router
- Backend: Python, FastAPI, Supabase (via service role key)
- Agente: Python, LangGraph, CopilotKit
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (SSR com `@supabase/ssr`)

## Comandos úteis

```bash
pnpm dev              # roda frontend + backend + agent juntos
pnpm dev:frontend     # só frontend (porta 3000)
pnpm dev:backend      # só backend (porta 8000, via uv)
pnpm dev:agent        # só agente LangGraph (porta 8123)
pnpm build            # build de produção
pnpm tsc --noEmit     # type check sem emitir
```
