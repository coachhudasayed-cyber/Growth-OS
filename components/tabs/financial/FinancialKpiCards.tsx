import React from 'react';
import { DollarSign, Wallet, TrendingUp, Clock, Megaphone, AlertTriangle } from 'lucide-react';
import { UserRole } from '../../../types';

interface FinancialKpiCardsProps {
  totalAdSpend: number;
  adSpendCampaignsCount: number;
  adSpendFromPayments: number;
  adSpendFromBudgets: number;
  hasActualSpendRecords: boolean;
  totalFeesPaid: number;
  totalFeesPending: number;
  totalFeesOverdue: number;
  feesPaidCount: number;
  feesPendingCount: number;
  feesOverdueCount: number;
  feesPartialCount?: number;
  totalCombinedVolume: number;
  periodLabel: string;
  userRole?: UserRole;
  activeCampaignsCount?: number;
  urgentCampaignsCount?: number;
}

export const FinancialKpiCards: React.FC<FinancialKpiCardsProps> = ({
  totalAdSpend,
  adSpendCampaignsCount,
  adSpendFromPayments,
  adSpendFromBudgets,
  hasActualSpendRecords,
  totalFeesPaid,
  totalFeesPending,
  totalFeesOverdue,
  feesPaidCount,
  feesPendingCount,
  feesOverdueCount,
  feesPartialCount = 0,
  totalCombinedVolume,
  periodLabel,
  userRole,
  activeCampaignsCount = 0,
  urgentCampaignsCount = 0
}) => {
  const isEmployee = userRole === 'employee';
  const hasActualSpend = hasActualSpendRecords;
  const spendLabel = hasActualSpend ? 'Actual Ad Spend' : 'Budget Funding';
  const spendDescription = hasActualSpend
    ? `صرف فعلي مسجل${adSpendFromBudgets > 0 ? ` • شحنات ${adSpendFromBudgets.toLocaleString()} EGP` : ''}`
    : 'إجمالي شحنات الميزانية المسجلة (ليس صرف المنصة الفعلي)';

  if (isEmployee) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* 1. Total Ad Spend */}
        <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3 sm:p-4 shadow-2xs hover:border-[#5A5A40]/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-[#5A5A40] truncate">
              💰 {spendLabel}
            </span>
            <span className="p-1 sm:p-1.5 bg-blue-50 text-blue-700 rounded-lg sm:rounded-xl shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-black text-[#2D2D2A] tracking-tight">
              {totalAdSpend.toLocaleString()} <span className="text-[10px] sm:text-xs font-bold text-[#8E8E85]">EGP</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#8E8E85] font-medium mt-0.5 line-clamp-1">
              {spendDescription}
            </p>
          </div>
        </div>

        {/* 2. Total Campaigns in Period */}
        <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3 sm:p-4 shadow-2xs hover:border-[#5A5A40]/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-[#2D2D2A] truncate">
              📢 الحملات الإعلانية
            </span>
            <span className="p-1 sm:p-1.5 bg-purple-50 text-purple-700 rounded-lg sm:rounded-xl shrink-0">
              <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-black text-[#2D2D2A] tracking-tight">
              {adSpendCampaignsCount} <span className="text-[10px] sm:text-xs font-bold text-[#8E8E85]">حملات</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#8E8E85] font-medium mt-0.5 line-clamp-1">
              الحملات المسجلة في {periodLabel}
            </p>
          </div>
        </div>

        {/* 3. Active Campaigns */}
        <div className="bg-[#F9F8F6] border border-emerald-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs hover:border-emerald-400 transition flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-800 truncate">
              ⚡ الحملات النشطة
            </span>
            <span className="p-1 sm:p-1.5 bg-emerald-50 text-emerald-700 rounded-lg sm:rounded-xl shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-black text-emerald-950 tracking-tight">
              {activeCampaignsCount} <span className="text-[10px] sm:text-xs font-bold text-emerald-700">نشطة</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium mt-0.5 line-clamp-1">
              حملات قيد التشغيل حالياً
            </p>
          </div>
        </div>

        {/* 4. Urgent / Needs Recharge */}
        <div className="bg-[#F9F8F6] border border-amber-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs hover:border-amber-400 transition flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-amber-800 truncate">
              ⚠️ تنبيهات الشحن
            </span>
            <span className="p-1 sm:p-1.5 bg-amber-50 text-amber-700 rounded-lg sm:rounded-xl shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-black text-amber-950 tracking-tight">
              {urgentCampaignsCount} <span className="text-[10px] sm:text-xs font-bold text-amber-700">تنبيه</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-amber-700 font-medium mt-0.5 line-clamp-1">
              متبقي يومين أو بحاجة لشحن
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      {/* 1. Ad Spend */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3 sm:p-4 shadow-2xs hover:border-[#5A5A40]/40 transition flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[11px] sm:text-xs font-bold text-[#5A5A40] truncate">
            💰 {spendLabel}
          </span>
          <span className="p-1 sm:p-1.5 bg-blue-50 text-blue-700 rounded-lg sm:rounded-xl shrink-0">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div className="mt-2">
          <div className="text-lg sm:text-2xl font-black text-[#2D2D2A] tracking-tight">
            {totalAdSpend.toLocaleString()} <span className="text-[10px] sm:text-xs font-bold text-[#8E8E85]">EGP</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#8E8E85] font-medium mt-0.5 line-clamp-1">
            {spendDescription} ({adSpendCampaignsCount} حملات)
          </p>
        </div>
      </div>

      {/* 2. Media Buying Fees */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3 sm:p-4 shadow-2xs hover:border-emerald-300 transition flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[11px] sm:text-xs font-bold text-emerald-800 truncate">
            👩🏻‍💻 Fees
          </span>
          <span className="p-1 sm:p-1.5 bg-emerald-50 text-emerald-700 rounded-lg sm:rounded-xl shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div className="mt-2">
          <div className="text-lg sm:text-2xl font-black text-emerald-900 tracking-tight">
            {totalFeesPaid.toLocaleString()} <span className="text-[10px] sm:text-xs font-bold text-[#8E8E85]">EGP</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-700/80 font-medium mt-0.5 line-clamp-1">
            أتعاب مستلمة ({feesPaidCount + feesPartialCount} دفعة)
          </p>
        </div>
      </div>

      {/* 3. Monthly Summary */}
      <div className="bg-[#F9F8F6] border border-[#5A5A40]/30 rounded-2xl p-3 sm:p-4 shadow-2xs hover:border-[#5A5A40] transition flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[11px] sm:text-xs font-bold text-[#2D2D2A] truncate">
            📊 Summary
          </span>
          <span className="p-1 sm:p-1.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded-lg sm:rounded-xl shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div className="mt-2">
          <div className="text-lg sm:text-2xl font-black text-[#2D2D2A] tracking-tight">
            {totalCombinedVolume.toLocaleString()} <span className="text-[10px] sm:text-xs font-bold text-[#8E8E85]">EGP</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#8E8E85] font-medium mt-0.5 line-clamp-1">
            {hasActualSpend ? 'إجمالي الصرف الفعلي + الأتعاب' : 'إجمالي الشحنات + الأتعاب (تقديري)'}
          </p>
        </div>
      </div>

      {/* 4. Payment Status */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl p-3 sm:p-4 shadow-2xs hover:border-amber-300 transition flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[11px] sm:text-xs font-bold text-[#2D2D2A] truncate">
            ⏳ Status
          </span>
          <span className="p-1 sm:p-1.5 bg-amber-50 text-amber-700 rounded-lg sm:rounded-xl shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-1">
          <div className="bg-emerald-50 border border-emerald-200/60 rounded-lg sm:rounded-xl p-1 text-center flex-1 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 block truncate">مدفوع</span>
            <span className="text-xs sm:text-sm font-black text-emerald-950">{feesPaidCount}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200/60 rounded-lg sm:rounded-xl p-1 text-center flex-1 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 block truncate">متبقي</span>
            <span className="text-xs sm:text-sm font-black text-amber-950">{feesPendingCount}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200/60 rounded-lg sm:rounded-xl p-1 text-center flex-1 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-blue-700 block truncate">جزئي</span>
            <span className="text-xs sm:text-sm font-black text-blue-950">{feesPartialCount}</span>
          </div>
        </div>
        <p className="text-[9px] sm:text-[10px] text-[#8E8E85] font-bold mt-1.5 text-center">
          متبقي {totalFeesPending.toLocaleString()} EGP
          {totalFeesOverdue > 0 ? ` • متأخر ${totalFeesOverdue.toLocaleString()} EGP` : ''}
        </p>
      </div>
    </div>
  );
};
