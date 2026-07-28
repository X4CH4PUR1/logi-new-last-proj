/**
 * Products page: mode tabs, fuel chips and the catalogue grid.
 *
 * The two filters live in this module rather than in the router, because they
 * are a way of browsing rather than a place — you would not want the Back
 * button to walk you through every chip you tried. Individual products *are*
 * addressable, at #/products/<id>, which the app shell turns into a modal.
 */

import { h, mount, when } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { filterProducts, fuelFilterApplies } from '../core/selectors.js';
import { empty, pageHeader, productGrid } from './partials.js';

const MODES = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'sale', labelKey: 'modeSale' },
  { key: 'rent', labelKey: 'modeRent' },
  { key: 'parts', labelKey: 'partsTab' },
  { key: 'wheels', labelKey: 'wheelsTab' },
];

const FUELS = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'electric', labelKey: 'fuelElectric' },
  { key: 'diesel', labelKey: 'fuelDiesel' },
  { key: 'gasoline', labelKey: 'fuelGasoline' },
];

/**
 * @param {{onOpenProduct: (id: string) => void}} handlers
 */
export function productsPage({ onOpenProduct }) {
  const state = { mode: 'all', fuel: 'all' };

  const modeBar = h('div.tab-row.product-filters', { role: 'tablist', 'aria-label': t('productsTitle') });
  const fuelBar = h('div.product-filters--fuel', { role: 'group' });
  const results = h('div');

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
    mount(
      modeBar,
      MODES.map((mode) =>
        h('button.tab', {
          type: 'button',
          role: 'tab',
          text: t(mode.labelKey),
          'aria-selected': String(state.mode === mode.key),
          on: { click: () => setMode(mode.key) },
        })
      )
    );

    const showFuel = fuelFilterApplies(state.mode);
    fuelBar.hidden = !showFuel;
    mount(
      fuelBar,
      showFuel
        ? FUELS.map((fuel) =>
            h('button.chip', {
              type: 'button',
              text: t(fuel.labelKey),
              'aria-pressed': String(state.fuel === fuel.key),
              on: { click: () => setFuel(fuel.key) },
            })
          )
        : []
    );

    const list = filterProducts(state);
    mount(
      results,
      list.length ? productGrid(list, onOpenProduct) : empty(t('noProducts'))
    );
  }

  renderAll();

  return h(
    'div.page.container',
    { 'data-page': 'products' },
    pageHeader('CATALOG', t('productsTitle')),
    modeBar,
    fuelBar,
    results
  );
}
