import { AppState, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'
import type { Database } from '../types/database'
const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
export const supabaseConfigured = Boolean(url && key)
export const supabase: SupabaseClient<Database> | null = supabaseConfigured ? createClient<Database>(url as string, key as string, { auth: { ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}), autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }) : null
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | undefined
if (supabase && Platform.OS !== 'web') appStateSubscription = AppState.addEventListener('change', (state) => state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh())
export function disposeSupabaseAppStateListener(): void { appStateSubscription?.remove(); appStateSubscription = undefined }
