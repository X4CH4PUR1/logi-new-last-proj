window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.contacts = (function () {

  const tpl = Logi.core.tpl;
  const { localise, t } = Logi.core.i18n;
  const { contactRows, contacts, mapView } = Logi.core.selectors;
  const { pageHeader } = Logi.views.partials;
  const { contactForm } = Logi.views["contact-form"];

  function contactsPage() {
    const root = tpl.clone('contacts');
    const [eyebrowEl, titleEl] = pageHeader('CONTACT', t('contactsTitle'));
    tpl.place(root, 'eyebrow', eyebrowEl);
    tpl.place(root, 'title', titleEl);
    tpl.place(root, 'details', detailsCard());
    tpl.place(root, 'form', contactForm({ title: t('heroCta2'), messageRows: 10 }));
    return root;
  }

  function detailsCard() {
    const root = tpl.clone('contact-details');
    const mapMarker = tpl.slot(root, 'map');
    for (const row of contactRows()) {
      mapMarker.before(contactRow(row));
    }
    tpl.place(root, 'map', map());
    return root;
  }

  function contactRow(row) {
    const root = tpl.clone('contact-row');
    const { link, plain, parts } = tpl.refs(root);
    tpl.bind(root, { key: row.key, value: row.value });

    if (row.parts) {
      tpl.toggle(link, false);
      tpl.toggle(plain, false);
      tpl.toggle(parts, true);
      row.parts.forEach((part, index) => {
        if (index > 0) parts.append(' · ');
        const a = tpl.clone('contact-row-part');
        tpl.bindAttr(a, { href: part.href });
        tpl.bind(a, { value: part.value });
        parts.append(a);
      });
      return root;
    }

    tpl.toggle(link, !!row.href);
    tpl.toggle(plain, !row.href);
    if (row.href) {
      tpl.bindAttr(root, { href: row.href });
      if (row.href.startsWith('http')) {
        link.rel = 'noopener noreferrer';
        link.target = '_blank';
      }
    }
    return root;
  }

  function map() {
    const view = mapView();

    if (!view) {
      const root = tpl.clone('contact-map-placeholder');
      tpl.bind(root, { label: 'map' });
      return root;
    }

    const root = tpl.clone('contact-map');
    const { linkA, directionsA } = tpl.refs(root);
    tpl.bindAttr(root, {
      embed: view.embed,
      mapTitle: `${t('address')} — ${localise(contacts().address)}`,
      link: view.link || '',
      directions: view.directions || '',
    });
    tpl.bind(root, { viewAllLabel: `${t('viewAll')} →`, directionsLabel: `${t('address')} →` });
    tpl.toggle(linkA, !!view.link);
    tpl.toggle(directionsA, !!view.directions);
    return root;
  }

  return { contactsPage };
})();
