window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.tpl = (function () {
  /**
   * Clones markup out of the <template id="tpl-..."> library in index.html,
   * and binds data onto the clone via a handful of data-* attributes. This is
   * the counterpart to dom.js's h(): h() builds a tree from JS, tpl reads one
   * that a developer already wrote as plain HTML.
   *
   * Binding attributes, all read off the clone after tpl.clone():
   *   data-bind="key"            textContent = data[key], on every match
   *   data-bind-attr="a:k,b:k2"  setAttribute(a, data[k]) (or el[a] = data[k]
   *                               for value/checked/disabled/selected, same
   *                               property-vs-attribute split h() makes)
   *   data-ref="name"            collected by refs() into { name: element }
   *   data-slot="name"           loop container, found by slot()
   *
   * Templates must be flat, top-level siblings under #templates — never
   * nested inside another <template> — because elements inside another
   * template's inert content are unreachable via getElementById.
   *
   * Text only ever goes in through textContent/setAttribute here, same as
   * dom.js's h(): admin-editable content can never be parsed as markup.
   */

  const PROPERTIES = new Set(['value', 'checked', 'disabled', 'selected']);

  /**
   * `root.querySelectorAll` alone would miss `root` itself — querySelectorAll
   * never matches its own context node — which matters here because the
   * clone root is often the single bind target (e.g. <template id="tpl-badge">
   * is just one <span data-bind="label">). This includes it when it matches.
   */
  function queryAll(root, selector) {
    const nodes = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) nodes.unshift(root);
    return nodes;
  }

  /** @param {string} name e.g. 'product-card' for <template id="tpl-product-card"> */
  function clone(name) {
    const el = document.getElementById(`tpl-${name}`);
    if (!el) throw new Error(`tpl.clone(): no <template id="tpl-${name}"> in index.html`);
    const root = el.content.firstElementChild;
    if (!root) throw new Error(`tpl.clone(): <template id="tpl-${name}"> has no root element`);
    return root.cloneNode(true);
  }

  /** @returns {Record<string, Element>} every [data-ref] descendant of `root`, keyed by name */
  function refs(root) {
    const out = {};
    for (const el of root.querySelectorAll('[data-ref]')) {
      out[el.dataset.ref] = el;
    }
    if (root.dataset && root.dataset.ref) out[root.dataset.ref] = root;
    return out;
  }

  /** Sets textContent on every [data-bind="key"] match (including `root` itself) for each key present in `data`. */
  function bind(root, data) {
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      for (const el of queryAll(root, `[data-bind="${key}"]`)) {
        el.textContent = value === null || value === false ? '' : String(value);
      }
    }
    return root;
  }

  /** Sets attributes/properties on every [data-bind-attr] match (including `root` itself), per its own key list. */
  function bindAttr(root, data) {
    for (const el of queryAll(root, '[data-bind-attr]')) {
      for (const pair of el.dataset.bindAttr.split(',')) {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (!attr || !key || !(key in data)) continue;
        const value = data[key];
        if (value === undefined) continue;
        if (PROPERTIES.has(attr)) el[attr] = value;
        else el.setAttribute(attr, value === true ? '' : String(value));
      }
    }
    return root;
  }

  /** @returns {Element|null} the [data-slot="name"] match, including `root` itself if it matches. */
  function slot(root, name) {
    return queryAll(root, `[data-slot="${name}"]`)[0] ?? null;
  }

  /** Replaces `container`'s children with `items.map(build)`. */
  function each(container, items, build) {
    const dom = Logi.core.dom;
    return dom.mount(container, items.map(build));
  }

  /** `el.hidden = !condition`. */
  function toggle(el, condition) {
    el.hidden = !condition;
    return el;
  }

  /**
   * Swaps the [data-slot="name"] placeholder for `node` (or removes the
   * placeholder if `node` is falsy). For a single self-contained child built
   * by another function (media(), badgeRow(), ...) that must sit directly
   * among its parent's children, not wrapped in an extra container — unlike
   * each(), which loops children *into* a slot that stays in the DOM.
   */
  function place(root, name, node) {
    const target = slot(root, name);
    if (node) target.replaceWith(node);
    else target.remove();
  }

  return { clone, refs, bind, bindAttr, slot, each, toggle, place };
})();
