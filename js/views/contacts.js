window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.contacts = (function () {
  /**
   * Contacts page: the detail table with a map, and the enquiry form.
   */

  const { h, when } = Logi.core.dom;
  const { localise, t } = Logi.core.i18n;
  const { contactRows, contacts, mapView } = Logi.core.selectors;
  const { pageHeader } = Logi.views.partials;
  const { contactForm } = Logi.views["contact-form"];
  function contactsPage() {
    return h(
      'div.page.container',
      { 'data-page': 'contacts' },
      pageHeader('CONTACT', t('contactsTitle')),
      h(
        'div.contacts-grid',
        {},
        detailsCard(),
        h('div.card.contact-form-panel.notch', {}, contactForm({ title: t('heroCta2') }))
      )
    );
  }

  function detailsCard() {
    return h(
      'div.card.contact-card.notch',
      {},
      contactRows().map((row) =>
        h(
          'div.contact-row',
          {},
          h('span.contact-row__key', { text: row.key }),
          h(
            'span.contact-row__value',
            {},
            row.href
              ? h('a', {
                  href: row.href,
                  text: row.value,
                  rel: row.href.startsWith('http') ? 'noopener noreferrer' : null,
                  target: row.href.startsWith('http') ? '_blank' : null,
                })
              : row.value
          )
        )
      ),
      map()
    );
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
      return h('div.placeholder.contact-card__map', { 'aria-hidden': 'true' }, h('span', { text: 'map' }));
    }

    return h(
      'div',
      { style: { flex: '1', display: 'flex', flexDirection: 'column', minHeight: '220px' } },
      h('iframe.contact-card__map', {
        src: view.embed,
        title: `${t('address')} — ${localise(contacts().address)}`,
        loading: 'lazy',
        referrerpolicy: 'no-referrer-when-downgrade',
        // Third-party frame: withholding allow-top-navigation means the embed
        // can never redirect the page out from under a visitor. It still gets
        // scripts and its own origin, which map tiles need, and popups so
        // "view larger map" opens in a new tab.
        sandbox: 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox',
        style: { flex: '1', minHeight: '220px' },
      }),
      h(
        'div',
        {
          style: {
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: '12px 26px 16px',
            fontSize: '13px',
          },
        },
        when(view.link, () =>
          h('a', {
            href: view.link,
            target: '_blank',
            rel: 'noopener noreferrer',
            text: `${t('viewAll')} →`,
          })
        ),
        when(view.directions, () =>
          h('a', {
            href: view.directions,
            target: '_blank',
            rel: 'noopener noreferrer',
            text: `${t('address')} →`,
          })
        )
      )
    );
  }

  return { contactsPage };
})();
