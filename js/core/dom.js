window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.dom = (function () {
  /**
   * A very small hyperscript helper.
   *
   * Every view in this project builds real DOM nodes through `h()` rather than
   * assembling HTML strings. That is deliberate: text always goes in through
   * `textContent`, so content typed into the admin panel can never be parsed as
   * markup. There is no innerHTML anywhere in the codebase.
   *
   *   h('div.card.notch', { 'data-id': p.id }, h('h3', {}, p.title))
   *
   * The tag string accepts CSS-ish shorthand: `tag.class.class#id`.
   */

  const TAG_RE = /^([a-zA-Z0-9-]+)?((?:\.[^.#]+)*)(?:#([^.#]+))?$/;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SVG_TAGS = new Set(['svg', 'path', 'circle', 'rect', 'g', 'line', 'polygon']);

  /**
   * @param {string} tag       e.g. 'button.btn.btn--primary'
   * @param {object} [props]   attributes; see the special keys below
   * @param {...any} children  nodes, strings, numbers, arrays; null/false skipped
   * @returns {HTMLElement}
   *
   * Special props:
   *   class      extra class names (string or array), merged with the shorthand
   *   style      object of CSS properties, or a string
   *   dataset    object written to element.dataset
   *   on         object of event handlers, e.g. { click: fn }
   *   text       shorthand for a single text child
   *   ref        callback invoked with the element once built
   */
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
        // Properties that must be set on the object, not as attributes, so that
        // they keep working after the element is re-rendered.
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

  /** Appends children of any supported shape, flattening arrays and skipping holes. */
  function append(parent, children) {
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false || child === true) continue;
      parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return parent;
  }

  /** A detached fragment, for returning several siblings from one function. */
  function fragment(...children) {
    return append(document.createDocumentFragment(), children);
  }

  /** Removes every child of `el`. */
  function clear(el) {
    el.replaceChildren();
    return el;
  }

  /** Replaces the contents of `el` with `children`. */
  function mount(el, ...children) {
    return append(clear(el), children);
  }

  /** `h`, but only when `condition` is truthy — keeps view code free of ternaries. */
  function when(condition, build) {
    return condition ? build() : null;
  }

  return { h, append, fragment, clear, mount, when };
})();
