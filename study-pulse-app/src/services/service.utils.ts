import { fail, toAppError, type Result } from '../lib/result';
import { supabase, supabaseConfigured } from '../lib/supabase';

export function unavailable<T>(): Result<T> {
  return fail({
    code: 'unknown',
    message: 'Supabase não está configurado. Verifique as variáveis de ambiente.',
  });
}

export function client() {
  return supabaseConfigured ? supabase : null;
}

export function guarded<T>(error: unknown, message: string): Result<T> {
  return fail(toAppError(error, message));
}
