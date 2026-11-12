export type SafeLogEvent =
  | 'translations.initialization_failed'
  | 'language.change_failed'
  | 'auth.login_failed'
  | 'auth.registration_failed'
  | 'language.load_failed'
  | 'i18n.initialization_failed'
  | 'goal.create_failed';

/** Logs only an allowlisted event; never pass errors, form data, tokens, or users. */
export function logSafeError(event: SafeLogEvent): void {
  console.warn(`[StudyPulse] ${event}`);
}
