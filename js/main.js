/**
 * Entry point.
 *
 * Boot order matters: content has to be loaded before language and theme,
 * because both of those read their defaults out of content.settings.
 */

import * as store from './core/store.js';
import * as i18n from './core/i18n.js';
import * as theme from './core/theme.js';
import { initSpotlight } from './core/effects.js';
import { start } from './app.js';

async function boot() {
  const root = document.getElementById('app');
  if (!root) throw new Error('#app is missing from index.html');

  try {
    await store.init();
  } catch (err) {
    // The store swallows a missing content.json on its own, so reaching here
    // means something structural is wrong and rendering would only confuse.
    console.error('[boot] could not load content', err);
    showBootError(root, err);
    return;
  }

  i18n.init();
  theme.init();
  initSpotlight();

  start(root);

  document.documentElement.dataset.ready = 'true';
}

function showBootError(root, err) {
  root.textContent = '';
  const box = document.createElement('div');
  box.style.cssText =
    'max-width:640px;margin:15vh auto;padding:32px;font:16px/1.6 system-ui,sans-serif;' +
    'color:#f2f2ec;background:#1a1e29;border:1px solid #e05555';
  const title = document.createElement('h1');
  title.textContent = 'The site could not start';
  title.style.cssText = 'font-size:22px;margin:0 0 12px';
  const detail = document.createElement('p');
  detail.textContent = String(err?.message || err);
  detail.style.cssText = 'margin:0;color:#98a0af;font-family:ui-monospace,monospace;font-size:13px';
  box.append(title, detail);
  root.append(box);
}

boot();
