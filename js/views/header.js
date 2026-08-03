/**
 * Site header: logo, primary navigation, language switch, theme toggle.
 *
 * Below 900px the navigation collapses behind a burger. The original site let
 * seven links wrap onto three lines on a phone; this keeps the header one row
 * tall at every width.
 */

import { h } from '../core/dom.js';
import { NAV_ROUTES } from '../data/config.js';
import * as i18n from '../core/i18n.js';
import * as theme from '../core/theme.js';
import * as router from '../core/router.js';
import { brand } from '../core/selectors.js';
import { socialLinks } from './social.js';

const noop = () => {};
/** Removes the document listeners belonging to the currently open menu. */
let releaseMenuListeners = noop;

/**
 * @param {{routeKey: string}} state
 * @returns {HTMLElement}
 */
export function header({ routeKey }) {
  let headerEl;
  let toggleEl;

  // The shell rebuilds this header on every navigation. Document-level
  // listeners therefore have to be torn down, or each rebuild would leave
  // another one behind holding a detached header alive.
  releaseMenuListeners();

  const onDocumentClick = (event) => {
    if (!headerEl.contains(event.target)) closeMenu();
  };
  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      toggleEl.focus();
    }
  };

  const openMenu = () => {
    headerEl.dataset.navOpen = 'true';
    toggleEl.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    releaseMenuListeners = () => {
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
      releaseMenuListeners = noop;
    };
  };

  const closeMenu = () => {
    if (headerEl.dataset.navOpen !== 'true') return;
    headerEl.dataset.navOpen = 'false';
    toggleEl.setAttribute('aria-expanded', 'false');
    releaseMenuListeners();
  };

  const toggleMenu = () => {
    if (headerEl.dataset.navOpen === 'true') closeMenu();
    else openMenu();
  };

  headerEl = h(
    'header.site-header',
    { dataset: { navOpen: 'false' } },
    h('span.site-header__tape.hazard', { 'aria-hidden': 'true' }),
    h(
      'div.site-header__inner',
      {},
      logo(),
      navigation(routeKey, closeMenu),
      h(
        'div.header-tools',
        {},
        socialLinks('desktop'),
        languageSwitch(),
        themeToggle(),
        (toggleEl = h(
          'button.nav-toggle',
          {
            type: 'button',
            'aria-label': i18n.t('menu'),
            'aria-expanded': 'false',
            'aria-controls': 'main-nav',
            on: { click: toggleMenu },
          },
          h('span.nav-toggle__bar'),
          h('span.nav-toggle__bar'),
          h('span.nav-toggle__bar')
        ))
      )
    )
  );

  return headerEl;
}

function logo() {
  const marks = brand();
  return h(
    'a.logo',
    { href: router.href('home'), 'aria-label': marks.full },
    h('span.logo__word', { text: marks.short }),
    h('span.logo__bar.hazard--warm', { 'aria-hidden': 'true' })
  );
}

function navigation(routeKey, onNavigate) {
  return h(
    'nav.main-nav',
    { id: 'main-nav', 'aria-label': i18n.t('menu') },
    NAV_ROUTES.map((route) =>
      h('a.main-nav__link', {
        href: router.href(route.key),
        text: i18n.t(route.labelKey),
        'aria-current': routeKey === route.key ? 'page' : null,
        on: { click: onNavigate },
      })
    ),
    // Only visible once the nav has collapsed into the burger panel, where
    // the toolbar copy has been hidden for want of room.
    socialLinks('mobile')
  );
}

function languageSwitch() {
  return h(
    'div.segmented',
    { role: 'group', 'aria-label': 'Language' },
    i18n.getLanguages().map((lang) =>
      h('button.segmented__btn', {
        type: 'button',
        text: lang.label,
        lang: lang.htmlLang,
        title: lang.name,
        'aria-pressed': String(i18n.getLang() === lang.code),
        on: { click: () => i18n.setLang(lang.code) },
      })
    )
  );
}

/**
 * The label names the theme you would switch *to*, which is how the original
 * behaved. It is updated in place rather than by re-rendering, because a theme
 * change needs no other DOM work — the custom properties do all of it.
 */
function themeToggle() {
  const button = h('button.theme-toggle', {
    type: 'button',
    text: theme.nextLabel(),
    'aria-label': 'Switch colour theme',
    on: {
      click: () => {
        theme.toggle();
        button.textContent = theme.nextLabel();
      },
    },
  });
  return button;
}
