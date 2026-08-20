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

  const { h, when } = Logi.core.dom;
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
    let dialog;
    let dismissed = false;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      if (dialog.open) dialog.close();
      onDismiss();
    };

    dialog = h(
      'dialog.modal',
      {
        'aria-label': view.title,
        on: {
          // Clicking the scrim — but not the panel — dismisses.
          click: (event) => {
            if (event.target === dialog) dismiss();
          },
          // Escape. preventDefault stops the browser closing it behind our back.
          cancel: (event) => {
            event.preventDefault();
            dismiss();
          },
          keydown: (event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              dismiss();
            }
          },
          close: dismiss,
        },
      },
      h(
        'div.modal__panel.notch',
        {},
        media({
          src: view.img,
          alt: view.title,
          className: 'modal__media',
          placeholderClass: 'modal__media--placeholder',
        }),
        h(
          'div.modal__body',
          {},
          badgeRow(view.badges),
          h('h2.modal__title', { text: view.title }),
          when(view.specs.length, () =>
            h(
              'div.spec-grid',
              {},
              view.specs.map((spec) =>
                h(
                  'div.spec',
                  {},
                  h('div.spec__key', { text: spec.key }),
                  h('div.spec__value', { text: spec.value })
                )
              )
            )
          ),
          h(
            'div.modal__footer',
            {},
            h('p.modal__price.grad-text', { text: view.price }),
            h(
              'div',
              { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
              h('a.btn.btn--primary.btn--sm', {
                href: router.href('contacts'),
                text: t('requestQuote'),
                on: { click: dismiss },
              }),
              h('button.btn.btn--ghost.btn--sm', {
                type: 'button',
                text: t('close'),
                on: { click: dismiss },
              })
            )
          )
        )
      )
    );

    return dialog;
  }

  return { productModal };
})();
