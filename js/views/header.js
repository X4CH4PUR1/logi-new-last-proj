window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.header = (function () {

  const dom = Logi.core.dom;
  const tpl = Logi.core.tpl;
  const i18n = Logi.core.i18n;
  const theme = Logi.core.theme;
  const router = Logi.core.router;
  const { brand, visibleNavRoutes } = Logi.core.selectors;
  const { socialLinks } = Logi.views.social;
  const noop = () => {};
  let releaseMenuListeners = noop;

  function header({ routeKey }) {
    releaseMenuListeners();

    const root = tpl.clone('header');
    const { themeToggle, navToggle } = tpl.refs(root);
    const marks = brand();
    const menuLabel = i18n.t('menu');

    tpl.bind(root, { brandShort: marks.short, menuLabel });
    tpl.bindAttr(root, { homeHref: router.href('home'), brandFull: marks.full, menuLabel });

    tpl.each(tpl.slot(root, 'nav-links'), visibleNavRoutes(), (route) => {
      const a = tpl.clone('nav-link');
      tpl.bindAttr(a, { href: router.href(route.key) });
      tpl.bind(a, { label: i18n.t(route.labelKey) });
      if (routeKey === route.key) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', closeMenu);
      return a;
    });
    dom.mount(tpl.slot(root, 'nav-social'), socialLinks('mobile'));
    dom.mount(tpl.slot(root, 'tools-social'), socialLinks('desktop'));

    const languages = i18n.getLanguages();
    const langSwitch = tpl.slot(root, 'lang-switch');
    // One language left is no choice at all, so the switcher goes away with it.
    tpl.toggle(langSwitch, languages.length > 1);

    tpl.each(langSwitch, languages, (lang) => {
      const b = tpl.clone('lang-btn');
      tpl.bind(b, { label: lang.label });
      tpl.bindAttr(b, {
        htmlLang: lang.htmlLang,
        name: lang.name,
        pressed: String(i18n.getLang() === lang.code),
      });
      b.addEventListener('click', () => i18n.setLang(lang.code));
      return b;
    });

    themeToggle.textContent = theme.nextLabel();
    themeToggle.addEventListener('click', () => {
      theme.toggle();
      themeToggle.textContent = theme.nextLabel();
    });

    const onDocumentClick = (event) => {
      if (!root.contains(event.target)) closeMenu();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        navToggle.focus();
      }
    };

    function openMenu() {
      root.dataset.navOpen = 'true';
      navToggle.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onDocumentClick);
      document.addEventListener('keydown', onKeyDown);
      releaseMenuListeners = () => {
        document.removeEventListener('click', onDocumentClick);
        document.removeEventListener('keydown', onKeyDown);
        releaseMenuListeners = noop;
      };
    }

    function closeMenu() {
      if (root.dataset.navOpen !== 'true') return;
      root.dataset.navOpen = 'false';
      navToggle.setAttribute('aria-expanded', 'false');
      releaseMenuListeners();
    }

    function toggleMenu() {
      if (root.dataset.navOpen === 'true') closeMenu();
      else openMenu();
    }

    navToggle.addEventListener('click', toggleMenu);

    return root;
  }

  return { header };
})();
