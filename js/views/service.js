/**
 * Service page: what the workshop does, and a booking form.
 */

import { h } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { services, text } from '../core/selectors.js';
import { pageHeader, serviceGrid } from './partials.js';
import { contactForm } from './contact-form.js';

export function servicePage() {
  return h(
    'div.page.container',
    { 'data-page': 'service' },
    pageHeader('SERVICE', t('serviceTitle')),
    h('p.service__intro', { text: text('serviceIntro') }),
    h('div.service__grid', {}, serviceGrid(services())),
    h('div.card.booking.notch', {}, contactForm({ title: t('serviceCta') }))
  );
}
