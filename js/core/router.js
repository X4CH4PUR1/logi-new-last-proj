window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.router = (function () {
  /**
   * Hash router.
   *
   * Hash routing rather than the History API, because GitHub Pages serves static
   * files only: `/products` would 404 on a hard refresh, `#/products` never does.
   *
   * A location is parsed into a route key plus any extra path segments, so views
   * can own deep links without the router knowing what they mean:
   *
   *   #/                  -> { key: 'home',     segments: [] }
   *   #/products          -> { key: 'products', segments: [] }
   *   #/products/p1       -> { key: 'products', segments: ['p1'] }
   *   #/control-room/gallery -> { key: 'admin', segments: ['gallery'] }
   *   #/nonsense          -> { key: 'home',     segments: [] }
   */

  const { ROUTES } = Logi.data.config;
  const KEYS_BY_PATH = new Map(ROUTES.map((r) => [r.path, r.key]));
  const PATHS_BY_KEY = new Map(ROUTES.map((r) => [r.key, r.path]));

  const listeners = new Set();
  /** @type {{key: string, segments: string[]}} */
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

  /** Builds a href for a route key, e.g. href('products', 'p1') -> '#/products/p1'. */
  function href(key, ...segments) {
    const path = PATHS_BY_KEY.get(key) ?? '';
    return `#/${[path, ...segments.map(encodeURIComponent)].filter(Boolean).join('/')}`;
  }

  /**
   * Changes the route.
   * @param {{replace?: boolean}} [options] replace the history entry instead of
   *        pushing one — used when a modal closes, so Back does not reopen it
   */
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

  /** Starts listening and fires the first navigation. */
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

  /** @returns {() => void} unsubscribe */
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { parse, current, href, go, start, subscribe };
})();
