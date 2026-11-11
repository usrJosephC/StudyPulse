import { supabase, supabaseConfigured } from '../lib/supabase'

export type AccountDeletionErrorCode =
  | 'not_configured'
  | 'session_required'
  | 'session_expired'
  | 'delete_failed'

export type AccountDeletionResult =
  | { ok: true; data: null }
  | { ok: false; error: { code: AccountDeletionErrorCode } }

const failure = (code: AccountDeletionErrorCode): AccountDeletionResult => ({
  ok: false,
  error: { code },
})

/** Permanently deletes the authenticated account. The caller clears the local session after showing success. */
export async function deleteCurrentAccount(): Promise<AccountDeletionResult> {
  if (!supabase || !supabaseConfigured) return failure('not_configured')

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) return failure('delete_failed')
    if (!session?.access_token) return failure('session_required')

    const { error: functionError } = await supabase.functions.invoke('delete-account', { method: 'POST' })
    if (functionError) {
      const status = functionError.context instanceof Response ? functionError.context.status : undefined
      return failure(status === 401 ? 'session_expired' : 'delete_failed')
    }

    return { ok: true, data: null }
  } catch {
    return failure('delete_failed')
  }
}
