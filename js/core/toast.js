window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.toast = (function () {

  const { h } = Logi.core.dom;
  let node = null;
  let timer = 0;

  function show(message, options = {}) {
    const { error = false, duration = error ? 6000 : 2600 } = options;

    dismiss();

    node = h(
      'div.toast',
      {
        class: error ? 'toast--error' : null,
        role: 'status',
        'aria-live': error ? 'assertive' : 'polite',
      },
      h('span.toast__dot'),
      h('span', { text: message })
    );

    document.body.append(node);
    timer = window.setTimeout(dismiss, duration);
  }

  function error(message) {
    show(message, { error: true });
  }

  function dismiss() {
    window.clearTimeout(timer);
    timer = 0;
    node?.remove();
    node = null;
  }

  return { show, error, dismiss };
})();
