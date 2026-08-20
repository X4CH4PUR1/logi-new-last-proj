window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.gallery = (function () {
  /**
   * Gallery page.
   *
   * Photos open in a lightbox with keyboard paging. Only uploaded photos are
   * clickable — an empty slot renders the hatched placeholder and is inert.
   */

  const tpl = Logi.core.tpl;
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

    const root = tpl.clone('gallery');
    const [eyebrowEl, titleEl] = pageHeader('VISUALS', t('galleryTitle'));
    tpl.place(root, 'eyebrow', eyebrowEl);
    tpl.place(root, 'title', titleEl);

    if (items.length) {
      const grid = tpl.clone('gallery-grid');
      tpl.each(tpl.slot(grid, 'list'), items, (item) => figure(item, open));
      tpl.place(root, 'body', grid);
    } else {
      tpl.place(root, 'body', empty(t('galleryEmpty')));
    }

    return root;
  }

  function figure(item, onOpen) {
    const root = tpl.clone('gallery-figure');
    const { caption } = tpl.refs(root);
    tpl.place(root, 'media', media({
      src: item.img,
      alt: item.caption,
      className: 'gallery-figure__media',
      placeholderClass: 'gallery-figure__media',
      onClick: item.img ? () => onOpen(item) : undefined,
    }));
    tpl.toggle(caption, !!item.caption);
    tpl.bind(root, { caption: item.caption });
    return root;
  }

  /* --------------------------------------------------------------------------
     Lightbox
     -------------------------------------------------------------------------- */

  function openLightbox(items, startIndex) {
    let index = startIndex;

    const dialog = tpl.clone('lightbox');
    const { image, caption, counter, prev, next, closeBtn } = tpl.refs(dialog);

    dialog.setAttribute('aria-label', t('galleryTitle'));
    tpl.bind(dialog, { closeLabel: t('close') });
    tpl.bindAttr(dialog, { prevAria: t('prev'), nextAria: t('next') });
    tpl.toggle(prev, items.length > 1);
    tpl.toggle(next, items.length > 1);

    const render = () => {
      image.src = items[index].img;
      image.alt = items[index].caption;
      caption.textContent = items[index].caption;
      counter.textContent = `${index + 1} / ${items.length}`;
    };
    render();

    const step = (delta) => {
      index = (index + delta + items.length) % items.length;
      render();
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

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dismiss();
    });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      dismiss();
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
      }
    });
    dialog.addEventListener('close', dismiss);

    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    closeBtn.addEventListener('click', dismiss);

    document.body.append(dialog);
    dialog.showModal();
  }

  return { galleryPage };
})();
