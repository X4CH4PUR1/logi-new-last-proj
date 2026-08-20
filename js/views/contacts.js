window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.contacts = (function () {
  /**
   * Contacts page: the detail table with a map, and the enquiry form.
   */

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
    tpl.place(root, 'form', contactForm({ title: t('heroCta2') }));
    return root;
  }

  function detailsCard() {
    const root = tpl.clone('contact-details');
    // Rows are inserted before the map marker (not via each()/clear+append,
    // which would also wipe the marker) so both can share one container,
    // exactly like the original's rows-then-map child list.
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
      // Several numbers in one row — each needs its own tel: link, so a
      // single href on the row (as below) can't cover both.
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

  /**
   * The map, pinned on the exact coordinates set in Admin → Contacts.
   *
   * When no coordinates are set the same hatched placeholder the rest of the
   * site uses appears instead — which also means no request to a third party.
   * The frame is lazy-loaded, so a visitor who never scrolls this far never
   * contacts openstreetmap.org at all.
   */
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
      // Third-party frame: withholding allow-top-navigation means the embed
      // can never redirect the page out from under a visitor. It still gets
      // scripts and its own origin, which map tiles need, and popups so
      // "view larger map" opens in a new tab.
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
