window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.service = (function () {
  /**
   * Service page: what the workshop does, and a booking form.
   */

  const { h } = Logi.core.dom;
  const { t } = Logi.core.i18n;
  const { services, text } = Logi.core.selectors;
  const { pageHeader, serviceGrid } = Logi.views.partials;
  const { contactForm } = Logi.views["contact-form"];
  function servicePage() {
    return h(
      'div.page.container',
      { 'data-page': 'service' },
      pageHeader('SERVICE', t('serviceTitle')),
      h('p.service__intro', { text: text('serviceIntro') }),
      h('div.service__grid', {}, serviceGrid(services())),
      h('div.card.booking.notch', {}, contactForm({ title: t('serviceCta') }))
    );
  }

  return { servicePage };
})();
