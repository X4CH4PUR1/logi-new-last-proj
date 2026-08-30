window.Logi = window.Logi || {};
Logi.util = Logi.util || {};
Logi.util.format = (function () {

  function formatNumber(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('en-US').replace(/,/g, ' ');
  }

  function formatPrice(price, unit, perMonth) {
    const base = `€ ${formatNumber(price)}`;
    return unit === 'mo' ? `${base} ${perMonth}` : base;
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? String(iso) : iso;
  }

  function excerpt(text, max = 120) {
    const s = String(text || '').trim();
    if (s.length <= max) return s;
    const cut = s.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  }

  function pick(value, lang) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value !== 'object') return String(value);
    return value[lang] || value.en || Object.values(value).find(Boolean) || '';
  }

  function telHref(phone) {
    const s = String(phone || '').trim();
    const plus = s.startsWith('+') ? '+' : '';
    return `tel:${plus}${s.replace(/\D/g, '')}`;
  }

  function whatsappHref(number) {
    const digits = String(number || '').replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }

  function webHref(web) {
    const s = String(web || '').trim();
    if (!s) return '';
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
  }

  function makeId(prefix) {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function humanise(key) {
    return String(key)
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]+/g, ' ')
      .trim()
      .toUpperCase();
  }

  return { formatNumber, formatPrice, formatDate, excerpt, pick, telHref, whatsappHref, webHref, makeId, today, humanise };
})();
