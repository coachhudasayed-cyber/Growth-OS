import React, { useState } from 'react';
import {
  X,
  Download,
  Loader2,
  Calendar,
  Layers,
  BarChart3,
  TrendingUp,
  Megaphone,
  Sparkles,
  PackageCheck,
  MessageSquare,
  Lightbulb,
  Compass,
  CheckCircle,
  Target,
  Clock,
  FileText,
  Building2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { QuarterlyReport } from '../../types';
import { exportQuarterlyReportToPDF } from '../../utils/pdfExporter';

interface QuarterlyReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: QuarterlyReport | null;
  brandName?: string;
}

export const QuarterlyReportViewModal: React.FC<QuarterlyReportViewModalProps> = ({
  isOpen,
  onClose,
  report,
  brandName
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !report) return null;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportQuarterlyReportToPDF(report, brandName);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Extract any custom questions that are not standard keys
  const customQuestions =
    report.questionsList && Array.isArray(report.questionsList)
      ? report.questionsList.filter((q) => !q.standardKey && String(q.answer).trim() !== '')
      : [];

  return (
    <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#E5E5E0] rounded-3xl w-full max-w-5xl max-h-[94vh] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 my-auto">
        {/* Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-[#E5E5E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 bg-[#F9F8F6] rounded-t-3xl">
          <div className="w-full sm:w-auto flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#5A5A40] text-white rounded-2xl shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 rounded-full text-[10px] font-extrabold">
                    تقرير ربع سنوي استراتيجي | Quarterly Review
                  </span>
                  <span className="text-xs font-bold text-[#8E8E85]">
                    {report.quarter}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#2D2D2A] mt-0.5">
                  {report.title || brandName || 'البراند'}
                </h2>
                {report.title && brandName && (
                  <p className="text-xs text-[#8E8E85] font-bold">{brandName}</p>
                )}
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#E5E5E0] pt-2 sm:pt-0">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              title="تصدير كـ PDF"
              aria-label="تصدير كـ PDF"
              className="p-2 sm:p-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs flex items-center justify-center transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Download className="w-4 h-4" />}
            </button>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-2 text-[#8E8E85] hover:text-[#2D2D2A] hover:bg-[#F5F5F0] rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. ملخص الأداء | Quarterly Performance */}
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E5E5E0]">
              <BarChart3 className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                1. ملخص الأداء | Quarterly Performance
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] text-[#8E8E85] font-bold block mb-1">
                  إجمالي الإنفاق
                </span>
                <span className="text-base font-black text-[#2D2D2A]">
                  {(report.totalSpent || 0).toLocaleString()} EGP
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] text-[#8E8E85] font-bold block mb-1">
                  إجمالي الطلبات
                </span>
                <span className="text-base font-black text-[#5A5A40]">
                  {(report.totalOrders || 0).toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] text-[#8E8E85] font-bold block mb-1">
                  إجمالي المبيعات
                </span>
                <span className="text-base font-black text-emerald-800">
                  {(report.totalRevenue || 0).toLocaleString()} EGP
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] text-[#8E8E85] font-bold block mb-1">
                  العائد (ROAS)
                </span>
                <span className="text-base font-black text-[#C8662B]">
                  {report.roas || 0}x
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] text-[#8E8E85] font-bold block mb-1">
                  متوسط CPA
                </span>
                <span className="text-sm font-bold text-[#2D2D2A]">
                  {report.cpa || '-'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] text-[#8E8E85] font-bold block mb-1">
                  متوسط AOV
                </span>
                <span className="text-sm font-bold text-[#2D2D2A]">
                  {report.aov || '-'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E5E5E0] col-span-2">
                <span className="text-[11px] text-[#8E8E85] font-bold block mb-1">
                  معدل التحويل (CR)
                </span>
                <span className="text-sm font-bold text-blue-800">
                  {report.conversionRate || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. مقارنة بالربع السابق | Quarter-over-Quarter */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E0]">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                2. مقارنة بالربع السابق | Quarter-over-Quarter (QoQ)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-2.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[10px] text-[#8E8E85] block font-bold">تغير الإنفاق (Spend)</span>
                <span className="text-xs font-black text-[#2D2D2A]">{report.spendChange || '-'}</span>
              </div>
              <div className="p-2.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[10px] text-[#8E8E85] block font-bold">تغير الطلبات (Orders)</span>
                <span className="text-xs font-black text-emerald-800">{report.ordersChange || '-'}</span>
              </div>
              <div className="p-2.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[10px] text-[#8E8E85] block font-bold">تغير المبيعات (Revenue)</span>
                <span className="text-xs font-black text-emerald-800">{report.revenueChange || '-'}</span>
              </div>
              <div className="p-2.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[10px] text-[#8E8E85] block font-bold">تغير ROAS</span>
                <span className="text-xs font-black text-[#C8662B]">{report.roasChange || '-'}</span>
              </div>
              <div className="p-2.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[10px] text-[#8E8E85] block font-bold">تغير CPA</span>
                <span className="text-xs font-black text-blue-800">{report.cpaChange || '-'}</span>
              </div>
              <div className="p-2.5 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[10px] text-[#8E8E85] block font-bold">تغير AOV</span>
                <span className="text-xs font-black text-purple-800">{report.aovChange || '-'}</span>
              </div>
            </div>
          </div>

          {/* 3. أداء الحملات | Campaign Performance */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E0]">
              <Megaphone className="w-4 h-4 text-emerald-700" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                3. أداء الحملات | Campaign Performance
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-black text-emerald-900 block mb-1">
                  ⭐ أفضل الحملات خلال الربع (Top Performing)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.topPerformingCampaigns || 'لم يتم تسجيل بيانات'}
                </p>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                <span className="text-[11px] font-black text-rose-900 block mb-1">
                  ⚠️ أضعف الحملات (Weakest)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.weakestCampaigns || 'لم يتم تسجيل بيانات'}
                </p>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                <span className="text-[11px] font-black text-blue-900 block mb-1">
                  🚀 الحملات التي حققت أكبر نمو (Highest Growth)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.highestGrowthCampaigns || 'لم يتم تسجيل بيانات'}
                </p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                <span className="text-[11px] font-black text-amber-900 block mb-1">
                  🛑 الحملات التي تم إيقافها وأسباب الإيقاف (Paused)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.pausedCampaignsReasons || 'لم يتم تسجيل بيانات'}
                </p>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 sm:col-span-2">
                <span className="text-[11px] font-black text-purple-900 block mb-1">
                  💡 أهم نتائج واختبارات الحملات (Key Campaign Learnings)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.keyCampaignLearnings || 'لم يتم تسجيل بيانات'}
                </p>
              </div>
            </div>
          </div>

          {/* 4. أداء الإعلانات والمحتوى | Creative Performance */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E0]">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                4. أداء الإعلانات والمحتوى | Creative Performance
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-[#5A5A40] block mb-1">
                  أفضل الإعلانات (Top Creatives)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.topPerformingCreatives || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-[#5A5A40] block mb-1">
                  أفضل الـ Hooks
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.topPerformingHooks || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-[#5A5A40] block mb-1">
                  أفضل الزوايا التسويقية (Marketing Angles)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.bestMarketingAngles || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-[#5A5A40] block mb-1">
                  أفضل أنواع وفورمات المحتوى (Content Formats)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.bestContentFormats || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-rose-800 block mb-1">
                  إعلانات تحتاج لتحديث (Creatives To Refresh)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.creativesNeedRefresh || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-purple-800 block mb-1">
                  أهم الـ Creative Learnings
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.keyCreativeLearnings || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 5. أداء المنتجات والعروض | Product & Offer Performance */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E0]">
              <PackageCheck className="w-4 h-4 text-orange-700" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                5. أداء المنتجات والعروض | Product & Offer Performance
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                  أفضل المنتجات (Top Products)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.topPerformingProducts || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-rose-800 block mb-1">
                  أضعف المنتجات (Low Performing)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.lowPerformingProducts || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-blue-800 block mb-1">
                  منتجات ذات فرصة نمو (Opportunities)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.productGrowthOpportunities || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-amber-800 block mb-1">
                  أداء العروض (Offer Performance)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.offerPerformance || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0] sm:col-span-2">
                <span className="text-[11px] font-bold text-purple-800 block mb-1">
                  فرص الـ Upsell والـ Cross-Sell
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.upsellCrossSellOpportunities || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 6. سلوك العملاء والمبيعات | Customer & Sales Insights */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E0]">
              <MessageSquare className="w-4 h-4 text-sky-700" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                6. سلوك العملاء والمبيعات | Customer & Sales Insights
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-rose-800 block mb-1">
                  أهم اعتراضات العملاء (Top Objections)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.topCustomerObjections || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                  أهم ملاحظات المبيعات (Sales Insights)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.keySalesInsights || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-amber-800 block mb-1">
                  مشاكل التسعير / الشحن / المخزون
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.pricingShippingStockIssues || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-blue-800 block mb-1">
                  تغيرات سلوك العملاء (Behavior Changes)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.customerBehaviorChanges || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 7. أهم النتائج والتعلم | Key Learnings */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E0]">
              <Lightbulb className="w-4 h-4 text-amber-700" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                7. أهم النتائج والتعلم | Key Learnings
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                  🏆 أكبر نجاح تحقق (Biggest Win)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.biggestWin || '-'}
                </p>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                <span className="text-[11px] font-bold text-rose-900 block mb-1">
                  ⚡ أكبر تحدي واجهناه (Biggest Challenge)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.biggestChallenge || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-[#5A5A40] block mb-1">
                  أهم ما تعلمناه (Key Learnings)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.keyLearnings || '-'}
                </p>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                <span className="text-[11px] font-bold text-purple-900 block mb-1">
                  🧠 أهم استنتاج استراتيجي (Strategic Insight)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.keyStrategicInsight || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 8. فرص النمو | Growth Opportunities */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E0]">
              <Compass className="w-4 h-4 text-teal-700" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                8. فرص النمو | Growth Opportunities
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-teal-800 block mb-1">
                  أكبر فرصة للنمو (Biggest Growth Opportunity)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.biggestGrowthOpportunity || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-blue-800 block mb-1">
                  فرصة نمو المبيعات (Sales Growth)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.salesGrowthOpportunity || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-amber-800 block mb-1">
                  فرص المنتجات والعروض (Product / Offer)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.productOfferOpportunities || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-purple-800 block mb-1">
                  فرص التوسع الإعلاني (Scaling)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.scalingOpportunities || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 9. التقييم الاستراتيجي | Strategic Review */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E0]">
              <CheckCircle className="w-4 h-4 text-blue-700" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                9. التقييم الاستراتيجي | Strategic Review
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-blue-900 block mb-1">
                  ماذا تغير في البراند؟ (What Changed)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.whatChanged || '-'}
                </p>
              </div>

              <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                  هل النمو مستدام؟ (Is Growth Sustainable)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.isGrowthSustainable || '-'}
                </p>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 sm:col-span-2">
                <span className="text-[11px] font-bold text-rose-900 block mb-1">
                  أهم معوقات النمو (Key Growth Barriers)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.keyGrowthBarriers || '-'}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                  ما الذي يجب الاستمرار فيه؟ (What To Continue)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.whatShouldContinue || '-'}
                </p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900 block mb-1">
                  ما الذي يجب تغييره؟ (What To Change)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.whatShouldChange || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 10. خطة الربع القادم | Next Quarter Strategy */}
          <div className="bg-[#C8662B]/5 border border-[#C8662B]/20 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#C8662B]/20">
              <Target className="w-4 h-4 text-[#C8662B]" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                10. خطة الربع القادم | Next Quarter Strategy
              </h3>
            </div>

            {report.mainGoal && (
              <div className="bg-white p-3.5 rounded-xl border border-[#C8662B]/30 mb-3">
                <span className="text-[11px] font-black text-[#C8662B] block mb-1">
                  🎯 الهدف الرئيسي (Main Goal)
                </span>
                <p className="text-xs font-bold text-[#2D2D2A] leading-relaxed">
                  {report.mainGoal}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-[#5A5A40] block mb-1">
                  مستهدف المبيعات والطلبات (Revenue & Orders)
                </span>
                <p className="text-xs text-[#2D2D2A] leading-relaxed">{report.revenueOrderTargets || '-'}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-[#5A5A40] block mb-1">
                  مستهدف CPA و ROAS
                </span>
                <p className="text-xs text-[#2D2D2A] leading-relaxed">{report.targetCpaRoas || '-'}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-blue-800 block mb-1">
                  استراتيجية الإعلانات (Ads Strategy)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.advertisingStrategy || '-'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-purple-800 block mb-1">
                  استراتيجية المحتوى (Content Strategy)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.contentStrategy || '-'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-orange-800 block mb-1">
                  استراتيجية المنتجات والعروض
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.productOfferStrategy || '-'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                  اختبارات وتجارب جديدة (New Tests)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.newTests || '-'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E5E5E0]">
                <span className="text-[11px] font-bold text-blue-800 block mb-1">
                  فرص التوسع (Scaling)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.nextQuarterScalingOpportunities || '-'}
                </p>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                <span className="text-[11px] font-bold text-purple-900 block mb-1">
                  المطلوب من العميل (Client Action Required)
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.clientActionRequired || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 11. خطة الـ90 يوم | 90-Day Growth Plan */}
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E0]">
              <Clock className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-extrabold text-[#2D2D2A] text-sm">
                11. خطة الـ90 يوم | 90-Day Growth Plan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-black text-emerald-900 block mb-1">
                  🗓️ {report.month1Name ? `خطة شهر ${report.month1Name} (الشهر الأول)` : 'الشهر الأول | Month 1'}
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.month1Plan || 'لم تسجل خطة للشهر الأول'}
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200">
                <span className="text-[11px] font-black text-blue-900 block mb-1">
                  🗓️ {report.month2Name ? `خطة شهر ${report.month2Name} (الشهر الثاني)` : 'الشهر الثاني | Month 2'}
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.month2Plan || 'لم تسجل خطة للشهر الثاني'}
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-200">
                <span className="text-[11px] font-black text-purple-900 block mb-1">
                  🗓️ {report.month3Name ? `خطة شهر ${report.month3Name} (الشهر الثالث)` : 'الشهر الثالث | Month 3'}
                </span>
                <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                  {report.month3Plan || 'لم تسجل خطة للشهر الثالث'}
                </p>
              </div>
            </div>
          </div>

          {/* 12. ملخص النمو | Quarterly Growth Summary */}
          {report.quarterlyGrowthSummary && (
            <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
                <FileText className="w-4 h-4 text-purple-700" />
                <h3 className="font-black text-purple-950 text-sm">
                  12. ملخص النمو | Quarterly Growth Summary
                </h3>
              </div>
              <p className="text-xs text-[#2D2D2A] font-medium leading-relaxed whitespace-pre-line pt-1">
                {report.quarterlyGrowthSummary}
              </p>
            </div>
          )}

          {/* 13. أسئلة مخصصة إضافية إن وجدت | Custom Additional Questions */}
          {customQuestions.length > 0 && (
            <div className="bg-white border border-[#E5E5E0] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E5E5E0]">
                <Layers className="w-4 h-4 text-[#5A5A40]" />
                <h3 className="font-black text-[#2D2D2A] text-sm">
                  أسئلة واستنتاجات إضافية مخصصة
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customQuestions.map((q) => (
                  <div key={q.id} className="p-3 bg-[#F9F8F6] rounded-xl border border-[#E5E5E0]">
                    <span className="text-[11px] font-bold text-[#5A5A40] block mb-1">
                      {q.question}
                    </span>
                    <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                      {String(q.answer)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#E5E5E0] bg-[#F9F8F6] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-extrabold rounded-xl text-xs hover:bg-[#F5F5F0] transition cursor-pointer text-center"
          >
            إغلاق
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Download className="w-4 h-4" />}
            <span>{isExporting ? 'جاري التحميل...' : 'تحميل التقرير كـ PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
