import React, { useRef, useState } from 'react';
import {
  X,
  Target,
  Megaphone,
  Calendar,
  Layers,
  TrendingUp,
  Award,
  DollarSign,
  Download,
  Loader2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Video,
  Globe,
  Share2,
  Lightbulb,
  FileText,
  Trash2
} from 'lucide-react';
import { AdsPlanItem, CampaignPlanEntry } from '../../../types';
import { exportElementToPDF } from '../../../utils/pdfExporter';

interface StrategyAndAdsPlanViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: AdsPlanItem | null;
  brandName?: string;
  onEdit?: (plan: AdsPlanItem) => void;
  onDelete?: (plan: AdsPlanItem) => void;
}

export const StrategyAndAdsPlanViewModal: React.FC<StrategyAndAdsPlanViewModalProps> = ({
  isOpen,
  onClose,
  plan,
  brandName,
  onEdit,
  onDelete
}) => {
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !plan) return null;

  const strategy = plan.strategy || {};
  const startDate = strategy.startDate || plan.startDate || 'غير محدد';
  const endDate = strategy.endDate || plan.endDate || 'غير محدد';
  const stage = strategy.stage || plan.campaignStage || 'Testing';
  const phaseStatus = strategy.phaseStatus || (plan.status === 'completed' ? 'Completed' : 'In Progress');
  const totalBudget = strategy.totalBudget || plan.campaignBudget || 0;
  const strategicGoals = strategy.strategicGoals || [];

  const campaigns: CampaignPlanEntry[] =
    plan.campaigns && plan.campaigns.length > 0
      ? plan.campaigns
      : plan.campaignName
      ? [
          {
            id: 'legacy-camp',
            campaignName: plan.campaignName,
            platform: plan.platform || 'Meta Ads',
            campaignStage: plan.campaignStage || 'Testing',
            startDate: plan.startDate || startDate,
            endDate: plan.endDate || endDate,
            objective: plan.objective || 'مبيعات مباشرة',
            campaignType: plan.campaignType || 'CBO',
            campaignBudget: plan.campaignBudget || totalBudget,
            primaryKpi: plan.primaryKpi || 'ROAS & CPA',
            targetKpi: plan.targetKpi,
            testingHypothesis: plan.testingHypothesis,
            campaignStrategyNotes: plan.campaignStrategyNotes,
            status: plan.status || 'active',
            adSets: plan.adSets || [],
            results: plan.results,
            learnings: plan.learnings
          }
        ]
      : [];

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      await exportElementToPDF(reportRef.current, {
        filename: `Ads_Strategy_${brandName || plan.title || 'Plan'}.pdf`,
        backgroundColor: '#F9F8F6'
      });
    } catch (error) {
      console.error('Ads strategy PDF export failed', error);
      window.alert('تعذر تحميل ملف PDF. حاولي مرة أخرى.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div ref={reportRef} className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* VIEW MODAL HEADER */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-[#E5E5E0] flex items-center justify-between shrink-0 print:border-b-2 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs shrink-0">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20">
                  تفاصيل الخطة والاستراتيجية
                </span>
                {brandName && (
                  <span className="text-[11px] sm:text-xs font-bold text-[#8E8E85] truncate">| {brandName}</span>
                )}
              </div>
              <h2 className="text-sm sm:text-lg font-black text-[#2D2D2A] truncate">
                {plan.title || plan.campaignName || `خطة واستراتيجية: ${startDate} إلى ${endDate}`}
              </h2>
            </div>
          </div>

          <div data-pdf-hide className="flex items-center gap-1.5 sm:gap-2 print:hidden shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(plan)}
                className="flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-2 min-h-[38px] bg-[#5A5A40]/10 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">تعديل</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(plan)}
                className="flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-2 min-h-[38px] bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                title="حذف الخطة"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">حذف</span>
              </button>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-[#5A5A40] bg-[#F5F5F0] hover:bg-[#E5E5E0] disabled:opacity-60 disabled:cursor-wait rounded-xl transition cursor-pointer"
              title="تحميل PDF"
            >
              {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL CONTENT */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 print:overflow-visible print:p-2">
          {/* 1. STRATEGY SUMMARY CARD */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E5E0]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#5A5A40]" />
                <span className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider">
                  الإطار الاستراتيجي والفترة الزمنية:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20">
                  المرحلة: {stage}
                </span>
                <span
                  className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                    phaseStatus === 'Completed'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {phaseStatus}
                </span>
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  الميزانية: {Number(totalBudget).toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* Dates & Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] space-y-1">
                <span className="text-[11px] font-bold text-[#8E8E85] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>الفترة الزمنية المحددة:</span>
                </span>
                <div className="font-extrabold text-[#2D2D2A]">
                  من <span className="text-[#5A5A40]">{startDate}</span> إلى{' '}
                  <span className="text-[#5A5A40]">{endDate}</span>
                </div>
              </div>

              {strategy.targetAudience && (
                <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] space-y-1">
                  <span className="text-[11px] font-bold text-[#8E8E85]">الجمهور المستهدف والتموضع:</span>
                  <div className="font-medium text-[#2D2D2A]">{strategy.targetAudience}</div>
                </div>
              )}
            </div>

            {/* Overall Strategy Text */}
            {strategy.overallStrategy && (
              <div className="p-3.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] text-xs space-y-1">
                <span className="font-bold text-[#8E8E85]">الاستراتيجية العامة ورؤية التنفيذ:</span>
                <p className="font-medium text-[#2D2D2A] leading-relaxed">
                  {strategy.overallStrategy}
                </p>
              </div>
            )}

            {/* Strategic Goals List */}
            {strategicGoals.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-extrabold text-[#2D2D2A]">الأهداف الاستراتيجية المحددة:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {strategicGoals.map((goal, gIdx) => (
                    <div
                      key={gIdx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F9F8F6] border border-[#E5E5E0] text-xs font-bold text-[#2D2D2A]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#5A5A40] shrink-0" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. CAMPAIGNS, AD SETS & ADS BREAKDOWN */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-black text-[#2D2D2A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5A5A40]" />
                <span>تفاصيل الحملات والمجموعات والنتائج ({campaigns.length} حملة):</span>
              </h3>

              {/* Campaign Filter Tabs for Multi-campaign Plans */}
              {campaigns.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E5E5E0] print:hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaignFilter('all')}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                      selectedCampaignFilter === 'all'
                        ? 'bg-[#5A5A40] text-white shadow-xs'
                        : 'text-[#2D2D2A] hover:bg-[#F9F8F6]'
                    }`}
                  >
                    عرض كل الحملات ({campaigns.length})
                  </button>
                  {campaigns.map((c, i) => (
                    <button
                      key={c.id || i}
                      type="button"
                      onClick={() => setSelectedCampaignFilter(c.id)}
                      className={`px-3 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                        selectedCampaignFilter === c.id
                          ? 'bg-[#5A5A40] text-white shadow-xs'
                          : 'text-[#2D2D2A] hover:bg-[#F9F8F6]'
                      }`}
                    >
                      حملة #{i + 1}: {c.campaignName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {campaigns
              .filter((c) => selectedCampaignFilter === 'all' || c.id === selectedCampaignFilter)
              .map((camp, cIdx) => {
                const originalIdx = campaigns.findIndex((c) => c.id === camp.id);
                const actualIndex = originalIdx >= 0 ? originalIdx : cIdx;
                const campAdSets = camp.adSets || [];
                const campAdsCount = campAdSets.reduce((sum, s) => sum + (s.ads?.length || 0), 0);
                const results = camp.results;
                const learnings = camp.learnings;

                return (
                  <div
                    key={camp.id || cIdx}
                    className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-2xs space-y-5"
                  >
                    {/* Campaign Card Top */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E0]">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-[#5A5A40] text-white">
                            حملة #{actualIndex + 1}
                          </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                          {camp.platform || 'Meta Ads'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F9F8F6] text-[#2D2D2A] border border-[#E5E5E0]">
                          {camp.campaignType || 'CBO'}
                        </span>
                        {camp.campaignBudget ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {Number(camp.campaignBudget).toLocaleString()} ج.م
                          </span>
                        ) : null}
                        {results?.performanceStatus === 'Winner' && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                            Winner 🏆
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-[#2D2D2A]">
                        {camp.campaignName}
                      </h4>
                    </div>

                    <div className="text-xs text-[#8E8E85] font-medium space-y-0.5 text-right sm:text-left">
                      <div>🎯 الهدف: {camp.objective}</div>
                      <div>
                        📦 {campAdSets.length} Ad Sets • {campAdsCount} إعلان
                      </div>
                    </div>
                  </div>

                  {/* Campaign Meta & Hypothesis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {camp.primaryKpi && (
                      <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                        <span className="font-bold text-[#8E8E85]">المؤشر المستهدف (KPI): </span>
                        <span className="font-extrabold text-[#2D2D2A]">
                          {camp.primaryKpi} {camp.targetKpi ? `(${camp.targetKpi})` : ''}
                        </span>
                      </div>
                    )}
                    {camp.testingHypothesis && (
                      <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                        <span className="font-bold text-[#8E8E85]">فرضية الاختبار: </span>
                        <span className="font-medium text-[#2D2D2A]">{camp.testingHypothesis}</span>
                      </div>
                    )}
                  </div>

                  {/* ================= AD SETS & ADS BREAKDOWN ================= */}
                  {campAdSets.length > 0 && (
                    <div className="space-y-4 pt-1">
                      <div className="text-xs font-black text-[#5A5A40] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Ad Sets (مجموعات الإعلانات) — {campAdSets.length} مجموعات:</span>
                      </div>

                      <div className="space-y-4">
                        {campAdSets.map((adSet, sIdx) => (
                          <div
                            key={adSet.id || sIdx}
                            className="p-4 sm:p-5 rounded-2xl bg-[#F9F8F6] border border-[#E5E5E0] space-y-4"
                          >
                            {/* AdSet Top Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E5E0]">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#5A5A40] text-white">
                                  Ad Set #{sIdx + 1}
                                </span>
                                <span className="text-xs sm:text-sm font-black text-[#2D2D2A]">
                                  {adSet.name}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                {adSet.budgetType && (
                                  <span className="px-2 py-0.5 rounded bg-white text-[#5A5A40] border border-[#E5E5E0] font-bold">
                                    {adSet.budgetType} {adSet.budget ? `(${adSet.budget} ج.م)` : ''}
                                  </span>
                                )}
                                {adSet.objectiveOrRole && (
                                  <span className="px-2 py-0.5 rounded bg-white text-[#2D2D2A] border border-[#E5E5E0] font-bold">
                                    🎯 {adSet.objectiveOrRole}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* AdSet Exact 10 Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                              <div className="p-2.5 bg-white rounded-xl border border-[#E5E5E0]">
                                <span className="text-[10px] font-bold text-[#8E8E85] block">
                                  Audience / Targeting (الجمهور والاستهداف):
                                </span>
                                <span className="font-bold text-[#2D2D2A]">
                                  {adSet.audienceTargeting || 'Broad Audience (عام)'}
                                </span>
                              </div>

                              <div className="p-2.5 bg-white rounded-xl border border-[#E5E5E0]">
                                <span className="text-[10px] font-bold text-[#8E8E85] block">
                                  Location & Demographics (الموقع والعمر والنوع):
                                </span>
                                <span className="font-bold text-[#2D2D2A]">
                                  {adSet.location || 'مصر'} • {adSet.age || '18-45'} • {adSet.gender || 'الكل'}
                                </span>
                              </div>

                              <div className="p-2.5 bg-white rounded-xl border border-[#E5E5E0]">
                                <span className="text-[10px] font-bold text-[#8E8E85] block">
                                  Placements (أماكن ظهور الإعلان):
                                </span>
                                <span className="font-bold text-[#2D2D2A]">
                                  {adSet.placements || 'Advantage+ Placements'}
                                </span>
                              </div>

                              {adSet.notes && (
                                <div className="p-2.5 bg-white rounded-xl border border-[#E5E5E0] sm:col-span-3">
                                  <span className="text-[10px] font-bold text-[#8E8E85] block">
                                    Ad Set Notes (ملاحظات واستراتيجية المجموعة):
                                  </span>
                                  <span className="font-medium text-[#2D2D2A] leading-relaxed">
                                    {adSet.notes}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Ads Cards Inside AdSet */}
                            {(adSet.ads || []).length > 0 && (
                              <div className="space-y-2 pt-2">
                                <div className="text-[11px] font-extrabold text-[#5A5A40] flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  <span>Ads (الإعلانات) — {(adSet.ads || []).length} إعلانات:</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {(adSet.ads || []).map((ad, aIdx) => (
                                    <div
                                      key={ad.id || aIdx}
                                      className={`p-3.5 rounded-2xl border text-xs space-y-2 transition ${
                                        ad.status === 'Winner'
                                          ? 'bg-amber-50/70 border-amber-300'
                                          : 'bg-white border-[#E5E5E0]'
                                      }`}
                                    >
                                      {/* Ad Header */}
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#5A5A40]/10 text-[#5A5A40]">
                                            {ad.creativeType || 'Creative'}
                                          </span>
                                          <span className="font-black text-[#2D2D2A]">{ad.name}</span>
                                        </div>
                                        <span
                                          className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                                            ad.status === 'Winner'
                                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                                              : ad.status === 'Live'
                                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                              : ad.status === 'Loser'
                                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                                              : 'bg-[#F9F8F6] text-[#2D2D2A] border-[#E5E5E0]'
                                          }`}
                                        >
                                          {ad.status || 'Ready'}
                                        </span>
                                      </div>

                                      {/* Creative Link or Description */}
                                      {ad.creative && (
                                        <div className="text-[11px] bg-[#F9F8F6] p-2 rounded-lg border border-[#E5E5E0] text-[#5A5A40] font-bold break-all">
                                          🎨 Creative: {ad.creative}
                                        </div>
                                      )}

                                      {/* Hook & Angle */}
                                      {ad.hook && (
                                        <div className="text-[11px]">
                                          <span className="font-bold text-[#8E8E85]">الهوك: </span>
                                          <span className="font-bold text-[#2D2D2A]">&ldquo;{ad.hook}&rdquo;</span>
                                        </div>
                                      )}

                                      {ad.angle && (
                                        <div className="text-[11px]">
                                          <span className="font-bold text-[#8E8E85]">الزاوية: </span>
                                          <span className="font-medium text-[#2D2D2A]">{ad.angle}</span>
                                        </div>
                                      )}

                                      {/* Headline & Primary Text */}
                                      {ad.headline && (
                                        <div className="text-[11px]">
                                          <span className="font-bold text-[#8E8E85]">العنوان: </span>
                                          <span className="font-extrabold text-[#2D2D2A]">{ad.headline}</span>
                                        </div>
                                      )}

                                      {ad.primaryText && (
                                        <div className="text-[11px] text-[#2D2D2A] bg-[#F9F8F6] p-2 rounded-lg border border-[#E5E5E0] leading-relaxed">
                                          {ad.primaryText}
                                        </div>
                                      )}

                                      {/* CTA & Destination */}
                                      <div className="flex items-center justify-between text-[10px] text-[#8E8E85] pt-1 border-t border-[#E5E5E0]/60">
                                        <span>🔘 CTA: {ad.cta || 'Shop Now'}</span>
                                        <span>🌐 الوجهة: {ad.destination || 'Website'}</span>
                                      </div>

                                      {ad.notes && (
                                        <div className="text-[10px] text-[#8E8E85] italic">
                                          📝 {ad.notes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ================= 3. RESULTS & LEARNINGS ================= */}
                  {(results || learnings) && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#F9F8F6] border border-[#E5E5E0] space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E0]">
                        <div className="text-xs font-black text-[#5A5A40] flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
                          <span>Results & Learnings (النتائج والتعلم والقرارات):</span>
                        </div>

                        {results?.performanceStatus && (
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              results.performanceStatus === 'Winner'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : results.performanceStatus === 'Loser'
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : 'bg-white text-[#2D2D2A] border-[#E5E5E0]'
                            }`}
                          >
                            حالة الأداء: {results.performanceStatus}
                          </span>
                        )}
                      </div>

                      {/* Actual Results Metrics */}
                      {results && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0]">
                            <span className="text-[10px] text-[#8E8E85] block">الإنفاق الفعلي:</span>
                            <span className="font-black text-[#2D2D2A]">{results.actualSpend || 0} ج.م</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0]">
                            <span className="text-[10px] text-[#8E8E85] block">الظهور / الوصول:</span>
                            <span className="font-bold text-[#2D2D2A]">
                              {results.impressions || 0} / {results.reach || 0}
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0]">
                            <span className="text-[10px] text-[#8E8E85] block">معدل النقر CTR:</span>
                            <span className="font-bold text-[#2D2D2A]">{results.ctr || '0%'}</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0]">
                            <span className="text-[10px] text-[#8E8E85] block">تكلفة النقرة CPC:</span>
                            <span className="font-bold text-[#2D2D2A]">{results.cpc || 0} ج.م</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0]">
                            <span className="text-[10px] text-[#8E8E85] block">تكلفة ألف ظهور CPM:</span>
                            <span className="font-bold text-[#2D2D2A]">{results.cpm || 0} ج.م</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0]">
                            <span className="text-[10px] text-[#8E8E85] block">السلات ATC:</span>
                            <span className="font-bold text-[#2D2D2A]">{results.atc || 0}</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0]">
                            <span className="text-[10px] text-[#8E8E85] block">الطلبات / التحويلات:</span>
                            <span className="font-black text-[#2D2D2A]">{results.purchasesOrLeads || 0}</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0]">
                            <span className="text-[10px] text-[#8E8E85] block">تكلفة الطلب CPA:</span>
                            <span className="font-black text-[#5A5A40]">{results.cpaOrCac || 'N/A'}</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0]">
                            <span className="text-[10px] text-[#8E8E85] block">معدل التحويل CVR:</span>
                            <span className="font-bold text-[#2D2D2A]">{results.cvr || '0%'}</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-[#E5E5E0] col-span-2 sm:col-span-3">
                            <span className="text-[10px] text-[#5A5A40] font-bold block">العائد على الإعلانات ROAS:</span>
                            <span className="text-sm font-black text-[#5A5A40]">{results.roas || 'N/A'}</span>
                          </div>
                        </div>
                      )}

                      {/* Learnings Breakdown */}
                      {learnings && (
                        <div className="space-y-2 pt-2 border-t border-[#E5E5E0] text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {learnings.whatWorked && (
                              <div className="p-3 bg-white rounded-xl border border-[#E5E5E0] space-y-1">
                                <span className="font-bold text-emerald-900 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>إيه اللي اشتغل؟ (What worked):</span>
                                </span>
                                <p className="text-[#2D2D2A]">{learnings.whatWorked}</p>
                              </div>
                            )}

                            {learnings.whatDidntWork && (
                              <div className="p-3 bg-white rounded-xl border border-[#E5E5E0] space-y-1">
                                <span className="font-bold text-rose-900 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>إيه اللي ما اشتغلش؟ (What didn't work):</span>
                                </span>
                                <p className="text-[#2D2D2A]">{learnings.whatDidntWork}</p>
                              </div>
                            )}

                            {learnings.bestCreative && (
                              <div className="p-2.5 bg-white rounded-xl border border-[#E5E5E0] text-[11px]">
                                <span className="font-bold text-[#8E8E85]">أفضل Creative: </span>
                                <span className="font-bold text-[#2D2D2A]">{learnings.bestCreative}</span>
                              </div>
                            )}

                            {learnings.bestAngle && (
                              <div className="p-2.5 bg-white rounded-xl border border-[#E5E5E0] text-[11px]">
                                <span className="font-bold text-[#8E8E85]">أفضل Angle: </span>
                                <span className="font-bold text-[#2D2D2A]">{learnings.bestAngle}</span>
                              </div>
                            )}

                            {learnings.bestAudience && (
                              <div className="p-2.5 bg-white rounded-xl border border-[#E5E5E0] text-[11px]">
                                <span className="font-bold text-[#8E8E85]">أفضل Audience: </span>
                                <span className="font-bold text-[#2D2D2A]">{learnings.bestAudience}</span>
                              </div>
                            )}

                            {learnings.insightsNotes && (
                              <div className="p-2.5 bg-white rounded-xl border border-[#E5E5E0] text-[11px]">
                                <span className="font-bold text-[#8E8E85]">ملاحظات واستنتاجات: </span>
                                <span className="font-bold text-[#2D2D2A]">{learnings.insightsNotes}</span>
                              </div>
                            )}
                          </div>

                          {/* Decision & Next Step */}
                          {(learnings.decision || learnings.nextStep) && (
                            <div className="p-3 bg-white rounded-xl border border-[#E5E5E0] space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-[#2D2D2A]">القرار (Decision):</span>
                                <span className="px-2.5 py-0.5 rounded-md bg-[#5A5A40] text-white font-bold text-xs">
                                  {learnings.decision || 'Scale'}
                                </span>
                              </div>
                              {learnings.nextStep && (
                                <div>
                                  <span className="font-bold text-[#8E8E85] block text-[11px]">الخطوة التالية (Next Step):</span>
                                  <p className="font-bold text-[#2D2D2A] text-xs mt-0.5">{learnings.nextStep}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* VIEW MODAL FOOTER */}
        <div data-pdf-hide className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-[#E5E5E0] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-[11px] sm:text-xs text-[#8E8E85]">
            تاريخ التسجيل: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('ar-EG') : startDate}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 bg-white hover:bg-[#F5F5F0] disabled:opacity-60 disabled:cursor-wait border border-[#E5E5E0] text-[#2D2D2A] rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isExportingPdf ? <Loader2 className="w-4 h-4 text-[#5A5A40] animate-spin" /> : <Download className="w-4 h-4 text-[#5A5A40]" />}
              <span>{isExportingPdf ? 'جاري التحميل...' : 'تحميل PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none min-h-[44px] px-5 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

