/**
 * Admin → Services.
 *
 * These are the five numbered cards on the home and service pages. Editing is
 * inline — there are only a handful, and each has just a number, a title and a
 * paragraph, so a separate editor screen would be ceremony for its own sake.
 */

import { h, mount } from '../../core/dom.js';
import * as store from '../../core/store.js';
import { makeId } from '../../util/format.js';
import {
  commit,
  confirmThen,
  editorPanel,
  localisedInput,
  patchDebounced,
  primaryButton,
  textInput,
} from './fields.js';

export function servicesTab() {
  const panel = h('div.admin__panel');

  const render = () => {
    const services = store.getContent().services ?? [];

    mount(
      panel,
      h('p.admin__panel-intro', {
        text:
          'The numbered service cards. The number is shown as typed, so keep the two-digit style ' +
          '(01, 02, …) if you want the oversized outline behind each card to line up.',
      }),
      primaryButton('+ Add service', () =>
        commit((content) => {
          const next = String((content.services?.length ?? 0) + 1).padStart(2, '0');
          content.services.push({
            id: makeId('sv'),
            num: next,
            title: { ka: '', en: '', ru: '' },
            desc: { ka: '', en: '', ru: '' },
          });
        }, 'Service added')
      ),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' } },
        services.map((service, index) => card(service, index, services.length))
      )
    );
  };

  function card(service, index, total) {
    const write = (mutate) =>
      patchDebounced((content) => {
        const target = content.services.find((s) => s.id === service.id);
        if (target) mutate(target);
      });

    return editorPanel(
      `Service ${service.num || index + 1}`,
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        h(
          'div',
          { style: { display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' } },
          h('div', { style: { width: '110px' } },
            textInput({
              label: 'Number',
              value: service.num,
              onInput: (value) => write((target) => { target.num = value; }),
            })
          ),
          h('div', { style: { flex: '1', minWidth: '220px' } },
            localisedInput({
              label: 'Title',
              value: service.title,
              onInput: (l, value) =>
                write((target) => {
                  if (!target.title || typeof target.title !== 'object') target.title = {};
                  target.title[l] = value;
                }),
            })
          )
        ),
        localisedInput({
          label: 'Description',
          multiline: true,
          rows: 3,
          value: service.desc,
          onInput: (l, value) =>
            write((target) => {
              if (!target.desc || typeof target.desc !== 'object') target.desc = {};
              target.desc[l] = value;
            }),
        }),
        h(
          'div',
          { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
          moveButton('↑ Move up', index > 0, () => move(service.id, -1)),
          moveButton('↓ Move down', index < total - 1, () => move(service.id, 1)),
          h('button.btn-plain.btn-plain--danger', {
            type: 'button',
            text: 'Delete',
            on: {
              click: confirmThen('Delete this service card?', () =>
                commit((content) => {
                  content.services = content.services.filter((s) => s.id !== service.id);
                }, 'Service deleted')
              ),
            },
          })
        )
      )
    );
  }

  function moveButton(label, enabled, onClick) {
    return h('button.btn-plain', {
      type: 'button',
      text: label,
      disabled: !enabled,
      style: enabled ? null : { opacity: '0.4', cursor: 'default' },
      on: { click: enabled ? onClick : undefined },
    });
  }

  function move(id, delta) {
    commit((content) => {
      const list = content.services;
      const from = list.findIndex((s) => s.id === id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= list.length) return;
      [list[from], list[to]] = [list[to], list[from]];
    });
  }

  render();
  return panel;
}
