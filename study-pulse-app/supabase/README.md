# StudyPulse · Supabase local

## Iniciar com Docker

Pré-requisito: Docker Desktop aberto.

Na raiz do aplicativo, execute:

```sh
docker-compose up -d
```

O Compose inicia PostgreSQL, Auth, PostgREST e o gateway, aplica todas as migrations de `supabase/migrations/` e executa o seed uma vez. Os dados ficam no volume `studypulse-db` e sobrevivem a reinícios.

Endpoints locais:

- API Supabase (Auth, REST e RPC): `http://localhost:54321`
- PostgreSQL: `postgresql://postgres:postgres@localhost:54322/postgres`
- Health check: `http://localhost:54321/health`

Confira o estado com `docker-compose ps` e acompanhe a inicialização com `docker-compose logs -f migrations`.

Para usar o app, copie `.env.example` para `.env`. Em celular físico, execute `npm run start:local`; o script troca `localhost` pelo IPv4 da máquina. O computador e o celular precisam estar na mesma rede, e a porta 54321 deve estar liberada no firewall.

Para parar sem apagar os dados, use `docker-compose down`. O comando `docker-compose down -v` apaga o banco local e só deve ser usado quando você quiser recriá-lo do zero.

## Alternativa com Supabase CLI

A CLI continua disponível como dependência do projeto. O fluxo equivalente é `npx supabase start`, seguido de `npx supabase db reset`. Não execute a stack da CLI e a stack do Compose ao mesmo tempo, pois ambas usam as portas 54321 e 54322.

As migrations criam esquema, RLS e RPCs. O cliente lê apenas os dados permitidos pelas policies; pontos, check-ins, conclusões e squads passam por RPC autenticada. O seed é sintético e não contém dados reais.
