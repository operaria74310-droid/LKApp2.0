export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

/**
 * Adds months to a date YYYY-MM-DD preserving the day of month.
 * If next month has fewer days (e.g. Jan 31 -> Feb 28), it caps to the last day.
 */
export function addMonthsPreservingDay(dateStr: string, monthsToAdd: number): string {
  if (!dateStr) return getTodayISO();
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-indexed
  const targetDay = parseInt(dayStr, 10);

  const totalMonths = month + monthsToAdd;
  const nextYear = year + Math.floor((totalMonths - 1) / 12);
  const nextMonth = ((totalMonths - 1) % 12) + 1;

  // Get max days in the target month
  const daysInNextMonth = new Date(nextYear, nextMonth, 0).getDate();
  const finalDay = Math.min(targetDay, daysInNextMonth);

  const mm = String(nextMonth).padStart(2, '0');
  const dd = String(finalDay).padStart(2, '0');
  return `${nextYear}-${mm}-${dd}`;
}

export function addOneMonthPreservingDay(dateStr: string): string {
  return addMonthsPreservingDay(dateStr, 1);
}

export function addDays(dateStr: string, daysToAdd: number): string {
  const date = parseISODate(dateStr);
  date.setDate(date.getDate() + daysToAdd);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // Noon to avoid timezone boundary issues
}

export interface DateDiffInfo {
  status: 'today' | 'overdue' | 'upcoming' | 'future';
  diffDays: number;
  label: string;
}

export function getDateDiffInfo(dueDateStr: string): DateDiffInfo {
  const todayStr = getTodayISO();
  if (dueDateStr === todayStr) {
    return {
      status: 'today',
      diffDays: 0,
      label: 'Vence Hoje!',
    };
  }

  const due = parseISODate(dueDateStr).getTime();
  const today = parseISODate(todayStr).getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((due - today) / oneDay);

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      status: 'overdue',
      diffDays,
      label: overdueDays === 1 ? 'Atrasado há 1 dia' : `Atrasado há ${overdueDays} dias`,
    };
  }

  if (diffDays <= 7) {
    return {
      status: 'upcoming',
      diffDays,
      label: diffDays === 1 ? 'Vence amanhã' : `Vence em ${diffDays} dias`,
    };
  }

  return {
    status: 'future',
    diffDays,
    label: `Vence em ${diffDays} dias`,
  };
}
