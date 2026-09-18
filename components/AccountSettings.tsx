import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound, X } from 'lucide-react';
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
          ? 'inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E5E0] rounded-xl text-xs font-bold text-[#2D2D2A] hover:border-[#E07A48] hover:text-[#E07A48] transition'
          : 'w-full flex items-center gap-2 px-3.5 py-2.5 bg-[#E07A48]/10 border border-[#E07A48]/20 rounded-xl text-xs font-bold text-[#E07A48] hover:bg-[#E07A48]/20 transition'}
        title="بيانات حسابي" aria-label="بيانات حسابي">
        <UserRound className="w-4 h-4" />
        <span>بيانات حسابي</span>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 font-['Cairo',sans-serif]"
          dir="rtl" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="account-settings-title"
            className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-8 shadow-2xl text-[#2D2D2A] animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E5E0] pb-4 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-3 bg-[#E07A48]/10 border border-[#E07A48]/20 text-[#E07A48] rounded-2xl shrink-0">
                  <UserRound className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h2 id="account-settings-title" className="text-lg sm:text-xl font-extrabold">بيانات حسابي</h2>
                  <p className="text-[11px] sm:text-xs text-[#8E8E85] mt-0.5">بيانات الدخول وإعدادات كلمة المرور</p>
                </div>
              </div>
              <button type="button" onClick={close} disabled={busy} aria-label="إغلاق"
                className="p-2 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#EFEFEA] rounded-xl transition shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <section className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5 shadow-xs mb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#8E8E85]">الاسم</span>
                  <p className="text-sm font-bold mt-1 break-words">{user.name}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8E8E85]">نوع الحساب</span>
                  <p className="text-sm font-bold mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#E07A48]" />{roleLabel}
                  </p>
                </div>
              </div>
              <div className="border-t border-[#E5E5E0] py-4">
                <span className="text-[11px] font-semibold text-[#8E8E85] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />الإيميل</span>
                <p className="text-sm font-bold mt-1 break-all" dir="ltr">{user.email}</p>
              </div>
              <div className="border-t border-[#E5E5E0] pt-4">
                <span className="text-[11px] font-semibold text-[#8E8E85] flex items-center gap-1.5"><LockKeyhole className="w-3.5 h-3.5" />كلمة المرور</span>
                <p className="text-sm font-bold tracking-widest mt-1" aria-label="كلمة المرور مخفية">••••••••</p>
                <p className="text-[11px] text-[#8E8E85] mt-1">الكلمة الحالية لا يمكن عرضها، ويمكنك تغييرها بالأسفل.</p>
              </div>
            </section>

            <form onSubmit={changePassword} className="space-y-4">
              <div className="flex items-center gap-2 text-[#E07A48] font-bold text-sm border-b border-[#E5E5E0] pb-3">
                <KeyRound className="w-4 h-4" />
                <h3>تغيير كلمة المرور</h3>
              </div>
              {[
                { label: 'كلمة المرور الحالية', value: currentPassword, setValue: setCurrentPassword, show: showCurrent, setShow: setShowCurrent, autoComplete: 'current-password' },
                { label: 'كلمة المرور الجديدة', value: newPassword, setValue: setNewPassword, show: showNew, setShow: setShowNew, autoComplete: 'new-password' },
                { label: 'تأكيد كلمة المرور الجديدة', value: confirmPassword, setValue: setConfirmPassword, show: showConfirm, setShow: setShowConfirm, autoComplete: 'new-password' }
              ].map(field => (
                <label key={field.label} className="block text-xs font-semibold text-[#2D2D2A]">
                  {field.label}
                  <span className="relative block mt-1.5">
                    <input type={field.show ? 'text' : 'password'} required minLength={field.autoComplete === 'new-password' ? 8 : undefined}
                      autoComplete={field.autoComplete} value={field.value} onChange={event => field.setValue(event.target.value)}
                      className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 pl-11 text-sm text-[#2D2D2A] outline-none" />
                    <button type="button" onClick={() => field.setShow(!field.show)}
                      aria-label={field.show ? 'إخفاء ' + field.label : 'إظهار ' + field.label} aria-pressed={field.show}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#8E8E85] hover:text-[#E07A48]">
                      {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </span>
                </label>
              ))}
              {error && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</p>}
              {success && <p role="status" className="text-xs text-green-800 bg-green-50 border border-green-200 p-3 rounded-xl">{success}</p>}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <button type="button" onClick={close} disabled={busy}
                  className="sm:w-1/3 bg-white border border-[#E5E5E0] hover:bg-[#EFEFEA] text-[#5A5A40] font-bold rounded-xl py-2.5 text-xs transition">
                  إلغاء
                </button>
                <button type="submit" disabled={busy}
                  className="sm:flex-1 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold rounded-xl py-2.5 text-xs transition disabled:opacity-60 shadow-xs">
                  {busy ? 'جارٍ التغيير...' : 'حفظ كلمة المرور الجديدة'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
