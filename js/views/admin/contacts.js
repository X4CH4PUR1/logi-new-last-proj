window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.contacts = (function () {

  const { h, mount, when } = Logi.core.dom;
  const store = Logi.core.store;
  const {
    DEFAULT_ZOOM,
    formatCoordinates,
    osmEmbedUrl,
    parseCoordinates,
  } = Logi.util.geo;
  const { makeId } = Logi.util.format;
  const {
    commit,
    editorPanel,
    field,
    localisedInput,
    patchDebounced,
    select,
    textInput,
  } = Logi.views.admin.fields;
  function contactsTab() {
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

        socialPanel(store.getContent().social ?? []),
        mapPanel(c, render)
      );
    };

    render();
    return panel;
  }


  const SOCIAL_TYPES = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'link', label: 'Other link' },
  ];

  function socialPanel(items) {
    const row = (item, index, total) =>
      h(
        'div',
        {
          style: {
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            borderTop: index ? '1px solid var(--line)' : 'none',
            paddingTop: index ? '14px' : '0',
          },
        },
        h('div', { style: { width: '150px' } },
          select({
            label: 'Icon',
            value: item.type,
            options: SOCIAL_TYPES,
            onInput: (value) =>
              patchDebounced((draft) => {
                draft.social[index].type = value;
              }),
          })
        ),
        h('div', { style: { flex: '1', minWidth: '200px' } },
          textInput({
            label: 'Label',
            value: item.label,
            hint: 'Shown on hover and read aloud by screen readers.',
            onInput: (value) =>
              patchDebounced((draft) => {
                draft.social[index].label = value;
              }),
          })
        ),
        h('div', { style: { flex: '1.4', minWidth: '240px' } },
          item.type === 'whatsapp'
            ? textInput({
                label: 'Phone number',
                value: item.number,
                placeholder: '+995599585148',
                hint: 'Must include the country code. Spaces and brackets are ignored.',
                onInput: (value) =>
                  patchDebounced((draft) => {
                    draft.social[index].number = value;
                  }),
              })
            : textInput({
                label: 'Link',
                type: 'url',
                value: item.url,
                placeholder: 'https://…',
                onInput: (value) =>
                  patchDebounced((draft) => {
                    draft.social[index].url = value;
                  }),
              })
        ),
        h(
          'div',
          { style: { display: 'flex', gap: '6px', paddingBottom: '2px' } },
          h('button.btn-plain', {
            type: 'button',
            text: '↑',
            'aria-label': 'Move left',
            disabled: index === 0,
            style: index === 0 ? { opacity: '0.4' } : null,
            on: {
              click: index === 0 ? undefined : () =>
                commit((draft) => {
                  const l = draft.social;
                  [l[index - 1], l[index]] = [l[index], l[index - 1]];
                }),
            },
          }),
          h('button.btn-plain', {
            type: 'button',
            text: '↓',
            'aria-label': 'Move right',
            disabled: index === total - 1,
            style: index === total - 1 ? { opacity: '0.4' } : null,
            on: {
              click: index === total - 1 ? undefined : () =>
                commit((draft) => {
                  const l = draft.social;
                  [l[index], l[index + 1]] = [l[index + 1], l[index]];
                }),
            },
          }),
          h('button.btn-plain.btn-plain--danger', {
            type: 'button',
            text: 'Remove',
            on: {
              click: () => {
                if (!window.confirm(`Remove the ${item.label || item.type} icon?`)) return;
                commit((draft) => {
                  draft.social.splice(index, 1);
                }, 'Icon removed');
              },
            },
          })
        )
      );

    return editorPanel(
      'Header icons',
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        h('p.hint', {
          text:
            'Shown in the header, in this order. On a phone the toolbar has no room for them, ' +
            'so they move into the burger menu instead.',
        }),
        items.length
          ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
              items.map((item, index) => row(item, index, items.length)))
          : h('p.hint', { text: 'No icons yet.' }),
        h('div', {},
          h('button.btn.btn--ghost.btn--sm', {
            type: 'button',
            text: '+ Add icon',
            on: {
              click: () =>
                commit((draft) => {
                  if (!Array.isArray(draft.social)) draft.social = [];
                  draft.social.push({
                    id: makeId('so'),
                    type: 'facebook',
                    label: '',
                    url: '',
                  });
                }, 'Icon added'),
            },
          })
        )
      )
    );
  }


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

  return { contactsTab };
})();
