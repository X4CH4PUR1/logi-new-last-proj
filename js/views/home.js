window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.home = (function () {

  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const router = Logi.core.router;
  const { attachHeroParallax, attachReveal } = Logi.core.effects;
  const {
    brand,
    brands,
    decorateNews,
    featuredProducts,
    heroPills,
    services,
    sortedNews,
    stats,
    text,
  } = Logi.core.selectors;
  const {
    ctaBand,
    productGrid,
    sectionHead,
    serviceGrid,
    statGrid,
  } = Logi.views.partials;
  function homePage({ onOpenProduct }) {
    const root = tpl.clone('home');
    tpl.place(root, 'hero', hero());
    tpl.place(root, 'marquee', marquee());
    tpl.place(root, 'stats', statsSection());
    tpl.place(root, 'services', servicesSection());
    tpl.place(root, 'featured', featuredSection(onOpenProduct));
    tpl.place(root, 'news', newsSection());
    tpl.place(root, 'cta', ctaBand());
    return root;
  }

  function hero() {
    const parts = {};
    const marks = brand();

    const root = tpl.clone('hero');
    const { orbA, orbB } = tpl.refs(root);
    parts.orbA = orbA;
    parts.orbB = orbB;

    tpl.bind(root, {
      brandFull: marks.full,
      scroll: t('scroll'),
      heroBadge: text('heroBadge'),
      heroTitle: text('heroTitle'),
      heroSub: text('heroSub'),
      heroCta1: t('heroCta1'),
      heroCta2: t('heroCta2'),
    });
    tpl.bindAttr(root, {
      productsHref: router.href('products'),
      contactsHref: router.href('contacts'),
    });

    tpl.place(root, 'dial', dial(parts));

    attachHeroParallax(root, parts);
    return root;
  }

  function dial(parts) {
    const headline = stats()[0];
    const pills = heroPills();

    const root = tpl.clone('dial');
    const { dialWrap } = tpl.refs(root);
    parts.dial = dialWrap;

    tpl.bind(root, {
      number: headline ? `${headline.value}${headline.suffix}` : '',
      caption: headline?.label ?? '',
    });
    tpl.each(tpl.slot(root, 'pills'), pills, (label, index) => {
      const pill = tpl.clone('dial-pill');
      pill.classList.add(`dial__pill--${index + 1}`);
      tpl.bind(pill, { label });
      return pill;
    });

    return root;
  }

  function marquee() {
    const root = tpl.clone('marquee');
    tpl.bind(root, { brand: brands() });
    return root;
  }

  function statsSection() {
    const root = tpl.clone('stats-section');
    tpl.place(root, 'grid', statGrid(stats()));
    attachReveal(root);
    return root;
  }

  function servicesSection() {
    const root = tpl.clone('services-section');
    tpl.bind(root, { title: t('secServices') });
    tpl.place(root, 'grid', serviceGrid(services(), { ghost: true }));
    attachReveal(root);
    return root;
  }

  function featuredSection(onOpenProduct) {
    const products = featuredProducts(3);
    if (!products.length) return null;

    const root = tpl.clone('featured-section');
    tpl.place(root, 'head', sectionHead({ label: 'STOCK', title: t('secFeatured'), linkTo: 'products' }));
    tpl.place(root, 'grid', productGrid(products, onOpenProduct, { showBrand: false }));
    attachReveal(root);
    return root;
  }

  function newsSection() {
    const posts = sortedNews().slice(0, 2).map(decorateNews);
    if (!posts.length) return null;

    const root = tpl.clone('news-section');
    tpl.place(root, 'head', sectionHead({ label: 'FEED', title: t('secNews'), linkTo: 'news' }));
    tpl.each(tpl.slot(root, 'grid'), posts, (post) => {
      const a = tpl.clone('news-teaser');
      const { excerpt } = tpl.refs(a);
      tpl.bindAttr(a, { href: router.href('news') });
      tpl.bind(a, { date: post.date, title: post.title, excerpt: post.excerpt });
      tpl.toggle(excerpt, !!post.excerpt);
      return a;
    });
    attachReveal(root);
    return root;
  }

  return { homePage };
})();
