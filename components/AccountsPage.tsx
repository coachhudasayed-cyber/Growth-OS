import React, { useState, useMemo } from 'react';
import {
  Wallet,
  DollarSign,
  Plus,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Building2,
  Filter,
  Check,
  TrendingUp,
  FileText,
  RotateCcw,
  Pencil
} from 'lucide-react';
import {
  Client,
  Agreement,
  PaymentRecord,
  PaymentFrequency,
  PaymentStatus
} from '../types';
import {
  getInstallmentAmount,
  getPaymentCollectedAmount as calculateCollectedAmount,
  normalizePaymentAmounts
} from '../lib/financialLogic';

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const getArabicDayName = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return '';
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return ARABIC_DAYS[d.getDay()] || '';
};

export const getLocalDateYMD = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Calculates covered period ending exactly on the payment date.
 * E.g. If paymentDate is Friday 2026-09-18 and days = 7,
 * start date is Saturday 2026-09-12 and end date is Friday 2026-09-18.
 */
export const calculatePeriodDates = (
  payDateStr: string,
  days: number | ''
): { start: string; end: string } => {
  if (!payDateStr || !days || Number(days) <= 0) {
    return { start: '', end: '' };
  }
  const parts = payDateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return { start: '', end: '' };
  }
  const [year, month, day] = parts;
  const numDays = Math.max(1, Math.round(Number(days)));

  // End date is payment date
  const endDate = new Date(year, month - 1, day);
  // Start date is endDate minus (numDays - 1) days
  const startDate = new Date(year, month - 1, day - (numDays - 1));

  const formatToYMD = (dt: Date): string => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const dStr = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${dStr}`;
  };

  return {
    start: formatToYMD(startDate),
    end: formatToYMD(endDate)
  };
};

export const getPaymentActualDate = (p: PaymentRecord): string => {
  return p.date || p.periodEndDate || p.periodStartDate || (p.createdAt ? p.createdAt.split('T')[0] : '');
};

export const getPaymentCollectedAmount = (p: PaymentRecord): number => {
  return calculateCollectedAmount(p);
};

interface AccountsPageProps {
  clients: Client[];
  agreements: Agreement[];
  payments: PaymentRecord[];
  onAddAgreement: (data: Omit<Agreement, 'id' | 'createdAt' | 'brandName'>) => void;
  onUpdateAgreement: (id: string, data: Partial<Agreement>) => void;
  onDeleteAgreement: (id: string) => void;
  onAddPayment: (paymentData: Omit<PaymentRecord, 'id'>) => void;
  onUpdatePaymentStatus: (id: string, status: PaymentStatus) => void;
  onUpdatePayment?: (id: string, paymentData: Partial<PaymentRecord>) => void;
  onDeletePayment: (id: string) => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  clients,
  agreements,
  payments,
  onAddAgreement,
  onUpdateAgreement,
  onDeleteAgreement,
  onAddPayment,
  onUpdatePaymentStatus,
  onUpdatePayment,
  onDeletePayment
}) => {
  const todayYMD = getLocalDateYMD();
  const defaultAutoPeriod = calculatePeriodDates(todayYMD, 7);

  // Modal State for Add Agreement
  const [showAddAgreementModal, setShowAddAgreementModal] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<Agreement | null>(null);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [agreementType, setAgreementType] = useState('إدارة إعلانات وتسويق كامل');
  const [startDate, setStartDate] = useState(todayYMD);
  const [monthlySalary, setMonthlySalary] = useState<number | ''>(20000);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly');
  const [installmentAmount, setInstallmentAmount] = useState<number | ''>(20000);
  const [agreementNotes, setAgreementNotes] = useState('');

  // Modal State for Record / Edit Payment
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [editingPaymentRecord, setEditingPaymentRecord] = useState<PaymentRecord | null>(null);
  const [paymentAgreementId, setPaymentAgreementId] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayYMD);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('InstaPay');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [paymentPaidAmount, setPaymentPaidAmount] = useState<number | ''>('');
  const [daysCovered, setDaysCovered] = useState<number | ''>(7);
  const [periodStartDate, setPeriodStartDate] = useState(defaultAutoPeriod.start || todayYMD);
  const [periodEndDate, setPeriodEndDate] = useState(defaultAutoPeriod.end || todayYMD);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Filter States (Brand & Date Range)
  const [filterClientId, setFilterClientId] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // --- CALCULATIONS ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth();
  const currentMonthPrefix = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}`;

  // Month selector for Card 2 (defaults to current month, user can toggle months)
  const [selectedIncomeMonth, setSelectedIncomeMonth] = useState<string>(currentMonthPrefix);

  // Available unique months from payments data
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    monthSet.add(currentMonthPrefix);
    const prevMonth = new Date(currentYear, currentMonthNum - 1, 1);
    const prevMonthPrefix = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(prevMonthPrefix);

    payments.forEach((p) => {
      const d = getPaymentActualDate(p);
      if (d && d.length >= 7) {
        monthSet.add(d.slice(0, 7));
      }
    });

    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [payments, currentMonthPrefix, currentYear, currentMonthNum]);

  const formatMonthLabel = (monthKey: string) => {
    const [yStr, mStr] = monthKey.split('-');
    const mIdx = Number(mStr) - 1;
    const isCurrent = monthKey === currentMonthPrefix;
    const monthName = ARABIC_MONTHS[mIdx] || mStr;
    return `${monthName} ${yStr}${isCurrent ? ' (الحالي)' : ''}`;
  };

  // 1. Total Income for selected month (respects brand filter if specific brand selected)
  const monthlyPaidPayments = payments.filter((p) => {
    const pDate = getPaymentActualDate(p);
    const matchesMonth = pDate.startsWith(selectedIncomeMonth);
    const matchesBrand = filterClientId === 'all' || p.clientId === filterClientId;
    return matchesMonth && matchesBrand && (p.status === 'paid' || p.status === 'partial');
  });

  const totalMonthlyIncome = monthlyPaidPayments.reduce((acc, curr) => {
    return acc + getPaymentCollectedAmount(curr);
  }, 0);

  // Grand total for all brands for selected month
  const totalAllBrandsMonthlyIncome = payments
    .filter((p) => {
      const pDate = getPaymentActualDate(p);
      return pDate.startsWith(selectedIncomeMonth) && (p.status === 'paid' || p.status === 'partial');
    })
    .reduce((acc, curr) => acc + getPaymentCollectedAmount(curr), 0);

  // 2. Unpaid Clients Count (عدد العملاء الذين لم يدفعوا بعد)
  const unpaidClientIds = new Set(
    payments
      .filter((payment) => payment.status === 'pending' || payment.status === 'overdue' || payment.status === 'partial')
      .map((payment) => payment.clientId)
  );
  const unpaidClientsCount = unpaidClientIds.size;

  // 3. Filtered Payments Logic (By Brand AND Date Range)
  const filteredPayments = payments.filter((p) => {
    // Brand check
    const matchesClient = filterClientId === 'all' || p.clientId === filterClientId;

    // Start Date check
    let matchesStartDate = true;
    if (filterStartDate) {
      const dateToCheck = p.date || p.periodStartDate;
      if (dateToCheck) {
        matchesStartDate = dateToCheck >= filterStartDate;
      }
    }

    // End Date check
    let matchesEndDate = true;
    if (filterEndDate) {
      const dateToCheck = p.date || p.periodEndDate || p.periodStartDate;
      if (dateToCheck) {
        matchesEndDate = dateToCheck <= filterEndDate;
      }
    }

    return matchesClient && matchesStartDate && matchesEndDate;
  });

  // Total collected under current active filter
  const filteredTotalPaid = filteredPayments
    .reduce((acc, curr) => acc + getPaymentCollectedAmount(curr), 0);

  const selectedBrandObj = clients.find((c) => c.id === filterClientId);
  const selectedBrandName = filterClientId === 'all' ? 'جميع البراندات' : (selectedBrandObj?.brandName || 'البراند المحدد');

  const handlePaymentDateChange = (newDate: string) => {
    setPaymentDate(newDate);
    if (daysCovered && Number(daysCovered) > 0) {
      const auto = calculatePeriodDates(newDate, daysCovered);
      if (auto.start && auto.end) {
        setPeriodStartDate(auto.start);
        setPeriodEndDate(auto.end);
      }
    }
  };

  const handleDaysCoveredChange = (val: string) => {
    const num = val ? Number(val) : '';
    setDaysCovered(num);
    if (num && Number(num) > 0 && paymentDate) {
      const auto = calculatePeriodDates(paymentDate, num);
      if (auto.start && auto.end) {
        setPeriodStartDate(auto.start);
        setPeriodEndDate(auto.end);
      }
    }
  };

  const handleResetAutoPeriod = () => {
    if (paymentDate && daysCovered && Number(daysCovered) > 0) {
      const auto = calculatePeriodDates(paymentDate, daysCovered);
      if (auto.start && auto.end) {
        setPeriodStartDate(auto.start);
        setPeriodEndDate(auto.end);
      }
    }
  };

  const handleMonthlySalaryChange = (value: string) => {
    const salary = value ? Number(value) : '';
    setMonthlySalary(salary);
    setInstallmentAmount(
      salary === '' ? '' : getInstallmentAmount(salary, paymentFrequency)
    );
  };

  const handlePaymentFrequencyChange = (frequency: PaymentFrequency) => {
    setPaymentFrequency(frequency);
    setInstallmentAmount(
      monthlySalary === '' ? '' : getInstallmentAmount(Number(monthlySalary), frequency)
    );
  };

  const handlePaymentStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    const amount = Number(paymentAmount) || 0;
    if (status === 'partial') {
      const existingPaid = Number(paymentPaidAmount);
      setPaymentPaidAmount(
        existingPaid > 0 && existingPaid < amount ? existingPaid : amount / 2
      );
      return;
    }
    setPaymentPaidAmount(status === 'paid' ? amount : 0);
  };

  const resetAgreementForm = () => {
    setEditingAgreement(null);
    setSelectedClientId(clients[0]?.id || '');
    setAgreementType('إدارة إعلانات وتسويق كامل');
    setStartDate(todayYMD);
    setMonthlySalary(20000);
    setPaymentFrequency('monthly');
    setInstallmentAmount(20000);
    setAgreementNotes('');
  };

  const handleOpenAddAgreement = () => {
    resetAgreementForm();
    setShowAddAgreementModal(true);
  };

  const handleOpenEditAgreement = (agreement: Agreement) => {
    setEditingAgreement(agreement);
    setSelectedClientId(agreement.clientId);
    setAgreementType(agreement.agreementType);
    setStartDate(agreement.startDate);
    setMonthlySalary(agreement.monthlySalary);
    setPaymentFrequency(agreement.paymentFrequency);
    setInstallmentAmount(agreement.installmentAmount || getInstallmentAmount(agreement.monthlySalary, agreement.paymentFrequency));
    setAgreementNotes(agreement.notes || '');
    setShowAddAgreementModal(true);
  };

  const handleCloseAgreementModal = () => {
    setShowAddAgreementModal(false);
    setEditingAgreement(null);
  };

  const handleAddAgreementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !monthlySalary || !installmentAmount) return;

    const salary = Number(monthlySalary);
    const installment = Number(installmentAmount);
    if (!Number.isFinite(salary) || salary <= 0 || !Number.isFinite(installment) || installment <= 0) return;

    const agreementData = {
      agreementType,
      startDate,
      monthlySalary: salary,
      paymentFrequency,
      installmentAmount: installment,
      notes: agreementNotes
    };

    if (editingAgreement) {
      onUpdateAgreement(editingAgreement.id, agreementData);
    } else {
      onAddAgreement({
        clientId: selectedClientId,
        ...agreementData
      });
    }

    handleCloseAgreementModal();
    setAgreementNotes('');
  };

  const handleOpenAddPayment = (agr: Agreement) => {
    setEditingPaymentRecord(null);
    setPaymentAgreementId(agr.id);
    setSelectedClientId(agr.clientId);
    setPaymentAmount(agr.installmentAmount || agr.monthlySalary);
    
    const curToday = getLocalDateYMD();
    setPaymentDate(curToday);
    
    // Default days based on frequency: weekly -> 7, semi_monthly -> 15, monthly -> 30
    const defaultDays = agr.paymentFrequency === 'weekly' ? 7 : agr.paymentFrequency === 'semi_monthly' ? 15 : 30;
    setDaysCovered(defaultDays);

    const autoDates = calculatePeriodDates(curToday, defaultDays);
    setPeriodStartDate(autoDates.start);
    setPeriodEndDate(autoDates.end);

    setPaymentMethod('InstaPay');
    setPaymentStatus('paid');
    setPaymentPaidAmount(agr.installmentAmount || agr.monthlySalary);
    setPaymentNotes('');
    setFormError('');
    setShowAddPaymentModal(true);
  };

  const handleOpenEditPayment = (p: PaymentRecord) => {
    setEditingPaymentRecord(p);
    setPaymentAgreementId(p.agreementId || '');
    setSelectedClientId(p.clientId);
    const curDate = p.date || getLocalDateYMD();
    setPaymentDate(curDate);
    setPaymentAmount(p.amount);
    setPaymentMethod(p.method);
    setPaymentStatus(p.status);
    setPaymentPaidAmount(normalizePaymentAmounts(p.amount, p.status, p.paidAmount).paidAmount);
    const pDays = p.daysCovered !== undefined ? p.daysCovered : 7;
    setDaysCovered(pDays);
    
    if (p.periodStartDate && p.periodEndDate) {
      setPeriodStartDate(p.periodStartDate);
      setPeriodEndDate(p.periodEndDate);
    } else {
      const auto = calculatePeriodDates(curDate, pDays);
      setPeriodStartDate(auto.start);
      setPeriodEndDate(auto.end);
    }

    setPaymentNotes(p.notes || '');
    setFormError('');
    setShowAddPaymentModal(true);
  };

  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    const days = Number(daysCovered);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('قيمة الدفعة يجب أن تكون أكبر من صفر.');
      return;
    }
    if (daysCovered !== '' && (!Number.isInteger(days) || days < 1)) {
      setFormError('عدد الأيام يجب أن يكون رقمًا صحيحًا أكبر من صفر.');
      return;
    }
    if (periodStartDate && periodEndDate && periodStartDate > periodEndDate) {
      setFormError('تاريخ بداية الفترة يجب أن يسبق تاريخ النهاية.');
      return;
    }
    const rawPaid = Number(paymentPaidAmount);
    if (paymentStatus === 'partial' && (!Number.isFinite(rawPaid) || rawPaid <= 0 || rawPaid >= amount)) {
      setFormError('في الدفع الجزئي، المبلغ المدفوع يجب أن يكون أكبر من صفر وأقل من إجمالي الدفعة.');
      return;
    }
    const normalized = normalizePaymentAmounts(amount, paymentStatus, rawPaid);
    setFormError('');

    const formattedPeriod = (periodStartDate && periodEndDate)
      ? `من ${periodStartDate} إلى ${periodEndDate}`
      : undefined;

    if (editingPaymentRecord) {
      if (onUpdatePayment) {
        onUpdatePayment(editingPaymentRecord.id, {
          date: paymentDate,
          amount,
          ...normalized,
          method: paymentMethod,
          status: paymentStatus,
          daysCovered: daysCovered ? Number(daysCovered) : undefined,
          periodStartDate: periodStartDate || undefined,
          periodEndDate: periodEndDate || undefined,
          periodCovered: formattedPeriod,
          notes: paymentNotes
        });
      }
    } else {
      const agrObj = agreements.find((a) => a.id === paymentAgreementId);
      const clientIdToUse = agrObj ? agrObj.clientId : selectedClientId;
      const brandNameToUse = agrObj
        ? agrObj.brandName
        : (clients.find((c) => c.id === selectedClientId)?.brandName || '');

      onAddPayment({
        agreementId: paymentAgreementId || (agreements.find((a) => a.clientId === clientIdToUse)?.id || ''),
        clientId: clientIdToUse,
        brandName: brandNameToUse,
        date: paymentDate,
        amount,
        ...normalized,
        method: paymentMethod,
        status: paymentStatus,
        daysCovered: daysCovered ? Number(daysCovered) : undefined,
        periodStartDate: periodStartDate || undefined,
        periodEndDate: periodEndDate || undefined,
        periodCovered: formattedPeriod,
        notes: paymentNotes
      });
    }

    setShowAddPaymentModal(false);
    setEditingPaymentRecord(null);
    setPaymentNotes('');
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9F8F6] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E5E5E0] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-[#E07A48]/10 text-[#E07A48] rounded-2xl border border-[#E07A48]/20 shadow-xs shrink-0">
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#2D2D2A]">Accounts & Income Tracking</h1>
            <p className="text-[11px] sm:text-xs text-[#8E8E85] mt-0.5 sm:mt-1 font-medium">
              متابعة الحسابات و الدخل
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddAgreement}
          className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة اتفاق جديد (Add Agreement)</span>
        </button>
      </div>

      {/* 🔍 FILTER BAR SECTION (Brand & Date Range Filter) */}
      <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#E07A48]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-[#2D2D2A]">
              فلتر استعلام التحصيلات حسب البراند والفترة الزمنية 📊
            </h2>
          </div>

          {(filterClientId !== 'all' || filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setFilterClientId('all');
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="text-[11px] font-bold text-[#E07A48] hover:underline flex items-center gap-1 cursor-pointer bg-[#E07A48]/10 px-2.5 py-1 rounded-lg"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط الفلتر</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Filter 1: Brand */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#78786E] mb-1">
              البراند / العميل:
            </label>
            <select
              value={filterClientId}
              onChange={(e) => setFilterClientId(e.target.value)}
              className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] outline-none cursor-pointer"
            >
              <option value="all">جميع البراندات ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brandName}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Start Date */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#78786E] mb-1">
              من تاريخ (بداية المدة):
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] outline-none"
            />
          </div>

          {/* Filter 3: End Date */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#78786E] mb-1">
              إلى تاريخ (نهاية المدة):
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] outline-none"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS (DYNAMICALLY RESPONDING TO FILTERS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Filtered Total Collected */}
        <div className="bg-[#EBF6ED] border border-[#C2E3C7] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#2D5A27]">
              تحصيلات {selectedBrandName}
            </span>
            <div className="p-2 bg-[#2D5A27]/10 text-[#2D5A27] rounded-2xl border border-[#2D5A27]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#2D5A27] tracking-tight">
            {filteredTotalPaid.toLocaleString()} <span className="text-xs font-semibold text-[#2D5A27]">EGP</span>
          </div>
          <div className="text-[11px] text-[#2D5A27] font-bold mt-2">
            {filterStartDate || filterEndDate
              ? `إجمالي التحصيلات للفترة من (${filterStartDate || 'البداية'}) إلى (${filterEndDate || 'النهاية'})`
              : 'إجمالي التحصيلات المحصلة فعلياً حسب البراند والفترة المحددة'}
          </div>
        </div>

        {/* Card 2: Month Income */}
        <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#8E8E85]">
                {filterClientId === 'all'
                  ? 'إجمالي دخل الشهر'
                  : `دخل ${selectedBrandName}`}
              </span>
              <select
                value={selectedIncomeMonth}
                onChange={(e) => setSelectedIncomeMonth(e.target.value)}
                className="bg-white border border-[#E5E5E0] text-[11px] font-extrabold text-[#E07A48] rounded-lg px-2 py-0.5 outline-none cursor-pointer hover:border-[#E07A48]"
                title="تغيير الشهر المعروض"
              >
                {availableMonths.map((mKey) => (
                  <option key={mKey} value={mKey}>
                    {formatMonthLabel(mKey)}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-2.5 bg-[#E07A48]/10 text-[#E07A48] rounded-2xl border border-[#E07A48]/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#2D2D2A] tracking-tight">
            {totalMonthlyIncome.toLocaleString()} <span className="text-xs font-semibold text-[#8E8E85]">EGP</span>
          </div>
          <div className="text-[11px] text-[#E07A48] font-bold mt-2 flex items-center justify-between flex-wrap gap-1">
            <span>
              {monthlyPaidPayments.length > 0
                ? `محصلة من ${monthlyPaidPayments.length} دفعات في ${formatMonthLabel(selectedIncomeMonth)}`
                : `لا توجد تحصيلات مدفوعة لشهر ${formatMonthLabel(selectedIncomeMonth)}`}
            </span>
            {filterClientId !== 'all' && (
              <span className="text-[#8E8E85] font-normal text-[10px]">
                (إجمالي الكل: {totalAllBrandsMonthlyIncome.toLocaleString()} EGP)
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Unpaid Clients Count */}
        <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8E8E85]">عملاء لم يدفعوا بعد</span>
            <div className="p-2.5 bg-rose-500/10 text-rose-700 rounded-2xl border border-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-700 tracking-tight">
            {unpaidClientsCount} <span className="text-xs font-semibold text-[#8E8E85]">عملاء</span>
          </div>
          <div className="text-[11px] text-rose-700 font-bold mt-2">
            لديهم مستحقات معلقة أو متأخرة الدفع
          </div>
        </div>
      </div>

      {/* AGREEMENTS LIST SECTION */}
      <section className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 sm:pb-4 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-[#2D2D2A] flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#E07A48]" />
            <span>اتفاقيات العقود والرواتب الشهرية ({agreements.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agreements.map((agr) => {
            // Total collected amount from this brand since working with them
            const totalBrandCollected = payments
              .filter((p) => p.clientId === agr.clientId)
              .reduce((acc, curr) => acc + getPaymentCollectedAmount(curr), 0);

            return (
              <div
                key={agr.id}
                className="p-4 sm:p-5 bg-white border border-[#E5E5E0] hover:border-[#E07A48]/40 rounded-2xl space-y-3.5 transition shadow-xs flex flex-col justify-between"
              >
                {/* Agreement Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#F0F0EC] pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-extrabold text-[#2D2D2A] truncate">
                        {agr.brandName}
                      </h3>
                      <span className="text-[10px] font-bold text-[#E07A48] bg-[#E07A48]/10 px-2.5 py-0.5 rounded-full border border-[#E07A48]/20 shrink-0">
                        {agr.agreementType}
                      </span>
                    </div>
                  </div>

                  <div className="self-start sm:self-auto shrink-0">
                    <span className="text-xs sm:text-sm font-black text-[#2D2D2A] bg-[#F5F5F0] border border-[#E5E5E0] px-3 py-1 rounded-xl block">
                      {agr.monthlySalary.toLocaleString()} <span className="text-[10px] text-[#78786E]">EGP / شهرياً</span>
                    </span>
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F9F8F6] p-3 rounded-xl border border-[#E5E5E0]">
                  <div>
                    <span className="text-[10px] text-[#78786E] block mb-0.5">مدة الدفع</span>
                    <span className="font-bold text-[#2D2D2A]">
                      {agr.paymentFrequency === 'weekly'
                        ? 'أسبوعي'
                        : agr.paymentFrequency === 'semi_monthly'
                        ? 'نصف شهري'
                        : 'شهري'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#78786E] block mb-0.5">بداية الاتفاق</span>
                    <span className="font-semibold text-[#2D2D2A]">{agr.startDate}</span>
                  </div>
                </div>

                {/* Total Brand Collections & Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#F0F0EC] text-xs">
                  <div className="flex items-center gap-1.5 bg-[#EBF6ED] border border-[#C2E3C7] text-[#2D5A27] px-3 py-1.5 rounded-xl font-black text-xs">
                    <span>إجمالي تحصيلات البراند:</span>
                    <span className="text-sm font-black">{totalBrandCollected.toLocaleString()} EGP</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleOpenEditAgreement(agr)}
                      className="p-1.5 text-[#78786E] hover:text-[#E07A48] rounded-lg hover:bg-[#E07A48]/10 transition cursor-pointer"
                      title="تعديل الاتفاق"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenAddPayment(agr)}
                      className="px-3 py-1.5 bg-[#E07A48] hover:bg-[#C8662B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>تسجيل دفعة</span>
                    </button>
                    <button
                      onClick={() => onDeleteAgreement(agr.id)}
                      className="p-1.5 text-[#78786E] hover:text-[#9B2C1D] rounded-lg hover:bg-[#F9EBE6] transition cursor-pointer"
                      title="حذف العقد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PAYMENT TRACKING SECTION */}
      <section className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E0] pb-3 sm:pb-4 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[#2D2D2A] flex items-center gap-2">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#E07A48]" />
            <span>سجل المدفوعات والتحصيل (Payment Tracking)</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto min-w-0">
            <span className="text-xs text-[#78786E] font-medium shrink-0">تصفية حسب البراند:</span>
            <select
              value={filterClientId}
              onChange={(e) => setFilterClientId(e.target.value)}
              className="flex-1 sm:flex-none bg-white border border-[#E5E5E0] text-[#2D2D2A] text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-[#E07A48] min-w-0 max-w-full"
            >
              <option value="all">جميع العملاء ({payments.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brandName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MOBILE VIEW: CARDS */}
        <div className="block md:hidden space-y-3">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-[#78786E] text-xs bg-white rounded-2xl border border-[#E5E5E0]">
              لا توجد مدفوعات مسجلة لهذه الفلترة 📝
            </div>
          ) : (
            filteredPayments.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-[#E5E5E0] rounded-2xl p-4 space-y-3 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#F0F0EC] pb-2.5">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-[#2D2D2A] truncate">{p.brandName}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#78786E] mt-0.5">
                      <Calendar className="w-3 h-3 text-[#E07A48] shrink-0" />
                      <span>تاريخ الدفعة: {p.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditPayment(p)}
                      className="p-1.5 text-[#78786E] hover:text-[#E07A48] rounded-lg hover:bg-[#E07A48]/10 transition cursor-pointer"
                      title="تعديل الدفعة"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePayment(p.id)}
                      className="p-1.5 text-[#78786E] hover:text-[#9B2C1D] rounded-lg hover:bg-[#F9EBE6] transition cursor-pointer"
                      title="حذف الدفعة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                    <span className="text-[10px] text-[#78786E] block">القيمة</span>
                    <span className="font-extrabold text-[#2D2D2A] text-sm">
                      {p.amount.toLocaleString()} EGP
                    </span>
                  </div>

                  <div className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#E5E5E0]">
                    <span className="text-[10px] text-[#78786E] block">عدد الأيام والفترة</span>
                    <span className="font-bold text-[#E07A48] text-xs block">
                      {p.daysCovered ? `${p.daysCovered} يوم` : ''}
                      {p.periodStartDate && p.periodEndDate
                        ? ` (${p.periodStartDate} إلى ${p.periodEndDate})`
                        : p.periodCovered
                        ? ` (${p.periodCovered})`
                        : ''}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-xs font-semibold text-[#78786E]">طريقة وحالة الدفع:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#2D2D2A] bg-[#F5F5F0] px-2 py-1 rounded-lg border border-[#E5E5E0]">
                      {p.method}
                    </span>
                    <select
                      value={p.status}
                      onChange={(e) => onUpdatePaymentStatus(p.id, e.target.value as PaymentStatus)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1 border outline-none cursor-pointer transition ${
                        p.status === 'paid'
                          ? 'bg-[#EBF6ED] text-[#2D5A27] border-[#C2E3C7]'
                          : p.status === 'overdue'
                          ? 'bg-[#F9EBE6] text-[#9B2C1D] border-[#EACEC3]'
                          : 'bg-[#FEF6E6] text-[#A36813] border-[#FAD9A5]'
                      }`}
                    >
                      <option value="paid" className="bg-white text-[#2D5A27]">مدفوع ✅</option>
                      <option value="pending" className="bg-white text-[#A36813]">معلق ⏳</option>
                      <option value="overdue" className="bg-white text-[#9B2C1D]">متأخر 🔴</option>
                    </select>
                  </div>
                </div>

                {p.notes && (
                  <div className="text-[11px] text-[#78786E] bg-[#F9F8F6] p-2 rounded-lg border border-[#E5E5E0]">
                    <span className="font-bold">ملاحظات:</span> {p.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* DESKTOP VIEW: TABLE */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-[#E5E5E0] shadow-xs">
          <table className="w-full text-right text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E5E5E0] text-[#78786E] font-bold bg-[#F9F8F6]">
                <th className="p-3.5">البراند / العميل</th>
                <th className="p-3.5">تاريخ الدفعة</th>
                <th className="p-3.5">عدد الأيام والفترة</th>
                <th className="p-3.5">القيمة</th>
                <th className="p-3.5">طريقة الدفع</th>
                <th className="p-3.5">حالة الدفع</th>
                <th className="p-3.5">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#78786E]">
                    لا توجد مدفوعات مسجلة لهذه الفلترة 📝
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F9F8F6]/80 transition">
                    <td className="p-3.5 font-extrabold text-[#2D2D2A]">{p.brandName}</td>
                    <td className="p-3.5 text-[#2D2D2A] font-medium">{p.date}</td>
                    <td className="p-3.5 font-bold text-[#E07A48]">
                      <div>{p.daysCovered ? `${p.daysCovered} يوم` : '-'}</div>
                      <div className="text-[11px] text-[#78786E] font-medium mt-0.5">
                        {p.periodStartDate && p.periodEndDate
                          ? `من ${p.periodStartDate} إلى ${p.periodEndDate}`
                          : p.periodCovered || ''}
                      </div>
                    </td>
                    <td className="p-3.5 font-extrabold text-[#2D2D2A]">
                      {p.amount.toLocaleString()} EGP
                    </td>
                    <td className="p-3.5 text-[#2D2D2A] font-semibold">{p.method}</td>
                    <td className="p-3.5">
                      <select
                        value={p.status}
                        onChange={(e) => onUpdatePaymentStatus(p.id, e.target.value as PaymentStatus)}
                        className={`text-xs font-bold rounded-xl px-3 py-1.5 border outline-none cursor-pointer transition ${
                          p.status === 'paid'
                            ? 'bg-[#EBF6ED] text-[#2D5A27] border-[#C2E3C7]'
                            : p.status === 'overdue'
                            ? 'bg-[#F9EBE6] text-[#9B2C1D] border-[#EACEC3]'
                            : 'bg-[#FEF6E6] text-[#A36813] border-[#FAD9A5]'
                        }`}
                      >
                        <option value="paid" className="bg-white text-[#2D5A27]">مدفوع ✅</option>
                        <option value="pending" className="bg-white text-[#A36813]">معلق ⏳</option>
                        <option value="overdue" className="bg-white text-[#9B2C1D]">متأخر 🔴</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-[#78786E]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate max-w-[150px]">{p.notes || '-'}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditPayment(p)}
                            className="p-1 text-[#78786E] hover:text-[#E07A48] rounded-lg hover:bg-[#E07A48]/10 transition cursor-pointer"
                            title="تعديل الدفعة"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePayment(p.id)}
                            className="p-1 text-[#78786E] hover:text-[#9B2C1D] rounded-lg hover:bg-[#F9EBE6] transition cursor-pointer"
                            title="حذف الدفعة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL 1: ADD / EDIT AGREEMENT */}
      {showAddAgreementModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
              <div className="flex items-center gap-2 text-[#E07A48] font-bold text-base">
                {editingAgreement ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{editingAgreement ? 'تعديل الاتفاق (Edit Agreement)' : 'إضافة اتفاق عقد جديد (Add Agreement)'}</span>
              </div>
              <button
                onClick={handleCloseAgreementModal}
                className="text-[#8E8E85] hover:text-[#2D2D2A] text-xs"
              >
                إلغاء
              </button>
            </div>

            <form onSubmit={handleAddAgreementSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  اختر العميل
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={Boolean(editingAgreement)}
                  className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none disabled:bg-[#F0F0EC] disabled:text-[#8E8E85] disabled:cursor-not-allowed"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brandName} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  نوع الاتفاق
                </label>
                <input
                  type="text"
                  value={agreementType}
                  onChange={(e) => setAgreementType(e.target.value)}
                  placeholder="مثال: إدارة محتوى وإعلانات ممولة"
                  className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  بداية الاتفاق
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                    الراتب الشهري (EGP)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={monthlySalary}
                    onChange={(e) => handleMonthlySalaryChange(e.target.value)}
                    placeholder="20000"
                    className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                    مدة الدفع
                  </label>
                  <select
                    value={paymentFrequency}
                    onChange={(e) => handlePaymentFrequencyChange(e.target.value as PaymentFrequency)}
                    className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none font-bold cursor-pointer"
                  >
                    <option value="weekly">أسبوعي (Weekly)</option>
                    <option value="semi_monthly">نصف شهري (Semi-Monthly)</option>
                    <option value="monthly">شهري (Monthly)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  قيمة كل دفعة (EGP)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none font-bold"
                  required
                />
                <p className="text-[10px] text-[#8E8E85] mt-1">
                  تُحسب تلقائيًا حسب دورية الدفع ويمكن تعديلها قبل الحفظ.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">ملاحظات</label>
                <input
                  type="text"
                  value={agreementNotes}
                  onChange={(e) => setAgreementNotes(e.target.value)}
                  placeholder="ملاحظات العقد ومواعيد التحصيل..."
                  className="w-full bg-white border border-[#E5E5E0] focus:border-[#E07A48] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  {editingAgreement ? 'حفظ التعديلات' : 'حفظ الاتفاقية'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseAgreementModal}
                  className="px-4 bg-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#d8d8d2] transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD / EDIT PAYMENT */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#F9F8F6] border border-[#E5E5E0] rounded-3xl p-5 sm:p-8 w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 sticky top-0 bg-[#F9F8F6] z-10">
              <div className="flex items-center gap-2 text-[#E07A48] font-bold text-base">
                <CreditCard className="w-5 h-5" />
                <span>{editingPaymentRecord ? 'تعديل بيانات الدفعة المسجلة' : 'تسجيل دفعة محصلة'}</span>
              </div>
              <button
                onClick={() => {
                  setShowAddPaymentModal(false);
                  setEditingPaymentRecord(null);
                }}
                className="text-[#8E8E85] hover:text-[#2D2D2A] text-xs font-bold"
              >
                إلغاء
              </button>
            </div>

            <form onSubmit={handleAddPaymentSubmit} className="space-y-4">
              {formError && (
                <div role="alert" className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  {formError}
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#2D2D2A]">
                    تاريخ التحصيل (تاريخ الدفع)
                  </label>
                  {paymentDate && (
                    <span className="text-[11px] font-bold text-[#E07A48] bg-[#E07A48]/10 px-2 py-0.5 rounded-md">
                      يوم {getArabicDayName(paymentDate)}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => handlePaymentDateChange(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none font-bold focus:border-[#E07A48]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                    قيمة الدفعة (EGP)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => {
                      const nextAmount = e.target.value ? Number(e.target.value) : '';
                      setPaymentAmount(nextAmount);
                      if (paymentStatus === 'paid') setPaymentPaidAmount(nextAmount);
                      if (paymentStatus === 'pending' || paymentStatus === 'overdue') setPaymentPaidAmount(0);
                    }}
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs text-[#2D2D2A] outline-none font-bold focus:border-[#E07A48]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                    عدد الأيام المدفوعة
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={daysCovered}
                    onChange={(e) => handleDaysCoveredChange(e.target.value)}
                    placeholder="7"
                    className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs text-[#2D2D2A] outline-none font-bold focus:border-[#E07A48]"
                  />
                </div>
              </div>

              {/* COVERED PERIOD DATES SECTION */}
              <div className="p-3.5 bg-[#F5F5F0] border border-[#E5E5E0] rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-[#2D2D2A]">
                    الفترة الزمنية المغطاة (تحديد بالتاريخ) 📅
                  </label>
                  {daysCovered && paymentDate && (
                    <button
                      type="button"
                      onClick={handleResetAutoPeriod}
                      className="text-[10px] font-bold text-[#E07A48] hover:underline cursor-pointer bg-white px-2 py-0.5 rounded-md border border-[#E5E5E0]"
                      title="إعادة حساب الفترة تلقائياً من تاريخ الدفع"
                    >
                      إعادة الحساب التلقائي
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] text-[#78786E] font-medium mb-1">
                      من تاريخ (البداية):
                      {periodStartDate && (
                        <span className="text-[#E07A48] font-bold mr-1">
                          ({getArabicDayName(periodStartDate)})
                        </span>
                      )}
                    </span>
                    <input
                      type="date"
                      value={periodStartDate}
                      onChange={(e) => setPeriodStartDate(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs text-[#2D2D2A] outline-none font-bold focus:border-[#E07A48]"
                      required
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] text-[#78786E] font-medium mb-1">
                      إلى تاريخ (النهاية):
                      {periodEndDate && (
                        <span className="text-[#E07A48] font-bold mr-1">
                          ({getArabicDayName(periodEndDate)})
                        </span>
                      )}
                    </span>
                    <input
                      type="date"
                      value={periodEndDate}
                      onChange={(e) => setPeriodEndDate(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs text-[#2D2D2A] outline-none font-bold focus:border-[#E07A48]"
                      required
                    />
                  </div>
                </div>

                {paymentDate && daysCovered && Number(daysCovered) > 0 && periodStartDate && periodEndDate && (
                  <div className="text-[11px] bg-white p-2 rounded-xl border border-[#E5E5E0] text-[#78786E] leading-relaxed">
                    📌 <strong>حساب تلقائي:</strong> آخر <span className="text-[#E07A48] font-bold">{daysCovered} أيام</span> من يوم <span className="text-[#2D2D2A] font-bold">{getArabicDayName(periodStartDate)} ({periodStartDate})</span> حتى يوم <span className="text-[#2D2D2A] font-bold">{getArabicDayName(periodEndDate)} ({periodEndDate})</span> (تاريخ التحصيل).
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">طريقة الدفع</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none focus:border-[#E07A48]"
                >
                  <option value="InstaPay">InstaPay</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="فودافون كاش">فودافون كاش</option>
                  <option value="كارت إلكتروني">كارت إلكتروني</option>
                  <option value="نقداً (Cash)">نقداً (Cash)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">حالة الدفع</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none focus:border-[#E07A48]"
                >
                  <option value="paid">مدفوع ✅</option>
                  <option value="partial">دفع جزئي 🟦</option>
                  <option value="pending">معلق ⏳</option>
                  <option value="overdue">متأخر 🔴</option>
                </select>
              </div>

              {paymentStatus === 'partial' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/60 border border-blue-200 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 mb-1">المبلغ المدفوع</label>
                    <input
                      type="number"
                      min="0.01"
                      max={typeof paymentAmount === 'number' ? Math.max(0, paymentAmount - 0.01) : undefined}
                      step="0.01"
                      value={paymentPaidAmount}
                      onChange={(e) => setPaymentPaidAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-800 mb-1">المبلغ المتبقي</label>
                    <div className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-800">
                      {Math.max(0, Number(paymentAmount || 0) - Number(paymentPaidAmount || 0)).toLocaleString()} EGP
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">ملاحظات</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="ملاحظات الدفعة ورقم العملية..."
                  className="w-full bg-white border border-[#E5E5E0] rounded-xl px-4 py-2.5 text-xs text-[#2D2D2A] outline-none focus:border-[#E07A48]"
                />
              </div>

              <div className="pt-2 flex gap-3 sticky bottom-0 bg-[#F9F8F6] pb-1 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#E07A48] hover:bg-[#C8662B] text-white font-extrabold py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  {editingPaymentRecord ? 'حفظ التعديلات' : 'تأكيد وتسجيل الدفعة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPaymentModal(false);
                    setEditingPaymentRecord(null);
                  }}
                  className="px-4 bg-[#E5E5E0] text-[#2D2D2A] font-bold rounded-xl text-xs hover:bg-[#d8d8d2] transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
