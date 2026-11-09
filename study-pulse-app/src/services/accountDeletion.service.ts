import { fail, ok, type Result } from '../lib/result'
import { supabase, supabaseConfigured } from '../lib/supabase'

const unavailable = (): Result<null> => fail({
  code: 'unknown',
  message: 'Supabase não está configurado. Verifique as variáveis de ambiente.',
})

/** Permanently deletes the authenticated account. The caller clears the local session after showing success. */
export async function deleteCurrentAccount(): Promise<Result<null>> {
  if (!supabase || !supabaseConfigured) return unavailable()

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.access_token) {
      return fail({ code: 'auth', message: 'Faça login para excluir sua conta.' })
    }

    const { error: functionError } = await supabase.functions.invoke('delete-account', { method: 'POST' })
    if (functionError) {
      const status = functionError.context instanceof Response ? functionError.context.status : undefined
      return status === 401
        ? fail({ code: 'auth', message: 'Sua sessão expirou. Entre novamente e tente excluir a conta.' })
        : fail({ code: 'unknown', message: 'Não foi possível excluir sua conta. Tente novamente.' })
    }

    return ok(null)
  } catch {
    return fail({ code: 'unknown', message: 'Não foi possível excluir sua conta. Tente novamente.' })
  }
}
