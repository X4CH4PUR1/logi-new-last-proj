window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views["product-modal"] = (function () {

  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const router = Logi.core.router;
  const { decorateProduct } = Logi.core.selectors;
  const { badgeRow, media } = Logi.views.partials;
  function productModal(product, onDismiss) {
    const view = decorateProduct(product);
    let dismissed = false;

    const dialog = tpl.clone('product-modal');
    const { specGrid, quote, closeBtn, descP } = tpl.refs(dialog);

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      if (dialog.open) dialog.close();
      onDismiss();
    };

    dialog.setAttribute('aria-label', view.title);
    tpl.place(dialog, 'media', gallery(view.images, view.title));
    tpl.place(dialog, 'badges', badgeRow(view.badges));
    tpl.toggle(descP, !!view.description);
    tpl.bind(dialog, {
      title: view.title,
      description: view.description,
      price: view.price,
      requestQuote: t('requestQuote'),
      close: t('close'),
    });
    tpl.bindAttr(dialog, { contactsHref: router.href('contacts') });

    tpl.toggle(specGrid, view.specs.length > 0);
    tpl.each(specGrid, view.specs, (spec) => {
      const row = tpl.clone('product-spec');
      tpl.bind(row, { key: spec.key, value: spec.value });
      return row;
    });

    quote.addEventListener('click', dismiss);
    closeBtn.addEventListener('click', dismiss);

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dismiss();
    });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      dismiss();
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
      }
    });
    dialog.addEventListener('close', dismiss);

    return dialog;
  }

  function gallery(images, title) {
    const root = tpl.clone('product-gallery');
    const { thumbs } = tpl.refs(root);

    let current = buildMedia(images[0], title);
    tpl.place(root, 'main', current);

    tpl.toggle(thumbs, images.length > 1);
    if (images.length > 1) {
      tpl.each(thumbs, images, (src, index) => {
        const btn = tpl.clone('product-thumb');
        tpl.bindAttr(btn, { src, alt: title });
        btn.setAttribute('aria-current', String(index === 0));
        btn.addEventListener('click', () => {
          const next = buildMedia(src, title);
          current.replaceWith(next);
          current = next;
          for (const sibling of thumbs.children) {
            sibling.setAttribute('aria-current', String(sibling === btn));
          }
        });
        return btn;
      });
    }

    return root;
  }

  function buildMedia(src, title) {
    return media({
      src,
      alt: title,
      className: 'modal__media',
      placeholderClass: 'modal__media--placeholder',
    });
  }

  return { productModal };
})();
