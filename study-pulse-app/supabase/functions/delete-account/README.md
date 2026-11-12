# `delete-account` Edge Function

The function accepts `POST` only. It reads the bearer token from the request, validates it with `auth.getUser(token)`, and permanently deletes the authenticated user's own Auth record. It ignores request bodies, so callers cannot choose another user ID. Responses use generic errors and the function does not log tokens, user data, or internal Auth errors.

Profile-owned rows cascade on deletion. The existing schema also cascades deletion of squads created by that user, including those squads' memberships and activity.

The function runtime supplies `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Set `SUPABASE_SERVICE_ROLE_KEY` as a server secret only; never add it to Expo variables or the app bundle.

## Local

The repository's Docker Compose stack does not run Edge Functions. Use the Supabase CLI instead of Compose for local function work:

```sh
npx supabase start
npx supabase db reset
npx supabase functions serve delete-account --env-file supabase/.env.local
```

Create the untracked `supabase/.env.local` with the local `SUPABASE_SERVICE_ROLE_KEY` from `npx supabase status`. Keep secrets out of version control. The CLI supplies the local URL and anon key to the function runtime.

Validate the deletion cascades against the local database with:

```sh
npx supabase test db supabase/tests/account_deletion.sql
```

## Deploy

Set the production service-role key through the Supabase secrets manager, then deploy:

```sh
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
npx supabase functions deploy delete-account
```

The deployed function uses the project's runtime `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The Expo client invokes it as `delete-account`; the authenticated session supplies the bearer token.
