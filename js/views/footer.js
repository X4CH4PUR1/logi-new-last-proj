window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.footer = (function () {
  /**
   * Site footer: legal name, menu, contact details, and the admin entry point.
   */

  const tpl = Logi.core.tpl;
  const { t, localise } = Logi.core.i18n;
  const router = Logi.core.router;
  const { brand, contacts, phoneLinks, visibleNavRoutes } = Logi.core.selectors;
  function footer() {
    const c = contacts();
    const marks = brand();
    const phones = phoneLinks();
    const year = new Date().getFullYear();

    const root = tpl.clone('footer');
    const { address, phones: phonesEl, email, hours } = tpl.refs(root);

    tpl.bind(root, {
      brandShort: marks.short,
      legal: localise(c.legal),
      menuLabel: t('menu'),
      address: localise(c.address),
      email: c.email,
      hours: localise(c.hours),
      // No admin link here on purpose. The panel lives at an unlisted address
      // (ADMIN_PATH in js/data/config.js) so visitors never see a way in.
      copyright: `© ${year} ${localise(c.legal)}${c.idCode ? ` · ID ${c.idCode}` : ''}`,
    });
    tpl.toggle(address, !!c.address);
    // Each number gets its own tel: link — joining them under one href meant
    // only the first was ever actually callable.
    tpl.toggle(phonesEl, phones.length > 0);
    phones.forEach((phone, index) => {
      if (index > 0) phonesEl.append(' · ');
      const a = tpl.clone('footer-phone');
      tpl.bindAttr(a, { href: phone.href });
      tpl.bind(a, { label: phone.label });
      phonesEl.append(a);
    });
    tpl.toggle(email, !!c.email);
    if (c.email) tpl.bindAttr(root, { emailHref: `mailto:${c.email}` });
    tpl.toggle(hours, !!c.hours);

    tpl.each(tpl.slot(root, 'menu-links'), visibleNavRoutes(), (route) => {
      const a = tpl.clone('footer-link');
      tpl.bindAttr(a, { href: router.href(route.key) });
      tpl.bind(a, { label: t(route.labelKey) });
      return a;
    });

    return root;
  }

  return { footer };
})();
