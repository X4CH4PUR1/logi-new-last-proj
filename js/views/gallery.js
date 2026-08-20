window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.gallery = (function () {
  /**
   * Gallery page.
   *
   * Photos open in a lightbox with keyboard paging. Only uploaded photos are
   * clickable — an empty slot renders the hatched placeholder and is inert.
   */

  const { h, when } = Logi.core.dom;
  const { t } = Logi.core.i18n;
  const { gallery } = Logi.core.selectors;
  const { empty, media, pageHeader } = Logi.views.partials;
  function galleryPage() {
    const items = gallery();
    const withPhotos = items.filter((item) => item.img);

    const open = (item) => {
      const index = withPhotos.findIndex((candidate) => candidate.id === item.id);
      if (index >= 0) openLightbox(withPhotos, index);
    };

    return h(
      'div.page.container',
      { 'data-page': 'gallery' },
      pageHeader('VISUALS', t('galleryTitle')),
      items.length
        ? h('div.grid.gallery-grid', {}, items.map((item) => figure(item, open)))
        : empty(t('galleryEmpty'))
    );
  }

  function figure(item, onOpen) {
    return h(
      'figure.card.card--lift.gallery-figure.notch',
      {},
      media({
        src: item.img,
        alt: item.caption,
        className: 'gallery-figure__media',
        placeholderClass: 'gallery-figure__media',
        onClick: item.img ? () => onOpen(item) : undefined,
      }),
      when(item.caption, () =>
        h('figcaption.gallery-figure__caption', { text: item.caption })
      )
    );
  }

  /* --------------------------------------------------------------------------
     Lightbox
     -------------------------------------------------------------------------- */

  function openLightbox(items, startIndex) {
    let index = startIndex;

    const image = h('img.lightbox__image', { src: items[index].img, alt: items[index].caption });
    const caption = h('figcaption.gallery-figure__caption', { text: items[index].caption });
    const counter = h('span.badge', { text: `${index + 1} / ${items.length}` });

    const step = (delta) => {
      index = (index + delta + items.length) % items.length;
      image.src = items[index].img;
      image.alt = items[index].caption;
      caption.textContent = items[index].caption;
      counter.textContent = `${index + 1} / ${items.length}`;
    };

    // As in product-modal.js: closing is explicit rather than event-driven, so
    // it still works in shells that never dispatch the dialog `close` event.
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      if (dialog.open) dialog.close();
      dialog.remove();
    };

    const dialog = h(
      'dialog.modal',
      {
        'aria-label': t('galleryTitle'),
        on: {
          click: (event) => {
            if (event.target === dialog) dismiss();
          },
          cancel: (event) => {
            event.preventDefault();
            dismiss();
          },
          keydown: (event) => {
            if (event.key === 'ArrowRight') step(1);
            if (event.key === 'ArrowLeft') step(-1);
            if (event.key === 'Escape') {
              event.preventDefault();
              dismiss();
            }
          },
          close: dismiss,
        },
      },
      h(
        'figure.modal__panel.notch',
        { style: { margin: '0' } },
        image,
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              padding: '4px 20px 16px',
            },
          },
          caption,
          h(
            'div',
            { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
            counter,
            when(items.length > 1, () =>
              h('button.btn-plain', {
                type: 'button',
                text: '←',
                'aria-label': t('prev'),
                on: { click: () => step(-1) },
              })
            ),
            when(items.length > 1, () =>
              h('button.btn-plain', {
                type: 'button',
                text: '→',
                'aria-label': t('next'),
                on: { click: () => step(1) },
              })
            ),
            h('button.btn-plain', {
              type: 'button',
              text: t('close'),
              on: { click: dismiss },
            })
          )
        )
      )
    );

    document.body.append(dialog);
    dialog.showModal();
  }

  return { galleryPage };
})();
