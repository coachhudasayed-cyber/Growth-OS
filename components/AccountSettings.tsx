import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, UserRound, X } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface AccountSettingsProps {
  user: UserProfile;
  compact?: boolean;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user, compact = false }) => {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const close = () => {
    if (busy) return;
    setOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError('');
    setSuccess('');
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword.length < 8) {
      setError('كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('تأكيد كلمة المرور الجديدة غير مطابق.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('اختاري كلمة مرور جديدة مختلفة عن الحالية.');
      return;
    }
    setBusy(true);
    try {
      const session = await supabase.auth.getUser();
      if (session.error || session.data.user?.id !== user.id) {
        throw new Error('انتهت الجلسة. سجلي الدخول مرة أخرى.');
      }
      const verified = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      if (verified.error || verified.data.user?.id !== user.id) {
        throw new Error('كلمة المرور الحالية غير صحيحة.');
      }
      const updated = await supabase.auth.updateUser({ password: newPassword });
      if (updated.error) throw new Error(updated.error.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setSuccess('تم تغيير كلمة المرور في Supabase بنجاح.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تغيير كلمة المرور.');
    } finally {
      setBusy(false);
    }
  };

  const roleLabel = user.role === 'admin' ? 'أدمن' : user.role === 'employee' ? 'موظف' : 'عميل';

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={compact
          ? 'p-2 text-[#78786E] hover:text-[#E07A48] hover:bg-[#FFF0E6] rounded-xl transition'
          : 'w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E5E0] rounded-xl text-sm font-bold text-[#2D2D2A] hover:border-[#E07A48] transition'}
        title="بيانات حسابي" aria-label="بيانات حسابي">
        <UserRound className="w-4 h-4" />
        {!compact && <span>بيانات حسابي</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2D2D2A]/60 p-4" dir="rtl" onMouseDown={close}>
          <div role="dialog" aria-modal="true" aria-labelledby="account-settings-title"
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl text-[#2D2D2A]"
            onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 id="account-settings-title" className="text-xl font-extrabold">بيانات حسابي</h2>
              <button type="button" onClick={close} disabled={busy} aria-label="إغلاق" className="p-2 rounded-lg hover:bg-[#F5F5F0]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-[#F9F8F6] rounded-xl">
                <div className="text-xs text-[#78786E]">الاسم</div>
                <div className="font-bold">{user.name}</div>
              </div>
              <div className="p-3 bg-[#F9F8F6] rounded-xl">
                <div className="text-xs text-[#78786E]">الإيميل</div>
                <div className="font-bold break-all" dir="ltr">{user.email}</div>
              </div>
              <div className="p-3 bg-[#F9F8F6] rounded-xl">
                <div className="text-xs text-[#78786E]">نوع الحساب</div>
                <div className="font-bold">{roleLabel}</div>
              </div>
              <div className="p-3 bg-[#F9F8F6] rounded-xl">
                <div className="text-xs text-[#78786E]">كلمة المرور</div>
                <div className="font-bold tracking-widest" aria-label="كلمة المرور مخفية">••••••••</div>
                <p className="text-xs text-[#78786E] mt-1">لا يمكن عرض كلمة المرور الحالية. يمكنك تغييرها من هنا.</p>
              </div>
            </div>
            <form onSubmit={changePassword} className="space-y-4">
              <h3 className="font-bold flex items-center gap-2"><KeyRound className="w-4 h-4" />تغيير كلمة المرور</h3>
              {[
                { label: 'كلمة المرور الحالية', value: currentPassword, setValue: setCurrentPassword, show: showCurrent, setShow: setShowCurrent, autoComplete: 'current-password' },
                { label: 'كلمة المرور الجديدة', value: newPassword, setValue: setNewPassword, show: showNew, setShow: setShowNew, autoComplete: 'new-password' },
                { label: 'تأكيد كلمة المرور الجديدة', value: confirmPassword, setValue: setConfirmPassword, show: showConfirm, setShow: setShowConfirm, autoComplete: 'new-password' }
              ].map(field => (
                <label key={field.label} className="block text-sm font-semibold">
                  {field.label}
                  <span className="relative block mt-2">
                    <input type={field.show ? 'text' : 'password'} required minLength={field.autoComplete === 'new-password' ? 8 : undefined}
                      autoComplete={field.autoComplete} value={field.value} onChange={event => field.setValue(event.target.value)}
                      className="w-full border border-[#E5E5E0] rounded-xl px-4 py-3 pl-12 outline-none focus:border-[#E07A48]" />
                    <button type="button" onClick={() => field.setShow(!field.show)} aria-label={field.show ? 'إخفاء ' + field.label : 'إظهار ' + field.label}
                      aria-pressed={field.show} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#78786E] hover:text-[#E07A48]">
                      {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </span>
                </label>
              ))}
              {error && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>}
              {success && <p role="status" className="text-sm text-green-800 bg-green-50 p-3 rounded-xl">{success}</p>}
              <button type="submit" disabled={busy} className="w-full bg-[#E07A48] hover:bg-[#C8662B] text-white font-bold rounded-xl py-3 disabled:opacity-60">
                {busy ? 'جارٍ التغيير...' : 'حفظ كلمة المرور الجديدة'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
