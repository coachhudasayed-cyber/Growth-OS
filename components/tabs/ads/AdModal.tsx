import React, { useState } from 'react';
import { X, Sparkles, Video, FileText, Link, Award, Eye } from 'lucide-react';
import { AdItem, AdCreativeType, AdItemStatus } from '../../../types';

interface AdModalProps {
  initialAd?: AdItem | null;
  onClose: () => void;
  onSave: (adData: Partial<AdItem>) => void;
}

const CREATIVE_TYPES: AdCreativeType[] = [
  'UGC',
  'Video',
  'Static',
  'Carousel',
  'Founder',
  'Unboxing',
  'Problem-Solution',
  'Testimonial',
  'Other'
];

const AD_STATUSES: { value: AdItemStatus; label: string }[] = [
  { value: 'Ready', label: 'جاهز للإطلاق (Ready)' },
  { value: 'Live', label: 'شغال حالياً (Live)' },
  { value: 'Winner', label: 'إعلان فائز 🏆 (Winner)' },
  { value: 'Paused', label: 'متوقف (Paused)' },
  { value: 'Loser', label: 'غير مجدي ❌ (Loser)' },
  { value: 'Planned', label: 'مخطط للتصوير/التصميم (Planned)' },
  { value: 'Completed', label: 'مكتمل (Completed)' }
];

const CTAS = [
  'Shop Now (اطلب الآن / تسوق الآن)',
  'Order via WhatsApp (اطلب عبر واتساب)',
  'Sign Up (سجل الآن)',
  'Learn More (اعرف المزيد)',
  'Get Offer (احصل على العرض)',
  'Contact Us (تواصل معنا)',
  'Download (تحميل التطبيق)',
  'Book Now (احجز موعدك)'
];

const DESTINATIONS = [
  'Website',
  'Landing Page',
  'WhatsApp',
  'Instagram Direct Message (DM)',
  'Lead Instant Form',
  'Messenger',
  'App Store / Google Play'
];

export const AdModal: React.FC<AdModalProps> = ({
  initialAd,
  onClose,
  onSave
}) => {
  const isEditing = !!initialAd;

  const [name, setName] = useState(initialAd?.name || '');
  const [creative, setCreative] = useState(initialAd?.creative || '');
  const [creativeType, setCreativeType] = useState<AdCreativeType>(initialAd?.creativeType || 'UGC');
  const [angle, setAngle] = useState(initialAd?.angle || '');
  const [hook, setHook] = useState(initialAd?.hook || '');
  const [primaryText, setPrimaryText] = useState(initialAd?.primaryText || '');
  const [headline, setHeadline] = useState(initialAd?.headline || '');
  const [cta, setCta] = useState(initialAd?.cta || CTAS[0]);
  const [destination, setDestination] = useState(initialAd?.destination || DESTINATIONS[0]);
  const [status, setStatus] = useState<AdItemStatus>(initialAd?.status || 'Ready');
  const [notes, setNotes] = useState(initialAd?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      creative: creative.trim(),
      creativeType,
      angle: angle.trim(),
      hook: hook.trim(),
      primaryText: primaryText.trim(),
      headline: headline.trim(),
      cta: cta.trim(),
      destination: destination.trim(),
      status,
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5E0] flex items-center justify-center text-[#5A5A40] shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                  {isEditing ? 'تعديل بيانات الإعلان' : 'إعلان جديد (Creative & Copy)'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#2D2D2A]">
                {isEditing ? name : 'إضافة إعلان جديد (Ad Item)'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#E5E5E0] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Creative Specs */}
          <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3.5">
            <h4 className="text-xs font-extrabold text-[#2D2D2A] flex items-center gap-1.5 border-b border-[#E5E5E0] pb-2">
              <Video className="w-4 h-4 text-[#5A5A40]" />
              <span>مواصفات الكرياتيف والزاوية الإعلانية</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-8">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  كود / اسم الإعلان (Ad Name / Code) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: Ad 01 - UGC Video - Unboxing Offer"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  نوع الكرياتيف (Creative Type) *
                </label>
                <select
                  value={creativeType}
                  onChange={(e) => setCreativeType(e.target.value as AdCreativeType)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  {CREATIVE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  وصف الكرياتيف / رابط الفيديو أو التصميم
                </label>
                <input
                  type="text"
                  value={creative}
                  onChange={(e) => setCreative(e.target.value)}
                  placeholder="مثال: فيديو ريل عميل يجرب المنتج + كود درايف أو لينك"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  حالة الإعلان الحالية (Ad Status) *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AdItemStatus)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  {AD_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>{st.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-12">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  الزاوية التسويقية (Marketing Angle) *
                </label>
                <input
                  type="text"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  placeholder="مثال: زاوية توفير الفلوس / زاوية حل مشكلة التساقط / زاوية الفخامة والهيبة..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>
            </div>
          </div>

          {/* Copywriting & Hook */}
          <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3.5">
            <h4 className="text-xs font-extrabold text-[#2D2D2A] flex items-center gap-1.5 border-b border-[#E5E5E0] pb-2">
              <FileText className="w-4 h-4 text-[#5A5A40]" />
              <span>النص الإعلاني والـ Hook والـ CTA</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-12">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  الهوك / الجملة الافتتاحية الخاطفة (Ad Hook) *
                </label>
                <input
                  type="text"
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="مثال: لو لسه بتعاني من... يبقى الفيديو ده معمول ليك مخصوص!"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-12">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  النص الأساسي للإعلان (Primary Ad Copy)
                </label>
                <textarea
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  placeholder="اكتب نص الكابشن الكامل للإعلان هنا مع العرض والمميزات ورابط الطلب..."
                  rows={4}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] placeholder:text-[#8E8E85]"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  العنوان الرئيسي (Headline)
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="مثال: خصم 40% + شحن مجاني لأول 50 طلب اليوم"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  زر الإجراء (CTA)
                </label>
                <select
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  {CTAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  الوجهة (Destination)
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-12">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  ملاحظات وتوجيهات خاصة بالإعلان
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: تجربة مقاس 9:16 ستوري، كود خصم خاص، موسيقى تريند..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5E5E0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-[#E5E5E0] border border-[#E5E5E0] text-[#2D2D2A] rounded-xl font-extrabold text-xs transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl font-extrabold text-xs transition cursor-pointer shadow-xs"
            >
              {isEditing ? 'حفظ التعديلات' : 'إضافة الإعلان'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
