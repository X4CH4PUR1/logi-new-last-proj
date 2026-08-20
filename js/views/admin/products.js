window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.products = (function () {
  /**
   * Admin → Products.
   *
   * The list and the editor are two states of the same panel. The editor works
   * on a detached copy of the record, so an abandoned edit changes nothing —
   * Cancel really does cancel.
   */

  const { h, mount } = Logi.core.dom;
  const store = Logi.core.store;
  const { clone } = store;
  const toast = Logi.core.toast;
  const { allProducts } = Logi.core.selectors;
  const { CONDITIONS, FORKLIFT_CATEGORY, MODES } = Logi.data.config;
  const { formatPrice, makeId, pick } = Logi.util.format;
  const { processImage } = Logi.util.image;
  const {
    commit,
    confirmThen,
    editorActions,
    editorGrid,
    editorPanel,
    field,
    getEditLang,
    ghostButton,
    localisedInput,
    primaryButton,
    select,
    setTranslation,
    textInput,
  } = Logi.views.admin.fields;
  const EMPTY_PRODUCT = {
    id: null,
    cat: FORKLIFT_CATEGORY,
    mode: 'sale',
    fuel: 'electric',
    cond: 'used',
    brand: '',
    name: { ka: '', en: '', ru: '' },
    desc: { ka: '', en: '', ru: '' },
    price: '',
    unit: '',
    capacity: '',
    lift: '',
    year: '',
    images: [],
  };

  /** Category options for the select: the fixed forklift line, then Admin → Filters' list. */
  function categoryOptions() {
    const lang = getEditLang();
    return [
      { value: FORKLIFT_CATEGORY, label: 'Forklift' },
      ...(store.getContent().categories ?? []).map((c) => ({ value: c.key, label: pick(c.label, lang) || c.key })),
    ];
  }

  /** Fuel options for the select, from Admin → Filters' list. */
  function fuelOptions() {
    const lang = getEditLang();
    return (store.getContent().fuels ?? []).map((f) => ({ value: f.key, label: pick(f.label, lang) || f.key }));
  }

  function productsTab() {
    const panel = h('div.admin__panel');
    /** @type {object|null} the record being edited, or null while listing */
    let draft = null;

    const render = () => {
      mount(panel, draft ? editor() : list());
    };

    /* --- list ------------------------------------------------------------- */

    function list() {
      const products = allProducts();

      return h(
        'div',
        {},
        h('p.admin__panel-intro', {
          text:
            'Everything in the catalogue. Prices are in euros; set the unit to "per month" for rental machines.',
        }),
        primaryButton('+ Add product', () => {
          draft = clone(EMPTY_PRODUCT);
          render();
        }),
        products.length
          ? h('div.admin-list', { style: { marginTop: '20px' } }, products.map(row))
          : h('p.hint', { style: { marginTop: '20px' }, text: 'No products yet.' })
      );
    }

    function row(product) {
      const label = pick(product.name, getEditLang()) || '(untitled)';
      const thumb = product.images?.[0] || product.img;

      return h(
        'div.admin-row',
        {},
        thumb
          ? h('img.admin-row__thumb', { src: thumb, alt: '' })
          : h('span.admin-row__thumb.admin-row__thumb--empty', { 'aria-hidden': 'true' }),
        h('span.admin-row__label', { text: label }),
        h('span.admin-row__meta', {
          text: [product.cat, product.mode, product.fuel].filter(Boolean).join(' · ').toUpperCase(),
        }),
        h('span.admin-row__price', {
          text: formatPrice(product.price, product.unit, '/mo'),
        }),
        h(
          'div.admin-row__actions',
          {},
          h('button.btn-plain', {
            type: 'button',
            text: 'Edit',
            on: {
              click: () => {
                draft = clone(product);
                render();
              },
            },
          }),
          h('button.btn-plain.btn-plain--danger', {
            type: 'button',
            text: 'Delete',
            on: {
              click: confirmThen(`Delete "${label}"?`, () =>
                commit((content) => {
                  content.products = content.products.filter((p) => p.id !== product.id);
                }, 'Product deleted')
              ),
            },
          })
        )
      );
    }

    /* --- editor ----------------------------------------------------------- */

    function editor() {
      const isNew = !draft.id;

      const save = () => {
        const record = clone(draft);
        record.price = Number(record.price) || 0;
        // A non-forklift has no fuel type; keep the record clean rather than
        // storing a value the filters would then have to ignore.
        if (record.cat !== FORKLIFT_CATEGORY) record.fuel = '';

        commit((content) => {
          if (!record.id) {
            record.id = makeId('p');
            content.products.push(record);
          } else {
            const index = content.products.findIndex((p) => p.id === record.id);
            if (index >= 0) content.products[index] = record;
            else content.products.push(record);
          }
        }, isNew ? 'Product added' : 'Product saved');

        draft = null;
        render();
      };

      const cancel = () => {
        draft = null;
        render();
      };

      return editorPanel(
        isNew ? 'New product' : 'Edit product',
        editorGrid(
          localisedInput({
            label: 'Name',
            value: draft.name,
            onInput: (lang, value) => setTranslation(draft, 'name', lang, value),
          }),
          textInput({
            label: 'Brand',
            value: draft.brand,
            onInput: (value) => {
              draft.brand = value;
            },
          }),
          select({
            label: 'Category',
            value: draft.cat,
            options: categoryOptions(),
            onInput: (value) => {
              draft.cat = value;
            },
            hint: 'Add new categories in Admin → Filters.',
          }),
          select({
            label: 'Sale or rent',
            value: draft.mode,
            options: MODES.map((value) => ({ value, label: value })),
            onInput: (value) => {
              draft.mode = value;
            },
          }),
          select({
            label: 'Fuel',
            value: draft.fuel,
            options: [{ value: '', label: '—' }, ...fuelOptions()],
            onInput: (value) => {
              draft.fuel = value;
            },
            hint: 'Forklifts only. Add new fuel types in Admin → Filters.',
          }),
          select({
            label: 'Condition',
            value: draft.cond,
            options: [
              { value: '', label: '—' },
              ...CONDITIONS.map((value) => ({ value, label: value })),
            ],
            onInput: (value) => {
              draft.cond = value;
            },
          }),
          textInput({
            label: 'Price (EUR)',
            type: 'number',
            value: draft.price,
            onInput: (value) => {
              draft.price = value;
            },
          }),
          select({
            label: 'Price unit',
            value: draft.unit,
            options: [
              { value: '', label: 'one-off' },
              { value: 'mo', label: 'per month' },
            ],
            onInput: (value) => {
              draft.unit = value;
            },
          }),
          textInput({
            label: 'Capacity',
            value: draft.capacity,
            placeholder: '2.0 t',
            onInput: (value) => {
              draft.capacity = value;
            },
          }),
          textInput({
            label: 'Lift height',
            value: draft.lift,
            placeholder: '4.5 m',
            onInput: (value) => {
              draft.lift = value;
            },
          }),
          textInput({
            label: 'Year',
            value: draft.year,
            placeholder: '2019',
            onInput: (value) => {
              draft.year = value;
            },
          })
        ),
        localisedInput({
          label: 'Description',
          value: draft.desc,
          multiline: true,
          rows: 4,
          onInput: (lang, value) => setTranslation(draft, 'desc', lang, value),
        }),
        imagesField(),
        editorActions(primaryButton('Save', save), ghostButton('Cancel', cancel))
      );
    }

    /**
     * The product's own photo gallery — as many photos as needed, the first
     * one doubling as the catalogue thumbnail. Edits write straight into the
     * detached `draft` object; nothing is saved until Save is pressed.
     */
    function imagesField() {
      if (!draft.images) draft.images = [];

      const grid = draft.images.length
        ? h(
            'div.admin-gallery',
            { style: { marginTop: '10px' } },
            draft.images.map((src, index) =>
              h(
                'div.admin-gallery__item',
                {},
                h('img.admin-gallery__media', { src, alt: '' }),
                h(
                  'div.admin-gallery__foot',
                  {},
                  h('button.btn-plain.btn-plain--danger', {
                    type: 'button',
                    text: 'Remove',
                    on: {
                      click: () => {
                        draft.images.splice(index, 1);
                        render();
                      },
                    },
                  })
                )
              )
            )
          )
        : null;

      const input = h('input', {
        type: 'file',
        accept: 'image/*',
        multiple: true,
        on: {
          change: async (event) => {
            const files = [...(event.currentTarget.files ?? [])];
            event.currentTarget.value = '';
            if (!files.length) return;

            // Processed one at a time so a single bad file does not lose the batch.
            for (const file of files) {
              try {
                const dataUrl = await processImage(file);
                draft.images.push(dataUrl);
              } catch (err) {
                toast.error(`${file.name}: ${err.message}`);
              }
            }
            render();
          },
        },
      });

      return h(
        'div',
        {},
        field('Photos', h('label.admin-upload', {}, '+ Add photos', input), {
          hint: 'The first photo is used as the catalogue thumbnail. Large photos are resized automatically.',
        }),
        grid
      );
    }

    render();
    return panel;
  }

  return { productsTab };
})();
