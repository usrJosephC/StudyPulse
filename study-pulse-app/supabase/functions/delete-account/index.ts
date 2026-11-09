import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function response(status: number, body: { error?: string; success?: boolean }) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return response(405, { error: 'Método não permitido.' })

  const authorization = request.headers.get('Authorization')
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1]
  if (!token) return response(401, { error: 'Sessão inválida.' })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return response(500, { error: 'Não foi possível excluir a conta.' })
  }

  try {
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser(token)
    if (userError || !user) return response(401, { error: 'Sessão inválida.' })

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) return response(500, { error: 'Não foi possível excluir a conta.' })

    return response(200, { success: true })
  } catch {
    // Não registrar token, usuário ou mensagens internas de Auth.
    return response(500, { error: 'Não foi possível excluir a conta.' })
  }
})
