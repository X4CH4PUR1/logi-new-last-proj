window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.about = (function () {
  /**
   * About page: intro, the concept and policy panels, and the statistics.
   */

  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const { stats, text } = Logi.core.selectors;
  const { pageHeader, statGrid } = Logi.views.partials;

  function aboutPage() {
    const root = tpl.clone('about');
    const [eyebrowEl, titleEl] = pageHeader('COMPANY', t('aboutTitle'));
    tpl.place(root, 'eyebrow', eyebrowEl);
    tpl.place(root, 'title', titleEl);
    tpl.bind(root, {
      lead: text('about1'),
      about2: text('about2'),
      about3: text('about3'),
      anyBrand: t('anyBrand'),
    });
    tpl.place(root, 'stats', statGrid(stats(), { compact: true }));
    return root;
  }

  return { aboutPage };
})();
