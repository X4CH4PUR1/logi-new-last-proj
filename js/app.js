/**
 * Application shell.
 *
 * Owns the one place the whole page is assembled, and re-renders it when
 * something global changes: the route, the language, or the content itself.
 *
 * Re-rendering everything on each of those is deliberate. The page is small,
 * the render is a few milliseconds, and the alternative — tracking which parts
 * of which view depend on which slice of content — would be a framework. Views
 * that own genuinely local state (the product filters, the contact form) do
 * their own partial updates internally and are untouched by this.
 */

import { h, mount } from './core/dom.js';
import * as router from './core/router.js';
import * as i18n from './core/i18n.js';
import * as store from './core/store.js';
import { findProduct, text } from './core/selectors.js';

import { header } from './views/header.js';
import { footer } from './views/footer.js';
import { homePage } from './views/home.js';
import { aboutPage } from './views/about.js';
import { productsPage } from './views/products.js';
import { productModal } from './views/product-modal.js';
import { newsPage } from './views/news.js';
import { servicePage } from './views/service.js';
import { galleryPage } from './views/gallery.js';
import { contactsPage } from './views/contacts.js';
import { adminPage } from './views/admin/index.js';

/** @type {HTMLElement} */
let root;
/** @type {HTMLDialogElement|null} */
let openModal = null;

export function start(mountPoint) {
  root = mountPoint;

  // Any of these three invalidates the whole page.
  router.subscribe(render);
  i18n.subscribe(render);
  store.subscribe(render);

  router.start();
}

function render() {
  const route = router.current();

  closeModal();
  updateDocumentMeta(route);

  mount(
    root,
    h('div.page-shell', {},
      header({ routeKey: route.key }),
      h('main.site-main', { id: 'main', tabindex: '-1' }, page(route)),
      // Only the home page closes with the CTA band; see footer.js.
      footer({ afterCtaBand: route.key === 'home' })
    )
  );

  syncModal(route);
  restoreScroll(route);
}

/* --------------------------------------------------------------------------
   Routing
   -------------------------------------------------------------------------- */

function page(route) {
  const onOpenProduct = (id) => router.go('products', [id]);

  switch (route.key) {
    case 'about':
      return aboutPage();
    case 'products':
      return productsPage({ onOpenProduct });
    case 'news':
      return newsPage();
    case 'service':
      return servicePage();
    case 'gallery':
      return galleryPage();
    case 'contacts':
      return contactsPage();
    case 'admin':
      // Unlocking and locking change what the page *is* without changing the
      // URL, so the panel needs a way to ask for a rebuild.
      return adminPage({ tab: route.segments[0], onAuthChange: render });
    case 'home':
    default:
      return homePage({ onOpenProduct });
  }
}

/* --------------------------------------------------------------------------
   Product modal
   The modal is a function of the URL, not of a click handler, so a product
   link can be shared and the Back button closes the dialog.
   -------------------------------------------------------------------------- */

function syncModal(route) {
  if (route.key !== 'products') return;

  const id = route.segments[0];
  if (!id) return;

  const product = findProduct(id);
  if (!product) {
    // Stale or hand-typed id — drop the segment rather than showing an error.
    router.go('products', [], { replace: true });
    return;
  }

  openModal = productModal(product, () => {
    openModal?.remove();
    openModal = null;
    // Closing returns to the plain catalogue URL without adding history, so
    // Back goes to the previous page rather than reopening the product.
    if (router.current().segments.length) {
      router.go('products', [], { replace: true });
    }
  });

  document.body.append(openModal);
  openModal.showModal();
}

function closeModal() {
  if (!openModal) return;
  openModal.remove();
  openModal = null;
}

/* --------------------------------------------------------------------------
   Document metadata and scroll
   -------------------------------------------------------------------------- */

function updateDocumentMeta(route) {
  const description = text('metaDescription');
  const meta = document.querySelector('meta[name="description"]');
  if (meta && description) meta.content = description;

  const label = route.key === 'home' ? '' : i18n.t(routeLabelKey(route.key));
  document.title = label
    ? `${label} — LOGIMOTORS`
    : 'LOGIMOTORS — Forklifts: sale, rent, service, parts';
}

function routeLabelKey(key) {
  return `nav${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

/** New page: back to the top. Same page, different modal: leave it alone. */
let lastRouteKey = null;
function restoreScroll(route) {
  if (route.key !== lastRouteKey) {
    window.scrollTo(0, 0);
    lastRouteKey = route.key;
  }
}
