-- Credenciais exclusivamente locais. O ambiente de producao usa segredos proprios.
\set pgpass `echo "$POSTGRES_PASSWORD"`

alter user authenticator with password :'pgpass';
alter user pgbouncer with password :'pgpass';
alter user supabase_auth_admin with password :'pgpass';
alter user supabase_storage_admin with password :'pgpass';

\set jwt_exp `echo "$JWT_EXP"`
alter database postgres set "app.settings.jwt_exp" to :'jwt_exp';
