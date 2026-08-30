window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.tpl = (function () {

  const PROPERTIES = new Set(['value', 'checked', 'disabled', 'selected']);

  function queryAll(root, selector) {
    const nodes = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) nodes.unshift(root);
    return nodes;
  }

  function clone(name) {
    const el = document.getElementById(`tpl-${name}`);
    if (!el) throw new Error(`tpl.clone(): no <template id="tpl-${name}"> in index.html`);
    const root = el.content.firstElementChild;
    if (!root) throw new Error(`tpl.clone(): <template id="tpl-${name}"> has no root element`);
    return root.cloneNode(true);
  }

  function refs(root) {
    const out = {};
    for (const el of root.querySelectorAll('[data-ref]')) {
      out[el.dataset.ref] = el;
    }
    if (root.dataset && root.dataset.ref) out[root.dataset.ref] = root;
    return out;
  }

  function bind(root, data) {
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      for (const el of queryAll(root, `[data-bind="${key}"]`)) {
        el.textContent = value === null || value === false ? '' : String(value);
      }
    }
    return root;
  }

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

  function slot(root, name) {
    return queryAll(root, `[data-slot="${name}"]`)[0] ?? null;
  }

  function each(container, items, build) {
    const dom = Logi.core.dom;
    return dom.mount(container, items.map(build));
  }

  function toggle(el, condition) {
    el.hidden = !condition;
    return el;
  }

  function place(root, name, node) {
    const target = slot(root, name);
    if (node) target.replaceWith(node);
    else target.remove();
  }

  return { clone, refs, bind, bindAttr, slot, each, toggle, place };
})();
