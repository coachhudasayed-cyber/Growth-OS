import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Clock,
  BatteryCharging,
  Edit2,
  CheckCircle2,
  X,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  History,
  Eye,
  Wallet,
  CalendarDays,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { BudgetAlarm, UserRole, PaymentRecord, PaymentStatus } from '../../types';
import { calculateBudgetEndDate, getBudgetDaysRemaining, isBudgetRechargeUrgent } from '../../lib/budgetLogic';
import { formatLocalDate } from '../../lib/dateUtils';
import { FinancialPeriodFilter, MonthOption } from './financial/FinancialPeriodFilter';
import { FinancialKpiCards } from './financial/FinancialKpiCards';
import { WeeklyPaymentsSection } from './financial/WeeklyPaymentsSection';

interface AdsBudgetTabProps {
  budgetAlarms: BudgetAlarm[];
  clientId: string;
  brandName: string;
  userRole: UserRole;
  payments?: PaymentRecord[];
  onAddBudgetAlarm: (
    clientId: string,
    amount: number,
    startDate: string,
    expectedDays: number,
    platform?: string,
    notes?: string,
    campaignName?: string,
    status?: 'active' | 'paused' | 'completed' | 'needs_recharge'
  ) => void;
  onUpdateBudgetAlarm?: (id: string, fields: Partial<BudgetAlarm>) => void;
  onRechargeBudgetAlarm?: (
    id: string,
    newAmount: number,
    newExpectedDays: number,
    newStartDate?: string,
    rechargeNotes?: string
  ) => void;
  onDeleteBudgetAlarm: (id: string) => void;
  onAddPayment?: (paymentData: Omit<PaymentRecord, 'id'>) => void;
  onUpdatePayment?: (id: string, paymentData: Partial<PaymentRecord>) => void;
  onUpdatePaymentStatus?: (id: string, status: PaymentStatus) => void;
  onDeletePayment?: (id: string) => void;
}

export const AdsBudgetTab: React.FC<AdsBudgetTabProps> = ({
  budgetAlarms,
  clientId,
  brandName,
  userRole,
  payments = [],
  onAddBudgetAlarm,
  onUpdateBudgetAlarm,
  onRechargeBudgetAlarm,
  onDeleteBudgetAlarm,
  onAddPayment,
  onUpdatePayment,
  onUpdatePaymentStatus,
  onDeletePayment
}) => {
  const clientBudgets = budgetAlarms.filter((b) => b.clientId === clientId);

  const todayStr = formatLocalDate();

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetAlarm | null>(null);
  const [deletingBudgetInfo, setDeletingBudgetInfo] = useState<{ id: string; name?: string } | null>(null);
  const [viewingDetailsBudget, setViewingDetailsBudget] = useState<BudgetAlarm | null>(null);

  // Recharge Modal State
  const [rechargingBudget, setRechargingBudget] = useState<BudgetAlarm | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState<number | ''>('');
  const [rechargeDays, setRechargeDays] = useState<number | ''>('');
  const [rechargeStartDate, setRechargeStartDate] = useState(todayStr);
  const [rechargeNotes, setRechargeNotes] = useState('');

  // Form Fields State
  const [campaignName, setCampaignName] = useState('');
  const [platform, setPlatform] = useState('Meta Ads (FB & Insta)');
  const [amount, setAmount] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(todayStr);
  const [expectedDays, setExpectedDays] = useState<number | ''>(7);
  const [status, setStatus] = useState<'active' | 'paused' | 'completed' | 'needs_recharge'>('active');
  const [notes, setNotes] = useState('');

  // Quick Toggle Campaign Status (Active / Stopped)
  const handleToggleStatus = (budget: BudgetAlarm) => {
    if (userRole === 'client') return;
    if (onUpdateBudgetAlarm) {
      if (budget.status === 'paused') {
        onUpdateBudgetAlarm(budget.id, { status: 'active' });
      } else {
        onUpdateBudgetAlarm(budget.id, { status: 'paused' });
      }
    }
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    if (userRole === 'client') return;
    setEditingBudget(null);
    setCampaignName('');
    setPlatform('Meta Ads (FB & Insta)');
    setAmount('');
    setStartDate(todayStr);
    setExpectedDays(7);
    setStatus('active');
    setNotes('');
    setShowFormModal(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (budget: BudgetAlarm) => {
    if (userRole === 'client') return;
    setEditingBudget(budget);
    setCampaignName(budget.campaignName || '');
    setPlatform(budget.platform || 'Meta Ads (FB & Insta)');
    setAmount(budget.amount || '');
    setStartDate(budget.startDate || todayStr);
    setExpectedDays(budget.expectedDays || 7);
    setStatus(budget.status || 'active');
    setNotes(budget.notes || '');
    setShowFormModal(true);
  };

  // Open Modal for Recharge
  const handleOpenRecharge = (budget: BudgetAlarm) => {
    if (userRole === 'client') return;
    setRechargingBudget(budget);
    setRechargeAmount(budget.amount);
    setRechargeDays(budget.expectedDays);
    setRechargeStartDate(todayStr);
    setRechargeNotes('');
  };

  // Submit Add / Edit Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedAmount = Number(amount);
    const normalizedDays = Number(expectedDays);
    if (!startDate || !Number.isFinite(normalizedAmount) || normalizedAmount <= 0
      || !Number.isInteger(normalizedDays) || normalizedDays < 1) return;

    if (editingBudget && onUpdateBudgetAlarm) {
      onUpdateBudgetAlarm(editingBudget.id, {
        campaignName: campaignName.trim() || 'حملة إعلانية',
        platform,
        amount: normalizedAmount,
        startDate,
        expectedDays: normalizedDays,
        status,
        notes: notes.trim()
      });
    } else {
      onAddBudgetAlarm(
        clientId,
        normalizedAmount,
        startDate,
        normalizedDays,
        platform,
        notes.trim(),
        campaignName.trim() || 'حملة إعلانية جديدة',
        status
      );
    }

    setShowFormModal(false);
    setEditingBudget(null);
  };

  // Submit Recharge Form
  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedAmount = Number(rechargeAmount);
    const normalizedDays = Number(rechargeDays);
    if (!rechargingBudget || !rechargeStartDate || !Number.isFinite(normalizedAmount)
      || normalizedAmount <= 0 || !Number.isInteger(normalizedDays) || normalizedDays < 1) return;

    if (onRechargeBudgetAlarm) {
      onRechargeBudgetAlarm(
        rechargingBudget.id,
        normalizedAmount,
        normalizedDays,
        rechargeStartDate,
        rechargeNotes.trim()
      );
    } else if (onUpdateBudgetAlarm) {
      // Fallback
      const newEndDate = calculateBudgetEndDate(rechargeStartDate, normalizedDays);
      const oldNotes = rechargingBudget.notes || '';
      const addedNote = rechargeNotes ? `\n[إعادة شحن ${todayStr}]: ${rechargeNotes}` : '';
      onUpdateBudgetAlarm(rechargingBudget.id, {
        amount: normalizedAmount,
        expectedDays: normalizedDays,
        startDate: rechargeStartDate,
        endDate: newEndDate,
        status: 'active',
        notes: oldNotes + addedNote,
        rechargesCount: (rechargingBudget.rechargesCount || 0) + 1,
        lastRechargedAt: todayStr
      });
    }

    setRechargingBudget(null);
  };

  // Delete Budget
  const handleDelete = (id: string, name?: string) => {
    if (userRole === 'client') return;
    setDeletingBudgetInfo({ id, name });
  };

  const confirmDeleteBudget = () => {
    if (userRole === 'client') return;
    if (deletingBudgetInfo) {
      onDeleteBudgetAlarm(deletingBudgetInfo.id);
      setDeletingBudgetInfo(null);
    }
  };

  // --- FINANCIAL TRACKING LOGIC & CALCULATIONS ---
  // Payments for this client
  const clientPayments = useMemo(() => {
    return (payments || []).filter((p) => p.clientId === clientId);
  }, [payments, clientId]);

  // Available months calculation
  const availableMonths: MonthOption[] = useMemo(() => {
    const monthSet = new Set<string>();
    const currentM = todayStr.slice(0, 7);
    monthSet.add(currentM);

    clientPayments.forEach((p) => {
      if (p.date) monthSet.add(p.date.slice(0, 7));
    });
    clientBudgets.forEach((b) => {
      if (b.startDate) monthSet.add(b.startDate.slice(0, 7));
      if (b.lastRechargedAt) monthSet.add(b.lastRechargedAt.slice(0, 7));
      b.rechargeHistory?.forEach((h) => {
        if (h.date) monthSet.add(h.date.slice(0, 7));
      });
    });

    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((m) => {
        const [year, month] = m.split('-');
        const monthIndex = parseInt(month, 10) - 1;
        const label = `${arabicMonths[monthIndex] || month} ${year}`;
        return { value: m, label };
      });
  }, [clientPayments, clientBudgets, todayStr]);

  // Filter state
  const [filterMode, setFilterMode] = useState<'all' | 'month' | 'custom'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0]?.value || todayStr.slice(0, 7)
  );
  const isEmployee = userRole === 'employee';

  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Sub-view tab state (Default to 'ad_spend' for employee, 'fees' for admin/client)
  const [activeSubView, setActiveSubView] = useState<'fees' | 'ad_spend'>(() =>
    userRole === 'employee' ? 'ad_spend' : 'fees'
  );

  // Filter period helper
  const isDateInPeriod = (dateStr?: string) => {
    if (!dateStr) return false;
    if (filterMode === 'all') return true;
    if (filterMode === 'month') return dateStr.startsWith(selectedMonth);
    if (filterMode === 'custom') {
      const isAfterStart = !customStartDate || dateStr >= customStartDate;
      const isBeforeEnd = !customEndDate || dateStr <= customEndDate;
      return isAfterStart && isBeforeEnd;
    }
    return true;
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return clientPayments.filter((p) => isDateInPeriod(p.date));
  }, [clientPayments, filterMode, selectedMonth, customStartDate, customEndDate]);

  // Reset filter
  const handleResetFilter = () => {
    setFilterMode('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // 1. Ad Spend
  let adSpendFromBudgets = 0;
  let adSpendCampaignsCount = 0;

  clientBudgets.forEach((budget) => {
    let budgetContributed = false;
    const historyList =
      budget.rechargeHistory && budget.rechargeHistory.length > 0
        ? budget.rechargeHistory
        : [
            {
              id: `initial-${budget.id}`,
              date: budget.startDate || budget.createdAt || todayStr,
              amount: budget.amount,
              expectedDays: budget.expectedDays,
              startDate: budget.startDate,
              endDate: budget.endDate
            }
          ];

    historyList.forEach((hist) => {
      if (filterMode === 'all' || isDateInPeriod(hist.date) || isDateInPeriod(hist.startDate)) {
        adSpendFromBudgets += hist.amount;
        budgetContributed = true;
      }
    });

    if (budgetContributed || filterMode === 'all') {
      adSpendCampaignsCount++;
    }
  });

  const adSpendFromPayments = filteredPayments
    .filter((p) => p.category === 'ad_spend' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalAdSpend = adSpendFromBudgets > 0 ? adSpendFromBudgets : adSpendFromPayments;

  // 2. Media Buying Fees (اللي العميل دفعهولك)
  const mediaBuyingPayments = useMemo(() => {
    return filteredPayments.filter((p) => p.category !== 'ad_spend');
  }, [filteredPayments]);

  const totalFeesPaid = mediaBuyingPayments.reduce((sum, p) => {
    if (p.status === 'paid') return sum + p.amount;
    if (p.status === 'partial') return sum + (p.paidAmount !== undefined ? p.paidAmount : p.amount);
    return sum;
  }, 0);
  const feesPaidCount = mediaBuyingPayments.filter((p) => p.status === 'paid').length;

  const totalFeesPending = mediaBuyingPayments.reduce((sum, p) => {
    if (p.status === 'pending') return sum + p.amount;
    if (p.status === 'partial') return sum + (p.remainingAmount !== undefined ? p.remainingAmount : 0);
    return sum;
  }, 0);
  const feesPendingCount = mediaBuyingPayments.filter((p) => p.status === 'pending' || p.status === 'overdue').length;

  const feesPartialCount = mediaBuyingPayments.filter((p) => p.status === 'partial').length;
  const feesOverdueCount = mediaBuyingPayments.filter(
    (p) => p.status === 'overdue' || (p.status === 'pending' && p.date < todayStr)
  ).length;

  // 3. Monthly Summary: إجمالي Ads Spend + إجمالي أتعابك
  const totalCombinedVolume = totalAdSpend + totalFeesPaid;

  // Period label for titles
  const periodLabel =
    filterMode === 'all'
      ? 'كل الفترات'
      : filterMode === 'month'
      ? availableMonths.find((m) => m.value === selectedMonth)?.label || selectedMonth
      : `${customStartDate || 'البداية'} إلى ${customEndDate || 'اليوم'}`;

  // Calculate statistics & urgent alarms
  const urgentCount = clientBudgets.filter((b) => isBudgetRechargeUrgent(b, 2, todayStr)).length;

  const activeCampaignsCount = clientBudgets.filter((b) => b.status === 'active').length;

  return (
    <div className="space-y-4">
      {/* 1. HEADER BAR */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#2D2D2A] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#5A5A40]" />
            <span>Financial Tracking (المتابعة المالية)</span>
            <span className="text-xs font-bold text-[#8E8E85] bg-white px-2 py-0.5 rounded-full border border-[#E5E5E0] hidden md:inline-block">
              {brandName}
            </span>
          </h2>
          <p className="text-xs text-[#8E8E85] mt-0.5">
            {isEmployee
              ? 'تتبع الصرف الإعلاني وميزانيات الحملات (Ad Spend)'
              : 'تتبع الصرف الإعلاني (Ad Spend) وأتعاب الإدارة (Media Buying Fees)'}
          </p>
        </div>

        {userRole !== 'client' && (isEmployee || activeSubView === 'ad_spend') && (
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ميزانية جديدة</span>
          </button>
        )}
      </div>

      {/* 2. PERIOD FILTER (فلترة بالشهر أو الفترة) */}
      <FinancialPeriodFilter
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        availableMonths={availableMonths}
        onReset={handleResetFilter}
      />

      {/* 3. THE 4 KPI CARDS (Ad Spend, Fees/Campaigns, Monthly Summary/Active, Payment Status/Urgent) */}
      <FinancialKpiCards
        totalAdSpend={totalAdSpend}
        adSpendCampaignsCount={adSpendCampaignsCount}
        adSpendFromPayments={adSpendFromPayments}
        adSpendFromBudgets={adSpendFromBudgets}
        totalFeesPaid={totalFeesPaid}
        totalFeesPending={totalFeesPending}
        totalFeesOverdue={feesOverdueCount}
        feesPaidCount={feesPaidCount}
        feesPendingCount={feesPendingCount}
        feesOverdueCount={feesOverdueCount}
        feesPartialCount={feesPartialCount}
        totalCombinedVolume={totalCombinedVolume}
        periodLabel={periodLabel}
        userRole={userRole}
        activeCampaignsCount={activeCampaignsCount}
        urgentCampaignsCount={urgentCount}
      />

      {/* 4. SUB-VIEW NAVIGATION SWITCHER */}
      {isEmployee ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-[#E5E5E0] pb-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#5A5A40] text-white flex items-center gap-2 shadow-2xs">
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span>💰 تتبع الصرف الإعلاني — Ad Spend ({clientBudgets.length} حملات)</span>
              {urgentCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              )}
            </span>
          </div>

          <div className="text-xs text-[#8E8E85] font-bold text-center sm:text-end">
            الفترة المعروضة: <span className="text-[#2D2D2A]">{periodLabel}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-[#E5E5E0] pb-2.5 pt-1">
          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 bg-[#F9F8F6] p-1 rounded-2xl border border-[#E5E5E0] w-full sm:w-auto">
            <button
              onClick={() => setActiveSubView('fees')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubView === 'fees'
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'text-[#5A5A40] hover:bg-neutral-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">👩🏻‍💻 Media Buying Fees ({mediaBuyingPayments.length})</span>
            </button>

            <button
              onClick={() => setActiveSubView('ad_spend')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubView === 'ad_spend'
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'text-[#5A5A40] hover:bg-neutral-200'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">💰 Ad Spend ({clientBudgets.length})</span>
              {urgentCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              )}
            </button>
          </div>

          <div className="text-xs text-[#8E8E85] font-bold text-center sm:text-end">
            الفترة المعروضة: <span className="text-[#2D2D2A]">{periodLabel}</span>
          </div>
        </div>
      )}

      {/* 5. MEDIA BUYING FEES SECTION (Hidden for employees) */}
      {!isEmployee && activeSubView === 'fees' && (
        <WeeklyPaymentsSection
          payments={mediaBuyingPayments}
          clientId={clientId}
          brandName={brandName}
          userRole={userRole}
          onAddPayment={onAddPayment}
          onUpdatePayment={onUpdatePayment}
          onUpdatePaymentStatus={onUpdatePaymentStatus}
          onDeletePayment={onDeletePayment}
        />
      )}

      {/* 6. AD SPEND (CAMPAIGN BUDGETS & RECHARGE ALARMS) SECTION */}
      {(isEmployee || activeSubView === 'ad_spend') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <h3 className="text-sm sm:text-base font-extrabold text-[#2D2D2A] flex items-center gap-2">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A40] shrink-0" />
              <span>Ad Spend — ميزانيات الحملات الإعلانية ومواعيد الشحن</span>
            </h3>
            {userRole !== 'client' && (
              <button
                onClick={handleOpenAdd}
                className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ميزانية جديدة</span>
              </button>
            )}
          </div>

          {/* URGENT RECHARGE ALERT BANNER */}
          {urgentCount > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-3xl text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 rounded-2xl shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-700 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-950">
                    تنبيه: يوجد {urgentCount} حملة بحاجة لإعادة الشحن قريبًا أو منتهية!
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {userRole === 'client'
                      ? 'الحملات الموضحة بالأصفر/الأحمر أدناه اقتربت من الانتهاء أو انتهت ميزانيتها المقررة.'
                      : 'يرجى مراجعة الحملات الموضحة بالأصفر/الأحمر أدناه واضغط زر "إعادة شحن" لمواصلة التشغيل وبدء دورة تنبيه جديدة.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BUDGET CARDS LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientBudgets.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl text-[#8E8E85] text-xs">
            {userRole === 'client'
              ? 'لا توجد ميزانيات إعلانات مسجلة لهذا البراند حالياً 📢'
              : 'لا توجد ميزانيات إعلانات مسجلة لهذا البراند حالياً. اضغط أزرار الإضافة أعلاه لتشغيل ميزانية جديدة 📢'}
          </div>
        ) : (
          clientBudgets.map((budget) => {
            const daysLeft = getBudgetDaysRemaining(budget.endDate, todayStr);
            const isToday = daysLeft === 0;
            const isCompleted = budget.status === 'completed';
            const isExpired = daysLeft < 0;
            const isWarning = daysLeft >= 1 && daysLeft <= 2;
            const isNeedsRecharge = budget.status === 'needs_recharge';
            const isPaused = budget.status === 'paused';

            // Calculate history list & cumulative amount
            const historyList = (budget.rechargeHistory && budget.rechargeHistory.length > 0)
              ? budget.rechargeHistory
              : [
                  {
                    id: `initial-${budget.id}`,
                    date: budget.startDate || budget.createdAt || todayStr,
                    amount: budget.amount,
                    expectedDays: budget.expectedDays,
                    startDate: budget.startDate,
                    endDate: budget.endDate,
                    notes: budget.notes || 'الميزانية الأولية للحملة',
                    type: 'initial' as const
                  }
                ];
            const totalCumulativeAmount = historyList.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

            // Card Styling based on status/days
            let cardBgClass = 'bg-[#F9F8F6] border-[#E5E5E0] hover:border-[#5A5A40]/40';
            let statusBadge = {
              label: 'نشطة ✅',
              bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
            };

            if (isPaused) {
              cardBgClass = 'bg-[#F4F4F0] border-[#D5D5CF] opacity-90';
              statusBadge = {
                label: 'توقفت 🔴',
                bg: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold'
              };
            } else if (isCompleted) {
              cardBgClass = 'bg-slate-100 border-slate-300';
              statusBadge = {
                label: 'مكتملة ✅',
                bg: 'bg-slate-200 text-slate-800 border-slate-300'
              };
            } else if (isExpired || isNeedsRecharge) {
              cardBgClass = 'bg-rose-500/10 border-rose-500/40';
              statusBadge = {
                label: isNeedsRecharge ? 'تحتاج شحن ⚠️' : 'منتهية 🔴',
                bg: 'bg-rose-100 text-rose-800 border-rose-300'
              };
            } else if (isToday) {
              cardBgClass = 'bg-amber-500/10 border-amber-500/50';
              statusBadge = {
                label: 'تنتهي اليوم 🔥',
                bg: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
              };
            } else if (isWarning) {
              cardBgClass = 'bg-amber-50/80 border-amber-300';
              statusBadge = {
                label: `متبقي ${daysLeft} أيام ⚠️`,
                bg: 'bg-amber-100 text-amber-800 border-amber-300'
              };
            } else {
              statusBadge = {
                label: `نشطة (متبقي ${daysLeft} يوم) ✅`,
                bg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
              };
            }

            return (
              <div
                key={budget.id}
                onClick={() => {
                  if (userRole === 'client') {
                    setViewingDetailsBudget(budget);
                  }
                }}
                className={`p-5 sm:p-6 rounded-3xl border transition space-y-4 shadow-xs flex flex-col justify-between ${cardBgClass} ${userRole === 'client' ? 'cursor-pointer hover:shadow-md hover:border-[#5A5A40]/40' : ''}`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#E5E5E0]/80 pb-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#8E8E85] uppercase tracking-wider block">
                        {budget.platform || 'General Ads'}
                      </span>
                      <h3 className="text-base font-extrabold text-[#2D2D2A] truncate mt-0.5">
                        {budget.campaignName || 'حملة إعلانية بدون عنوان'}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold border shrink-0 ${statusBadge.bg}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Cumulative Total Budget Badge */}
                  <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/15 p-2.5 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#5A5A40]">
                      <History className="w-4 h-4" />
                      <span className="font-bold">إجمالي الميزانيات المشحونة:</span>
                    </div>
                    <div className="font-black text-[#2D2D2A]">
                      {totalCumulativeAmount.toLocaleString()} EGP
                      <span className="text-[10px] text-[#8E8E85] font-semibold mr-1">
                        ({historyList.length} {historyList.length === 1 ? 'شحنة' : 'شحنات'})
                      </span>
                    </div>
                  </div>

                  {/* Grid Numbers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-[#E5E5E0] text-center text-xs">
                    <div>
                      <div className="text-[10px] text-[#8E8E85]">الميزانية الحالية</div>
                      <div className="font-extrabold text-[#5A5A40] mt-0.5">
                        {budget.amount ? budget.amount.toLocaleString() : '0'} EGP
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8E8E85]">تاريخ البداية</div>
                      <div className="font-semibold text-[#2D2D2A] mt-0.5">{budget.startDate}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8E8E85]">مدة التشغيل</div>
                      <div className="font-semibold text-[#2D2D2A] mt-0.5">{budget.expectedDays} أيام</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8E8E85]">تاريخ الانتهاء</div>
                      <div className={`font-extrabold mt-0.5 ${isToday || isExpired ? 'text-rose-700' : 'text-[#5A5A40]'}`}>
                        {budget.endDate}
                      </div>
                    </div>
                  </div>

                  {/* Warning Messages */}
                  {!isPaused && !isCompleted && (isToday || isExpired || isWarning || isNeedsRecharge) && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs font-bold text-amber-950 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        {isToday
                          ? 'تنتهي هذه الحملة اليوم! يُنصح ببدء إجراءات الشحن الآن.'
                          : isExpired || isNeedsRecharge
                          ? userRole === 'client'
                            ? 'الميزانية منتهية أو بحاجة شحن لمواصلة الحملة.'
                            : 'الميزانية منتهية أو بحاجة شحن. اضغط "إعادة شحن" لتجديد الدورة.'
                          : `تنبيه: متبقي ${daysLeft} يوم فقط على انتهاء ميزانية هذه الحملة.`}
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {budget.notes && (
                    <div className="text-xs text-[#2D2D2A] bg-white p-3 rounded-xl border border-[#E5E5E0]/80 space-y-1">
                      <span className="font-bold text-[#8E8E85] text-[10px] block">ملاحظات التشغيل:</span>
                      <p className="whitespace-pre-line leading-relaxed">{budget.notes}</p>
                    </div>
                  )}

                  {/* Recharge stats */}
                  <div className="text-[10px] text-[#8E8E85] flex items-center justify-between px-1">
                    <span>عدد مرات الشحن: <strong className="text-[#2D2D2A]">{budget.rechargesCount || (historyList.length > 1 ? historyList.length - 1 : 0)}</strong></span>
                    {budget.lastRechargedAt ? (
                      <span>آخر شحن: <strong className="text-[#2D2D2A]">{budget.lastRechargedAt}</strong></span>
                    ) : (
                      <span>بداية الحملة: <strong className="text-[#2D2D2A]">{budget.startDate}</strong></span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-[#E5E5E0]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {userRole !== 'client' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRecharge(budget);
                        }}
                        className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <BatteryCharging className="w-4 h-4" />
                        <span>إعادة شحن الحملة</span>
                      </button>
                    )}

                    {userRole === 'client' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDetailsBudget(budget);
                        }}
                        className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 bg-[#5A5A40]/10 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white border border-[#5A5A40]/25 font-extrabold rounded-xl text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title="معاينة تفاصيل الميزانية وسجل الشحن"
                      >
                        <Eye className="w-4 h-4" />
                        <span>معاينة التفاصيل والسجل ({historyList.length})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDetailsBudget(budget);
                        }}
                        className="flex-1 sm:flex-initial px-3 py-2.5 sm:py-2 bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] border border-[#E5E5E0] font-extrabold rounded-xl text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title="معاينة تفاصيل الميزانية وسجل الشحن للحملة"
                      >
                        <Eye className="w-4 h-4 text-[#5A5A40]" />
                        <span>معاينة وسجل الميزانية ({historyList.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E0]/60">
                    {userRole === 'client' ? (
                      <span
                        className={`px-3 py-1.5 border font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5 ${
                          isPaused || isCompleted
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isPaused || isCompleted ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{isCompleted ? 'الحالة: مكتملة' : 'الحالة: متوقفة'}</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>الحالة: نشطة</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <>
                        {isCompleted ? (
                          <span className="px-2.5 py-1.5 border font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>الحملة مكتملة</span>
                          </span>
                        ) : (
                          <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(budget);
                          }}
                          className={`px-2.5 py-1.5 border font-extrabold text-xs rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                            isPaused
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                          title={
                            isPaused
                              ? 'الحملة متوقفة حالياً - اضغط لتغيير الحالة إلى نشطة'
                              : 'الحملة نشطة حالياً - اضغط لإيقاف الحملة'
                          }
                        >
                          {isPaused ? (
                            <>
                              <PauseCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>الحالة: توقفت</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>الحالة: نشطة</span>
                            </>
                          )}
                          </button>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(budget);
                            }}
                            title="تعديل الميزانية"
                            className="p-2 bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] border border-[#E5E5E0] font-bold text-xs rounded-xl transition inline-flex items-center justify-center cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-[#8E8E85]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(budget.id, budget.campaignName);
                            }}
                            title="حذف الميزانية"
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition inline-flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
          </div>
        </div>
      )}

      {/* ADD / EDIT FORM MODAL */}
      {showFormModal && userRole !== 'client' && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 shrink-0">
              <h3 className="font-extrabold text-[#2D2D2A] text-sm sm:text-base flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#5A5A40]" />
                <span>{editingBudget ? 'تعديل الميزانية' : 'إضافة ميزانية جديدة'}</span>
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="adsBudgetForm" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs pr-1 pl-1 my-1">
              {/* Campaign Name */}
              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">
                  اسم الحملة الإعلانية *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="مثال: حملة عروض الصيف / حملة ليدز الفروع"
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                  required
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">المنصة الإعلانية *</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none cursor-pointer focus:border-[#5A5A40]"
                  required
                >
                  <option value="Meta Ads (FB & Insta)">Meta Ads (Facebook & Instagram)</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                  <option value="Google & Youtube Ads">Google & Youtube Ads</option>
                  <option value="Snapchat Ads">Snapchat Ads</option>
                  <option value="LinkedIn Ads">LinkedIn Ads</option>
                  <option value="X (Twitter) Ads">X (Twitter) Ads</option>
                  <option value="منصة أخرى">منصة أخرى</option>
                </select>
              </div>

              {/* Amount & Expected Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2D2D2A] font-bold mb-1">
                    الميزانية المخصصة (EGP) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="15000"
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#2D2D2A] font-bold mb-1">مدة التشغيل (بالأيام) *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={expectedDays}
                    onChange={(e) => setExpectedDays(e.target.value ? Number(e.target.value) : '')}
                    placeholder="7"
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                    required
                  />
                </div>
              </div>

              {/* Start Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2D2D2A] font-bold mb-1">تاريخ البداية *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#2D2D2A] font-bold mb-1">حالة الحملة *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none cursor-pointer focus:border-[#5A5A40]"
                  >
                    <option value="active">نشطة ✅</option>
                    <option value="paused">متوقفة مؤقتاً ⏸️</option>
                    <option value="needs_recharge">تحتاج إعادة شحن ⚠️</option>
                    <option value="completed">منتهية 🔴</option>
                  </select>
                </div>
              </div>

              {/* Calculated End Date Preview */}
              {startDate && expectedDays && (
                <div className="p-3 bg-white border border-[#E5E5E0] rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[#8E8E85]">تاريخ الانتهاء المتوقع:</span>
                  <span className="font-extrabold text-[#5A5A40]">
                    {calculateBudgetEndDate(startDate, Number(expectedDays))}
                  </span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">ملاحظات التشغيل</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أية تفاصيل حول إعداد الميزانية، الحساب الإعلاني، أو العروض..."
                  rows={2}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                />
              </div>
            </form>

            <div className="pt-3 border-t border-[#E5E5E0] flex gap-3 shrink-0">
              <button
                type="submit"
                form="adsBudgetForm"
                className="flex-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingBudget ? 'حفظ التعديلات' : 'حفظ الميزانية وتفعيل التنبيه'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#F5F5F0] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECHARGE MODAL */}
      {rechargingBudget && userRole !== 'client' && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#5A5A40]/10 rounded-xl">
                  <BatteryCharging className="w-5 h-5 text-[#5A5A40]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#2D2D2A] text-sm sm:text-base">
                    إعادة شحن ميزانية الحملة
                  </h3>
                  <p className="text-[11px] text-[#8E8E85]">
                    {rechargingBudget.campaignName || 'الحملة الإعلانية'} ({rechargingBudget.platform})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRechargingBudget(null)}
                className="p-1 text-[#8E8E85] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="rechargeForm" onSubmit={handleRechargeSubmit} className="py-4 space-y-3.5 text-xs">
              {/* Alert Info with Previous Budget Context */}
              <div className="p-3 bg-[#5A5A40]/10 border border-[#5A5A40]/20 rounded-2xl text-[#2D2D2A] text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#5A5A40]">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>الميزانية السابقة الحالية:</span>
                  </span>
                  <span className="text-[#2D2D2A] font-black">{rechargingBudget.amount.toLocaleString()} EGP</span>
                </div>
                <div className="text-[11px] text-[#8E8E85] flex justify-between">
                  <span>المدة: {rechargingBudget.expectedDays} أيام</span>
                  <span>من {rechargingBudget.startDate} إلى {rechargingBudget.endDate}</span>
                </div>
                <p className="text-[10px] text-[#8E8E85] pt-1.5 border-t border-[#5A5A40]/15">
                  💡 سيتم أرشفة الميزانية القديمة تلقائياً في السجل التاريخي دون فقدانها، وتحديث تنبيهات الشحن الجديد.
                </p>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">تاريخ بداية الشحن الجديد *</label>
                <input
                  type="date"
                  value={rechargeStartDate}
                  onChange={(e) => setRechargeStartDate(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                  required
                />
              </div>

              {/* New Amount & New Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2D2D2A] font-bold mb-1">مبلغ الشحن الجديد (EGP) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="15000"
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#2D2D2A] font-bold mb-1">مدة التشغيل الجديدة (أيام) *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={rechargeDays}
                    onChange={(e) => setRechargeDays(e.target.value ? Number(e.target.value) : '')}
                    placeholder="7"
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                    required
                  />
                </div>
              </div>

              {/* Live Preview of New End Date */}
              {rechargeStartDate && rechargeDays && (
                <div className="p-3 bg-white border border-[#E5E5E0] rounded-xl flex items-center justify-between">
                  <span className="text-[#8E8E85] font-semibold">تاريخ الانتهاء الجديد المتوقع:</span>
                  <span className="font-extrabold text-[#5A5A40]">
                    {calculateBudgetEndDate(rechargeStartDate, Number(rechargeDays))}
                  </span>
                </div>
              )}

              {/* Optional Recharge Notes */}
              <div>
                <label className="block text-[#2D2D2A] font-bold mb-1">ملاحظات عملية الشحن</label>
                <input
                  type="text"
                  value={rechargeNotes}
                  onChange={(e) => setRechargeNotes(e.target.value)}
                  placeholder="مثال: تم شحن الرصيد لتغطية عروض نهاية الأسبوع..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3.5 py-2 text-[#2D2D2A] outline-none focus:border-[#5A5A40]"
                />
              </div>
            </form>

            <div className="pt-3 border-t border-[#E5E5E0] flex gap-3 shrink-0">
              <button
                type="submit"
                form="rechargeForm"
                className="flex-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <BatteryCharging className="w-4 h-4" />
                <span>تأكيد إعادة الشحن وبدء التنبيه 🔋</span>
              </button>
              <button
                type="button"
                onClick={() => setRechargingBudget(null)}
                className="px-4 bg-white border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#F5F5F0] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingBudgetInfo && userRole !== 'client' && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2D2D2A] text-base">تأكيد حذف الميزانية</h3>
              <p className="text-xs text-[#8E8E85] mt-1">
                هل أنت تأكد من رغبتك في حذف ميزانية "{deletingBudgetInfo.name || 'هذه الحملة'}" بشكل نهائي؟
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDeleteBudget}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                نعم، تأكيد الحذف
              </button>
              <button
                onClick={() => setDeletingBudgetInfo(null)}
                className="px-4 bg-[#F9F8F6] hover:bg-[#E5E5E0] border border-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED BUDGET DETAILS & RECHARGE HISTORY MODAL */}
      {viewingDetailsBudget && (
        <div className="fixed inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#5A5A40]/10 rounded-xl">
                  <Megaphone className="w-5 h-5 text-[#5A5A40]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#2D2D2A] text-sm sm:text-base">
                    معاينة تفاصيل وسجل ميزانية الحملة
                  </h3>
                  <p className="text-[11px] text-[#8E8E85]">
                    {viewingDetailsBudget.campaignName || 'الحملة الإعلانية'} ({viewingDetailsBudget.platform || 'General Ads'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDetailsBudget(null)}
                className="p-1.5 text-[#8E8E85] hover:text-[#2D2D2A] rounded-xl hover:bg-[#E5E5E0] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 pl-1 text-xs">
              {(() => {
                const daysLeft = getBudgetDaysRemaining(viewingDetailsBudget.endDate, todayStr);
                const isToday = daysLeft === 0;
                const isCompleted = viewingDetailsBudget.status === 'completed';
                const isExpired = daysLeft < 0;
                const isWarning = daysLeft >= 1 && daysLeft <= 2;
                const isNeedsRecharge = viewingDetailsBudget.status === 'needs_recharge';
                const isPaused = viewingDetailsBudget.status === 'paused';

                const historyList = (viewingDetailsBudget.rechargeHistory && viewingDetailsBudget.rechargeHistory.length > 0)
                  ? viewingDetailsBudget.rechargeHistory
                  : [
                      {
                        id: `initial-${viewingDetailsBudget.id}`,
                        date: viewingDetailsBudget.startDate || viewingDetailsBudget.createdAt || todayStr,
                        amount: viewingDetailsBudget.amount,
                        expectedDays: viewingDetailsBudget.expectedDays,
                        startDate: viewingDetailsBudget.startDate,
                        endDate: viewingDetailsBudget.endDate,
                        notes: viewingDetailsBudget.notes || 'الميزانية الأولية للحملة',
                        type: 'initial' as const
                      }
                    ];
                const totalCumulativeAmount = historyList.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

                let statusBadge = {
                  label: 'نشطة ✅',
                  bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
                };
                if (isPaused) {
                  statusBadge = {
                    label: 'متوقفة 🔴',
                    bg: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold'
                  };
                } else if (isCompleted) {
                  statusBadge = {
                    label: 'مكتملة ✅',
                    bg: 'bg-slate-200 text-slate-800 border-slate-300 font-extrabold'
                  };
                } else if (isExpired || isNeedsRecharge) {
                  statusBadge = {
                    label: isNeedsRecharge ? 'تحتاج شحن ⚠️' : 'منتهية 🔴',
                    bg: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold'
                  };
                } else if (isToday) {
                  statusBadge = {
                    label: 'تنتهي اليوم 🔥',
                    bg: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse font-extrabold'
                  };
                } else if (isWarning) {
                  statusBadge = {
                    label: `متبقي ${daysLeft} أيام ⚠️`,
                    bg: 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold'
                  };
                } else {
                  statusBadge = {
                    label: `نشطة (متبقي ${daysLeft} يوم) ✅`,
                    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold'
                  };
                }

                return (
                  <>
                    {/* Status Pill & Summary */}
                    <div className="bg-white border border-[#E5E5E0] p-4 rounded-2xl flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#8E8E85] block">المنصة وحالة التشغيل</span>
                        <div className="font-extrabold text-[#2D2D2A] mt-0.5">{viewingDetailsBudget.platform || 'General Ads'}</div>
                      </div>
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-4 rounded-2xl border border-[#E5E5E0] text-center shadow-2xs">
                      <div>
                        <div className="text-[10px] text-[#8E8E85] font-semibold">الميزانية الحالية</div>
                        <div className="font-black text-[#5A5A40] text-sm mt-1">
                          {viewingDetailsBudget.amount ? viewingDetailsBudget.amount.toLocaleString() : '0'} EGP
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8E8E85] font-semibold">تاريخ البداية</div>
                        <div className="font-bold text-[#2D2D2A] text-xs mt-1">{viewingDetailsBudget.startDate}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8E8E85] font-semibold">مدة التشغيل</div>
                        <div className="font-bold text-[#2D2D2A] text-xs mt-1">{viewingDetailsBudget.expectedDays} أيام</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8E8E85] font-semibold">تاريخ الانتهاء</div>
                        <div className={`font-black text-xs mt-1 ${isToday || isExpired ? 'text-rose-700' : 'text-[#5A5A40]'}`}>
                          {viewingDetailsBudget.endDate}
                        </div>
                      </div>
                    </div>

                    {/* Operational Notes */}
                    {viewingDetailsBudget.notes && (
                      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] space-y-1 shadow-2xs">
                        <span className="font-bold text-[#8E8E85] text-[10px] block">ملاحظات التشغيل الحالية:</span>
                        <p className="text-xs text-[#2D2D2A] whitespace-pre-line leading-relaxed">
                          {viewingDetailsBudget.notes}
                        </p>
                      </div>
                    )}

                    {/* Cumulative History Summary */}
                    <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/15 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#8E8E85] block">إجمالي الميزانيات المشحونة للحملة</span>
                        <span className="text-lg font-black text-[#5A5A40]">
                          {totalCumulativeAmount.toLocaleString()} EGP
                        </span>
                      </div>
                      <div className="text-xs text-[#2D2D2A] font-extrabold bg-white px-3 py-1.5 rounded-xl border border-[#E5E5E0]">
                        عدد عمليات الشحن المسجلة: {historyList.length}
                      </div>
                    </div>

                    {/* History Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-[#8E8E85] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>سجل الشحن والميزانيات القديمة (من الأحدث للأقدم):</span>
                      </h4>

                      <div className="space-y-2.5">
                        {[...historyList].reverse().map((rec, idx) => {
                          const originalNum = historyList.length - idx;
                          const isInitial = rec.type === 'initial' || originalNum === 1;

                          return (
                            <div
                              key={rec.id || idx}
                              className="bg-white border border-[#E5E5E0] p-3.5 rounded-2xl space-y-2 hover:border-[#5A5A40]/30 transition shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E0]/60 pb-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                                      isInitial
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}
                                  >
                                    {isInitial ? '🟢 الميزانية الأولية' : `⚡ شحن رقم ${originalNum - 1}`}
                                  </span>
                                  <span className="text-xs font-bold text-[#2D2D2A]">
                                    تاريخ الشحن: {rec.date}
                                  </span>
                                </div>
                                <span className="text-xs font-black text-[#5A5A40]">
                                  {rec.amount ? Number(rec.amount).toLocaleString() : '0'} EGP
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#2D2D2A]">
                                <div>
                                  <span className="text-[#8E8E85] block text-[10px]">مدة التشغيل</span>
                                  <span className="font-extrabold">{rec.expectedDays} أيام</span>
                                </div>
                                <div>
                                  <span className="text-[#8E8E85] block text-[10px]">تاريخ البداية</span>
                                  <span className="font-semibold">{rec.startDate}</span>
                                </div>
                                <div>
                                  <span className="text-[#8E8E85] block text-[10px]">تاريخ الانتهاء</span>
                                  <span className="font-semibold text-[#5A5A40]">{rec.endDate}</span>
                                </div>
                              </div>

                              {rec.notes && (
                                <div className="text-[11px] text-[#2D2D2A] bg-[#F9F8F6] p-2 rounded-xl border border-[#E5E5E0]/70 mt-1">
                                  <span className="font-bold text-[#8E8E85] text-[9px] block">ملاحظات العملية:</span>
                                  <p className="whitespace-pre-line">{rec.notes}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#E5E5E0] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingDetailsBudget(null)}
                className="px-5 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
