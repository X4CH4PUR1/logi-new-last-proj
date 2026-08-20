window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.products = (function () {
  /**
   * Products page: mode tabs, fuel chips and the catalogue grid.
   *
   * The two filters live in this module rather than in the router, because they
   * are a way of browsing rather than a place — you would not want the Back
   * button to walk you through every chip you tried. Individual products *are*
   * addressable, at #/products/<id>, which the app shell turns into a modal.
   */

  const dom = Logi.core.dom;
  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const { categories, filterProducts, fuelFilterApplies, fuels } = Logi.core.selectors;
  const { empty, pageHeader, productGrid } = Logi.views.partials;

  /**
   * All/Sale/Rent are fixed — the core catalogue line. Every other tab is
   * built from content.categories, so Admin → Filters can add one (e.g. a
   * new "Batteries" line) without a code change; it behaves like Parts/Wheels
   * always have, a flat listing with no fuel filter.
   */
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

  /**
   * @param {{onOpenProduct: (id: string) => void}} handlers
   */
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
      // Leaving the forklift modes retires the fuel filter, so switching to
      // Parts never silently hides everything.
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
