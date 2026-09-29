/** Story-clock and calendar helpers. Pure functions, no DOM access. */

const MIN_PER_HOUR = 60;

/** Base calendar day of the prototype: Tuesday, 29 September 2026. */
const BASE_DATE = new Date(2026, 8, 29);

export function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * MIN_PER_HOUR + minutes;
}

export function formatClock(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * MIN_PER_HOUR - 1, Math.round(minutes)));
  const hours = Math.floor(clamped / MIN_PER_HOUR);
  const mins = clamped % MIN_PER_HOUR;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function daypart(minutes: number): string {
  if (minutes < 12 * MIN_PER_HOUR) return 'Morning';
  if (minutes < 17 * MIN_PER_HOUR) return 'Afternoon';
  if (minutes < 18 * MIN_PER_HOUR) return 'Late Afternoon';
  if (minutes < 21 * MIN_PER_HOUR) return 'Evening';
  return 'Night';
}

/** e.g. "Afternoon — 16:42" for system story cards (PRD §10). */
export function systemTimeLabel(minutes: number): string {
  return `${daypart(minutes)} — ${formatClock(minutes)}`;
}

export function dateForDay(day: number): Date {
  const date = new Date(BASE_DATE);
  date.setDate(date.getDate() + (day - 1));
  return date;
}

export interface CalendarLabels {
  month: string;
  full: string;
  short: string;
}

export function calendarLabels(day: number): CalendarLabels {
  const date = dateForDay(day);
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const full = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const short = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  return { month, full, short };
}

export function isoDateForDay(day: number): string {
  const date = dateForDay(day);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ordinalWord(day: number): string {
  const words = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];
  return words[Math.min(day, words.length) - 1] ?? String(day);
}
