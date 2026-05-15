# Changelog de arquitetura — Fadely

Registro incremental de mudanças estruturais (sem alteração intencional de design visual).

---

## Fase 2 — Correções críticas e baseline

**Data:** 2026-05-14

### O que foi alterado / validado

1. **`src/components/dashboard/DashboardLayout.jsx`**  
   Shell completo do dashboard owner: `Sidebar`, `MobileSidebar`, área principal com `pt-14` / `lg:pl-60` (alinhado a `w-60` do sidebar) e `<Outlet context={{ business }} />` para as páginas que usam `useOutletContext()`.

2. **`public/manifest.json`**  
   Manifest mínimo servido em `/manifest.json`, alinhado ao `<link rel="manifest">` em `index.html`.

3. **`src/pages/Enterprise.jsx`**  
   Remoção do import não utilizado de `base44` (evita código morto).

### Por quê

- Garantir build e navegação do `/dashboard/*`.
- Eliminar 404 do manifest referenciado no HTML.
- Reduzir ruído no Enterprise.

### Impacto

- Rotas e integração **Supabase** (substitui Base44).
- Sem mudança deliberada de UI nas páginas filhas do dashboard.

### Riscos

- Ícone do manifest em URL externa: depende de rede para PWA; depois substituir por ícones em `public/`.

### Rollback

- Reverter os três ficheiros acima conforme necessário.

### Próximos passos

- Guards de rota por contexto (owner vs employee vs público).
- Limpeza de dependências npm não usadas.
- Ícones PWA locais em `public/`.

---

## Migração Base44 → Supabase (grande refactor)

**Data:** 2026-05-14

### O que foi alterado

- Removidos `@base44/sdk`, `@base44/vite-plugin`, `src/api/base44Client.js`, `src/lib/app-params.js`.
- Adicionados `@supabase/supabase-js`, `src/lib/supabaseClient.js`, `src/repositories/db.js` (CRUD + auth helpers).
- `AuthContext` passa a usar sessão Supabase (`getSession` / `onAuthStateChange`).
- Nova página **`/login`** (`src/pages/Login.jsx`) com email/password (entrar + criar conta).
- Redirecionamentos de login: `src/lib/authRedirect.js` (`goToLogin`).
- Chamadas `base44.entities.*` migradas para `db.*` nas páginas e componentes do dashboard, booking público, onboarding e convites.
- **`vite.config.js`:** alias `@` → `src` (antes fornecido pelo plugin Base44).
- **`supabase/migrations/`:** `001_fadely_schema.sql` (tabelas + RLS + RPCs `invite_preview` / `accept_invite`) e `002_employee_self_update.sql` (UPDATE pelo colaborador).

### Por quê

- Backend próprio em Postgres com RLS e auth standard.
- Redução de dependência de plataforma fechada.

### Impacto

- **Obrigatório:** criar projeto Supabase, correr migrations no SQL Editor, configurar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Utilizadores e dados **não** migram automaticamente da Base44; é um **novo** sistema de dados.
- Fluxo de produto: registo → onboarding → dashboard (igual à ideia anterior).

### Riscos

- RLS mal configurada em produção expõe dados — rever políticas antes de escalar.
- Trigger em `auth.users` e funções `SECURITY DEFINER` exigem permissões corretas no Supabase.
- `anon` INSERT em clients/appointments/notifications na página pública: depende das políticas; ajustar se o modelo de ameaças mudar.

### Rollback

- Restaurar commit anterior a esta migração e reinstalar dependências Base44.