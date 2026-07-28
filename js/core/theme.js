/**
 * Night / day theme.
 *
 * The whole switch is one attribute on <html>; every colour comes from the
 * custom properties in css/tokens.css, so nothing else has to know which theme
 * is active. The attribute is also set by the inline script in index.html
 * before first paint, which is what stops the page flashing dark then light.
 */

import { DEFAULT_THEME, STORAGE } from '../data/config.js';
import * as storage from '../util/storage.js';
import * as store from './store.js';

const THEMES = ['night', 'day'];
const listeners = new Set();
let current = DEFAULT_THEME;

export function init() {
  const saved = storage.readString(STORAGE.theme, '');
  const settingsDefault = store.getContent().settings?.defaultTheme;

  current = [saved, settingsDefault, DEFAULT_THEME].find((v) => THEMES.includes(v));
  apply();
  return current;
}

export function get() {
  return current;
}

export function set(theme) {
  if (!THEMES.includes(theme) || theme === current) return;
  current = theme;
  storage.writeString(STORAGE.theme, theme);
  apply();
  for (const listener of listeners) listener(theme);
}

export function toggle() {
  set(current === 'night' ? 'day' : 'night');
}

/** Label for the toggle button: it names the theme you would switch *to*. */
export function nextLabel() {
  return current === 'night' ? 'DAY' : 'NIGHT';
}

function apply() {
  document.documentElement.dataset.theme = current;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = current === 'night' ? '#101218' : '#f2f2ee';
}

/** @returns {() => void} unsubscribe */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
