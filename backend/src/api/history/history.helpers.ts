export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export function parseDateRange(filters: Record<string, unknown>): DateRange {
  const preset = filters.preset as string | undefined;
  const now = new Date();
  const end = filters.endDate
    ? new Date(filters.endDate as string)
    : new Date(now);
  end.setHours(23, 59, 59, 999);

  if (filters.startDate && filters.endDate) {
    return {
      startDate: new Date(filters.startDate as string),
      endDate: end,
    };
  }

  const start = new Date(end);
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return { startDate: start, endDate: end };
    case '7d':
      start.setDate(start.getDate() - 7);
      return { startDate: start, endDate: end };
    case '30d':
      start.setDate(start.getDate() - 30);
      return { startDate: start, endDate: end };
    case '90d':
      start.setDate(start.getDate() - 90);
      return { startDate: start, endDate: end };
    case '6m':
      start.setMonth(start.getMonth() - 6);
      return { startDate: start, endDate: end };
    case '12m':
      start.setFullYear(start.getFullYear() - 1);
      return { startDate: start, endDate: end };
    default:
      if (filters.startDate) {
        return {
          startDate: new Date(filters.startDate as string),
          endDate: filters.endDate ? end : undefined,
        };
      }
      return {};
  }
}

export function applyDateFilter(
  field: string,
  range: DateRange
): Record<string, unknown> | undefined {
  if (!range.startDate && !range.endDate) return undefined;
  const clause: Record<string, Date> = {};
  if (range.startDate) clause.gte = range.startDate;
  if (range.endDate) clause.lte = range.endDate;
  return { [field]: clause };
}

export function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}
