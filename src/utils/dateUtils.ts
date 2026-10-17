/**
 * Date utility functions with ISO and Kazakh localization
 */

export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = padZero(date.getMonth() + 1);
  const d = padZero(date.getDate());
  return `${y}-${m}-${d}`;
}

export function getTodayDateString(customDate?: Date): string {
  const d = customDate || new Date();
  return formatDateToISO(d);
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Returns Monday (00:00:00) of the week containing the given date
 */
export function getStartOfWeek(dateStr: string): string {
  const date = parseISODate(dateStr);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return formatDateToISO(monday);
}

/**
 * Returns Sunday (23:59:59) of the week containing the given date
 */
export function getEndOfWeek(dateStr: string): string {
  const monday = parseISODate(getStartOfWeek(dateStr));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return formatDateToISO(sunday);
}

/**
 * Returns the first day of the month for dateStr
 */
export function getStartOfMonth(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return `${year}-${month}-01`;
}

/**
 * Returns the last day of the month for dateStr
 */
export function getEndOfMonth(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${padZero(month)}-${padZero(lastDay)}`;
}

const KAZAKH_MONTHS = [
  'қаңтар', 'ақпан', 'нарыз', 'сәуір', 'мамыр', 'маусым',
  'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'
];

const KAZAKH_DAYS_SHORT = ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'];

export function formatDateKazakh(dateStr: string, includeYear = true): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const monthName = KAZAKH_MONTHS[month - 1] || '';
    if (!includeYear) {
      return `${day} ${monthName}`;
    }
    return `${day} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatDayNameShort(dateStr: string): string {
  const d = parseISODate(dateStr);
  return KAZAKH_DAYS_SHORT[d.getDay()];
}

/**
 * Returns array of the last N days up to today
 */
export function getLastNDays(daysCount: number, endDateStr?: string): string[] {
  const end = parseISODate(endDateStr || getTodayDateString());
  const result: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    result.push(formatDateToISO(d));
  }
  return result;
}
