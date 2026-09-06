window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.i18n = (function () {

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


  function init() {
    const saved = storage.readString(STORAGE.lang, '');
    const settingsDefault = store.getContent().settings?.defaultLang;
    const offered = getLanguages().map((l) => l.code);

    current =
      [saved, detectFromBrowser(), settingsDefault, DEFAULT_LANGUAGE].find(
        (code) => code && offered.includes(code)
      ) ?? offered[0];

    applyToDocument();
    if (isDevHost()) verifyBundles();
    return current;
  }

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


  function getLang() {
    return current;
  }

  // The control room can take languages off the site; a language switched off here
  // disappears from the header and can no longer be chosen. Hiding every one of them
  // would leave nothing to read the site in, so that falls back to the full list.
  function getLanguages() {
    const hidden = new Set(store.getContent().settings?.hiddenLangs ?? []);
    const offered = LANGUAGES.filter((l) => !hidden.has(l.code));
    return offered.length ? offered : LANGUAGES;
  }

  function t(key) {
    const overrides = store.getContent().strings?.[current];
    const override = overrides?.[key];
    if (typeof override === 'string' && override !== '') return override;
    return BUNDLES[current]?.[key] ?? en[key] ?? key;
  }

  function base(key, lang = current) {
    return BUNDLES[lang]?.[key] ?? en[key] ?? '';
  }

  function keys() {
    return Object.keys(en);
  }

  function localise(value) {
    return pick(value, current);
  }


  function setLang(code) {
    if (!LANGUAGE_CODES.includes(code) || code === current) return;
    current = code;
    storage.writeString(STORAGE.lang, code);
    applyToDocument();
    for (const listener of listeners) listener(code);
  }

  function applyToDocument() {
    const meta = LANGUAGES.find((l) => l.code === current);
    document.documentElement.lang = meta?.htmlLang || current;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { init, getLang, getLanguages, t, base, keys, localise, setLang, subscribe };
})();
