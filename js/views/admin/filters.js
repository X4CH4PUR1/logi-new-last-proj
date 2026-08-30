window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.filters = (function () {

  const { h, mount } = Logi.core.dom;
  const store = Logi.core.store;
  const { makeId } = Logi.util.format;
  const {
    commit,
    confirmThen,
    editorPanel,
    localisedInput,
    patchDebounced,
    primaryButton,
    setTranslation,
  } = Logi.views.admin.fields;

  function filtersTab() {
    const panel = h('div.admin__panel');

    const render = () => {
      const content = store.getContent();
      mount(
        panel,
        h('p.admin__panel-intro', {
          text:
            'Categories become tabs on the Products page, alongside the fixed All / Sale / Rent. ' +
            'Fuel types become the filter chips shown under Sale and Rent. Both also appear as choices ' +
            'in the product editor.',
        }),
        list({
          listKey: 'categories',
          title: 'Categories',
          items: content.categories ?? [],
          addLabel: '+ Add category',
          emptyHint: 'No extra categories yet — Forklift always shows.',
          idPrefix: 'cat',
        }),
        list({
          listKey: 'fuels',
          title: 'Fuel types',
          items: content.fuels ?? [],
          addLabel: '+ Add fuel type',
          emptyHint: 'No fuel types yet.',
          idPrefix: 'fuel',
        })
      );
    };

    function list({ listKey, title, items, addLabel, emptyHint, idPrefix }) {
      return editorPanel(
        title,
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
          items.length ? items.map((item) => row(listKey, item)) : h('p.hint', { text: emptyHint }),
          primaryButton(addLabel, () =>
            commit((content) => {
              content[listKey] = content[listKey] ?? [];
              content[listKey].push({ key: makeId(`${idPrefix}-`), label: { ka: '', en: '', ru: '' } });
            }, 'Added — set its name below')
          )
        )
      );
    }

    function row(listKey, item) {
      const write = (mutate) =>
        patchDebounced((content) => {
          const target = content[listKey].find((entry) => entry.key === item.key);
          if (target) mutate(target);
        });

      return h(
        'div.card.notch',
        { style: { padding: '14px 16px' } },
        localisedInput({
          label: 'Name',
          value: item.label,
          onInput: (lang, value) => write((target) => setTranslation(target, 'label', lang, value)),
        }),
        h('button.btn-plain.btn-plain--danger', {
          type: 'button',
          text: 'Delete',
          on: {
            click: confirmThen(
              'Delete this filter option? Products already using it keep the value, ' +
                'but it will stop showing up as a filter choice.',
              () =>
                commit((content) => {
                  content[listKey] = content[listKey].filter((entry) => entry.key !== item.key);
                }, 'Deleted')
            ),
          },
        })
      );
    }

    render();
    return panel;
  }

  return { filtersTab };
})();
