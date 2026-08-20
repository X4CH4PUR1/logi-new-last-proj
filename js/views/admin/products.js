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
  const { clone } = Logi.core.store;
  const { allProducts } = Logi.core.selectors;
  const { CATEGORIES, CONDITIONS, FUELS, MODES } = Logi.data.config;
  const { formatPrice, makeId, pick } = Logi.util.format;
  const {
    commit,
    confirmThen,
    editorActions,
    editorGrid,
    editorPanel,
    getEditLang,
    ghostButton,
    imageInput,
    localisedInput,
    primaryButton,
    select,
    setTranslation,
    textInput,
  } = Logi.views.admin.fields;
  const EMPTY_PRODUCT = {
    id: null,
    cat: 'forklift',
    mode: 'sale',
    fuel: 'electric',
    cond: 'used',
    brand: '',
    name: { ka: '', en: '', ru: '' },
    price: '',
    unit: '',
    capacity: '',
    lift: '',
    year: '',
    img: '',
  };

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

      return h(
        'div.admin-row',
        {},
        product.img
          ? h('img.admin-row__thumb', { src: product.img, alt: '' })
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
        if (record.cat !== 'forklift') record.fuel = '';

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
            options: CATEGORIES.map((value) => ({ value, label: value })),
            onInput: (value) => {
              draft.cat = value;
            },
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
            options: [{ value: '', label: '—' }, ...FUELS.map((value) => ({ value, label: value }))],
            onInput: (value) => {
              draft.fuel = value;
            },
            hint: 'Forklifts only',
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
        imageInput({
          label: 'Photo',
          value: draft.img,
          hint: 'Large photos are resized automatically.',
          onChange: (dataUrl) => {
            draft.img = dataUrl;
          },
        }),
        editorActions(primaryButton('Save', save), ghostButton('Cancel', cancel))
      );
    }

    render();
    return panel;
  }

  return { productsTab };
})();
