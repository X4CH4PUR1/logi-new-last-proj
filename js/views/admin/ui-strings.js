window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin["ui-strings"] = (function () {
  /**
   * Admin → UI text.
   *
   * Every button label, table header and filter name on the site, editable per
   * language. A field left at its shipped wording stores nothing; clearing an
   * edited field removes the override rather than saving an empty string, so
   * "Reset" genuinely restores the translation from locales/<lang>.js.
   */

  const { h, mount, when } = Logi.core.dom;
  const store = Logi.core.store;
  const i18n = Logi.core.i18n;
  const { humanise } = Logi.util.format;
  const { getEditLang, patchDebounced, commit } = Logi.views.admin.fields;
  function uiStringsTab() {
    const panel = h('div.admin__panel');
    let query = '';

    const render = () => {
      const lang = getEditLang();
      const overrides = store.getContent().strings?.[lang] ?? {};
      const needle = query.trim().toLowerCase();

      const keys = i18n.keys().filter((key) => {
        if (!needle) return true;
        return (
          key.toLowerCase().includes(needle) ||
          String(i18n.base(key, lang)).toLowerCase().includes(needle) ||
          String(overrides[key] ?? '').toLowerCase().includes(needle)
        );
      });

      const changed = Object.keys(overrides).filter((k) => overrides[k] !== undefined).length;

      mount(
        panel,
        h('p.admin__panel-intro', {
          text:
            'Interface labels for the language selected above. Leave a field as it is to keep the ' +
            'shipped translation; clear it to go back to that translation after an edit.',
        }),

        h(
          'div',
          { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' } },
          h('input.input.input--sm.admin-texts__search', {
            type: 'search',
            value: query,
            placeholder: 'Filter labels…',
            'aria-label': 'Filter labels',
            on: {
              input: (event) => {
                query = event.currentTarget.value;
                render();
              },
            },
          }),
          h('span.hint', {
            text: changed
              ? `${changed} label${changed === 1 ? '' : 's'} customised in ${lang.toUpperCase()}`
              : `No customised labels in ${lang.toUpperCase()}`,
          }),
          when(changed > 0, () =>
            h('button.btn-plain.btn-plain--danger', {
              type: 'button',
              text: 'Reset all',
              on: {
                click: () => {
                  if (!window.confirm(`Reset every customised label in ${lang.toUpperCase()}?`)) return;
                  commit((draft) => {
                    draft.strings[lang] = {};
                  }, 'Labels reset');
                  render();
                },
              },
            })
          )
        ),

        keys.length
          ? h('div.admin-texts', {}, keys.map((key) => row(key, lang, overrides)))
          : h('p.hint', { text: 'No labels match that filter.' })
      );
    };

    function row(key, lang, overrides) {
      const shipped = i18n.base(key, lang);
      const override = overrides[key];
      const isCustom = typeof override === 'string' && override !== '';

      const input = h('input.input.input--sm', {
        value: isCustom ? override : shipped,
        'aria-label': humanise(key),
        on: {
          input: (event) => {
            const value = event.currentTarget.value;
            patchDebounced((draft) => {
              if (!draft.strings[lang]) draft.strings[lang] = {};
              // Matching the shipped wording, or emptied — drop the override.
              if (value === '' || value === shipped) delete draft.strings[lang][key];
              else draft.strings[lang][key] = value;
            });
            marker.hidden = value === shipped || value === '';
          },
        },
      });

      const marker = h('span.badge', {
        text: 'custom',
        hidden: !isCustom,
        style: { color: 'var(--accent)', borderColor: 'var(--accent)' },
      });

      return h(
        'label.field',
        {},
        h(
          'span.field__label',
          { style: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' } },
          h('span', { text: humanise(key) }),
          marker
        ),
        input
      );
    }

    render();
    return panel;
  }

  return { uiStringsTab };
})();
