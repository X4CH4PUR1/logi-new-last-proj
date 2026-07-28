/**
 * View fragments shared by more than one page.
 *
 * Anything that appears on two pages lives here, so the home page and the
 * dedicated page can never drift apart visually.
 */

import { h, when } from '../core/dom.js';
import { t } from '../core/i18n.js';
import * as router from '../core/router.js';
import { attachTilt, countUp } from '../core/effects.js';
import { decorateProduct, phoneLinks } from '../core/selectors.js';
import { formatNumber } from '../util/format.js';

/* --------------------------------------------------------------------------
   Headings
   -------------------------------------------------------------------------- */

/** The monospace `// LABEL` marker. The leading rule comes from CSS. */
export function eyebrow(label) {
  return h('div.eyebrow', { text: `// ${label}` });
}

/** Page heading: eyebrow + h1. */
export function pageHeader(label, title) {
  return [eyebrow(label), h('h1.page__title', { text: title })];
}

/**
 * Section heading with an optional "View all →" link on the right.
 * @param {{label: string, title: string, linkTo?: string}} options
 */
export function sectionHead({ label, title, linkTo }) {
  return h(
    'div.section__head',
    {},
    h('div', {}, eyebrow(label), h('h2.section__title', { text: title })),
    when(linkTo, () =>
      h('a.section__link', { href: router.href(linkTo), text: `${t('viewAll')} →` })
    )
  );
}

/* --------------------------------------------------------------------------
   Media
   -------------------------------------------------------------------------- */

/**
 * An image, or the hatched placeholder when nothing has been uploaded yet.
 *
 * @param {{src?: string, alt?: string, className?: string,
 *          placeholderClass?: string, label?: string, onClick?: Function}} options
 */
export function media({
  src,
  alt = '',
  className = '',
  placeholderClass = '',
  label = t('photo'),
  onClick,
} = {}) {
  if (src) {
    return h('img', {
      src,
      alt,
      loading: 'lazy',
      decoding: 'async',
      class: className,
      on: onClick ? { click: onClick } : undefined,
      style: onClick ? { cursor: 'zoom-in' } : undefined,
    });
  }
  return h(
    'div.placeholder',
    { class: [className, placeholderClass].filter(Boolean).join(' '), 'aria-hidden': 'true' },
    h('span', { text: label })
  );
}

/* --------------------------------------------------------------------------
   Badges
   -------------------------------------------------------------------------- */

export function badgeRow(labels) {
  if (!labels?.length) return null;
  return h(
    'div.badge-row',
    {},
    labels.map((label) => h('span.badge', { text: label }))
  );
}

/* --------------------------------------------------------------------------
   Statistics
   -------------------------------------------------------------------------- */

/**
 * @param {{value: number, suffix: string, label: string}} stat
 * @param {{compact?: boolean}} [options] compact drops the tape and shrinks the
 *        number — the variant used on the About page
 */
export function statTile(stat, { compact = false } = {}) {
  return h(
    'div.card.stat.notch',
    { class: compact ? 'stat--compact' : 'card--lift' },
    when(!compact, () => h('span.stat__tape.hazard--warm')),
    h('div.stat__value.grad-text', {
      ref: (el) => countUp(el, stat.value, stat.suffix, { format: formatNumber }),
    }),
    h('div.stat__label', { text: stat.label })
  );
}

export function statGrid(stats, options) {
  return h(
    'div.grid',
    { style: { '--min': '200px', '--gap': '20px' } },
    stats.map((stat) => statTile(stat, options))
  );
}

/* --------------------------------------------------------------------------
   Services
   -------------------------------------------------------------------------- */

/**
 * @param {{num: string, title: string, desc: string}} service
 * @param {{ghost?: boolean}} [options] ghost draws the oversized outlined
 *        number behind the card — used on the home page only
 */
export function serviceCard(service, { ghost = false } = {}) {
  return h(
    'article.card.card--hover.card--tilt.service-card.notch',
    { ref: attachTilt },
    when(ghost, () =>
      h('span.service-card__ghost.ghost-text', { text: service.num, 'aria-hidden': 'true' })
    ),
    h('div.service-card__num', { text: service.num }),
    h('h3.service-card__title', { text: service.title }),
    h('p.service-card__desc', { text: service.desc })
  );
}

export function serviceGrid(services, options) {
  return h(
    'div.grid',
    { style: { '--min': '220px', '--gap': '16px' } },
    services.map((service) => serviceCard(service, options))
  );
}

/* --------------------------------------------------------------------------
   Products
   -------------------------------------------------------------------------- */

/**
 * A catalogue card. Rendered as a <button> so it is reachable by keyboard and
 * announced as activatable — the original used a plain div with a click
 * handler, which a screen reader user could not open at all.
 *
 * @param {object} product raw product record
 * @param {(id: string) => void} onOpen
 * @param {{showBrand?: boolean}} [options]
 */
export function productCard(product, onOpen, { showBrand = true } = {}) {
  const view = decorateProduct(product);

  return h(
    'button.card.card--hover.card--tilt.product-card.notch',
    {
      type: 'button',
      ref: attachTilt,
      'aria-label': `${view.title} — ${view.price}`,
      on: { click: () => onOpen(view.id) },
    },
    media({
      src: view.img,
      alt: view.title,
      className: 'product-card__media',
    }),
    h(
      'div.card__body',
      {},
      badgeRow(view.badges),
      h('div.product-card__title', { text: view.title }),
      when(showBrand && view.brand, () =>
        h('div.product-card__brand', { text: view.brand })
      ),
      h('div.product-card__price.grad-text', { text: view.price })
    )
  );
}

export function productGrid(products, onOpen, options) {
  return h(
    'div.grid',
    {},
    products.map((product) => productCard(product, onOpen, options))
  );
}

/* --------------------------------------------------------------------------
   Empty state
   -------------------------------------------------------------------------- */

export function empty(message) {
  return h('div.empty', { text: message });
}

/* --------------------------------------------------------------------------
   CTA band
   -------------------------------------------------------------------------- */

/**
 * The yellow "Need a machine or a part?" strip at the foot of the home page.
 *
 * Hazard tape top and bottom, so the band is bracketed symmetrically. The
 * footer suppresses its own tape when it follows this band — see footer.js.
 * Two striped bars touching, with different stripe widths and a hairline
 * between them, read as a rendering fault rather than as a design.
 */
export function ctaBand() {
  return h(
    'section.cta-band',
    {},
    h('span.cta-band__edge.cta-band__edge--top', { 'aria-hidden': 'true' }),
    h('span.cta-band__edge.cta-band__edge--bottom', { 'aria-hidden': 'true' }),
    h(
      'div.cta-band__inner',
      {},
      h(
        'div',
        {},
        h('p.cta-band__title', { text: t('ctaTitle') }),
        h('p.cta-band__sub', { text: t('ctaSub') })
      ),
      h(
        'div.cta-band__phones',
        {},
        phoneLinks().map((phone) =>
          h('a.cta-band__phone', { href: phone.href, text: phone.label })
        )
      )
    )
  );
}
