/**
 * Site footer: legal name, menu, contact details, and the admin entry point.
 */

import { h, when } from '../core/dom.js';
import { NAV_ROUTES } from '../data/config.js';
import { t, localise } from '../core/i18n.js';
import * as router from '../core/router.js';
import { brand, contacts } from '../core/selectors.js';
import { telHref } from '../util/format.js';

/**
 * @param {{afterCtaBand?: boolean}} [options]
 *        The home page ends with the yellow CTA band, which already closes
 *        with hazard tape. Drawing the footer's tape as well would stack two
 *        striped bars with different stripe widths right against each other —
 *        so on that one page the footer goes without.
 */
export function footer({ afterCtaBand = false } = {}) {
  const c = contacts();
  const marks = brand();
  const phones = [c.phone1, c.phone2].filter(Boolean).join(' · ');
  const year = new Date().getFullYear();

  return h(
    'footer.site-footer',
    {},
    afterCtaBand ? null : h('span.site-footer__tape.hazard', { 'aria-hidden': 'true' }),
    h('span.site-footer__ghost.ghost-text', { text: marks.short, 'aria-hidden': 'true' }),
    h(
      'div.site-footer__inner',
      {},
      h(
        'div.site-footer__cols',
        {},
        brandColumn(c, marks),
        menuColumn(),
        contactColumn(c, phones)
      ),
      // No admin link here on purpose. The panel lives at an unlisted address
      // (ADMIN_PATH in js/data/config.js) so visitors never see a way in.
      h(
        'div.site-footer__bottom',
        {},
        h('span', {
          text: `© ${year} ${localise(c.legal)}${c.idCode ? ` · ID ${c.idCode}` : ''}`,
        })
      )
    )
  );
}

function brandColumn(c, marks) {
  return h(
    'div',
    {},
    h(
      'div.site-footer__brand',
      {},
      h('span.site-footer__brand-word', { text: marks.short }),
      h('span.site-footer__brand-bar.hazard--warm', { 'aria-hidden': 'true' })
    ),
    h('p.site-footer__legal', { text: localise(c.legal) })
  );
}

function menuColumn() {
  return h(
    'div.site-footer__col',
    {},
    h('span.site-footer__col-title', { text: '// MENU' }),
    h(
      'nav.site-footer__menu',
      { 'aria-label': t('menu') },
      NAV_ROUTES.map((route) =>
        h('a', { href: router.href(route.key), text: t(route.labelKey) })
      )
    )
  );
}

function contactColumn(c, phones) {
  return h(
    'div.site-footer__col.site-footer__contact',
    {},
    h('span.site-footer__col-title', { text: '// CONTACT' }),
    when(c.address, () => h('span', { text: localise(c.address) })),
    when(phones, () =>
      h('a', {
        href: telHref(c.phone1Dial || c.phone1),
        text: phones,
        style: { color: 'inherit', textDecoration: 'none' },
      })
    ),
    when(c.email, () => h('a', { href: `mailto:${c.email}`, text: c.email })),
    when(c.hours, () => h('span', { text: localise(c.hours) }))
  );
}
