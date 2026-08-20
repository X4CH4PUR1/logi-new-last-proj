window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.home = (function () {
  /**
   * Home page: hero, brand ticker, statistics, services, featured stock,
   * latest news and the closing call to action.
   */

  const { h, when } = Logi.core.dom;
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
  /**
   * @param {{onOpenProduct: (id: string) => void}} handlers
   */
  function homePage({ onOpenProduct }) {
    return h(
      'div',
      { 'data-page': 'home' },
      hero(),
      marquee(),
      statsSection(),
      servicesSection(),
      featuredSection(onOpenProduct),
      newsSection(),
      ctaBand()
    );
  }

  /* --------------------------------------------------------------------------
     Hero
     -------------------------------------------------------------------------- */

  function hero() {
    const parts = {};
    const marks = brand();

    const section = h(
      'section.hero',
      { ref: (el) => attachHeroParallax(el, parts) },

      // Ambient glow orbs; the parallax handler nudges these.
      h('div.hero__orb.hero__orb--a', {
        'aria-hidden': 'true',
        ref: (el) => {
          parts.orbA = el;
        },
      }, h('div.hero__orb-inner')),
      h('div.hero__orb.hero__orb--b', {
        'aria-hidden': 'true',
        ref: (el) => {
          parts.orbB = el;
        },
      }, h('div.hero__orb-inner')),

      h('div.hero__watermark', { text: marks.full, 'aria-hidden': 'true' }),

      h('span.hero__bracket.hero__bracket--tl', { 'aria-hidden': 'true' }),
      h('span.hero__bracket.hero__bracket--tr', { 'aria-hidden': 'true' }),
      h('span.hero__bracket.hero__bracket--bl', { 'aria-hidden': 'true' }),
      h('span.hero__bracket.hero__bracket--br', { 'aria-hidden': 'true' }),

      h(
        'div.hero__cue',
        { 'aria-hidden': 'true' },
        h('span.hero__cue-label', { text: t('scroll') }),
        h('span.hero__cue-line')
      ),

      h(
        'div.hero__inner',
        {},
        h(
          'div.hero__copy',
          {},
          h(
            'p.hero__badge',
            {},
            h('span.hero__badge-dot', { 'aria-hidden': 'true' }),
            text('heroBadge')
          ),
          h('h1.hero__title', { text: text('heroTitle') }),
          h('span.rule.hero__rule', { 'aria-hidden': 'true' }),
          h('p.hero__sub', { text: text('heroSub') }),
          h(
            'div.hero__actions',
            {},
            h('a.btn.btn--primary', {
              href: router.href('products'),
              text: t('heroCta1'),
            }),
            h('a.btn.btn--ghost', {
              href: router.href('contacts'),
              text: t('heroCta2'),
            })
          )
        ),
        dial(parts)
      )
    );

    return section;
  }

  /** The rotating instrument dial on the right of the hero. */
  function dial(parts) {
    const headline = stats()[0];
    const pills = heroPills();

    return h(
      'div.dial-wrap',
      {
        ref: (el) => {
          parts.dial = el;
        },
      },
      h(
        'div.dial',
        { 'aria-hidden': 'true' },
        h('div.dial__sweep'),
        h('div.dial__ticks'),
        h('div.dial__ring-dashed'),
        h('div.dial__ring-solid'),
        h(
          'div.dial__core',
          {},
          h('span.dial__number.grad-text', {
            text: headline ? `${headline.value}${headline.suffix}` : '',
          }),
          h('span.dial__caption', { text: headline?.label ?? '' })
        ),
        pills.map((label, index) =>
          h('span.dial__pill', { class: `dial__pill--${index + 1}`, text: label })
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Brand ticker
     -------------------------------------------------------------------------- */

  /**
   * Two rows drifting in opposite directions. Each row repeats its text four
   * times so the -50% loop has no visible seam at any viewport width.
   */
  function marquee() {
    const line = brands();
    const row = (trackClass, itemClass) =>
      h(
        'div',
        { class: `marquee__track ${trackClass}` },
        Array.from({ length: 4 }, () =>
          h('span', { class: `marquee__item ${itemClass}`, text: line })
        )
      );

    return h(
      'div.marquee',
      { 'aria-hidden': 'true' },
      row('', ''),
      row('marquee__track--reverse', 'marquee__item--outline ghost-text')
    );
  }

  /* --------------------------------------------------------------------------
     Sections
     -------------------------------------------------------------------------- */

  function statsSection() {
    return h(
      'section.container',
      { style: { padding: '72px var(--gutter) 24px' }, ref: attachReveal },
      statGrid(stats())
    );
  }

  function servicesSection() {
    return h(
      'section.section.container',
      { ref: attachReveal },
      h('div', {}, h('div.eyebrow', { text: '// SERVICES' }), h('h2.section__title', {
        text: t('secServices'),
        style: { marginBottom: '36px' },
      })),
      serviceGrid(services(), { ghost: true })
    );
  }

  function featuredSection(onOpenProduct) {
    const products = featuredProducts(3);
    if (!products.length) return null;

    return h(
      'section.container',
      { style: { padding: '24px var(--gutter) 72px' }, ref: attachReveal },
      sectionHead({ label: 'STOCK', title: t('secFeatured'), linkTo: 'products' }),
      productGrid(products, onOpenProduct, { showBrand: false })
    );
  }

  function newsSection() {
    const posts = sortedNews().slice(0, 2).map(decorateNews);
    if (!posts.length) return null;

    return h(
      'section.container',
      { style: { padding: '0 var(--gutter) 72px' }, ref: attachReveal },
      sectionHead({ label: 'FEED', title: t('secNews'), linkTo: 'news' }),
      h(
        'div.grid',
        { style: { '--min': '320px' } },
        posts.map((post) =>
          h(
            'a.card.card--lift.card--link.news-teaser.notch',
            { href: router.href('news') },
            h('div.news-item__date', { text: post.date }),
            h('div.news-teaser__title', { text: post.title }),
            when(post.excerpt, () => h('p.news-teaser__excerpt', { text: post.excerpt }))
          )
        )
      )
    );
  }

  return { homePage };
})();
