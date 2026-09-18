import React from 'react';
import { Database, CheckCircle2 } from 'lucide-react';

interface SupabaseConfigModalProps {
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md text-[#2D2D2A]" dir="rtl">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-7 h-7 text-[#E07A48]" />
        <h2 className="text-lg font-bold">تخزين البيانات</h2>
      </div>
      <p className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        النظام متصل بمشروع Growth OS في Supabase.
      </p>
      <p className="text-sm text-[#78786E] mt-3">يتم حفظ بيانات العملاء والتقارير والحسابات في قاعدة البيانات، ويمكن الوصول إليها من الأجهزة المختلفة بعد تسجيل الدخول.</p>
      <button onClick={onClose} className="mt-6 bg-[#E07A48] text-white px-5 py-2 rounded-xl font-semibold">إغلاق</button>
    </div>
  </div>
);
