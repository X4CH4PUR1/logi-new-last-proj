window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.selectors = (function () {

  const store = Logi.core.store;
  const { NAV_ROUTES } = Logi.data.config;
  const { localise, t } = Logi.core.i18n;
  const { excerpt, formatPrice, telHref, webHref, whatsappHref } = Logi.util.format;
  const {
    DEFAULT_ZOOM,
    directionsUrl,
    formatCoordinates,
    osmEmbedUrl,
    osmLinkUrl,
  } = Logi.util.geo;

  function decorateProduct(product) {
    const badges = [];
    if (product.mode) badges.push(product.mode === 'sale' ? t('modeSale') : t('modeRent'));
    if (product.fuel) badges.push(fuelLabel(product.fuel));
    if (product.cond) badges.push(product.cond === 'new' ? t('condNew') : t('condUsed'));

    const specs = [];
    if (product.brand) specs.push({ key: t('brand'), value: product.brand });
    if (product.capacity) specs.push({ key: t('capacity'), value: product.capacity });
    if (product.lift) specs.push({ key: t('lift'), value: product.lift });
    if (product.year) specs.push({ key: t('year'), value: product.year });

    const images = product.images?.length ? product.images : product.img ? [product.img] : [];

    return {
      id: product.id,
      title: localise(product.name),
      brand: String(product.brand || '').toUpperCase(),
      badges,
      specs,
      description: localise(product.desc),
      images,
      img: images[0] || '',
      price: formatPrice(product.price, product.unit, t('perMonth')),
    };
  }

  function fuelLabel(fuel) {
    if (!fuel) return '';
    const match = (store.getContent().fuels ?? []).find((f) => f.key === fuel);
    return match ? localise(match.label) : fuel;
  }

  function categories() {
    return (store.getContent().categories ?? []).map((c) => ({ key: c.key, label: localise(c.label) }));
  }

  function fuels() {
    return (store.getContent().fuels ?? []).map((f) => ({ key: f.key, label: localise(f.label) }));
  }

  function allProducts() {
    return store.getContent().products ?? [];
  }

  function filterProducts({ mode = 'all', fuel = 'all' } = {}) {
    let list = allProducts();

    if (mode === 'sale' || mode === 'rent') {
      list = list.filter((p) => p.mode === mode && p.cat === 'forklift');
      if (fuel !== 'all') list = list.filter((p) => p.fuel === fuel);
    } else if (mode !== 'all') {
      list = list.filter((p) => p.cat === mode);
    }

    return list;
  }

  function fuelFilterApplies(mode) {
    return mode === 'sale' || mode === 'rent';
  }

  function findProduct(id) {
    return allProducts().find((p) => p.id === id) ?? null;
  }

  function featuredProducts(count = 3) {
    return allProducts()
      .filter((p) => p.cat === 'forklift')
      .slice(0, count);
  }


  function sortedNews() {
    return [...(store.getContent().news ?? [])].sort((a, b) =>
      String(b.date || '').localeCompare(String(a.date || ''))
    );
  }

  function decorateNews(post) {
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


  function services() {
    return (store.getContent().services ?? []).map((service) => ({
      id: service.id,
      num: service.num,
      title: localise(service.title),
      desc: localise(service.desc),
    }));
  }

  function gallery() {
    return (store.getContent().gallery ?? []).map((item) => ({
      id: item.id,
      img: item.img || '',
      caption: localise(item.caption),
    }));
  }

  function stats() {
    const thisYear = new Date().getFullYear();
    return (store.getContent().stats ?? []).map((stat) => ({
      id: stat.id,
      value: stat.sinceYear ? Math.max(0, thisYear - stat.sinceYear) : Number(stat.value) || 0,
      suffix: stat.suffix ?? '',
      label: t(stat.labelKey),
    }));
  }

  function foundedYear() {
    return store.getContent().foundedYear ?? 1999;
  }


  function contacts() {
    return store.getContent().contacts ?? {};
  }

  function contactRows() {
    const c = contacts();
    const phones = [
      c.phone1 && { value: c.phone1, href: telHref(c.phone1Dial || c.phone1) },
      c.phone2 && { value: c.phone2, href: telHref(c.phone2Dial || c.phone2) },
    ].filter(Boolean);

    const rows = [
      { key: t('address'), value: localise(c.address) },
      {
        key: t('phone'),
        value: phones.map((p) => p.value).join(' · '),
        href: phones.length === 1 ? phones[0].href : undefined,
        parts: phones.length > 1 ? phones : undefined,
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

  function mapView() {
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

  function social() {
    return (store.getContent().social ?? [])
      .map((item) => ({
        id: item.id,
        type: item.type,
        label: item.label || item.type,
        href: item.type === 'whatsapp' ? whatsappHref(item.number) : String(item.url || '').trim(),
      }))
      .filter((item) => item.href);
  }

  function phoneLinks() {
    const c = contacts();
    return [
      { label: c.phone1, href: telHref(c.phone1Dial || c.phone1) },
      { label: c.phone2, href: telHref(c.phone2Dial || c.phone2) },
    ].filter((p) => p.label);
  }


  function text(key) {
    return localise(store.getContent().texts?.[key]);
  }

  function brands() {
    return store.getContent().brands || '';
  }

  function brand() {
    const b = store.getContent().brand ?? {};
    return { short: b.short || 'LOGI', full: b.full || 'LOGIMOTORS' };
  }

  function heroPills() {
    return (store.getContent().heroPills ?? []).map((pill) => localise(pill)).filter(Boolean);
  }

  function settings() {
    return store.getContent().settings ?? {};
  }

  function hiddenPageKeys() {
    return new Set(settings().hiddenPages ?? []);
  }

  function isPageHidden(key) {
    return hiddenPageKeys().has(key);
  }

  function visibleNavRoutes() {
    const hidden = hiddenPageKeys();
    return NAV_ROUTES.filter((r) => r.key === 'home' || !hidden.has(r.key));
  }

  return { decorateProduct, fuelLabel, categories, fuels, allProducts, filterProducts, fuelFilterApplies, findProduct, featuredProducts, sortedNews, decorateNews, services, gallery, stats, foundedYear, contacts, contactRows, mapView, social, phoneLinks, text, brands, brand, heroPills, settings, isPageHidden, visibleNavRoutes };
})();
