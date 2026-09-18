import React, { useState } from 'react';
import { Building2, LockKeyhole, LogIn, ShieldAlert } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegisterAdmin: (email: string, password: string, token: string) => Promise<void>;
  authError?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegisterAdmin, authError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('setup') || '');
  const [registering, setRegistering] = useState(Boolean(setupToken));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('اكتبي البريد الإلكتروني وكلمة السر.');
      return;
    }
    setBusy(true);
    try {
      if (registering) {
        await onRegisterAdmin(email.trim(), password, setupToken);
      } else {
        await onLogin(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر إتمام العملية. حاولي مرة أخرى.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4 text-[#2D2D2A]" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-[#E07A48] text-white mb-4">
            <Building2 className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold">Growth OS</h1>
          <p className="mt-2 text-sm text-[#78786E]">نظام إدارة العملاء والحملات الإعلانية</p>
        </div>
        <div className="bg-white border border-[#E5E5E0] rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            {registering ? <LockKeyhole className="w-5 h-5 text-[#E07A48]" /> : <LogIn className="w-5 h-5 text-[#E07A48]" />}
            {registering ? 'إنشاء حساب الأدمن' : 'تسجيل الدخول'}
          </h2>
          {(error || authError) && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error || authError}</span>
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">
              البريد الإلكتروني
              <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="mt-2 w-full border border-[#E5E5E0] rounded-xl px-4 py-3 outline-none focus:border-[#E07A48]" />
            </label>
            <label className="block text-sm font-semibold">
              كلمة السر
              <input type="password" autoComplete={registering ? 'new-password' : 'current-password'} required minLength={registering ? 8 : undefined}
                value={password} onChange={e => setPassword(e.target.value)}
                className="mt-2 w-full border border-[#E5E5E0] rounded-xl px-4 py-3 outline-none focus:border-[#E07A48]" />
            </label>
            <button type="submit" disabled={busy} className="w-full bg-[#E07A48] hover:bg-[#C8662B] text-white font-bold rounded-xl py-3 disabled:opacity-60">
              {busy ? 'جارٍ التحقق...' : registering ? 'إنشاء الحساب' : 'دخول'}
            </button>
          </form>
          {setupToken && <button type="button" onClick={() => { setRegistering(!registering); setError(''); }}
            className="mt-5 text-sm text-[#5A5A40] underline">
            {registering ? 'لديك حساب؟ تسجيل الدخول' : 'إنشاء حساب الأدمن لأول مرة'}
          </button>}
        </div>
      </div>
    </div>
  );
};
