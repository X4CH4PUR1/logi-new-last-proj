window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.gallery = (function () {
  /**
   * Admin → Gallery.
   *
   * Photos are added straight from the picker — there is no editor step, because
   * a gallery entry is only a picture and a caption. Captions save as you type.
   *
   * Adding and deleting go through `commit`, which notifies the store; the app
   * shell rebuilds this panel in response, so nothing here re-renders by hand.
   */

  const { h, mount } = Logi.core.dom;
  const store = Logi.core.store;
  const toast = Logi.core.toast;
  const { makeId } = Logi.util.format;
  const { dataUrlBytes, formatBytes, processImage } = Logi.util.image;
  const { commit, confirmThen, getEditLang, patchDebounced } = Logi.views.admin.fields;
  function galleryTab() {
    const panel = h('div.admin__panel');
    const items = store.getContent().gallery ?? [];
    const totalBytes = items.reduce((sum, item) => sum + dataUrlBytes(item.img), 0);

    mount(
      panel,
      h('p.admin__panel-intro', {
        text:
          'Photos are resized and re-encoded in the browser before they are stored. ' +
          'Captions are per language — switch the editing language in the toolbar above.',
      }),
      uploadButton(),
      items.length
        ? h('div.admin-gallery', {}, items.map(tile))
        : h('p.hint', { text: 'No photos yet.' }),
      h('p.hint', {
        style: { marginTop: '16px' },
        text: `${items.length} photo${items.length === 1 ? '' : 's'} · ${formatBytes(totalBytes)}`,
      })
    );

    return panel;
  }

  function tile(item) {
    const lang = getEditLang();

    const caption = h('input.input.input--sm', {
      value: item.caption?.[lang] ?? '',
      placeholder: `Caption · ${lang.toUpperCase()}`,
      'aria-label': `Caption for photo, ${lang.toUpperCase()}`,
      style: { minWidth: '0' },
      on: {
        input: (event) => {
          const value = event.currentTarget.value;
          patchDebounced((content) => {
            const target = content.gallery.find((g) => g.id === item.id);
            if (!target) return;
            if (!target.caption || typeof target.caption !== 'object') target.caption = {};
            target.caption[lang] = value;
          });
        },
      },
    });

    return h(
      'div.admin-gallery__item',
      {},
      item.img
        ? h('img.admin-gallery__media', { src: item.img, alt: '' })
        : h('div.placeholder.admin-gallery__media', {}, h('span', { text: 'no photo' })),
      h(
        'div.admin-gallery__foot',
        {},
        caption,
        h('button.btn-plain.btn-plain--danger', {
          type: 'button',
          text: '✕',
          'aria-label': 'Delete photo',
          on: {
            click: confirmThen('Delete this photo?', () =>
              commit((content) => {
                content.gallery = content.gallery.filter((g) => g.id !== item.id);
              }, 'Photo deleted')
            ),
          },
        })
      )
    );
  }

  function uploadButton() {
    const input = h('input', {
      type: 'file',
      accept: 'image/*',
      multiple: true,
      on: {
        change: async (event) => {
          const files = [...(event.currentTarget.files ?? [])];
          event.currentTarget.value = '';
          if (!files.length) return;

          let added = 0;
          // Processed one at a time so a single bad file does not lose the batch.
          for (const file of files) {
            try {
              const dataUrl = await processImage(file);
              commit((content) => {
                content.gallery.push({
                  id: makeId('g'),
                  img: dataUrl,
                  caption: { ka: '', en: '', ru: '' },
                });
              });
              added += 1;
            } catch (err) {
              toast.error(`${file.name}: ${err.message}`);
            }
          }

          if (added) toast.show(`${added} photo${added === 1 ? '' : 's'} added`);
        },
      },
    });

    return h('label.admin-upload', {}, '+ Add photos', input);
  }

  return { galleryTab };
})();
