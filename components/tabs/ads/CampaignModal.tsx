import React, { useState } from 'react';
import { X, Megaphone, Calendar, DollarSign, Target, Lightbulb, FileText, CheckCircle2 } from 'lucide-react';
import { AdsPlanItem, AdStageType, AdCampaignType } from '../../../types';

interface CampaignModalProps {
  initialCampaign?: AdsPlanItem | null;
  clientId: string;
  onClose: () => void;
  onSave: (campaignData: Partial<AdsPlanItem>) => void;
}

const PLATFORMS = [
  'Meta (Instagram & Facebook)',
  'TikTok Ads',
  'Snapchat Ads',
  'Google Search & Shopping',
  'Google YouTube Ads',
  'X (Twitter) Ads',
  'LinkedIn Ads',
  'Pinterest Ads',
  'Multi-Platform (متعدد المنصات)'
];

const STAGES: { value: AdStageType; label: string }[] = [
  { value: 'Launch', label: 'Launch (إطلاق)' },
  { value: 'Testing', label: 'Testing (اختبار)' },
  { value: 'Validation', label: 'Validation (تأكيد النتائج / التحقق من الـ Winners)' },
  { value: 'Scaling', label: 'Scaling (التوسع)' },
  { value: 'Retargeting', label: 'Retargeting (إعادة الاستهداف)' },
  { value: 'Creative Refresh', label: 'Creative Refresh (تجديد الكرياتيف)' },
  { value: 'Optimization', label: 'Optimization (تحسين الأداء)' }
];

const OBJECTIVES = [
  'مبيعات مباشرة (Sales Conversion - Purchase)',
  'توليد عملاء محتملين (Lead Generation - Forms / Instant Forms)',
  'رسائل ومحادثات (Messages - WhatsApp / Messenger / Instagram DM)',
  'زيارات للموقع أو صفحة الهبوط (Traffic / Landing Page Views)',
  'تفاعل ومشاركة (Engagement / Video Views)',
  'تثبيت التطبيق (App Installs)',
  'توعية بالبراند والوصول (Brand Awareness & Reach)'
];

export const CampaignModal: React.FC<CampaignModalProps> = ({
  initialCampaign,
  clientId,
  onClose,
  onSave
}) => {
  const isEditing = !!initialCampaign;

  const [campaignName, setCampaignName] = useState(initialCampaign?.campaignName || '');
  const [platform, setPlatform] = useState(initialCampaign?.platform || PLATFORMS[0]);
  const [campaignStage, setCampaignStage] = useState<AdStageType>(initialCampaign?.campaignStage || 'Testing');
  const [startDate, setStartDate] = useState(initialCampaign?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialCampaign?.endDate || '');
  const [objective, setObjective] = useState(initialCampaign?.objective || OBJECTIVES[0]);
  const [campaignType, setCampaignType] = useState<AdCampaignType>(initialCampaign?.campaignType || 'CBO');
  const [campaignBudget, setCampaignBudget] = useState<number | ''>(
    initialCampaign?.campaignBudget !== undefined ? initialCampaign.campaignBudget : ''
  );
  const [primaryKpi, setPrimaryKpi] = useState(initialCampaign?.primaryKpi || 'ROAS & CPA');
  const [targetKpi, setTargetKpi] = useState(initialCampaign?.targetKpi || '');
  const [testingHypothesis, setTestingHypothesis] = useState(initialCampaign?.testingHypothesis || '');
  const [campaignStrategyNotes, setCampaignStrategyNotes] = useState(initialCampaign?.campaignStrategyNotes || '');
  const [status, setStatus] = useState<'planned' | 'active' | 'paused' | 'completed'>(initialCampaign?.status || 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;

    onSave({
      campaignName: campaignName.trim(),
      platform,
      platforms: [platform],
      campaignStage,
      startDate,
      endDate,
      objective,
      campaignType,
      campaignBudget: typeof campaignBudget === 'number' ? campaignBudget : 0,
      primaryKpi: primaryKpi.trim(),
      targetKpi: targetKpi.trim(),
      testingHypothesis: testingHypothesis.trim(),
      campaignStrategyNotes: campaignStrategyNotes.trim(),
      status
    });
  };

  return (
    <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5E0] flex items-center justify-center text-[#5A5A40] shadow-2xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                  {isEditing ? 'تعديل خطة الحملة' : 'خطة حملة إعلانية جديدة'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#2D2D2A]">
                {isEditing ? campaignName : 'إضافة خطة حملة إعلانية (Campaign Plan)'}
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

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* 1. Basic Info Section */}
          <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3.5">
            <h4 className="text-xs font-extrabold text-[#2D2D2A] flex items-center gap-1.5 border-b border-[#E5E5E0] pb-2">
              <Target className="w-4 h-4 text-[#5A5A40]" />
              <span>البيانات الأساسية والمنصة الإعلانية</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-8">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  اسم الحملة (Campaign Name) *
                </label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="مثال: حملة كولكشن الصيف - تحويلات مبيعات مباشرة (Scaling)"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  المنصة الإعلانية (Platform) *
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  مرحلة الحملة (Campaign Stage) *
                </label>
                <select
                  value={campaignStage}
                  onChange={(e) => setCampaignStage(e.target.value as AdStageType)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  حالة الحملة (Campaign Status) *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  <option value="active">نشطة حالياً (Active)</option>
                  <option value="planned">مخطط لها (Planned)</option>
                  <option value="paused">متوقفة مؤقتاً (Paused)</option>
                  <option value="completed">مكتملة (Completed)</option>
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                  تاريخ البداية (Start Date) *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                  تاريخ النهاية المتوقع (End Date)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-12">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  هدف الحملة (Campaign Objective) *
                </label>
                <input
                  type="text"
                  list="objectives-list"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="اختر أو اكتب هدف الحملة..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
                <datalist id="objectives-list">
                  {OBJECTIVES.map((obj) => (
                    <option key={obj} value={obj} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* 2. Budget & Optimization Section */}
          <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3.5">
            <h4 className="text-xs font-extrabold text-[#2D2D2A] flex items-center gap-1.5 border-b border-[#E5E5E0] pb-2">
              <DollarSign className="w-4 h-4 text-[#5A5A40]" />
              <span>هيكل الميزانية ومؤشرات الأداء (Budget & KPIs)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  نوع الميزانية (Campaign Budget Structure) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCampaignType('CBO')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border text-center ${
                      campaignType === 'CBO'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-2xs'
                        : 'bg-white text-[#78786E] border-[#E5E5E0] hover:bg-[#E5E5E0]'
                    }`}
                  >
                    CBO (Advantage+)
                    <span className="block text-[10px] opacity-80 mt-0.5">ميزانية الحملة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCampaignType('ABO')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border text-center ${
                      campaignType === 'ABO'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-2xs'
                        : 'bg-white text-[#78786E] border-[#E5E5E0] hover:bg-[#E5E5E0]'
                    }`}
                  >
                    ABO (Ad Set)
                    <span className="block text-[10px] opacity-80 mt-0.5">ميزانية المجموعات</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  إجمالي ميزانية الحملة (Campaign Budget)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(e.target.value ? Number(e.target.value) : '')}
                    placeholder="مثال: 15000"
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8E85]">
                    ج.م
                  </span>
                </div>
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  المؤشر الأساسي للنجاح (Primary KPI)
                </label>
                <input
                  type="text"
                  value={primaryKpi}
                  onChange={(e) => setPrimaryKpi(e.target.value)}
                  placeholder="مثال: ROAS, CPA, CPL, Cost Per Purchase"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  الرقم المستهدف للـ KPI (Target KPI)
                </label>
                <input
                  type="text"
                  value={targetKpi}
                  onChange={(e) => setTargetKpi(e.target.value)}
                  placeholder="مثال: ROAS >= 4.0X | CPA <= 60 EGP"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>
            </div>
          </div>

          {/* 3. Strategy & Hypothesis Section */}
          <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3.5">
            <h4 className="text-xs font-extrabold text-[#2D2D2A] flex items-center gap-1.5 border-b border-[#E5E5E0] pb-2">
              <Lightbulb className="w-4 h-4 text-[#5A5A40]" />
              <span>فرضية الاختبار والملاحظات الاستراتيجية</span>
            </h4>

            <div>
              <label className="block font-extrabold text-[#2D2D2A] mb-1">
                فرضية الاختبار (Testing Hypothesis)
              </label>
              <textarea
                value={testingHypothesis}
                onChange={(e) => setTestingHypothesis(e.target.value)}
                placeholder="ما الفرضية التي تريد إثباتها بهذه الحملة؟ مثال: فيديوهات مراجعات المشترين (UGC) ستخفض تكلفة الاستحواذ بنسبة 30% مقارنة بالصور الثابتة..."
                rows={2}
                className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] placeholder:text-[#8E8E85]"
              />
            </div>

            <div>
              <label className="block font-extrabold text-[#2D2D2A] mb-1">
                استراتيجية وملاحظات الحملة (Campaign Strategy & Notes)
              </label>
              <textarea
                value={campaignStrategyNotes}
                onChange={(e) => setCampaignStrategyNotes(e.target.value)}
                placeholder="تفاصيل العرض، كود الخصم، طريقة التتبع، التعديلات المتوقعة، وأي ملاحظات خاصة بفريق العمل..."
                rows={3}
                className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] placeholder:text-[#8E8E85]"
              />
            </div>
          </div>

          {/* Modal Actions */}
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
              {isEditing ? 'حفظ التعديلات' : 'إضافة الحملة للخطة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
