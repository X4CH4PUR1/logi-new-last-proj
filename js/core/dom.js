window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.dom = (function () {

  const TAG_RE = /^([a-zA-Z0-9-]+)?((?:\.[^.#]+)*)(?:#([^.#]+))?$/;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SVG_TAGS = new Set(['svg', 'path', 'circle', 'rect', 'g', 'line', 'polygon']);

  function h(tag, props = {}, ...children) {
    const match = TAG_RE.exec(tag);
    if (!match) throw new Error(`h(): cannot parse tag "${tag}"`);

    const [, name = 'div', classPart, id] = match;
    const el = SVG_TAGS.has(name)
      ? document.createElementNS(SVG_NS, name)
      : document.createElement(name);

    if (classPart) el.setAttribute('class', classPart.slice(1).split('.').join(' '));
    if (id) el.id = id;

    for (const [key, value] of Object.entries(props || {})) {
      if (value === null || value === undefined || value === false) continue;

      switch (key) {
        case 'class':
        case 'className': {
          const extra = Array.isArray(value) ? value.filter(Boolean).join(' ') : String(value);
          el.setAttribute('class', [el.getAttribute('class'), extra].filter(Boolean).join(' '));
          break;
        }
        case 'style':
          if (typeof value === 'string') el.style.cssText = value;
          else for (const [prop, v] of Object.entries(value)) {
            if (v === null || v === undefined) continue;
            if (prop.startsWith('--')) el.style.setProperty(prop, String(v));
            else el.style[prop] = v;
          }
          break;
        case 'dataset':
          Object.assign(el.dataset, value);
          break;
        case 'on':
          for (const [type, handler] of Object.entries(value)) {
            if (typeof handler === 'function') el.addEventListener(type, handler);
          }
          break;
        case 'text':
          el.textContent = String(value);
          break;
        case 'ref':
          if (typeof value === 'function') value(el);
          break;
        case 'value':
        case 'checked':
        case 'disabled':
        case 'selected':
          el[key] = value;
          break;
        default:
          el.setAttribute(key, value === true ? '' : String(value));
      }
    }

    append(el, children);
    return el;
  }

  function append(parent, children) {
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false || child === true) continue;
      parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return parent;
  }

  function fragment(...children) {
    return append(document.createDocumentFragment(), children);
  }

  function clear(el) {
    el.replaceChildren();
    return el;
  }

  function mount(el, ...children) {
    return append(clear(el), children);
  }

  function when(condition, build) {
    return condition ? build() : null;
  }

  return { h, append, fragment, clear, mount, when };
})();
