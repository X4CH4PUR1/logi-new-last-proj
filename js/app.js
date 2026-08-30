window.Logi = window.Logi || {};
Logi.app = (function () {

  const { h, mount } = Logi.core.dom;
  const router = Logi.core.router;
  const i18n = Logi.core.i18n;
  const store = Logi.core.store;
  const { findProduct, text, isPageHidden } = Logi.core.selectors;
  const { header } = Logi.views.header;
  const { footer } = Logi.views.footer;
  const { homePage } = Logi.views.home;
  const { aboutPage } = Logi.views.about;
  const { productsPage } = Logi.views.products;
  const { productModal } = Logi.views["product-modal"];
  const { newsPage } = Logi.views.news;
  const { servicePage } = Logi.views.service;
  const { galleryPage } = Logi.views.gallery;
  const { contactsPage } = Logi.views.contacts;
  const { adminPage } = Logi.views.admin.index;
  let root;
  let openModal = null;

  function start(mountPoint) {
    root = mountPoint;

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
        footer({ afterCtaBand: route.key === 'home' })
      )
    );

    syncModal(route);
    restoreScroll(route);
  }

  function page(route) {
    const onOpenProduct = (id) => router.go('products', [id]);

    if (route.key !== 'admin' && isPageHidden(route.key)) {
      router.go('home', [], { replace: true });
      return homePage({ onOpenProduct });
    }

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
        return adminPage({ tab: route.segments[0], onAuthChange: render });
      case 'home':
      default:
        return homePage({ onOpenProduct });
    }
  }

  function syncModal(route) {
    if (route.key !== 'products' || isPageHidden(route.key)) return;

    const id = route.segments[0];
    if (!id) return;

    const product = findProduct(id);
    if (!product) {
      router.go('products', [], { replace: true });
      return;
    }

    openModal = productModal(product, () => {
      openModal?.remove();
      openModal = null;
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

  let lastRouteKey = null;
  function restoreScroll(route) {
    if (route.key !== lastRouteKey) {
      window.scrollTo(0, 0);
      lastRouteKey = route.key;
    }
  }

  return { start };
})();
