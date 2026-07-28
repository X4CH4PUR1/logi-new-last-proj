/**
 * Admin → Contacts.
 *
 * Feeds the contacts page, the footer and the phone numbers in the yellow call
 * to action band. The display number and the dial number are separate fields
 * on purpose: "(599) 585 148" reads well on the page, but a phone needs the
 * full international form to actually place the call.
 */

import { h, mount, when } from '../../core/dom.js';
import * as store from '../../core/store.js';
import {
  DEFAULT_ZOOM,
  formatCoordinates,
  osmEmbedUrl,
  parseCoordinates,
} from '../../util/geo.js';
import {
  commit,
  editorPanel,
  field,
  localisedInput,
  patchDebounced,
  textInput,
} from './fields.js';

export function contactsTab() {
  const panel = h('div.admin__panel');

  const render = () => {
    const c = store.getContent().contacts ?? {};

    const writeFlat = (key) => (value) =>
      patchDebounced((draft) => {
        draft.contacts[key] = value;
      });

    const writeLocalised = (key) => (lang, value) =>
      patchDebounced((draft) => {
        if (!draft.contacts[key] || typeof draft.contacts[key] !== 'object') {
          draft.contacts[key] = {};
        }
        draft.contacts[key][lang] = value;
      });

    mount(
      panel,
      h('p.admin__panel-intro', {
        text: 'Shown on the contacts page, in the footer, and in the yellow band at the foot of the home page.',
      }),

      editorPanel(
        'Address and hours',
        h(
          'div.admin-editor__grid',
          {},
          localisedInput({ label: 'Address', value: c.address, onInput: writeLocalised('address') }),
          localisedInput({ label: 'Legal name', value: c.legal, onInput: writeLocalised('legal') }),
          localisedInput({ label: 'Working hours', value: c.hours, onInput: writeLocalised('hours') })
        )
      ),

      editorPanel(
        'Phone, e-mail, registration',
        h(
          'div.admin-editor__grid',
          {},
          textInput({
            label: 'Phone 1 — as shown',
            value: c.phone1,
            onInput: writeFlat('phone1'),
          }),
          textInput({
            label: 'Phone 1 — dial format',
            value: c.phone1Dial,
            placeholder: '+995599585148',
            hint: 'Used by the tap-to-call links.',
            onInput: writeFlat('phone1Dial'),
          }),
          textInput({
            label: 'Phone 2 — as shown',
            value: c.phone2,
            onInput: writeFlat('phone2'),
          }),
          textInput({
            label: 'Phone 2 — dial format',
            value: c.phone2Dial,
            placeholder: '+995555502502',
            onInput: writeFlat('phone2Dial'),
          }),
          textInput({ label: 'E-mail', type: 'email', value: c.email, onInput: writeFlat('email') }),
          textInput({ label: 'Website', value: c.web, onInput: writeFlat('web') }),
          textInput({ label: 'Company ID', value: c.idCode, onInput: writeFlat('idCode') })
        )
      ),

      mapPanel(c, render)
    );
  };

  render();
  return panel;
}

/* --------------------------------------------------------------------------
   Map
   -------------------------------------------------------------------------- */

/**
 * Places the map pin.
 *
 * Three ways in, because the right one depends on where you are: read the
 * device's GPS if you are standing at the yard, paste a link if you found the
 * spot on a map on your computer, or type the numbers if you already have
 * them. Whichever you use, the preview updates immediately so you can see the
 * pin land before you publish.
 */
function mapPanel(c, rerender) {
  const pin = {
    lat: Number(c.mapLat),
    lon: Number(c.mapLon),
    zoom: Number(c.mapZoom) || DEFAULT_ZOOM,
  };
  const hasPin = Number.isFinite(pin.lat) && Number.isFinite(pin.lon);

  const preview = h('iframe', {
    title: 'Map preview',
    loading: 'lazy',
    sandbox: 'allow-scripts allow-same-origin allow-popups',
    style: {
      width: '100%',
      height: '260px',
      border: '1px solid var(--line)',
      background: 'var(--bg-2)',
    },
    src: hasPin ? osmEmbedUrl(pin) : '',
  });

  const readout = h('p.hint', {});
  const status = h('p.hint', { style: { minHeight: '18px' } });

  const latInput = h('input.input.input--sm', { type: 'number', step: '0.000001', value: hasPin ? pin.lat : '' });
  const lonInput = h('input.input.input--sm', { type: 'number', step: '0.000001', value: hasPin ? pin.lon : '' });
  const zoomInput = h('input.input.input--sm', { type: 'number', min: '1', max: '19', value: pin.zoom });

  /** Pushes the current values into the store and refreshes the preview. */
  const apply = ({ immediate = false, message = '' } = {}) => {
    const lat = Number(latInput.value);
    const lon = Number(lonInput.value);
    const zoom = Math.min(19, Math.max(1, Number(zoomInput.value) || DEFAULT_ZOOM));
    const valid = Number.isFinite(lat) && Number.isFinite(lon) &&
      Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && latInput.value !== '' && lonInput.value !== '';

    const write = (draft) => {
      draft.contacts.mapLat = valid ? lat : '';
      draft.contacts.mapLon = valid ? lon : '';
      draft.contacts.mapZoom = zoom;
      draft.contacts.mapPinConfirmed = valid;
    };

    if (immediate) commit(write, message);
    else patchDebounced(write);

    preview.src = valid ? osmEmbedUrl({ lat, lon, zoom }) : '';
    readout.textContent = valid
      ? `Pin at ${formatCoordinates({ lat, lon })} · zoom ${zoom}`
      : 'No pin set — the contacts page will show a plain placeholder and make no request to OpenStreetMap.';
  };

  for (const input of [latInput, lonInput, zoomInput]) {
    input.addEventListener('input', () => apply());
  }

  /* --- paste a link -------------------------------------------------------- */

  const pasteBox = h('input.input.input--sm', {
    type: 'text',
    placeholder: 'Paste a map link or "41.549700, 44.993220"',
    'aria-label': 'Paste a map link or coordinates',
    on: {
      input: (event) => {
        const parsed = parseCoordinates(event.currentTarget.value);
        if (!parsed) {
          status.textContent = event.currentTarget.value.trim()
            ? 'No coordinates found in that yet — paste the whole link.'
            : '';
          status.style.color = '';
          return;
        }
        latInput.value = parsed.lat;
        lonInput.value = parsed.lon;
        if (parsed.zoom) zoomInput.value = parsed.zoom;
        apply();
        status.textContent = `Found ${formatCoordinates(parsed)} — check the preview below.`;
        status.style.color = 'var(--accent)';
      },
    },
  });

  /* --- read the device's position ------------------------------------------ */

  const locateButton = h('button.btn.btn--ghost.btn--sm', {
    type: 'button',
    text: 'Use my current location',
    on: {
      click: () => {
        if (!navigator.geolocation) {
          status.textContent = 'This browser cannot report a location.';
          status.style.color = 'var(--danger)';
          return;
        }
        status.textContent = 'Asking your browser for a location…';
        status.style.color = '';
        locateButton.disabled = true;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            latInput.value = latitude;
            lonInput.value = longitude;
            zoomInput.value = 18;
            apply({ immediate: true, message: 'Pin set to your current location' });
            status.textContent = `Set to ${formatCoordinates({ lat: latitude, lon: longitude })}, accurate to about ${Math.round(accuracy)} m.`;
            status.style.color = 'var(--accent)';
            locateButton.disabled = false;
          },
          (error) => {
            status.textContent =
              error.code === error.PERMISSION_DENIED
                ? 'Location permission was refused. Allow it in the address bar, or paste a link instead.'
                : `Could not read a location: ${error.message}`;
            status.style.color = 'var(--danger)';
            locateButton.disabled = false;
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      },
    },
  });

  // Initial readout.
  apply();

  return editorPanel(
    'Map',
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },

      when(!c.mapPinConfirmed && hasPin, () =>
        h('p.hint', {
          style: { color: 'var(--accent)' },
          text:
            'The pin is still on the default position — roughly the centre of Rustavi, not your ' +
            'building. Set it below so visitors are sent to the right gate.',
        })
      ),

      h('p.hint', {
        text:
          'Standing at the yard? Press the button. On a computer? Open openstreetmap.org or Google Maps, ' +
          'right-click your building, copy the coordinates or the link, and paste them in. Or type the ' +
          'numbers directly. Geolocation needs https, so it works on the published site and on localhost.',
      }),

      h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' } },
        h('div', { style: { flex: '1', minWidth: '260px' } }, field('Paste a link or coordinates', pasteBox)),
        locateButton
      ),

      status,

      h(
        'div.admin-editor__grid',
        {},
        field('Latitude', latInput, { hint: '−90 to 90' }),
        field('Longitude', lonInput, { hint: '−180 to 180' }),
        field('Zoom', zoomInput, { hint: '17–18 shows a single building' })
      ),

      readout,
      preview,

      h(
        'div',
        { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
        h('button.btn-plain.btn-plain--danger', {
          type: 'button',
          text: 'Remove the map',
          on: {
            click: () => {
              if (!window.confirm('Remove the map from the contacts page?')) return;
              latInput.value = '';
              lonInput.value = '';
              apply({ immediate: true, message: 'Map removed' });
              rerender();
            },
          },
        })
      ),

      h(
        'details',
        { style: { marginTop: '4px' } },
        h('summary', {
          style: { cursor: 'pointer', color: 'var(--muted)', fontSize: '13px' },
          text: 'Use a different map provider',
        }),
        h(
          'div',
          { style: { marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' } },
          h('p.hint', {
            text:
              'Paste a complete embed URL to override everything above — for Google Maps, Yandex, ' +
              '2GIS or anything else that offers an iframe. Leave it empty to keep using the pin.',
          }),
          textInput({
            label: 'Custom embed URL',
            value: c.mapEmbed,
            placeholder: 'https://…',
            onInput: (value) =>
              patchDebounced((draft) => {
                draft.contacts.mapEmbed = value.trim();
              }),
          }),
          textInput({
            label: 'Custom link URL',
            value: c.mapLink,
            hint: 'Where the link under a custom embed points.',
            onInput: (value) =>
              patchDebounced((draft) => {
                draft.contacts.mapLink = value.trim();
              }),
          })
        )
      )
    )
  );
}
