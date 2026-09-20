const DAY_IN_MS = 24 * 60 * 60 * 1000;

const dateParts = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
};

export const formatLocalDate = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addCalendarDays = (value: string, days: number): string => {
  const { year, month, day } = dateParts(value);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
};

export const differenceInCalendarDays = (endDate: string, startDate: string): number => {
  const end = dateParts(endDate);
  const start = dateParts(startDate);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  return Math.round((endUtc - startUtc) / DAY_IN_MS);
};
