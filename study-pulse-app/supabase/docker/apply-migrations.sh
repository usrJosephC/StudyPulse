#!/bin/sh
set -eu

until pg_isready -q; do
  sleep 1
done

psql --set ON_ERROR_STOP=1 <<'SQL'
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (
  version text primary key,
  inserted_at timestamptz not null default now()
);
SQL

for migration in /migrations/*.sql; do
  version="$(basename "$migration" .sql)"
  applied="$(psql --tuples-only --no-align --command "select exists(select 1 from supabase_migrations.schema_migrations where version = '$version');")"

  if [ "$applied" = "f" ]; then
    echo "Aplicando migration $version"
    psql --set ON_ERROR_STOP=1 --file "$migration"
    psql --set ON_ERROR_STOP=1 --command "insert into supabase_migrations.schema_migrations(version) values ('$version');"
  fi
done

seed_applied="$(psql --tuples-only --no-align --command "select exists(select 1 from supabase_migrations.schema_migrations where version = 'seed');")"
if [ "$seed_applied" = "f" ]; then
  echo "Aplicando seed local"
  psql --set ON_ERROR_STOP=1 --file /seed/seed.sql
  psql --set ON_ERROR_STOP=1 --command "insert into supabase_migrations.schema_migrations(version) values ('seed');"
fi

echo "Banco StudyPulse pronto."
