import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const url = env.VITE_SUPABASE_URL || 'https://eqffgqkwlejztgmrtbgd.supabase.co';
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__QQP6AMI19sYYI_VSOZ_6Q_-abAsggy';

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

export function getSupabaseClient() {
  return supabase;
}
