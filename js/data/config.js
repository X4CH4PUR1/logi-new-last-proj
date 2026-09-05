window.Logi = window.Logi || {};
Logi.data = Logi.data || {};
Logi.data.config = (function () {

  const LANGUAGES = [
    { code: 'ka', label: 'ქარ', name: 'ქართული', htmlLang: 'ka' },
    { code: 'en', label: 'ENG', name: 'English', htmlLang: 'en' },
    // { code: 'ru', label: 'РУС', name: 'Русский', htmlLang: 'ru' }, // რუსული ენა დროებით გამორთულია
  ];

  const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

  const DEFAULT_LANGUAGE = 'en';
  const DEFAULT_THEME = 'night';

  const ADMIN_PATH = 'control-room';

  const ROUTES = [
    { key: 'home', path: '', labelKey: 'navHome', nav: true },
    { key: 'about', path: 'about', labelKey: 'navAbout', nav: true },
    { key: 'products', path: 'products', labelKey: 'navProducts', nav: true },
    { key: 'news', path: 'news', labelKey: 'navNews', nav: true },
    { key: 'service', path: 'service', labelKey: 'navService', nav: true },
    { key: 'gallery', path: 'gallery', labelKey: 'navGallery', nav: true },
    { key: 'contacts', path: 'contacts', labelKey: 'navContacts', nav: true },
    { key: 'admin', path: ADMIN_PATH, labelKey: 'navAdmin', nav: false },
  ];

  const NAV_ROUTES = ROUTES.filter((r) => r.nav);

  const STORAGE = {
    content: 'logi:content:v1',
    lang: 'logi:lang',
    theme: 'logi:theme',
    session: 'logi:admin-session',
  };

  const CONTENT_URL = 'data/content.json';

  const DEFAULT_PIN = '1234';

  const PIN_SALT = 'logimotors::admin::v1';

  const IMAGE_MAX_EDGE = 1600;

  const IMAGE_QUALITY = 0.82;

  const FORKLIFT_CATEGORY = 'forklift';
  const MODES = ['sale', 'rent'];
  const CONDITIONS = ['new', 'used'];

  return { LANGUAGES, LANGUAGE_CODES, DEFAULT_LANGUAGE, DEFAULT_THEME, ADMIN_PATH, ROUTES, NAV_ROUTES, STORAGE, CONTENT_URL, DEFAULT_PIN, PIN_SALT, IMAGE_MAX_EDGE, IMAGE_QUALITY, FORKLIFT_CATEGORY, MODES, CONDITIONS };
})();
