/**
 * About page: intro, the concept and policy panels, and the statistics.
 */

import { h } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { stats, text } from '../core/selectors.js';
import { pageHeader, statGrid } from './partials.js';

export function aboutPage() {
  return h(
    'div.page.container',
    { 'data-page': 'about' },
    pageHeader('COMPANY', t('aboutTitle')),
    h('span.rule.about__rule', { 'aria-hidden': 'true' }),
    h('p.about__lead', { text: text('about1') }),

    h(
      'div.grid.about__panels',
      {},
      panel('CONCEPT', text('about2')),
      panel('POLICY', text('about3'))
    ),

    h('div.about__strip', { text: t('anyBrand') }),
    h('div.about__stats', {}, statGrid(stats(), { compact: true }))
  );
}

function panel(label, body) {
  return h(
    'div.card.about__panel.notch',
    {},
    h('div.about__panel-label', { text: label }),
    h('p.about__panel-text', { text: body })
  );
}
