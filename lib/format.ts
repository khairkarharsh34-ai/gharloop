// Small formatting helpers (no extra libraries, same output on every phone).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const d = (v: string | Date) => (typeof v === 'string' ? new Date(v) : v);
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** "9:30 AM" */
export function time(v: string | Date) {
  const x = d(v);
  const h = x.getHours();
  const m = x.getMinutes();
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`;
}

/** "Today", "Tomorrow", "Sat 8 Nov" */
export function day(v: string | Date) {
  const x = d(v);
  const now = new Date();
  const tmr = new Date(now);
  tmr.setDate(now.getDate() + 1);
  const yst = new Date(now);
  yst.setDate(now.getDate() - 1);
  if (sameDay(x, now)) return 'Today';
  if (sameDay(x, tmr)) return 'Tomorrow';
  if (sameDay(x, yst)) return 'Yesterday';
  return `${DAYS[x.getDay()]} ${x.getDate()} ${MONTHS[x.getMonth()]}`;
}

/** "Today · 9:30 AM" */
export const when = (v: string | Date) => `${day(v)} · ${time(v)}`;

/** "8 Nov" */
export const shortDate = (v: string | Date) => `${d(v).getDate()} ${MONTHS[d(v).getMonth()]}`;

/** Calendar badge parts: { dow: 'SAT', date: '8', month: 'NOV' } */
export const badge = (v: string | Date) => ({
  dow: DAYS[d(v).getDay()].toUpperCase(),
  date: String(d(v).getDate()),
  month: MONTHS[d(v).getMonth()].toUpperCase(),
});

/** "just now", "5 min ago", "3 h ago", "2 d ago" */
export function ago(v: string | Date) {
  const s = Math.max(0, (Date.now() - d(v).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return shortDate(v);
}

/** Indian grouping: 840000 → "₹8,40,000" */
export function rupees(n: number) {
  const neg = n < 0;
  const s = String(Math.round(Math.abs(n)));
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${neg ? '−' : ''}₹${rest ? rest + ',' : ''}${last3}`;
}

/** Short form for big numbers: 4251500 → "₹42.5L", 12000 → "₹12K" */
export function rupeesShort(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(1).replace(/\.0$/, '')}L`;
  if (a >= 1e3) return `${sign}₹${(a / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return rupees(n);
}

/** "B-904" from tower + flat */
export const flatOf = (p?: { tower?: string | null; flat?: string | null } | null) =>
  p ? [p.tower, p.flat].filter(Boolean).join('-') : '';

/** Local YYYY-MM-DD for date columns. */
export function isoDate(x: Date) {
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
