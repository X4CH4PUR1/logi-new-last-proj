/**
 * Derived reads of the content tree.
 *
 * Views ask questions here ("which products match this filter?", "what does
 * this product look like in the current language?") instead of walking the
 * content tree themselves. That keeps filtering and label lookup in one place
 * and out of the markup, and it means the admin panel and the public pages
 * agree on what a product *is*.
 */

import * as store from './store.js';
import { localise, t } from './i18n.js';
import { excerpt, formatPrice, telHref, webHref, whatsappHref } from '../util/format.js';
import {
  DEFAULT_ZOOM,
  directionsUrl,
  formatCoordinates,
  osmEmbedUrl,
  osmLinkUrl,
} from '../util/geo.js';

/* --------------------------------------------------------------------------
   Products
   -------------------------------------------------------------------------- */

/**
 * Turns a stored product into everything a card or modal needs to render.
 * @param {object} product
 */
export function decorateProduct(product) {
  const badges = [];
  if (product.mode) badges.push(product.mode === 'sale' ? t('modeSale') : t('modeRent'));
  if (product.fuel) badges.push(fuelLabel(product.fuel));
  if (product.cond) badges.push(product.cond === 'new' ? t('condNew') : t('condUsed'));

  const specs = [];
  if (product.brand) specs.push({ key: t('brand'), value: product.brand });
  if (product.capacity) specs.push({ key: t('capacity'), value: product.capacity });
  if (product.lift) specs.push({ key: t('lift'), value: product.lift });
  if (product.year) specs.push({ key: t('year'), value: product.year });

  return {
    id: product.id,
    title: localise(product.name),
    brand: String(product.brand || '').toUpperCase(),
    badges,
    specs,
    img: product.img || '',
    price: formatPrice(product.price, product.unit, t('perMonth')),
  };
}

export function fuelLabel(fuel) {
  if (fuel === 'electric') return t('fuelElectric');
  if (fuel === 'diesel') return t('fuelDiesel');
  if (fuel === 'gasoline') return t('fuelGasoline');
  return '';
}

/** Every product, unfiltered, in stored order. */
export function allProducts() {
  return store.getContent().products ?? [];
}

/**
 * Applies the catalogue filters.
 * @param {{mode?: string, fuel?: string}} filters
 *        mode: 'all' | 'sale' | 'rent' | 'parts' | 'wheels'
 *        fuel: 'all' | 'electric' | 'diesel' | 'gasoline'
 */
export function filterProducts({ mode = 'all', fuel = 'all' } = {}) {
  let list = allProducts();

  if (mode === 'sale' || mode === 'rent') {
    list = list.filter((p) => p.mode === mode && p.cat === 'forklift');
    if (fuel !== 'all') list = list.filter((p) => p.fuel === fuel);
  } else if (mode === 'parts' || mode === 'wheels') {
    list = list.filter((p) => p.cat === mode);
  }

  return list;
}

/** Fuel chips only make sense for the two forklift modes. */
export function fuelFilterApplies(mode) {
  return mode === 'sale' || mode === 'rent';
}

export function findProduct(id) {
  return allProducts().find((p) => p.id === id) ?? null;
}

/** The first `count` forklifts, for the home page stock strip. */
export function featuredProducts(count = 3) {
  return allProducts()
    .filter((p) => p.cat === 'forklift')
    .slice(0, count);
}

/* --------------------------------------------------------------------------
   News
   -------------------------------------------------------------------------- */

/** Newest first. Dates are ISO, so a string compare is the right sort. */
export function sortedNews() {
  return [...(store.getContent().news ?? [])].sort((a, b) =>
    String(b.date || '').localeCompare(String(a.date || ''))
  );
}

export function decorateNews(post) {
  const body = localise(post.body);
  return {
    id: post.id,
    date: post.date || '',
    img: post.img || '',
    title: localise(post.title),
    body,
    excerpt: excerpt(body, 120),
  };
}

/* --------------------------------------------------------------------------
   Services, gallery, stats
   -------------------------------------------------------------------------- */

export function services() {
  return (store.getContent().services ?? []).map((service) => ({
    id: service.id,
    num: service.num,
    title: localise(service.title),
    desc: localise(service.desc),
  }));
}

export function gallery() {
  return (store.getContent().gallery ?? []).map((item) => ({
    id: item.id,
    img: item.img || '',
    caption: localise(item.caption),
  }));
}

/**
 * The statistic tiles. A stat with `sinceYear` reports elapsed years rather
 * than a stored number, so "years of experience" stays correct without anyone
 * having to remember to bump it every January.
 */
export function stats() {
  const thisYear = new Date().getFullYear();
  return (store.getContent().stats ?? []).map((stat) => ({
    id: stat.id,
    value: stat.sinceYear ? Math.max(0, thisYear - stat.sinceYear) : Number(stat.value) || 0,
    suffix: stat.suffix ?? '',
    label: t(stat.labelKey),
  }));
}

/** The founding year, for prose that mentions it. */
export function foundedYear() {
  return store.getContent().foundedYear ?? 1999;
}

/* --------------------------------------------------------------------------
   Contacts
   -------------------------------------------------------------------------- */

export function contacts() {
  return store.getContent().contacts ?? {};
}

/**
 * The contact table, already localised, with hrefs where a value is actionable.
 * @returns {{key: string, value: string, href?: string}[]}
 */
export function contactRows() {
  const c = contacts();
  const rows = [
    { key: t('address'), value: localise(c.address) },
    {
      key: t('phone'),
      value: [c.phone1, c.phone2].filter(Boolean).join(' · '),
      href: c.phone1 ? telHref(c.phone1Dial || c.phone1) : undefined,
    },
    { key: t('email'), value: c.email, href: c.email ? `mailto:${c.email}` : undefined },
    { key: t('web'), value: c.web, href: webHref(c.web) || undefined },
    { key: t('hours'), value: localise(c.hours) },
    { key: t('legalName'), value: localise(c.legal) },
    { key: t('idCode'), value: c.idCode },
  ];
  return rows
    .filter((row) => row.value)
    .map((row) => ({ ...row, key: row.key.toUpperCase() }));
}

/**
 * Everything the contacts map needs, or null when no map should be shown.
 *
 * A manually pasted embed URL wins; otherwise the URLs are built from the
 * stored coordinates so the pin lands exactly where it was set.
 *
 * @returns {{embed: string, link: string, directions: string|null,
 *            coords: string|null} | null}
 */
export function mapView() {
  const c = contacts();

  if (c.mapEmbed) {
    return { embed: c.mapEmbed, link: c.mapLink || '', directions: null, coords: null };
  }

  const lat = Number(c.mapLat);
  const lon = Number(c.mapLon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const pin = { lat, lon, zoom: Number(c.mapZoom) || DEFAULT_ZOOM };
  return {
    embed: osmEmbedUrl(pin),
    link: osmLinkUrl(pin),
    directions: directionsUrl(pin),
    coords: formatCoordinates(pin),
  };
}

/**
 * Social and messaging links, ready to render.
 * Entries without a usable destination are dropped rather than rendered as
 * dead icons.
 *
 * @returns {{id: string, type: string, label: string, href: string}[]}
 */
export function social() {
  return (store.getContent().social ?? [])
    .map((item) => ({
      id: item.id,
      type: item.type,
      label: item.label || item.type,
      href: item.type === 'whatsapp' ? whatsappHref(item.number) : String(item.url || '').trim(),
    }))
    .filter((item) => item.href);
}

/** The two phone numbers for the CTA band, with dial-ready hrefs. */
export function phoneLinks() {
  const c = contacts();
  return [
    { label: c.phone1, href: telHref(c.phone1Dial || c.phone1) },
    { label: c.phone2, href: telHref(c.phone2Dial || c.phone2) },
  ].filter((p) => p.label);
}

/* --------------------------------------------------------------------------
   Free text
   -------------------------------------------------------------------------- */

/** Reads a block from content.texts in the active language. */
export function text(key) {
  return localise(store.getContent().texts?.[key]);
}

export function brands() {
  return store.getContent().brands || '';
}

/** The wordmarks used by the logo, the hero watermark and the footer ghost. */
export function brand() {
  const b = store.getContent().brand ?? {};
  return { short: b.short || 'LOGI', full: b.full || 'LOGIMOTORS' };
}

/** The floating chips around the hero dial, localised. */
export function heroPills() {
  return (store.getContent().heroPills ?? []).map((pill) => localise(pill)).filter(Boolean);
}

export function settings() {
  return store.getContent().settings ?? {};
}
