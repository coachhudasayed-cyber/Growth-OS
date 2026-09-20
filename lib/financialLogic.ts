import { PaymentFrequency, PaymentRecord, PaymentStatus } from '../types';

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const getInstallmentAmount = (monthlySalary: number, frequency: PaymentFrequency): number => {
  if (!Number.isFinite(monthlySalary) || monthlySalary <= 0) return 0;
  const installments = frequency === 'weekly' ? 4 : frequency === 'semi_monthly' ? 2 : 1;
  return roundMoney(monthlySalary / installments);
};

export interface NormalizedPaymentAmounts {
  paidAmount: number;
  remainingAmount: number;
}

export const normalizePaymentAmounts = (
  amount: number,
  status: PaymentStatus,
  paidAmount?: number | null
): NormalizedPaymentAmounts => {
  const total = Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : 0;

  if (status === 'paid') return { paidAmount: total, remainingAmount: 0 };
  if (status === 'pending' || status === 'overdue') {
    return { paidAmount: 0, remainingAmount: total };
  }

  const requestedPaid = Number(paidAmount);
  const safePaid = Number.isFinite(requestedPaid)
    ? Math.min(total, Math.max(0, requestedPaid))
    : 0;
  const normalizedPaid = roundMoney(safePaid);
  return {
    paidAmount: normalizedPaid,
    remainingAmount: roundMoney(total - normalizedPaid)
  };
};

export const getPaymentCollectedAmount = (payment: PaymentRecord): number => {
  return normalizePaymentAmounts(
    Number(payment.amount),
    payment.status,
    payment.paidAmount
  ).paidAmount;
};

export const getPaymentOutstandingAmount = (payment: PaymentRecord): number => {
  return normalizePaymentAmounts(
    Number(payment.amount),
    payment.status,
    payment.paidAmount
  ).remainingAmount;
};

export interface PerformanceMetrics {
  roas: number | null;
  cpa: number | null;
  aov: number | null;
}

export const calculatePerformanceMetrics = (
  spend: number,
  orders: number,
  revenue: number
): PerformanceMetrics => ({
  roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : null,
  cpa: orders > 0 ? Number((spend / orders).toFixed(1)) : null,
  aov: orders > 0 ? Number((revenue / orders).toFixed(1)) : null
});

export const formatMetricMoney = (value: number | null): string =>
  value === null ? '' : `${value.toFixed(1)} EGP`;
