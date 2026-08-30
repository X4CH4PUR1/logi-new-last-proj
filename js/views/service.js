window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.service = (function () {

  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const { services, text } = Logi.core.selectors;
  const { pageHeader, serviceGrid } = Logi.views.partials;
  const { contactForm } = Logi.views["contact-form"];

  function servicePage() {
    const root = tpl.clone('service');
    const [eyebrowEl, titleEl] = pageHeader('SERVICE', t('serviceTitle'));
    tpl.place(root, 'eyebrow', eyebrowEl);
    tpl.place(root, 'title', titleEl);
    tpl.bind(root, { intro: text('serviceIntro') });
    tpl.place(root, 'grid', serviceGrid(services()));
    tpl.place(root, 'form', contactForm({ title: t('serviceCta') }));
    return root;
  }

  return { servicePage };
})();
