import React, { useState } from 'react';
import { X, TrendingUp, Award, DollarSign, BarChart2, CheckCircle2, Lightbulb, ArrowRight, HelpCircle } from 'lucide-react';
import { CampaignActualResults, CampaignLearningsAndDecision } from '../../../types';

interface ResultsLearningsModalProps {
  campaignName: string;
  initialResults?: CampaignActualResults;
  initialLearnings?: CampaignLearningsAndDecision;
  onClose: () => void;
  onSave: (results: CampaignActualResults, learnings: CampaignLearningsAndDecision) => void;
}

export const ResultsLearningsModal: React.FC<ResultsLearningsModalProps> = ({
  campaignName,
  initialResults,
  initialLearnings,
  onClose,
  onSave
}) => {
  // Results State
  const [actualSpend, setActualSpend] = useState<number | ''>(initialResults?.actualSpend !== undefined ? initialResults.actualSpend : '');
  const [impressions, setImpressions] = useState<number | ''>(initialResults?.impressions !== undefined ? initialResults.impressions : '');
  const [reach, setReach] = useState<number | ''>(initialResults?.reach !== undefined ? initialResults.reach : '');
  const [ctr, setCtr] = useState(initialResults?.ctr || '');
  const [cpc, setCpc] = useState(initialResults?.cpc || '');
  const [cpm, setCpm] = useState(initialResults?.cpm || '');
  const [atc, setAtc] = useState<number | ''>(initialResults?.atc !== undefined ? initialResults.atc : '');
  const [purchasesOrLeads, setPurchasesOrLeads] = useState<number | ''>(initialResults?.purchasesOrLeads !== undefined ? initialResults.purchasesOrLeads : '');
  const [cpaOrCac, setCpaOrCac] = useState(initialResults?.cpaOrCac || '');
  const [cvr, setCvr] = useState(initialResults?.cvr || '');
  const [roas, setRoas] = useState(initialResults?.roas || '');
  const [performanceStatus, setPerformanceStatus] = useState<'Winner' | 'Needs More Data' | 'Loser'>(
    initialResults?.performanceStatus || 'Needs More Data'
  );

  // Learnings & Decision State
  const [whatWorked, setWhatWorked] = useState(initialLearnings?.whatWorked || '');
  const [whatDidntWork, setWhatDidntWork] = useState(initialLearnings?.whatDidntWork || '');
  const [bestCreative, setBestCreative] = useState(initialLearnings?.bestCreative || '');
  const [bestAngle, setBestAngle] = useState(initialLearnings?.bestAngle || '');
  const [bestAudience, setBestAudience] = useState(initialLearnings?.bestAudience || '');
  const [insightsNotes, setInsightsNotes] = useState(initialLearnings?.insightsNotes || '');
  const [decision, setDecision] = useState<'Keep' | 'Pause' | 'Scale' | 'Iterate' | 'Retest'>(
    initialLearnings?.decision || 'Keep'
  );
  const [nextStep, setNextStep] = useState(initialLearnings?.nextStep || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const resultsData: CampaignActualResults = {
      actualSpend: typeof actualSpend === 'number' ? actualSpend : undefined,
      impressions: typeof impressions === 'number' ? impressions : undefined,
      reach: typeof reach === 'number' ? reach : undefined,
      ctr: ctr.trim() || undefined,
      cpc: cpc.trim() || undefined,
      cpm: cpm.trim() || undefined,
      atc: typeof atc === 'number' ? atc : undefined,
      purchasesOrLeads: typeof purchasesOrLeads === 'number' ? purchasesOrLeads : undefined,
      cpaOrCac: cpaOrCac.trim() || undefined,
      cvr: cvr.trim() || undefined,
      roas: roas.trim() || undefined,
      performanceStatus
    };

    const learningsData: CampaignLearningsAndDecision = {
      whatWorked: whatWorked.trim(),
      whatDidntWork: whatDidntWork.trim(),
      bestCreative: bestCreative.trim(),
      bestAngle: bestAngle.trim(),
      bestAudience: bestAudience.trim(),
      insightsNotes: insightsNotes.trim(),
      decision,
      nextStep: nextStep.trim()
    };

    onSave(resultsData, learningsData);
  };

  return (
    <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E0] flex items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5E0] flex items-center justify-center text-[#5A5A40] shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                  تحليل النتائج والقرارات
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#2D2D2A]">
                النتائج الفعلية والتعلم (Results & Learnings)
              </h3>
              <p className="text-xs text-[#8E8E85] truncate max-w-md">
                الحملة: <span className="text-[#5A5A40] font-bold">{campaignName}</span>
              </p>
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* 1. Actual Metrics Section */}
          <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
              <h4 className="text-xs font-extrabold text-[#2D2D2A] flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#5A5A40]" />
                <span>1. الأرقام والنتائج الفعلية المحققة (Actual Metrics)</span>
              </h4>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#2D2D2A]">تقييم الحملة:</span>
                <select
                  value={performanceStatus}
                  onChange={(e) => setPerformanceStatus(e.target.value as any)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold border cursor-pointer ${
                    performanceStatus === 'Winner'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : performanceStatus === 'Loser'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}
                >
                  <option value="Winner">Winner 🏆 (ناجحة وفائزة)</option>
                  <option value="Needs More Data">Needs More Data ⏳ (تحتاج داتا إضافية)</option>
                  <option value="Loser">Loser ❌ (غير مجدية / خاسرة)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  المصروف الفعلي (Spend)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={actualSpend}
                    onChange={(e) => setActualSpend(e.target.value ? Number(e.target.value) : '')}
                    placeholder="مثال: 4500"
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#8E8E85]">
                    ج.م
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  المبيعات / التحويلات (Purchases)
                </label>
                <input
                  type="number"
                  min={0}
                  value={purchasesOrLeads}
                  onChange={(e) => setPurchasesOrLeads(e.target.value ? Number(e.target.value) : '')}
                  placeholder="مثال: 95"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  العائد الإعلاني (ROAS)
                </label>
                <input
                  type="text"
                  value={roas}
                  onChange={(e) => setRoas(e.target.value)}
                  placeholder="مثال: 4.8X"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  تكلفة الشراء / العميل (CPA / CAC)
                </label>
                <input
                  type="text"
                  value={cpaOrCac}
                  onChange={(e) => setCpaOrCac(e.target.value)}
                  placeholder="مثال: 47 ج.م"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  معدل النقر (CTR Link %)
                </label>
                <input
                  type="text"
                  value={ctr}
                  onChange={(e) => setCtr(e.target.value)}
                  placeholder="مثال: 2.4%"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  تكلفة النقرة (CPC)
                </label>
                <input
                  type="text"
                  value={cpc}
                  onChange={(e) => setCpc(e.target.value)}
                  placeholder="مثال: 1.8 ج.م"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  تكلفة الألف ظهور (CPM)
                </label>
                <input
                  type="text"
                  value={cpm}
                  onChange={(e) => setCpm(e.target.value)}
                  placeholder="مثال: 45 ج.م"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  إضافات للسلة (Add to Cart)
                </label>
                <input
                  type="number"
                  min={0}
                  value={atc}
                  onChange={(e) => setAtc(e.target.value ? Number(e.target.value) : '')}
                  placeholder="مثال: 320"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>
            </div>
          </div>

          {/* 2. Qualitative Learnings Section */}
          <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3.5">
            <h4 className="text-xs font-extrabold text-[#2D2D2A] flex items-center gap-1.5 border-b border-[#E5E5E0] pb-2">
              <Lightbulb className="w-4 h-4 text-[#5A5A40]" />
              <span>2. ماذا تعلمنا من هذه الحملة؟ (Key Learnings & Winners)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-extrabold text-emerald-800 mb-1">
                  ✅ ما الذي نجح وأثبت كفاءته؟ (What Worked)
                </label>
                <textarea
                  value={whatWorked}
                  onChange={(e) => setWhatWorked(e.target.value)}
                  placeholder="مثال: هوك المشكلة الأولى حقق 3x في معدل التحويل، الجمهور المفتوح كان أرخص بكثير من الاهتمامات..."
                  rows={3}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] placeholder:text-[#8E8E85]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-rose-800 mb-1">
                  ❌ ما الذي لم ينجح؟ (What Didn't Work)
                </label>
                <textarea
                  value={whatDidntWork}
                  onChange={(e) => setWhatDidntWork(e.target.value)}
                  placeholder="مثال: التصاميم الثابتة لم تجلب مبيعات، جمهور اللوك ألايك كان تكلفة الشراء فيه مضاعفة..."
                  rows={3}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] placeholder:text-[#8E8E85]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  🏆 أفضل كرياتيف وزاوية (Best Creative & Angle)
                </label>
                <input
                  type="text"
                  value={bestCreative}
                  onChange={(e) => setBestCreative(e.target.value)}
                  placeholder="مثال: فيديو UGC 02 بزاوية توفير الفلوس والضمان"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  🎯 أفضل جمهور مستهدف (Best Audience)
                </label>
                <input
                  type="text"
                  value={bestAudience}
                  onChange={(e) => setBestAudience(e.target.value)}
                  placeholder="مثال: Broad Audience 22-38 سنة في القاهرة والإسكندرية"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  ملاحظات واستنتاجات تفصيلية (Insights & Observations)
                </label>
                <textarea
                  value={insightsNotes}
                  onChange={(e) => setInsightsNotes(e.target.value)}
                  placeholder="أي ملاحظات تخص سلوك العميل في صفحة الهبوط أو اعتراضات متكررة في التعليقات..."
                  rows={2}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl p-3 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] placeholder:text-[#8E8E85]"
                />
              </div>
            </div>
          </div>

          {/* 3. Decision & Next Steps Section */}
          <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#E5E5E0] space-y-3.5">
            <h4 className="text-xs font-extrabold text-[#2D2D2A] flex items-center gap-1.5 border-b border-[#E5E5E0] pb-2">
              <ArrowRight className="w-4 h-4 text-[#5A5A40]" />
              <span>3. القرار المتخذ والخطوة القادمة (Decision & Next Steps)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-4">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  القرار التنفيذي (Action Decision) *
                </label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  <option value="Scale">Scale (زيادة الميزانية والتوسع)</option>
                  <option value="Keep">Keep (الاستمرار بنفس الوتيرة والميزانية)</option>
                  <option value="Iterate">Iterate (تعديل وتطوير نسخ جديدة)</option>
                  <option value="Retest">Retest (إعادة اختبار بافتراضات جديدة)</option>
                  <option value="Pause">Pause (إيقاف الحملة نهائياً)</option>
                </select>
              </div>

              <div className="md:col-span-8">
                <label className="block font-extrabold text-[#2D2D2A] mb-1">
                  الخطوة العملية القادمة (Next Action Item) *
                </label>
                <input
                  type="text"
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  placeholder="مثال: تصوير 3 نسخ جديدة من إعلان UGC 02 مع مضاعفة الميزانية بنسبة 40% الأسبوع القادم"
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
              حفظ النتائج والقرارات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
