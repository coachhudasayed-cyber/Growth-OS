import React, { useState, useEffect } from 'react';
import { Target, Compass, Save, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { AdStageType, AdPhaseStatus, ClientAdsStageStrategy } from '../../../types';

interface AdsStageCardProps {
  clientId: string;
  strategy?: ClientAdsStageStrategy;
  onUpdateStrategy?: (clientId: string, strategy: Partial<ClientAdsStageStrategy>) => void;
}

const STAGES: { value: AdStageType; label: string; desc: string }[] = [
  { value: 'Launch', label: 'Launch (إطلاق)', desc: 'إطلاق أولي للحملات واختبار استجابة السوق ومسار الشراء الأول' },
  { value: 'Testing', label: 'Testing (اختبار)', desc: 'اختبار الجماهير، الزوايا التسويقية، والكرياتيفز وصيغ المحتوى المختلفة' },
  { value: 'Validation', label: 'Validation (تأكيد النتائج / التحقق من الـ Winners)', desc: 'التحقق من الكرياتيفز والجمهور الفائز وضمان استقرار النتائج والـ ROAS' },
  { value: 'Scaling', label: 'Scaling (التوسع)', desc: 'مضاعفة الميزانية والتوسع الرأسي والأفقي لزيادة المبيعات والأوردرات' },
  { value: 'Retargeting', label: 'Retargeting (إعادة الاستهداف)', desc: 'استهداف زوار المتجر والسلات المتروكة والمتفاعلين مع السوشيال ميديا' },
  { value: 'Creative Refresh', label: 'Creative Refresh (تجديد الكرياتيف)', desc: 'تحديث وتجديد الإعلانات لتفادي إرهاق الجمهور Ad Fatigue' },
  { value: 'Optimization', label: 'Optimization (تحسين الأداء)', desc: 'تحسين تكلفة الطلب ومعدل التحويل ومتوسط قيمة السلة AOV ومسار الشراء' }
];

const PHASE_STATUSES: { value: AdPhaseStatus; label: string }[] = [
  { value: 'Not Started', label: 'لم تبدأ (Not Started)' },
  { value: 'In Progress', label: 'قيد التنفيذ (In Progress)' },
  { value: 'Completed', label: 'مكتملة بنجاح (Completed)' }
];

export const AdsStageCard: React.FC<AdsStageCardProps> = ({
  clientId,
  strategy,
  onUpdateStrategy
}) => {
  const [currentStage, setCurrentStage] = useState<AdStageType>(strategy?.currentStage || 'Launch');
  const [overallStrategy, setOverallStrategy] = useState(strategy?.overallStrategy || '');
  const [phaseStatus, setPhaseStatus] = useState<AdPhaseStatus>(strategy?.phaseStatus || 'In Progress');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (strategy) {
      setCurrentStage(strategy.currentStage || 'Launch');
      setOverallStrategy(strategy.overallStrategy || '');
      setPhaseStatus(strategy.phaseStatus || 'In Progress');
    }
  }, [strategy]);

  const handleSave = () => {
    if (onUpdateStrategy) {
      onUpdateStrategy(clientId, {
        currentStage,
        overallStrategy,
        phaseStatus
      });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    }
  };

  const activeStageObj = STAGES.find(s => s.value === currentStage) || STAGES[0];

  return (
    <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E5E0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5E0] flex items-center justify-center text-[#5A5A40] shadow-2xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <span>استراتيجية المرحلة الإعلانية الحالية</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 hidden sm:inline-block">
                Media Buying Strategy
              </span>
            </h2>
            <p className="text-xs text-[#8E8E85] mt-0.5">
              تحديد المرحلة التي يقف عندها البراند إعلانياً، أهداف المرحلة، وخارطة الطريق التفصيلية
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer shadow-xs shrink-0 ${
            savedFeedback
              ? 'bg-emerald-600 text-white'
              : 'bg-[#5A5A40] hover:bg-[#484833] text-white'
          }`}
        >
          {savedFeedback ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>تم الحفظ بنجاح!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ الاستراتيجية</span>
            </>
          )}
        </button>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Stage & Status Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2">
            <label className="block text-xs font-extrabold text-[#2D2D2A]">
              1. المرحلة الإعلانية الحالية (Current Ad Stage) *
            </label>
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(e.target.value as AdStageType)}
              className="w-full bg-[#F9F8F6] border border-[#E5E5E0] text-[#2D2D2A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#5A5A40] cursor-pointer"
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#5A5A40] font-medium leading-relaxed bg-[#5A5A40]/5 p-2.5 rounded-xl border border-[#5A5A40]/10">
              {activeStageObj.desc}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-2">
            <label className="block text-xs font-extrabold text-[#2D2D2A]">
              2. حالة المرحلة (Phase Status) *
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PHASE_STATUSES.map((ps) => {
                const isSelected = phaseStatus === ps.value;
                return (
                  <button
                    key={ps.value}
                    type="button"
                    onClick={() => setPhaseStatus(ps.value)}
                    className={`px-2 py-2 rounded-xl text-[11px] font-bold transition cursor-pointer border text-center ${
                      isSelected
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-2xs'
                        : 'bg-[#F9F8F6] text-[#78786E] hover:bg-[#E5E5E0] border-[#E5E5E0]'
                    }`}
                  >
                    {ps.value === 'In Progress' ? 'قيد التنفيذ' : ps.value === 'Completed' ? 'مكتملة' : 'لم تبدأ'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stage Guidance */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#5A5A40]">
              <Zap className="w-3.5 h-3.5" />
              <span>توجيه المرحلة النشطة:</span>
            </div>
            <p className="text-[11px] text-[#78786E] leading-relaxed">
              {currentStage === 'Launch' && 'ركز على جمع بيانات بكسل أولية، التحقق من سلاسة مسار الشراء، واختبار المنتجات الأسهل في الإقناع.'}
              {currentStage === 'Testing' && 'اختبر 3-5 زوايا تسويقية مختلفة (Problem-Solution / Price-Offer / Social Proof) مع صيغ كرياتيف متنوعة.'}
              {currentStage === 'Validation' && 'ثبت أفضل 2-3 إعلانات واختبر استقرار الـ ROAS وتكلفة الطلب مع زيادة طفيفة للميزانية.'}
              {currentStage === 'Scaling' && 'قم برفع الميزانية تدريجياً (20-30%) كل 48-72 ساعة أو استخدام CBO موسع وجماهير Broad مفتوحة.'}
              {currentStage === 'Retargeting' && 'ركز على تقديم خصومات إضافية، الضمان الذهبي، وآراء المشترين الحقيقيين لغلق صفقات المترددين.'}
              {currentStage === 'Creative Refresh' && 'صور وابتكر زوايا وهوكس جديدة لنفس المنتجات الرابحة لتجديد تفاعل الجمهور.'}
              {currentStage === 'Optimization' && 'حسن سرعة الموقع، صفحات الهبوط، وعروض الباقات لرفع متوسط قيمة الطلب AOV ومعدل CVR.'}
            </p>
          </div>
        </div>

        {/* Overall Strategy Textarea (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E5E0]">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-extrabold text-[#2D2D2A]">
              3. الاستراتيجية الإعلانية العامة وتفاصيل الخطة (Overall Ads Strategy) *
            </label>
            <span className="text-[11px] text-[#8E8E85]">
              {overallStrategy.length} حرف
            </span>
          </div>
          <textarea
            value={overallStrategy}
            onChange={(e) => setOverallStrategy(e.target.value)}
            placeholder="اكتب هنا بالتفصيل: ما هي الخطة الإعلانية التي ستتبعها مع العميل في هذه المرحلة؟ لماذا اخترت هذه المرحلة تحديداً؟ ما الميزانية الإجمالية المخصصة؟ وما هي الأهداف الرقمية التي تستهدف تحقيقها في نهايتها (CPA, ROAS, Orders)؟..."
            rows={7}
            className="w-full flex-1 bg-[#F9F8F6] border border-[#E5E5E0] text-[#2D2D2A] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-[#5A5A40] placeholder:text-[#8E8E85] resize-y font-medium"
          />
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8E8E85]">
            <span>💡 يتم حفظ الخطة بالضغط على زر "حفظ الاستراتيجية".</span>
            {strategy?.updatedAt && (
              <span>آخر تحديث: {strategy.updatedAt}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
