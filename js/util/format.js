/**
 * Formatting helpers.
 * Pure functions only — nothing here touches the DOM or the store.
 */

/**
 * Groups thousands with a thin space: 7000 -> "7 000".
 * A space rather than a comma or a dot, because the site is read in three
 * languages that disagree about which of those means "decimal point".
 */
export function formatNumber(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('en-US').replace(/,/g, ' ');
}

/**
 * Builds a displayable price.
 * @param {number|string} price
 * @param {string} unit    '' for a one-off price, 'mo' for a monthly rate
 * @param {string} perMonth  the localised "/mo" suffix
 */
export function formatPrice(price, unit, perMonth) {
  const base = `€ ${formatNumber(price)}`;
  return unit === 'mo' ? `${base} ${perMonth}` : base;
}

/** ISO date (YYYY-MM-DD) as-is; anything unparseable is passed straight back. */
export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : iso;
}

/** Trims to `max` characters on a word boundary and appends an ellipsis. */
export function excerpt(text, max = 120) {
  const s = String(text || '').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Picks the right translation out of a { ka, en, ru } value.
 * Falls back to English, then to the first non-empty language, then to ''.
 * Plain strings are returned unchanged so callers do not have to type-check.
 */
export function pick(value, lang) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  return value[lang] || value.en || Object.values(value).find(Boolean) || '';
}

/** Strips everything but digits and a leading + so a phone works in tel:. */
export function telHref(phone) {
  const s = String(phone || '').trim();
  const plus = s.startsWith('+') ? '+' : '';
  return `tel:${plus}${s.replace(/\D/g, '')}`;
}

/** Prefixes a bare domain with https:// so it works as an href. */
export function webHref(web) {
  const s = String(web || '').trim();
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

/** Short, collision-resistant id for newly created records. */
export function makeId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Today as YYYY-MM-DD, for prefilling the news date field. */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Turns a camelCase key into a readable label: heroTitle -> "HERO TITLE". */
export function humanise(key) {
  return String(key)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toUpperCase();
}
