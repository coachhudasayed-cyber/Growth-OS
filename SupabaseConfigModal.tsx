import React, { useState } from 'react';
import { Database, Key, Globe, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { getStoredSupabaseConfig, saveSupabaseConfig, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseConfigModalProps {
  onClose: () => void;
  onResetDemoData?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  onClose,
  onResetDemoData
}) => {
  const initial = getStoredSupabaseConfig();
  const [url, setUrl] = useState(initial.url);
  const [key, setKey] = useState(initial.key);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 animate-in fade-in zoom-in-95 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">إعدادات قاعدة البيانات (Supabase)</h3>
              <span className="text-[10px] text-slate-400 font-medium">
                Supabase Authentication & Database Integration
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        {/* Current status banner */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs ${
            configured
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}
        >
          <Database className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-extrabold">
              {configured
                ? 'اتصال Supabase مفعل وجاهز!'
                : 'يعمل النظام حالياً بوضع التخزين المحلي المحفوظ (Local Storage & Seed Engine)'}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              يمكنك ربط المشروع بـ Supabase الخاص بك عبر إدخال Project URL و Anon Key أدناه.
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              رابط المشروع (Supabase Project URL)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-slate-600 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              مفتاح الوصول العام (Supabase Anon Key)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-slate-600 outline-none font-mono"
              />
            </div>
          </div>

          {saved && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>تم حفظ الإعدادات بنجاح!</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold py-3 rounded-xl text-xs hover:opacity-90 transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              حفظ المفاتيح
            </button>

            {onResetDemoData && (
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  onClose();
                }}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="إعادة تعيين البيانات التجريبية"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>إعادة ضبط البيانات التجريبية</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
