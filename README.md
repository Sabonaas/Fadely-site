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
   - `003_fix_businesses_rls_recursion.sql` — corrige erro **42P17** (recursão infinita em RLS em `businesses`) se aplicaste o `001` antigo; também já está integrado no `001` atual para instalações novas.

3. Em **Authentication → Providers**, ativa **Email** (password).

4. Instala e corre:

```bash
npm install
npm run dev
```

5. Abre `http://localhost:5173`, regista-te em **/login**, conclui o **onboarding** para criar o estabelecimento.

## Scripts

| Comando        | Descrição              |
|----------------|------------------------|
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção (`dist/`) |
| `npm run preview` | Servir o `dist/` localmente |

## Estrutura relevante

- `src/lib/supabaseClient.js` — cliente Supabase
- `src/repositories/db.js` — acesso a dados (substitui `base44.entities`)
- `src/lib/AuthContext.jsx` — sessão Supabase Auth
- `src/pages/Login.jsx` — login / registo email
- `supabase/migrations/` — schema e políticas RLS

## Documentação de arquitetura

Ver `docs/CHANGELOG-ARQUITETURA.md`.
