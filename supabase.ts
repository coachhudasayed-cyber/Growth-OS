import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read environment variables if available
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const envUrl = metaEnv.VITE_SUPABASE_URL || '';
const envAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

// LocalStorage keys for dynamic config
const SUPABASE_URL_KEY = 'brand_control_supabase_url';
const SUPABASE_KEY_KEY = 'brand_control_supabase_key';

export function getStoredSupabaseConfig() {
  const customUrl = localStorage.getItem(SUPABASE_URL_KEY) || envUrl;
  const customKey = localStorage.getItem(SUPABASE_KEY_KEY) || envAnonKey;
  return { url: customUrl, key: customKey };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url) localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  else localStorage.removeItem(SUPABASE_URL_KEY);

  if (key) localStorage.setItem(SUPABASE_KEY_KEY, key.trim());
  else localStorage.removeItem(SUPABASE_KEY_KEY);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getStoredSupabaseConfig();
  return Boolean(url && key);
};
