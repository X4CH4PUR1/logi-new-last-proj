window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.store = (function () {

  const { DEFAULT_CONTENT } = Logi.data.defaults;
  const { CONTENT_URL, STORAGE } = Logi.data.config;
  const storage = Logi.util.storage;
  let published = null;
  let content = null;
  let dirty = false;
  const listeners = new Set();
  let lastSave = { ok: true };


  const isPlainObject = (v) =>
    v !== null && typeof v === 'object' && !Array.isArray(v);

  function clone(value) {
    return typeof structuredClone === 'function'
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

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


  async function init() {
    published = merge(DEFAULT_CONTENT, await fetchPublished());

    const draft = storage.readJSON(STORAGE.content, null);
    if (draft && typeof draft === 'object') {
      if (sameContent(draft, published)) {
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
      return {};
    }
  }

  function migrate(draft) {
    const out = merge(published, draft);
    out.version = DEFAULT_CONTENT.version;
    return out;
  }


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

  function revertToPublished() {
    storage.remove(STORAGE.content);
    content = clone(published);
    dirty = false;
    notify();
  }

  function resetToDefaults() {
    storage.remove(STORAGE.content);
    content = clone(DEFAULT_CONTENT);
    dirty = !sameContent(content, published);
    if (dirty) storage.writeJSON(STORAGE.content, content);
    notify();
  }

  function replaceAll(next) {
    if (!isPlainObject(next)) throw new Error('Backup file is not a content object.');
    update((draft) => {
      for (const key of Object.keys(draft)) delete draft[key];
      Object.assign(draft, merge(DEFAULT_CONTENT, next));
    });
  }


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


  function toJSON() {
    return `${JSON.stringify(content, null, 2)}\n`;
  }

  return { clone, merge, init, getContent, getPublished, isDirty, getLastSave, update, revertToPublished, resetToDefaults, replaceAll, subscribe, toJSON };
})();
