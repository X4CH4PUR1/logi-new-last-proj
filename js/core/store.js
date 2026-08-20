window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.store = (function () {
  /**
   * The content store.
   *
   * Content is layered, lowest priority first:
   *
   *   1. js/data/defaults.js   — shipped with the code, the factory reset state
   *   2. data/content.json     — what is published and live for every visitor
   *   3. localStorage draft    — unpublished edits, visible only in this browser
   *
   * Layers 1 and 2 are deep-merged; the draft, when present, replaces the result
   * outright (it was itself derived from that merge, so it is already complete).
   *
   * A draft that turns out to be identical to the published content is dropped
   * on load. That means the "unpublished changes" badge clears itself the moment
   * the owner's commit goes live, with no extra step to remember.
   */

  const { DEFAULT_CONTENT } = Logi.data.defaults;
  const { CONTENT_URL, STORAGE } = Logi.data.config;
  const storage = Logi.util.storage;
  /** @type {object} the merge of defaults + content.json */
  let published = null;
  /** @type {object} what the site actually renders */
  let content = null;
  /** @type {boolean} true when a local draft differs from published */
  let dirty = false;
  /** @type {Set<Function>} */
  const listeners = new Set();
  /** @type {{ok: boolean, reason?: string}} result of the last save attempt */
  let lastSave = { ok: true };

  /* --------------------------------------------------------------------------
     Pure helpers
     -------------------------------------------------------------------------- */

  const isPlainObject = (v) =>
    v !== null && typeof v === 'object' && !Array.isArray(v);

  function clone(value) {
    return typeof structuredClone === 'function'
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  /**
   * Deep-merges `patch` onto `base`. Arrays are replaced, not concatenated —
   * if the owner deletes a product, the shorter array must win.
   */
  function merge(base, patch) {
    if (!isPlainObject(patch)) return patch === undefined ? clone(base) : clone(patch);
    const out = isPlainObject(base) ? clone(base) : {};
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) continue;
      out[key] = isPlainObject(value) && isPlainObject(out[key])
        ? merge(out[key], value)
        : clone(value);
    }
    return out;
  }

  /** Key-order-independent serialisation, so equality checks are meaningful. */
  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (isPlainObject(value)) {
      return `{${Object.keys(value)
        .sort()
        .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
        .join(',')}}`;
    }
    return JSON.stringify(value === undefined ? null : value);
  }

  const sameContent = (a, b) => stableStringify(a) === stableStringify(b);

  /* --------------------------------------------------------------------------
     Lifecycle
     -------------------------------------------------------------------------- */

  /**
   * Loads every layer. Resolves even when the network fetch fails, because a
   * missing content.json is the normal state of a fresh clone.
   */
  async function init() {
    published = merge(DEFAULT_CONTENT, await fetchPublished());

    const draft = storage.readJSON(STORAGE.content, null);
    if (draft && typeof draft === 'object') {
      if (sameContent(draft, published)) {
        // The draft has since been published — retire it silently.
        storage.remove(STORAGE.content);
        content = clone(published);
        dirty = false;
      } else {
        content = migrate(draft);
        dirty = true;
      }
    } else {
      content = clone(published);
      dirty = false;
    }

    return content;
  }

  async function fetchPublished() {
    try {
      const res = await fetch(CONTENT_URL, { cache: 'no-cache' });
      if (!res.ok) return {};
      return await res.json();
    } catch {
      // No content.json yet, offline, or opened via file:// — defaults are fine.
      return {};
    }
  }

  /**
   * Brings an older draft up to the current shape. Only version 1 exists so far,
   * so this just backfills anything a draft predates.
   */
  function migrate(draft) {
    const out = merge(published, draft);
    out.version = DEFAULT_CONTENT.version;
    return out;
  }

  /* --------------------------------------------------------------------------
     Reading
     -------------------------------------------------------------------------- */

  function getContent() {
    if (!content) throw new Error('store.init() must finish before getContent()');
    return content;
  }

  function getPublished() {
    return published;
  }

  function isDirty() {
    return dirty;
  }

  function getLastSave() {
    return lastSave;
  }

  /* --------------------------------------------------------------------------
     Writing
     -------------------------------------------------------------------------- */

  /**
   * Applies a mutation and persists it.
   *
   * The mutator receives a working copy, so a half-finished edit can never leave
   * the store in a broken state — if it throws, nothing is committed.
   *
   * @param {(draft: object) => void} mutator
   * @param {{silent?: boolean}} [options] skip notifying subscribers
   */
  function update(mutator, options = {}) {
    const draft = clone(content);
    mutator(draft);

    content = draft;
    dirty = !sameContent(content, published);

    lastSave = dirty
      ? storage.writeJSON(STORAGE.content, content)
      : (storage.remove(STORAGE.content), { ok: true });

    if (!options.silent) notify();
    return lastSave;
  }

  /** Discards the local draft and goes back to what is published. */
  function revertToPublished() {
    storage.remove(STORAGE.content);
    content = clone(published);
    dirty = false;
    notify();
  }

  /** Discards everything, including content.json, back to the shipped defaults. */
  function resetToDefaults() {
    storage.remove(STORAGE.content);
    content = clone(DEFAULT_CONTENT);
    dirty = !sameContent(content, published);
    if (dirty) storage.writeJSON(STORAGE.content, content);
    notify();
  }

  /** Replaces all content, e.g. when importing a backup file. */
  function replaceAll(next) {
    if (!isPlainObject(next)) throw new Error('Backup file is not a content object.');
    update((draft) => {
      for (const key of Object.keys(draft)) delete draft[key];
      Object.assign(draft, merge(DEFAULT_CONTENT, next));
    });
  }

  /* --------------------------------------------------------------------------
     Subscriptions
     -------------------------------------------------------------------------- */

  /** @returns {() => void} unsubscribe */
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function notify() {
    for (const listener of listeners) {
      try {
        listener(content);
      } catch (err) {
        console.error('[store] subscriber failed', err);
      }
    }
  }

  /* --------------------------------------------------------------------------
     Export
     -------------------------------------------------------------------------- */

  /** The exact text that should be saved as data/content.json. */
  function toJSON() {
    return `${JSON.stringify(content, null, 2)}\n`;
  }

  return { clone, merge, init, getContent, getPublished, isDirty, getLastSave, update, revertToPublished, resetToDefaults, replaceAll, subscribe, toJSON };
})();
