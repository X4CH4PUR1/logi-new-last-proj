window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.products = (function () {

  const dom = Logi.core.dom;
  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const { categories, filterProducts, fuelFilterApplies, fuels } = Logi.core.selectors;
  const { empty, pageHeader, productGrid } = Logi.views.partials;

  function tabs() {
    return [
      { key: 'all', label: t('filterAll') },
      { key: 'sale', label: t('modeSale') },
      { key: 'rent', label: t('modeRent') },
      ...categories(),
    ];
  }

  function fuelOptions() {
    return [{ key: 'all', label: t('filterAll') }, ...fuels()];
  }

  function productsPage({ onOpenProduct }) {
    const state = { mode: 'all', fuel: 'all' };

    const root = tpl.clone('products');
    const [eyebrowEl, titleEl] = pageHeader('CATALOG', t('productsTitle'));
    tpl.place(root, 'eyebrow', eyebrowEl);
    tpl.place(root, 'title', titleEl);

    const modeBar = tpl.slot(root, 'modes');
    const fuelBar = tpl.slot(root, 'fuels');
    const results = tpl.slot(root, 'results');
    modeBar.setAttribute('aria-label', t('productsTitle'));

    const setMode = (mode) => {
      state.mode = mode;
      if (!fuelFilterApplies(mode)) state.fuel = 'all';
      renderAll();
    };

    const setFuel = (fuel) => {
      state.fuel = fuel;
      renderAll();
    };

    function renderAll() {
      tpl.each(modeBar, tabs(), (tab) => {
        const btn = tpl.clone('mode-tab');
        tpl.bind(btn, { label: tab.label });
        btn.setAttribute('aria-selected', String(state.mode === tab.key));
        btn.addEventListener('click', () => setMode(tab.key));
        return btn;
      });

      const showFuel = fuelFilterApplies(state.mode);
      fuelBar.hidden = !showFuel;
      tpl.each(fuelBar, showFuel ? fuelOptions() : [], (fuel) => {
        const chip = tpl.clone('fuel-chip');
        tpl.bind(chip, { label: fuel.label });
        chip.setAttribute('aria-pressed', String(state.fuel === fuel.key));
        chip.addEventListener('click', () => setFuel(fuel.key));
        return chip;
      });

      const list = filterProducts(state);
      dom.mount(results, list.length ? productGrid(list, onOpenProduct) : empty(t('noProducts')));
    }

    renderAll();
    return root;
  }

  return { productsPage };
})();
