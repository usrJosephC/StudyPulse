# StudyPulse · Supabase

As migrations 001–003 criam o esquema, RLS e RPCs do contrato aprovado. O cliente lê apenas seus dados; pontos/check-ins, conclusão de tarefas/metas e entrada em squad passam por RPC autenticada. `invite_code` só aparece em linhas de squad já acessíveis a membros.

Para validar localmente: `supabase start`, `supabase db reset`, depois `supabase test db supabase/tests/rls_and_idempotency.sql`. O seed é sintético e usa os dois primeiros usuários Auth locais; não contém dados reais.
