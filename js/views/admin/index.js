window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.index = (function () {
  /**
   * Admin shell: the lock screen, the toolbar and the tab bar.
   *
   * The active tab lives in the URL (#/control-room/gallery), so a reload keeps you
   * where you were and a tab can be bookmarked. The editing language does not —
   * it is a preference for this sitting, not a place.
   */

  const { h, mount, when } = Logi.core.dom;
  const store = Logi.core.store;
  const router = Logi.core.router;
  const auth = Logi.core.auth;
  const toast = Logi.core.toast;
  const { editLangSwitch } = Logi.views.admin.fields;
  const { productsTab } = Logi.views.admin.products;
  const { filtersTab } = Logi.views.admin.filters;
  const { newsTab } = Logi.views.admin.news;
  const { galleryTab } = Logi.views.admin.gallery;
  const { servicesTab } = Logi.views.admin.services;
  const { textsTab } = Logi.views.admin.texts;
  const { uiStringsTab } = Logi.views.admin["ui-strings"];
  const { contactsTab } = Logi.views.admin.contacts;
  const { settingsTab } = Logi.views.admin.settings;
  const { publishTab } = Logi.views.admin.publish;
  const TABS = [
    { key: 'products', label: 'Products', build: productsTab },
    { key: 'filters', label: 'Filters', build: filtersTab },
    { key: 'news', label: 'News', build: newsTab },
    { key: 'gallery', label: 'Gallery', build: galleryTab },
    { key: 'services', label: 'Services', build: servicesTab },
    { key: 'texts', label: 'Texts', build: textsTab },
    { key: 'ui', label: 'UI text', build: uiStringsTab },
    { key: 'contacts', label: 'Contacts', build: contactsTab },
    { key: 'settings', label: 'Settings', build: settingsTab },
    { key: 'publish', label: 'Publish', build: publishTab },
  ];

  /**
   * @param {{tab?: string, onAuthChange?: () => void}} options
   *        `tab` comes from the URL; `onAuthChange` rebuilds the page after an
   *        unlock or a lock, neither of which changes the URL.
   */
  function adminPage({ tab, onAuthChange = () => {} } = {}) {
    return auth.isUnlocked() ? dashboard(tab, onAuthChange) : lockScreen(onAuthChange);
  }

  /* --------------------------------------------------------------------------
     Lock screen
     -------------------------------------------------------------------------- */

  function lockScreen(onAuthChange) {
    let pin = '';
    const error = h('p.form__error', { hidden: true, role: 'alert' });

    const submit = async (event) => {
      event.preventDefault();
      if (await auth.verify(pin)) {
        auth.unlock();
        onAuthChange();
        return;
      }
      error.textContent = 'That PIN is not correct.';
      error.hidden = false;
    };

    return h(
      'div.admin',
      {},
      h(
        'div.card.admin-lock.notch',
        {},
        h('p.admin-lock__eyebrow', { text: '// RESTRICTED' }),
        h('h1.admin-lock__title', { text: 'Admin panel' }),
        h(
          'form.form',
          { on: { submit } },
          h('input.input.admin-lock__pin', {
            type: 'password',
            inputmode: 'numeric',
            autocomplete: 'current-password',
            placeholder: 'PIN',
            'aria-label': 'Admin PIN',
            on: {
              input: (event) => {
                pin = event.currentTarget.value;
                error.hidden = true;
              },
            },
          }),
          h('button.btn.btn--primary.btn--block', { type: 'submit', text: 'Enter' })
        ),
        error,
        when(auth.usingDefaultPin(), () =>
          h('p.hint', {
            style: { marginTop: '18px' },
            text: 'Default PIN: 1234 — change it in Settings once you are in.',
          })
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     Dashboard
     -------------------------------------------------------------------------- */

  function dashboard(requestedTab, onAuthChange) {
    const active = TABS.find((t) => t.key === requestedTab) ?? TABS[0];
    const body = h('div');

    const renderBody = () => mount(body, active.build());
    renderBody();

    return h(
      'div.admin',
      {},
      h(
        'div.admin__head',
        {},
        h(
          'div',
          {},
          h('p.admin__eyebrow', { text: '// CONTROL ROOM' }),
          h('h1.admin__title', { text: 'Admin panel' })
        ),
        h(
          'div.admin__tools',
          {},
          statusPill(),
          h('span.admin__tools-label', { text: 'EDIT LANG' }),
          // Switching the editing language rebuilds only the current tab, so
          // every field re-reads in the new language without losing the shell.
          editLangSwitch(renderBody),
          h('button.btn-plain', {
            type: 'button',
            text: 'Lock',
            on: {
              click: () => {
                auth.lock();
                toast.show('Admin locked');
                onAuthChange();
              },
            },
          })
        )
      ),
      tabBar(active),
      body
    );
  }

  function statusPill() {
    const dirty = store.isDirty();
    return h(
      'span.admin__status',
      { dataset: { dirty: String(dirty) }, title: 'Whether your edits are live for visitors' },
      h('span.admin__status-dot'),
      h('span', {
        'data-role': 'status-label',
        text: dirty ? 'UNPUBLISHED CHANGES' : 'PUBLISHED',
      })
    );
  }

  function tabBar(active) {
    return h(
      'div.admin__tabs',
      { role: 'tablist', 'aria-label': 'Admin sections' },
      TABS.map((tab) =>
        h('a.tab', {
          role: 'tab',
          href: router.href('admin', tab.key),
          text: tab.label,
          'aria-selected': String(tab.key === active.key),
          style: { textDecoration: 'none' },
        })
      )
    );
  }

  return { adminPage };
})();
