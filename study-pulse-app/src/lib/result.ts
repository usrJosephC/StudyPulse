export type AppErrorCode = 'auth' | 'network' | 'validation' | 'conflict' | 'unknown'
export type AppError = { code: AppErrorCode; message: string; cause?: unknown }
export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError }
export const ok = <T>(data: T): Result<T> => ({ ok: true, data })
export const fail = <T = never>(error: AppError): Result<T> => ({ ok: false, error })
export function mapAuthError(error: { message?: string; code?: string } | null): AppError {
  const message = error?.message ?? ''
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return { code: 'auth', message: 'E-mail ou senha incorretos.' }
  if (normalized.includes('email not confirmed')) return { code: 'auth', message: 'Confirme seu e-mail antes de entrar.' }
  if (normalized.includes('already registered') || normalized.includes('already exists')) return { code: 'conflict', message: 'Este e-mail já está cadastrado.' }
  if (normalized.includes('password') && normalized.includes('6')) return { code: 'validation', message: 'A senha deve ter pelo menos 6 caracteres.' }
  return toAppError(error, 'Não foi possível autenticar. Tente novamente.')
}
export function toAppError(error: unknown, fallback = 'Não foi possível concluir a operação.'): AppError {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  const normalized = message.toLowerCase()
  if (normalized.includes('network') || normalized.includes('fetch') || normalized.includes('offline')) return { code: 'network', message: 'Sem conexão com a internet. Verifique sua rede e tente novamente.', cause: error }
  if (normalized.includes('already registered') || normalized.includes('already exists')) return { code: 'conflict', message: 'Este e-mail já está cadastrado.', cause: error }
  return { code: 'unknown', message: fallback, cause: error }
}
