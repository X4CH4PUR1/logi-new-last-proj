/**
 * Transient confirmation messages, used by the admin panel.
 *
 * One toast at a time: a second call replaces the first rather than stacking,
 * because these confirm the action you just took and only the latest matters.
 */

import { h } from './dom.js';

let node = null;
let timer = 0;

/**
 * @param {string} message
 * @param {{error?: boolean, duration?: number}} [options]
 */
export function show(message, options = {}) {
  const { error = false, duration = error ? 6000 : 2600 } = options;

  dismiss();

  node = h(
    'div.toast',
    {
      class: error ? 'toast--error' : null,
      role: 'status',
      'aria-live': error ? 'assertive' : 'polite',
    },
    h('span.toast__dot'),
    h('span', { text: message })
  );

  document.body.append(node);
  timer = window.setTimeout(dismiss, duration);
}

export function error(message) {
  show(message, { error: true });
}

export function dismiss() {
  window.clearTimeout(timer);
  timer = 0;
  node?.remove();
  node = null;
}
