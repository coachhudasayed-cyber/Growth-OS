import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { supabase } from './supabase';

/** Loads a setting from Supabase and saves subsequent edits there. */
export function useSupabaseSetting<T>(
  key: string,
  clientId: string | null,
  initialValue: T,
  writable: boolean
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const [loadedKey, setLoadedKey] = useState('');
  const loadedValue = useRef('');
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    setLoadedKey('');
    void (async () => {
      const result = await supabase.from('app_settings')
        .select('data').eq('key', key).maybeSingle();
      if (result.error) throw result.error;

      let next = result.data ? result.data.data as T : initialValue;
      let migrated = false;
      if (!result.data && writable) {
        // Move settings saved by an older browser version into Supabase once.
        try {
          const legacy = window.localStorage.getItem(key);
          if (legacy) {
            const parsed = JSON.parse(legacy);
            if (Array.isArray(parsed)) {
              next = parsed as T;
              migrated = true;
            }
          }
        } catch {
          // Invalid old data cannot replace the defaults.
        }
      }
      if (!active) return;
      loadedValue.current = migrated ? '' : JSON.stringify(next);
      setValue(next);
      setLoadedKey(key);
    })().catch(error => {
      if (active) {
        window.alert('تعذر تحميل إعدادات النظام من Supabase. تحققي من الاتصال ثم أعيدي فتح الصفحة.');
        console.error('Failed to load setting', key, error);
      }
    });
    return () => { active = false; };
  }, [key]);

  useEffect(() => {
    if (!writable || loadedKey !== key) return;
    const serialized = JSON.stringify(value);
    if (serialized === loadedValue.current) return;
    loadedValue.current = serialized;
    writeQueue.current = writeQueue.current.catch(() => undefined).then(async () => {
      const result = await supabase.from('app_settings').upsert({
        key, client_id: clientId, data: value
      }, { onConflict: 'key' });
      if (result.error) throw result.error;
      try { window.localStorage.removeItem(key); } catch { /* Supabase save succeeded. */ }
    }).catch(error => {
      console.error('Failed to save setting', key, error);
      window.alert('تعذر حفظ الإعدادات في Supabase. أعيدي المحاولة بعد التحقق من الاتصال.');
    });
  }, [value, key, clientId, writable, loadedKey]);

  return [value, setValue];
}
