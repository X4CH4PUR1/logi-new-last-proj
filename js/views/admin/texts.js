window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.texts = (function () {
  /**
   * Admin → Texts.
   *
   * Every editorial block on the site that is not a product, a post or a photo:
   * the hero copy, the About paragraphs, the service intro, the brand wordmarks,
   * the ticker and the four chips around the hero dial.
   *
   * Everything here saves as you type.
   */

  const { h, mount } = Logi.core.dom;
  const store = Logi.core.store;
  const { humanise } = Logi.util.format;
  const {
    editorPanel,
    localisedInput,
    patchDebounced,
    textArea,
    textInput,
  } = Logi.views.admin.fields;
  /**
   * Which content.texts keys to show, in which order, with a readable label and
   * whether they deserve a multi-line box.
   */
  const TEXT_BLOCKS = [
    { key: 'heroBadge', label: 'Hero — badge line', rows: 2 },
    { key: 'heroTitle', label: 'Hero — headline', rows: 2 },
    { key: 'heroSub', label: 'Hero — subtitle', rows: 3 },
    { key: 'about1', label: 'About — introduction', rows: 5 },
    { key: 'about2', label: 'About — concept panel', rows: 5 },
    { key: 'about3', label: 'About — policy panel', rows: 5 },
    { key: 'serviceIntro', label: 'Service — introduction', rows: 4 },
    { key: 'metaDescription', label: 'Search engine description', rows: 3 },
  ];

  /** Readable names for the statistic tiles, keyed by their stable id. */
  const STAT_LABELS = {
    years: 'Years of experience',
    machines: 'Machines serviced',
    parts: 'Parts delivered',
    support: 'Support',
  };

  const statLabel = (id) => STAT_LABELS[id] ?? humanise(id);

  function textsTab() {
    const panel = h('div.admin__panel');

    const render = () => {
      const content = store.getContent();

      mount(
        panel,
        h('p.admin__panel-intro', {
          text:
            'The written copy across the site. Each field edits the language selected in the toolbar ' +
            'above — switch it to translate the same block into Georgian or Russian. Changes save as you type.',
        }),

        editorPanel(
          'Page copy',
          h(
            'div.admin-texts',
            {},
            TEXT_BLOCKS.map((block) =>
              localisedInput({
                label: block.label,
                multiline: block.rows > 1,
                rows: block.rows,
                value: content.texts?.[block.key],
                onInput: (lang, value) =>
                  patchDebounced((draft) => {
                    if (!draft.texts[block.key] || typeof draft.texts[block.key] !== 'object') {
                      draft.texts[block.key] = {};
                    }
                    draft.texts[block.key][lang] = value;
                  }),
              })
            )
          )
        ),

        editorPanel(
          'Wordmarks',
          h(
            'div.admin-editor__grid',
            {},
            textInput({
              label: 'Short mark (logo, footer)',
              value: content.brand?.short,
              hint: 'Shown in the header logo and as the giant outline in the footer.',
              onInput: (value) =>
                patchDebounced((draft) => {
                  draft.brand.short = value;
                }),
            }),
            textInput({
              label: 'Full mark (hero watermark)',
              value: content.brand?.full,
              hint: 'The outlined lettering across the top of the hero.',
              onInput: (value) =>
                patchDebounced((draft) => {
                  draft.brand.full = value;
                }),
            })
          )
        ),

        editorPanel(
          'Hero dial chips',
          h('p.hint', {
            style: { marginBottom: '14px' },
            text: 'The four floating labels around the rotating dial, in order, clockwise from the top left.',
          }),
          h(
            'div.admin-editor__grid',
            {},
            (content.heroPills ?? []).map((pill, index) =>
              localisedInput({
                label: `Chip ${index + 1}`,
                value: pill,
                onInput: (lang, value) =>
                  patchDebounced((draft) => {
                    if (!draft.heroPills[index] || typeof draft.heroPills[index] !== 'object') {
                      draft.heroPills[index] = {};
                    }
                    draft.heroPills[index][lang] = value;
                  }),
              })
            )
          )
        ),

        editorPanel(
          'Statistics',
          h('p.hint', {
            style: { marginBottom: '14px' },
            text:
              'The four counters on the home and about pages. The years figure is worked out from ' +
              'the founding year every time the page loads, so it never goes out of date. ' +
              'Their captions are labels — edit those under UI text (statYears, statMachines …).',
          }),
          h(
            'div.admin-editor__grid',
            {},
            textInput({
              label: 'Founded in',
              type: 'number',
              value: content.foundedYear,
              hint: `Currently reads as ${Math.max(0, new Date().getFullYear() - (content.foundedYear ?? 0))}+ years`,
              onInput: (value) =>
                patchDebounced((draft) => {
                  const year = Number(value) || 0;
                  draft.foundedYear = year;
                  const years = draft.stats.find((s) => s.sinceYear !== undefined);
                  if (years) years.sinceYear = year;
                }),
            }),
            (content.stats ?? [])
              .map((stat, index) => ({ stat, index }))
              .filter(({ stat }) => stat.sinceYear === undefined)
              .map(({ stat, index }) =>
                textInput({
                  label: statLabel(stat.id),
                  type: 'number',
                  value: stat.value,
                  hint: `Shown as "${Number(stat.value).toLocaleString('en-US').replace(/,/g, ' ')}${stat.suffix ?? ''}"`,
                  onInput: (value) =>
                    patchDebounced((draft) => {
                      draft.stats[index].value = Number(value) || 0;
                    }),
                })
              )
          )
        ),

        editorPanel(
          'Brand ticker',
          textArea({
            label: 'Scrolling brand list',
            rows: 3,
            value: content.brands,
            hint: 'One line, shared by all three languages. Keep the trailing " · " so the loop reads continuously.',
            onInput: (value) =>
              patchDebounced((draft) => {
                draft.brands = value;
              }),
          })
        )
      );
    };

    render();
    return panel;
  }

  return { textsTab };
})();
