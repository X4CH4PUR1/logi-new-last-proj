window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views["product-modal"] = (function () {
  /**
   * Product detail modal.
   *
   * Built on a native <dialog>, which gives keyboard focus trapping and makes
   * the rest of the page inert without any of that being hand written.
   *
   * Teardown is driven by an explicit `dismiss()` rather than by listening for
   * the dialog's `close` event. Every route into closing — the buttons, the
   * scrim, Escape — calls it, and it is safe to call twice. Some embedded
   * browsers (Electron shells in particular) never dispatch `close`, and a modal
   * that will not go away is a much worse failure than a redundant call.
   */

  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const router = Logi.core.router;
  const { decorateProduct } = Logi.core.selectors;
  const { badgeRow, media } = Logi.views.partials;
  /**
   * @param {object} product raw product record
   * @param {() => void} onDismiss called once, after the dialog has closed
   * @returns {HTMLDialogElement}
   */
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

    // Clicking the scrim — but not the panel — dismisses.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dismiss();
    });
    // Escape. preventDefault stops the browser closing it behind our back.
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

  /**
   * The main photo plus a thumbnail strip when there is more than one — the
   * strip only appears once a product actually has extra photos, so a single-
   * image product (or one with none) looks exactly as it did before.
   * @param {string[]} images
   * @param {string} title used as the alt text for every photo
   */
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
