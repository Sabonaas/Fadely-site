# Fadely — React + Vite + Supabase

Gestão para negócios de beleza (agenda, clientes, equipa, etc.). **Backend: Supabase** (Postgres + Auth + RLS). A integração **Base44 foi removida**.

## Pré-requisitos

- Node 18+
- Conta [Supabase](https://supabase.com) e projeto criado

## Configuração

1. Copia `.env.example` para `.env.local` e preenche:

   - `VITE_SUPABASE_URL` — URL do projeto (Settings → API)
   - `VITE_SUPABASE_ANON_KEY` — chave `anon` `public`

2. No **SQL Editor** do Supabase, executa **por ordem** os ficheiros em `supabase/migrations/`:

   - `001_fadely_schema.sql`
   - `002_employee_self_update.sql`
   - `003_fix_businesses_rls_recursion.sql`
   - `004_saas_multi_tenant.sql` — organizações, RBAC, pagamentos, auditoria
   - `005_rbac_rls_analytics.sql` — RLS SaaS, analytics, onboarding RPC

3. (Opcional) Deploy das Edge Functions Stripe — ver `docs/BACKEND.md`.

4. Em **Authentication → Providers**, ativa **Email** (password).

5. Copia `.env.example` → `.env.local` e preenche Stripe se usar billing.

6. Instala e corre:

```bash
npm install
npm run dev
```

7. Abre `http://localhost:5173`, regista-te em **/login**, conclui o **onboarding** para criar o estabelecimento.

## Scripts

| Comando        | Descrição              |
|----------------|------------------------|
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção (`dist/`) |
| `npm run preview` | Servir o `dist/` localmente |

## Estrutura relevante

- `src/lib/supabaseClient.js` — cliente Supabase (legado)
- `src/lib/supabase/client.ts` — cliente tipado
- `src/modules/` — API backend (services, repos, policies)
- `src/repositories/db.js` — CRUD legado em JS
- `src/lib/AuthContext.jsx` — sessão Supabase Auth
- `supabase/migrations/` — schema e políticas RLS
- `supabase/functions/` — Stripe webhooks & checkout

## Documentação de arquitetura

- **Backend completo:** `docs/BACKEND.md`
- **Changelog:** `docs/CHANGELOG-ARQUITETURA.md`
