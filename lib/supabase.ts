import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const url = env.VITE_SUPABASE_URL || 'https://eqffgqkwlejztgmrtbgd.supabase.co';
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__QQP6AMI19sYYI_VSOZ_6Q_-abAsggy';

const rememberKey = 'growth-os-remember-me';
const authStorageKey = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;

export function getRememberMe(): boolean {
  return window.localStorage.getItem(rememberKey) !== 'false';
}

export function setRememberMe(remember: boolean): void {
  window.localStorage.setItem(rememberKey, String(remember));
  window.localStorage.removeItem(authStorageKey);
  window.sessionStorage.removeItem(authStorageKey);
}

const authStorage = {
  getItem: (key: string) =>
    (getRememberMe() ? window.localStorage : window.sessionStorage).getItem(key),
  setItem: (key: string, value: string) => {
    const selected = getRememberMe() ? window.localStorage : window.sessionStorage;
    const other = getRememberMe() ? window.sessionStorage : window.localStorage;
    selected.setItem(key, value);
    other.removeItem(key);
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: authStorageKey,
    storage: authStorage
  }
});

export function getSupabaseClient() {
  return supabase;
}
