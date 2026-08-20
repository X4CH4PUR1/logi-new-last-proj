window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.i18n = (function () {
  /**
   * Language handling.
   *
   * A label is resolved in three steps:
   *
   *   1. content.strings[lang][key]  — the owner's override from Admin → UI text
   *   2. locales/<lang>.js[key]      — the shipped translation
   *   3. locales/en.js[key]          — English, so a missing translation still
   *                                    renders something readable
   *
   * Editorial copy does not come through here; it lives in the content tree and
   * is read with `localise()`.
   */

  const ka = Logi.locales.ka;
  const en = Logi.locales.en;
  const ru = Logi.locales.ru;
  const { DEFAULT_LANGUAGE, LANGUAGE_CODES, LANGUAGES, STORAGE } = Logi.data.config;
  const storage = Logi.util.storage;
  const store = Logi.core.store;
  const { pick } = Logi.util.format;
  const BUNDLES = { ka, en, ru };

  let current = DEFAULT_LANGUAGE;
  const listeners = new Set();

  /* --------------------------------------------------------------------------
     Lifecycle
     -------------------------------------------------------------------------- */

  /**
   * Decides the starting language: a previous choice, else the browser's
   * preference if we speak it, else whatever the owner set as the site default.
   */
  function init() {
    const saved = storage.readString(STORAGE.lang, '');
    const settingsDefault = store.getContent().settings?.defaultLang;

    current = [saved, detectFromBrowser(), settingsDefault, DEFAULT_LANGUAGE].find(
      (code) => code && LANGUAGE_CODES.includes(code)
    );

    applyToDocument();
    if (isDevHost()) verifyBundles();
    return current;
  }

  /** There is no build step, so "development" simply means a local address. */
  function isDevHost() {
    return ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
  }

  function detectFromBrowser() {
    for (const tag of navigator.languages || [navigator.language || '']) {
      const base = String(tag).slice(0, 2).toLowerCase();
      if (LANGUAGE_CODES.includes(base)) return base;
    }
    return null;
  }

  /** Warns during local development if a locale file has drifted out of sync. */
  function verifyBundles() {
    const reference = Object.keys(en);
    for (const code of LANGUAGE_CODES) {
      const keys = new Set(Object.keys(BUNDLES[code]));
      const missing = reference.filter((k) => !keys.has(k));
      const extra = [...keys].filter((k) => !reference.includes(k));
      if (missing.length) console.warn(`[i18n] locales/${code}.js is missing:`, missing);
      if (extra.length) console.warn(`[i18n] locales/${code}.js has unknown keys:`, extra);
    }
  }

  /* --------------------------------------------------------------------------
     Reading
     -------------------------------------------------------------------------- */

  function getLang() {
    return current;
  }

  function getLanguages() {
    return LANGUAGES;
  }

  /**
   * Translates a UI key.
   * @param {string} key
   * @returns {string} the key itself if nothing matches, which makes gaps obvious
   */
  function t(key) {
    const overrides = store.getContent().strings?.[current];
    const override = overrides?.[key];
    if (typeof override === 'string' && override !== '') return override;
    return BUNDLES[current]?.[key] ?? en[key] ?? key;
  }

  /** The shipped translation for a key, ignoring overrides — used by the admin. */
  function base(key, lang = current) {
    return BUNDLES[lang]?.[key] ?? en[key] ?? '';
  }

  /** Every UI key, in the order they appear in locales/en.js. */
  function keys() {
    return Object.keys(en);
  }

  /** Reads a { ka, en, ru } value from the content tree in the active language. */
  function localise(value) {
    return pick(value, current);
  }

  /* --------------------------------------------------------------------------
     Writing
     -------------------------------------------------------------------------- */

  function setLang(code) {
    if (!LANGUAGE_CODES.includes(code) || code === current) return;
    current = code;
    storage.writeString(STORAGE.lang, code);
    applyToDocument();
    for (const listener of listeners) listener(code);
  }

  /** Keeps <html lang> honest, which screen readers and search engines rely on. */
  function applyToDocument() {
    const meta = LANGUAGES.find((l) => l.code === current);
    document.documentElement.lang = meta?.htmlLang || current;
  }

  /** @returns {() => void} unsubscribe */
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { init, getLang, getLanguages, t, base, keys, localise, setLang, subscribe };
})();
