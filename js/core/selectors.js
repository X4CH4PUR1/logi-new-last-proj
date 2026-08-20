window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.selectors = (function () {
  /**
   * Derived reads of the content tree.
   *
   * Views ask questions here ("which products match this filter?", "what does
   * this product look like in the current language?") instead of walking the
   * content tree themselves. That keeps filtering and label lookup in one place
   * and out of the markup, and it means the admin panel and the public pages
   * agree on what a product *is*.
   */

  const store = Logi.core.store;
  const { localise, t } = Logi.core.i18n;
  const { excerpt, formatPrice, telHref, webHref, whatsappHref } = Logi.util.format;
  const {
    DEFAULT_ZOOM,
    directionsUrl,
    formatCoordinates,
    osmEmbedUrl,
    osmLinkUrl,
  } = Logi.util.geo;
  /* --------------------------------------------------------------------------
     Products
     -------------------------------------------------------------------------- */

  /**
   * Turns a stored product into everything a card or modal needs to render.
   * @param {object} product
   */
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

    // Older saved records may still carry a single `img` string from before
    // the multi-photo gallery — treat it as a one-item gallery rather than
    // losing the photo.
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

  /** Label for a fuel key, from content.fuels — admin-added fuel types resolve too. */
  function fuelLabel(fuel) {
    if (!fuel) return '';
    const match = (store.getContent().fuels ?? []).find((f) => f.key === fuel);
    return match ? localise(match.label) : fuel;
  }

  /** Catalogue categories beyond the core "forklift" line — each is a flat browsing tab. */
  function categories() {
    return (store.getContent().categories ?? []).map((c) => ({ key: c.key, label: localise(c.label) }));
  }

  /** Selectable fuel types, localised — used by both the admin editor and the public filter chips. */
  function fuels() {
    return (store.getContent().fuels ?? []).map((f) => ({ key: f.key, label: localise(f.label) }));
  }

  /** Every product, unfiltered, in stored order. */
  function allProducts() {
    return store.getContent().products ?? [];
  }

  /**
   * Applies the catalogue filters.
   * @param {{mode?: string, fuel?: string}} filters
   *        mode: 'all' | 'sale' | 'rent' | 'parts' | 'wheels'
   *        fuel: 'all' | 'electric' | 'diesel' | 'gasoline'
   */
  function filterProducts({ mode = 'all', fuel = 'all' } = {}) {
    let list = allProducts();

    if (mode === 'sale' || mode === 'rent') {
      list = list.filter((p) => p.mode === mode && p.cat === 'forklift');
      if (fuel !== 'all') list = list.filter((p) => p.fuel === fuel);
    } else if (mode !== 'all') {
      // Any other mode is a category key — parts/wheels today, plus whatever
      // Admin → Filters has added since.
      list = list.filter((p) => p.cat === mode);
    }

    return list;
  }

  /** Fuel chips only make sense for the two forklift modes. */
  function fuelFilterApplies(mode) {
    return mode === 'sale' || mode === 'rent';
  }

  function findProduct(id) {
    return allProducts().find((p) => p.id === id) ?? null;
  }

  /** The first `count` forklifts, for the home page stock strip. */
  function featuredProducts(count = 3) {
    return allProducts()
      .filter((p) => p.cat === 'forklift')
      .slice(0, count);
  }

  /* --------------------------------------------------------------------------
     News
     -------------------------------------------------------------------------- */

  /** Newest first. Dates are ISO, so a string compare is the right sort. */
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

  /* --------------------------------------------------------------------------
     Services, gallery, stats
     -------------------------------------------------------------------------- */

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

  /**
   * The statistic tiles. A stat with `sinceYear` reports elapsed years rather
   * than a stored number, so "years of experience" stays correct without anyone
   * having to remember to bump it every January.
   */
  function stats() {
    const thisYear = new Date().getFullYear();
    return (store.getContent().stats ?? []).map((stat) => ({
      id: stat.id,
      value: stat.sinceYear ? Math.max(0, thisYear - stat.sinceYear) : Number(stat.value) || 0,
      suffix: stat.suffix ?? '',
      label: t(stat.labelKey),
    }));
  }

  /** The founding year, for prose that mentions it. */
  function foundedYear() {
    return store.getContent().foundedYear ?? 1999;
  }

  /* --------------------------------------------------------------------------
     Contacts
     -------------------------------------------------------------------------- */

  function contacts() {
    return store.getContent().contacts ?? {};
  }

  /**
   * The contact table, already localised, with hrefs where a value is actionable.
   *
   * The phone row carries a `parts` array instead of a single href when there
   * is more than one number — each number needs its own tel: link, or the
   * second number would show but not actually be callable.
   *
   * @returns {{key: string, value: string, href?: string, parts?: {value: string, href: string}[]}[]}
   */
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

  /**
   * Everything the contacts map needs, or null when no map should be shown.
   *
   * A manually pasted embed URL wins; otherwise the URLs are built from the
   * stored coordinates so the pin lands exactly where it was set.
   *
   * @returns {{embed: string, link: string, directions: string|null,
   *            coords: string|null} | null}
   */
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

  /**
   * Social and messaging links, ready to render.
   * Entries without a usable destination are dropped rather than rendered as
   * dead icons.
   *
   * @returns {{id: string, type: string, label: string, href: string}[]}
   */
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

  /** The two phone numbers for the CTA band, with dial-ready hrefs. */
  function phoneLinks() {
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
  function text(key) {
    return localise(store.getContent().texts?.[key]);
  }

  function brands() {
    return store.getContent().brands || '';
  }

  /** The wordmarks used by the logo, the hero watermark and the footer ghost. */
  function brand() {
    const b = store.getContent().brand ?? {};
    return { short: b.short || 'LOGI', full: b.full || 'LOGIMOTORS' };
  }

  /** The floating chips around the hero dial, localised. */
  function heroPills() {
    return (store.getContent().heroPills ?? []).map((pill) => localise(pill)).filter(Boolean);
  }

  function settings() {
    return store.getContent().settings ?? {};
  }

  return { decorateProduct, fuelLabel, categories, fuels, allProducts, filterProducts, fuelFilterApplies, findProduct, featuredProducts, sortedNews, decorateNews, services, gallery, stats, foundedYear, contacts, contactRows, mapView, social, phoneLinks, text, brands, brand, heroPills, settings };
})();
