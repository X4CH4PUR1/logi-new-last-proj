window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.settings = (function () {

  const { h, mount } = Logi.core.dom;
  const store = Logi.core.store;
  const auth = Logi.core.auth;
  const toast = Logi.core.toast;
  const { LANGUAGES, NAV_ROUTES } = Logi.data.config;
  const {
    checkboxInput,
    commit,
    editorPanel,
    patchDebounced,
    primaryButton,
    select,
    textInput,
  } = Logi.views.admin.fields;

  const HIDEABLE_PAGES = NAV_ROUTES.filter((r) => r.key !== 'home').map((r) => ({
    key: r.key,
    label: r.key.charAt(0).toUpperCase() + r.key.slice(1),
  }));
  function settingsTab() {
    const panel = h('div.admin__panel');

    const render = () => {
      const settings = store.getContent().settings ?? {};

      mount(
        panel,
        h('p.admin__panel-intro', {
          text: 'How the site behaves for a first-time visitor, and how enquiries reach you.',
        }),

        editorPanel(
          'Defaults for new visitors',
          h(
            'div.admin-editor__grid',
            {},
            select({
              label: 'Starting language',
              value: settings.defaultLang,
              options: LANGUAGES.map((l) => ({ value: l.code, label: l.name })),
              hint: "Only used when the visitor's browser language is not one of the three.",
              onInput: (value) =>
                patchDebounced((draft) => {
                  draft.settings.defaultLang = value;
                }),
            }),
            select({
              label: 'Starting theme',
              value: settings.defaultTheme,
              options: [
                { value: 'night', label: 'Night (dark)' },
                { value: 'day', label: 'Day (light)' },
              ],
              onInput: (value) =>
                patchDebounced((draft) => {
                  draft.settings.defaultTheme = value;
                }),
            })
          )
        ),

        editorPanel(
          'Contact form delivery',
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
            h('p.hint', {
              text:
                'Leave this empty and the form opens the visitor’s own mail app with the message ready to send — ' +
                'no server needed, but it depends on them having one set up. Paste a form endpoint ' +
                '(Formspree, Basin, Web3Forms and similar all work) to receive submissions by e-mail instead.',
            }),
            textInput({
              label: 'Form endpoint URL',
              type: 'url',
              value: settings.formEndpoint,
              placeholder: 'https://formspree.io/f/xxxxxxx',
              onInput: (value) =>
                patchDebounced((draft) => {
                  draft.settings.formEndpoint = value.trim();
                }),
            })
          )
        ),

        pagesPanel(settings),
        pinPanel()
      );
    };

    function pagesPanel(settings) {
      const hidden = new Set(settings.hiddenPages ?? []);

      const toggle = (key, checked) =>
        commit((draft) => {
          draft.settings.hiddenPages = draft.settings.hiddenPages ?? [];
          const set = new Set(draft.settings.hiddenPages);
          if (checked) set.delete(key);
          else set.add(key);
          draft.settings.hiddenPages = [...set];
        });

      return editorPanel(
        'Pages',
        h('p.hint', {
          text:
            'Hide a page and it disappears from the menu; anyone who still has the old link is sent ' +
            'back to the home page instead.',
        }),
        h(
          'div.admin-page-list',
          {},
          HIDEABLE_PAGES.map((page) =>
            checkboxInput({
              label: page.label,
              checked: !hidden.has(page.key),
              onChange: (checked) => toggle(page.key, checked),
            })
          )
        )
      );
    }

    function pinPanel() {
      let current = '';
      let next = '';
      let confirm = '';

      const message = h('p.hint', {
        text: auth.usingDefaultPin()
          ? 'This site is still using the default PIN of 1234. Change it.'
          : 'A PIN is set.',
        style: auth.usingDefaultPin() ? { color: 'var(--accent)' } : null,
      });

      const change = async () => {
        if (!(await auth.verify(current))) {
          toast.error('The current PIN is not correct.');
          return;
        }
        if (next !== confirm) {
          toast.error('The two new PINs do not match.');
          return;
        }
        const result = await auth.setPin(next);
        if (!result.ok) {
          toast.error(result.reason);
          return;
        }
        toast.show('PIN changed. It applies once you publish.');
        render();
      };

      return editorPanel(
        'Admin PIN',
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
          h('p.hint', {
            text:
              'This lock keeps the editor out of the way of ordinary visitors. It is not security: ' +
              'the check runs in the browser, so anyone determined can get past it and edit their own ' +
              'copy of the page. What protects the live site is that publishing needs a commit to the repository.',
          }),
          message,
          h(
            'div.admin-editor__grid',
            {},
            textInput({
              label: 'Current PIN',
              type: 'password',
              value: '',
              onInput: (value) => {
                current = value;
              },
            }),
            textInput({
              label: 'New PIN',
              type: 'password',
              value: '',
              hint: '4 to 12 digits',
              onInput: (value) => {
                next = value;
              },
            }),
            textInput({
              label: 'Repeat new PIN',
              type: 'password',
              value: '',
              onInput: (value) => {
                confirm = value;
              },
            })
          ),
          h('div', {}, primaryButton('Change PIN', change))
        )
      );
    }

    render();
    return panel;
  }

  return { settingsTab };
})();
