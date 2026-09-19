import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  CreditCard,
  Banknote,
  PieChart
} from 'lucide-react';
import { PaymentRecord, PaymentStatus, UserRole } from '../../../types';

interface WeeklyPaymentsSectionProps {
  payments: PaymentRecord[];
  clientId: string;
  brandName: string;
  userRole: UserRole;
  onAddPayment?: (paymentData: Omit<PaymentRecord, 'id'>) => void;
  onUpdatePayment?: (id: string, paymentData: Partial<PaymentRecord>) => void;
  onUpdatePaymentStatus?: (id: string, status: PaymentStatus) => void;
  onDeletePayment?: (id: string) => void;
}

export const WeeklyPaymentsSection: React.FC<WeeklyPaymentsSectionProps> = ({
  payments,
  clientId,
  brandName,
  userRole,
  onAddPayment,
  onUpdatePayment,
  onUpdatePaymentStatus,
  onDeletePayment
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filters state (all, paid, pending, partial)
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'partial'>('all');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<PaymentRecord | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('مستحقات ميديا بايينج');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formPaidAmount, setFormPaidAmount] = useState<number | ''>('');
  const [formRemainingAmount, setFormRemainingAmount] = useState<number | ''>('');
  const [formPeriodStart, setFormPeriodStart] = useState(todayStr);
  const [formPeriodEnd, setFormPeriodEnd] = useState(todayStr);
  const [formMethod, setFormMethod] = useState('InstaPay');
  const [formStatus, setFormStatus] = useState<'paid' | 'pending' | 'partial'>('paid');
  const [formNotes, setFormNotes] = useState('');

  // Handle amount change - recalculate partial amounts if active
  const handleAmountChange = (val: number | '') => {
    setFormAmount(val);
    if (formStatus === 'partial' && typeof val === 'number') {
      const currentPaid = typeof formPaidAmount === 'number' ? formPaidAmount : 0;
      setFormRemainingAmount(Math.max(0, val - currentPaid));
    }
  };

  // Handle paid amount change in partial mode
  const handlePaidAmountChange = (val: number | '') => {
    setFormPaidAmount(val);
    const total = typeof formAmount === 'number' ? formAmount : 0;
    const paid = typeof val === 'number' ? val : 0;
    setFormRemainingAmount(Math.max(0, total - paid));
  };

  // Handle status selection in form
  const handleStatusChange = (newStatus: 'paid' | 'pending' | 'partial') => {
    setFormStatus(newStatus);
    const total = typeof formAmount === 'number' ? formAmount : 0;
    if (newStatus === 'paid') {
      setFormPaidAmount(total);
      setFormRemainingAmount(0);
    } else if (newStatus === 'pending') {
      setFormPaidAmount(0);
      setFormRemainingAmount(total);
    } else if (newStatus === 'partial') {
      const defaultPaid = total > 0 ? Math.round(total / 2) : '';
      setFormPaidAmount(defaultPaid);
      setFormRemainingAmount(typeof defaultPaid === 'number' ? total - defaultPaid : '');
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    if (userRole === 'employee') return;
    setEditingPayment(null);
    setFormTitle('مستحقات ميديا بايينج');
    setFormAmount('');
    setFormPaidAmount('');
    setFormRemainingAmount('');
    setFormPeriodStart(todayStr);
    setFormPeriodEnd(todayStr);
    setFormMethod('InstaPay');
    setFormStatus('paid');
    setFormNotes('');
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (pay: PaymentRecord) => {
    if (userRole === 'employee') return;
    setEditingPayment(pay);
    setFormTitle(pay.title || 'مستحقات ميديا بايينج');
    setFormAmount(pay.amount || '');

    const currentStatus: 'paid' | 'pending' | 'partial' =
      pay.status === 'partial'
        ? 'partial'
        : pay.status === 'paid'
        ? 'paid'
        : 'pending';

    setFormStatus(currentStatus);
    setFormPaidAmount(
      pay.paidAmount !== undefined
        ? pay.paidAmount
        : currentStatus === 'paid'
        ? pay.amount
        : 0
    );
    setFormRemainingAmount(
      pay.remainingAmount !== undefined
        ? pay.remainingAmount
        : currentStatus === 'pending'
        ? pay.amount
        : 0
    );

    setFormPeriodStart(pay.periodStartDate || pay.date || todayStr);
    setFormPeriodEnd(pay.periodEndDate || pay.date || todayStr);
    setFormMethod(pay.method || 'InstaPay');
    setFormNotes(pay.notes || '');
    setShowAddEditModal(true);
  };

  // Submit Add / Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount) return;

    const numAmount = Number(formAmount);
    let finalPaid = numAmount;
    let finalRemaining = 0;

    if (formStatus === 'partial') {
      finalPaid = formPaidAmount === '' ? 0 : Number(formPaidAmount);
      finalRemaining = formRemainingAmount === '' ? Math.max(0, numAmount - finalPaid) : Number(formRemainingAmount);
    } else if (formStatus === 'pending') {
      finalPaid = 0;
      finalRemaining = numAmount;
    }

    const periodCoveredText =
      formPeriodStart && formPeriodEnd
        ? `من ${formPeriodStart} إلى ${formPeriodEnd}`
        : formPeriodStart || formPeriodEnd || undefined;

    if (editingPayment && onUpdatePayment) {
      onUpdatePayment(editingPayment.id, {
        title: formTitle.trim() || 'مستحقات ميديا بايينج',
        category: 'media_buying_fees',
        amount: numAmount,
        paidAmount: finalPaid,
        remainingAmount: finalRemaining,
        date: formPeriodStart || todayStr,
        periodStartDate: formPeriodStart,
        periodEndDate: formPeriodEnd,
        periodCovered: periodCoveredText,
        method: formMethod,
        status: formStatus,
        notes: formNotes.trim() || undefined
      });
    } else if (onAddPayment) {
      onAddPayment({
        clientId,
        brandName,
        title: formTitle.trim() || 'مستحقات ميديا بايينج',
        category: 'media_buying_fees',
        amount: numAmount,
        paidAmount: finalPaid,
        remainingAmount: finalRemaining,
        date: formPeriodStart || todayStr,
        periodStartDate: formPeriodStart,
        periodEndDate: formPeriodEnd,
        periodCovered: periodCoveredText,
        method: formMethod,
        status: formStatus,
        notes: formNotes.trim() || undefined
      });
    }

    setShowAddEditModal(false);
    setEditingPayment(null);
  };

  // Quick Status Cycle (paid -> partial -> pending)
  const handleCycleStatus = (pay: PaymentRecord) => {
    if (userRole === 'employee' || !onUpdatePaymentStatus) return;
    const nextMap: Record<string, PaymentStatus> = {
      paid: 'partial',
      partial: 'pending',
      pending: 'paid',
      overdue: 'paid'
    };
    const nextStatus = nextMap[pay.status] || 'paid';
    onUpdatePaymentStatus(pay.id, nextStatus);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingPayment && onDeletePayment) {
      onDeletePayment(deletingPayment.id);
      setDeletingPayment(null);
    }
  };

  // Filter logic (status filter)
  const filteredPayments = payments.filter((p) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') {
      return p.status === 'pending' || p.status === 'overdue';
    }
    return p.status === statusFilter;
  });

  // Counters
  const paidCount = payments.filter((p) => p.status === 'paid').length;
  const pendingCount = payments.filter((p) => p.status === 'pending' || p.status === 'overdue').length;
  const partialCount = payments.filter((p) => p.status === 'partial').length;

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <h3 className="text-sm sm:text-base font-extrabold text-[#2D2D2A] flex items-center gap-2">
            <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A40]" />
            <span>Media Buying Fees</span>
          </h3>
          <span className="text-xs font-bold text-[#8E8E85] bg-white px-2 py-0.5 rounded-full border border-[#E5E5E0]">
            {filteredPayments.length} دفعة
          </span>
        </div>

        {userRole !== 'employee' && (
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل دفعة جديدة</span>
          </button>
        )}
      </div>

      {/* Sub-Filters: Status only (تم الدفع / لم يتم الدفع بعد / دفع جزئي) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap pb-1 pt-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            statusFilter === 'all'
              ? 'bg-[#2D2D2A] text-white'
              : 'bg-white text-[#2D2D2A] border border-[#E5E5E0] hover:bg-neutral-100'
          }`}
        >
          الكل ({payments.length})
        </button>

        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
            statusFilter === 'paid'
              ? 'bg-emerald-700 text-white'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>تم الدفع ({paidCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>لم يتم الدفع بعد ({pendingCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter('partial')}
          className={`px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
            statusFilter === 'partial'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-800 border border-blue-200/60 hover:bg-blue-100'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>دفع جزئي ({partialCount})</span>
        </button>
      </div>

      {/* Payments List / Cards */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-10 bg-white border border-[#E5E5E0] rounded-2xl text-[#8E8E85] text-xs space-y-3">
          <p>لا توجد دفعات مسجلة في Media Buying Fees حالياً 📋</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((pay) => {
            const isPartial = pay.status === 'partial';
            const isPaid = pay.status === 'paid';
            const isPending = pay.status === 'pending' || pay.status === 'overdue';

            const paidVal = pay.paidAmount !== undefined ? pay.paidAmount : (isPaid ? pay.amount : 0);
            const remainingVal = pay.remainingAmount !== undefined ? pay.remainingAmount : (isPending ? pay.amount : 0);

            return (
              <div
                key={pay.id}
                className={`p-3.5 sm:p-4 bg-white border rounded-2xl transition hover:shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4 ${
                  isPaid
                    ? 'border-[#E5E5E0] hover:border-emerald-300'
                    : isPartial
                    ? 'border-blue-200 bg-blue-50/20'
                    : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                {/* Top/Left Side: Title, Dates, Method, Notes */}
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-2xl shrink-0 ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700'
                        : isPartial
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h4 className="text-sm font-extrabold text-[#2D2D2A] truncate">
                        {pay.title || 'مستحقات ميديا بايينج'}
                      </h4>

                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        Media Buying Fees
                      </span>
                    </div>

                    {/* Period: من يوم كام ليوم كام & Method */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#8E8E85]">
                      <span className="flex items-center gap-1 font-bold text-[#2D2D2A]">
                        <Calendar className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                        {pay.periodStartDate && pay.periodEndDate ? (
                          <span className="text-[11px] sm:text-xs">
                            من <strong className="text-[#5A5A40]">{pay.periodStartDate}</strong> إلى{' '}
                            <strong className="text-[#5A5A40]">{pay.periodEndDate}</strong>
                          </span>
                        ) : (
                          <span className="text-[11px] sm:text-xs">{pay.periodCovered || pay.date}</span>
                        )}
                      </span>

                      <span className="flex items-center gap-1 bg-[#F5F5F0] px-2 py-0.5 rounded-lg text-[11px] text-[#2D2D2A] font-medium">
                        <CreditCard className="w-3 h-3 text-[#5A5A40] shrink-0" />
                        <span>{pay.method}</span>
                      </span>
                    </div>

                    {/* Notes */}
                    {pay.notes && (
                      <p className="text-[11px] sm:text-xs text-[#5A5A40] mt-1.5 bg-[#F9F8F6] px-2.5 py-1 rounded-xl inline-block border border-[#E5E5E0] max-w-full break-words">
                        📝 {pay.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom/Right Side: Amount Breakdown, Status Badge, Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-[#E5E5E0]">
                  {/* Amount Breakdown */}
                  <div className="text-start sm:text-end">
                    <div className="text-base sm:text-lg font-black text-[#2D2D2A]">
                      {pay.amount.toLocaleString()}{' '}
                      <span className="text-xs font-bold text-[#8E8E85]">EGP</span>
                    </div>

                    {/* If partial, show paid and remaining breakdown */}
                    {isPartial && (
                      <div className="text-[11px] text-[#8E8E85] font-semibold mt-0.5 flex items-center justify-start sm:justify-end gap-2">
                        <span className="text-emerald-700">
                          مدفوع: {paidVal.toLocaleString()} EGP
                        </span>
                        <span>•</span>
                        <span className="text-rose-700">
                          متبقي: {remainingVal.toLocaleString()} EGP
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Status Badge Group */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCycleStatus(pay)}
                      disabled={userRole === 'employee'}
                      title={userRole !== 'employee' ? 'اضغط لتغيير الحالة' : undefined}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                        userRole !== 'employee' ? 'cursor-pointer hover:opacity-85' : 'cursor-default'
                      } ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : isPartial
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isPaid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                      {isPartial && <PieChart className="w-3.5 h-3.5 text-blue-700" />}
                      {isPending && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                      <span>
                        {isPaid
                          ? 'تم الدفع'
                          : isPartial
                          ? 'دفع جزئي'
                          : 'لم يتم الدفع بعد'}
                      </span>
                    </button>

                    {/* Edit & Delete for Admin / Client */}
                    {userRole !== 'employee' && (
                      <div className="flex items-center gap-0.5 bg-[#F9F8F6] p-0.5 rounded-xl border border-[#E5E5E0]">
                        <button
                          onClick={() => handleOpenEdit(pay)}
                          className="p-1.5 text-neutral-500 hover:text-[#5A5A40] hover:bg-white rounded-lg transition cursor-pointer"
                          title="تعديل الدفعة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPayment(pay)}
                          className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="حذف الدفعة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal - Simple & Streamlined */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            {/* Simple Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
              <h3 className="font-extrabold text-base text-[#2D2D2A] flex items-center gap-2">
                <Banknote className="w-5 h-5 text-[#5A5A40]" />
                <span>{editingPayment ? 'تعديل دفعة' : 'تسجيل دفعة'}</span>
              </h3>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1.5 text-neutral-400 hover:text-[#2D2D2A] rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 mt-3.5">
              {/* Simple Title */}
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] mb-1">
                  وصف الدفعة
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مستحقات ميديا بايينج"
                  className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] mb-1">
                  إجمالي المبلغ (EGP) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formAmount}
                  onChange={(e) => handleAmountChange(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثال: 5000"
                  className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              {/* Period: من يوم كام ليوم كام */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] mb-1">
                    من يوم *
                  </label>
                  <input
                    type="date"
                    required
                    value={formPeriodStart}
                    onChange={(e) => setFormPeriodStart(e.target.value)}
                    className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] mb-1">
                    ليوم *
                  </label>
                  <input
                    type="date"
                    required
                    value={formPeriodEnd}
                    onChange={(e) => setFormPeriodEnd(e.target.value)}
                    className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] mb-1">
                  طريقة الدفع *
                </label>
                <select
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] cursor-pointer"
                >
                  <option value="InstaPay">InstaPay (إنستاباي)</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="فودافون كاش">فودافون كاش / محفظة إلكترونية</option>
                  <option value="كاش نقدي">كاش نقدي</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              {/* Payment Status: تم الدفع / لم يتم الدفع بعد / دفع جزئي */}
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] mb-1">
                  حالة الدفعة *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('paid')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      formStatus === 'paid'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-[#F9F8F6] text-emerald-800 border-[#E5E5E0] hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم الدفع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('pending')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      formStatus === 'pending'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                        : 'bg-[#F9F8F6] text-amber-800 border-[#E5E5E0] hover:bg-amber-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>لم يتم الدفع بعد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('partial')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      formStatus === 'partial'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-[#F9F8F6] text-blue-800 border-[#E5E5E0] hover:bg-blue-50'
                    }`}
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    <span>دفع جزئي</span>
                  </button>
                </div>
              </div>

              {/* Conditional Partial Payment Breakdown */}
              {formStatus === 'partial' && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in">
                  <p className="text-[11px] font-bold text-blue-900">
                    حدد المبلغ المدفوع والمبلغ المتبقي:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                        المبلغ المدفوع (EGP) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max={typeof formAmount === 'number' ? formAmount : undefined}
                        value={formPaidAmount}
                        onChange={(e) => handlePaidAmountChange(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="2500"
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-rose-800 mb-1">
                        المبلغ المتبقي (EGP) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formRemainingAmount}
                        onChange={(e) => setFormRemainingAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="2500"
                        className="w-full bg-white border border-rose-300 rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2D2A] focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] mb-1">ملاحظات (اختياري)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ملاحظات إضافية..."
                  className="w-full bg-[#F9F8F6] border border-[#E5E5E0] rounded-xl p-2.5 text-xs font-medium text-[#2D2D2A] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E0]">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#2D2D2A] font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                >
                  {editingPayment ? 'حفظ التعديلات' : 'تسجيل الدفعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] rounded-3xl max-w-sm w-full p-6 shadow-xl text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-black text-sm text-[#2D2D2A] mb-1">تأكيد حذف الدفعة</h4>
            <p className="text-xs text-[#8E8E85] mb-5">
              هل أنت متأكد من حذف دفعة "{deletingPayment.title || 'هذه الدفعة'}" بمبلغ{' '}
              {deletingPayment.amount.toLocaleString()} EGP؟
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingPayment(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#2D2D2A] font-bold rounded-xl text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-2xs"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

