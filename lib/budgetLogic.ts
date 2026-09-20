import { BudgetAlarm } from '../types';
import { addCalendarDays, differenceInCalendarDays, formatLocalDate } from './dateUtils';

export const calculateBudgetEndDate = (startDate: string, expectedDays: number) => {
  const normalizedDays = Math.max(1, Math.trunc(expectedDays));
  return addCalendarDays(startDate, normalizedDays - 1);
};

export const getBudgetDaysRemaining = (endDate: string, today = formatLocalDate()) =>
  differenceInCalendarDays(endDate, today);

export const isBudgetRechargeUrgent = (
  alarm: BudgetAlarm,
  warningDays = 2,
  today = formatLocalDate()
) => {
  if (alarm.status === 'paused' || alarm.status === 'completed') return false;
  if (alarm.status === 'needs_recharge') return true;
  return getBudgetDaysRemaining(alarm.endDate, today) <= warningDays;
};
