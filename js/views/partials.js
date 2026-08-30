window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.partials = (function () {

  const dom = Logi.core.dom;
  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const router = Logi.core.router;
  const { attachTilt, countUp } = Logi.core.effects;
  const { decorateProduct, phoneLinks } = Logi.core.selectors;
  const { formatNumber } = Logi.util.format;

  const eyebrowText = (label) => `// ${label}`;

  function eyebrow(label) {
    const root = tpl.clone('eyebrow');
    tpl.bind(root, { label: eyebrowText(label) });
    return root;
  }

  function pageHeader(label, title) {
    const h1 = tpl.clone('page-title');
    tpl.bind(h1, { title });
    return [eyebrow(label), h1];
  }

  function sectionHead({ label, title, linkTo }) {
    const root = tpl.clone('section-head');
    const { link } = tpl.refs(root);
    tpl.bind(root, { eyebrowLabel: eyebrowText(label), title, linkLabel: `${t('viewAll')} →` });
    tpl.toggle(link, !!linkTo);
    if (linkTo) tpl.bindAttr(root, { href: router.href(linkTo) });
    return root;
  }

  function media({
    src,
    alt = '',
    className = '',
    placeholderClass = '',
    label = t('photo'),
    onClick,
  } = {}) {
    if (src) {
      const img = tpl.clone('media-img');
      img.src = src;
      img.alt = alt;
      if (className) img.className = className;
      if (onClick) {
        img.addEventListener('click', onClick);
        img.style.cursor = 'zoom-in';
      }
      return img;
    }
    const root = tpl.clone('media-placeholder');
    root.className = ['placeholder', className, placeholderClass].filter(Boolean).join(' ');
    tpl.bind(root, { label });
    return root;
  }

  function badgeRow(labels) {
    if (!labels?.length) return null;
    const root = tpl.clone('badge-row');
    tpl.each(tpl.slot(root, 'list'), labels, (label) => {
      const b = tpl.clone('badge');
      tpl.bind(b, { label });
      return b;
    });
    return root;
  }

  function statTile(stat, { compact = false } = {}) {
    const root = tpl.clone('stat-tile');
    const { tape, value } = tpl.refs(root);
    root.classList.add(compact ? 'stat--compact' : 'card--lift');
    tpl.toggle(tape, !compact);
    tpl.bind(root, { label: stat.label });
    countUp(value, stat.value, stat.suffix, { format: formatNumber });
    return root;
  }

  function statGrid(stats, options) {
    const root = tpl.clone('stat-grid');
    tpl.each(tpl.slot(root, 'grid'), stats, (stat) => statTile(stat, options));
    return root;
  }

  function serviceCard(service, { ghost = false } = {}) {
    const root = tpl.clone('service-card');
    const { ghost: ghostEl } = tpl.refs(root);
    tpl.toggle(ghostEl, ghost);
    tpl.bind(root, { num: service.num, title: service.title, desc: service.desc });
    attachTilt(root);
    return root;
  }

  function serviceGrid(services, options) {
    const root = tpl.clone('service-grid');
    tpl.each(tpl.slot(root, 'grid'), services, (service) => serviceCard(service, options));
    return root;
  }

  function productCard(product, onOpen, { showBrand = true } = {}) {
    const view = decorateProduct(product);
    const root = tpl.clone('product-card');
    const { brand } = tpl.refs(root);

    tpl.place(root, 'media', media({ src: view.img, alt: view.title, className: 'product-card__media' }));
    tpl.place(root, 'badges', badgeRow(view.badges));
    tpl.bind(root, { title: view.title, brand: view.brand, price: view.price });
    tpl.toggle(brand, showBrand && !!view.brand);

    root.setAttribute('aria-label', `${view.title} — ${view.price}`);
    root.addEventListener('click', () => onOpen(view.id));
    attachTilt(root);
    return root;
  }

  function productGrid(products, onOpen, options) {
    const root = tpl.clone('product-grid');
    tpl.each(tpl.slot(root, 'grid'), products, (product) => productCard(product, onOpen, options));
    return root;
  }

  function empty(message) {
    const root = tpl.clone('empty');
    tpl.bind(root, { message });
    return root;
  }

  function ctaBand() {
    const root = tpl.clone('cta-band');
    tpl.bind(root, { title: t('ctaTitle'), sub: t('ctaSub') });
    tpl.each(tpl.slot(root, 'phones'), phoneLinks(), (phone) => {
      const a = tpl.clone('cta-phone');
      tpl.bindAttr(a, { href: phone.href });
      tpl.bind(a, { label: phone.label });
      return a;
    });
    return root;
  }

  return { eyebrow, pageHeader, sectionHead, media, badgeRow, statTile, statGrid, serviceCard, serviceGrid, productCard, productGrid, empty, ctaBand };
})();
