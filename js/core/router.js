window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.router = (function () {

  const { ROUTES } = Logi.data.config;
  const KEYS_BY_PATH = new Map(ROUTES.map((r) => [r.path, r.key]));
  const PATHS_BY_KEY = new Map(ROUTES.map((r) => [r.key, r.path]));

  const listeners = new Set();
  let currentRoute = { key: 'home', segments: [] };

  function parse(hash = window.location.hash) {
    const raw = String(hash || '').replace(/^#\/?/, '');
    const segments = raw.split('/').filter(Boolean).map(decodeURIComponent);
    const head = segments.shift() ?? '';
    const key = KEYS_BY_PATH.get(head);
    return key ? { key, segments } : { key: 'home', segments: [] };
  }

  function current() {
    return currentRoute;
  }

  function href(key, ...segments) {
    const path = PATHS_BY_KEY.get(key) ?? '';
    return `#/${[path, ...segments.map(encodeURIComponent)].filter(Boolean).join('/')}`;
  }

  function go(key, segments = [], options = {}) {
    const target = href(key, ...segments);
    if (target === window.location.hash) return;
    if (options.replace) {
      window.history.replaceState(null, '', target);
      handleChange();
    } else {
      window.location.hash = target;
    }
  }

  function start(onChange) {
    if (onChange) listeners.add(onChange);
    window.addEventListener('hashchange', handleChange);
    handleChange({ initial: true });
    return () => window.removeEventListener('hashchange', handleChange);
  }

  function handleChange(meta = {}) {
    const next = parse();
    const changedPage = next.key !== currentRoute.key;
    currentRoute = next;

    for (const listener of listeners) {
      try {
        listener(next, { ...meta, changedPage });
      } catch (err) {
        console.error('[router] listener failed', err);
      }
    }
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { parse, current, href, go, start, subscribe };
})();
