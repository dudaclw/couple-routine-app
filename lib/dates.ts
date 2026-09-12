import { WeekdayKey } from './types';

const WEEKDAY_KEYS: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const WEEKDAYS_SUN_FIRST = WEEKDAY_KEYS;

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  sun: 'Dom',
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
};

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function weekdayKey(d: Date): WeekdayKey {
  return WEEKDAY_KEYS[d.getDay()];
}

export function isRoutineDueOn(recurrence: string[], d: Date): boolean {
  if (recurrence.includes('daily')) return true;
  return recurrence.includes(weekdayKey(d));
}

export function dateWindow(daysBefore: number, daysAfter: number, from: Date = new Date()): Date[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysBefore);
  return Array.from({ length: daysBefore + daysAfter + 1 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

export function formatHeaderDate(d: Date): string {
  const weekday = WEEKDAY_LABELS[weekdayKey(d)].toLowerCase();
  return `${d.getDate()} ${MONTH_LABELS[d.getMonth()]} · ${weekday}`;
}

export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTH_LABELS[m - 1]}`;
}
