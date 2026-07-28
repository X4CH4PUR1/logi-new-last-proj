/**
 * Storage wrappers that never throw.
 *
 * localStorage can be unavailable (private browsing on some browsers) or full
 * (the gallery stores images as data URLs, and the quota is only ~5 MB). Both
 * failures are reported to the caller rather than crashing a render.
 */

function safeStorage(kind) {
  try {
    const s = window[kind];
    const probe = '__logi_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

const local = safeStorage('localStorage');
const session = safeStorage('sessionStorage');

/** True when localStorage is usable; the admin panel warns if it is not. */
export const hasLocalStorage = local !== null;

export function readJSON(key, fallback = null) {
  if (!local) return fallback;
  try {
    const raw = local.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * @returns {{ok: true} | {ok: false, reason: 'unavailable'|'quota'|'unknown'}}
 */
export function writeJSON(key, value) {
  if (!local) return { ok: false, reason: 'unavailable' };
  try {
    local.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    const quota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.code === 22);
    return { ok: false, reason: quota ? 'quota' : 'unknown' };
  }
}

export function remove(key) {
  if (local) local.removeItem(key);
}

export function readString(key, fallback = '') {
  if (!local) return fallback;
  return local.getItem(key) ?? fallback;
}

export function writeString(key, value) {
  if (local) {
    try {
      local.setItem(key, value);
    } catch {
      /* non-critical: language and theme fall back to defaults next visit */
    }
  }
}

/* --- session (admin unlock only, cleared when the tab closes) ------------- */

export function readSession(key) {
  return session ? session.getItem(key) : null;
}

export function writeSession(key, value) {
  if (session) {
    try {
      session.setItem(key, value);
    } catch {
      /* ignore */
    }
  }
}

export function clearSession(key) {
  if (session) session.removeItem(key);
}

/** Rough byte size of what we have stored, shown in Admin → Publish. */
export function usageBytes() {
  if (!local) return 0;
  let total = 0;
  for (let i = 0; i < local.length; i += 1) {
    const key = local.key(i);
    if (key && key.startsWith('logi:')) total += key.length + (local.getItem(key) || '').length;
  }
  return total * 2; // UTF-16 code units
}
