window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.about = (function () {
  /**
   * About page: intro, the concept and policy panels, and the statistics.
   */

  const { h } = Logi.core.dom;
  const { t } = Logi.core.i18n;
  const { stats, text } = Logi.core.selectors;
  const { pageHeader, statGrid } = Logi.views.partials;
  function aboutPage() {
    return h(
      'div.page.container',
      { 'data-page': 'about' },
      pageHeader('COMPANY', t('aboutTitle')),
      h('span.rule.about__rule', { 'aria-hidden': 'true' }),
      h('p.about__lead', { text: text('about1') }),

      h(
        'div.grid.about__panels',
        {},
        panel('CONCEPT', text('about2')),
        panel('POLICY', text('about3'))
      ),

      h('div.about__strip', { text: t('anyBrand') }),
      h('div.about__stats', {}, statGrid(stats(), { compact: true }))
    );
  }

  function panel(label, body) {
    return h(
      'div.card.about__panel.notch',
      {},
      h('div.about__panel-label', { text: label }),
      h('p.about__panel-text', { text: body })
    );
  }

  return { aboutPage };
})();
