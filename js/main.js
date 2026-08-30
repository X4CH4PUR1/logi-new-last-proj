(function () {

  const store = Logi.core.store;
  const i18n = Logi.core.i18n;
  const theme = Logi.core.theme;
  const { initSpotlight } = Logi.core.effects;
  const { start } = Logi.app;
  async function boot() {
    const root = document.getElementById('app');
    if (!root) throw new Error('#app is missing from index.html');

    try {
      await store.init();
    } catch (err) {
      console.error('[boot] could not load content', err);
      showBootError(root, err);
      return;
    }

    i18n.init();
    theme.init();
    initSpotlight();

    start(root);

    document.documentElement.dataset.ready = 'true';
  }

  function showBootError(root, err) {
    root.textContent = '';
    const box = document.createElement('div');
    box.style.cssText =
      'max-width:640px;margin:15vh auto;padding:32px;font:16px/1.6 system-ui,sans-serif;' +
      'color:#f2f2ec;background:#1a1e29;border:1px solid #e05555';
    const title = document.createElement('h1');
    title.textContent = 'The site could not start';
    title.style.cssText = 'font-size:22px;margin:0 0 12px';
    const detail = document.createElement('p');
    detail.textContent = String(err?.message || err);
    detail.style.cssText = 'margin:0;color:#98a0af;font-family:ui-monospace,monospace;font-size:13px';
    box.append(title, detail);
    root.append(box);
  }

  boot();
})();
