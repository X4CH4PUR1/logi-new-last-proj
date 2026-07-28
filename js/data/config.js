/**
 * Static site configuration.
 *
 * Nothing here is editable from the admin panel — these are structural
 * decisions (which languages exist, which routes exist, where things are
 * stored). Everything an owner might want to change day to day lives in
 * js/data/defaults.js instead.
 */

/** Supported languages, in the order the switcher shows them. */
export const LANGUAGES = [
  { code: 'ka', label: 'ქარ', name: 'ქართული', htmlLang: 'ka' },
  { code: 'en', label: 'ENG', name: 'English', htmlLang: 'en' },
  { code: 'ru', label: 'РУС', name: 'Русский', htmlLang: 'ru' },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_THEME = 'night';

/**
 * The admin panel's address: the site is edited at `#/control-room`.
 *
 * Change this one string and the link moves; nothing else refers to the old
 * path. Pick something you will remember but a visitor would not guess.
 *
 * Worth being clear about what this does and does not do: an unlisted address
 * keeps the editor out of sight, which is all it is for. It is not a security
 * measure — see the note in js/core/auth.js. Anyone who reads the page source
 * can find this value.
 */
export const ADMIN_PATH = 'control-room';

/**
 * Routes. `path` is the hash fragment, `labelKey` is looked up in the active
 * locale, `nav` decides whether it appears in the header and footer menus.
 */
export const ROUTES = [
  { key: 'home', path: '', labelKey: 'navHome', nav: true },
  { key: 'about', path: 'about', labelKey: 'navAbout', nav: true },
  { key: 'products', path: 'products', labelKey: 'navProducts', nav: true },
  { key: 'news', path: 'news', labelKey: 'navNews', nav: true },
  { key: 'service', path: 'service', labelKey: 'navService', nav: true },
  { key: 'gallery', path: 'gallery', labelKey: 'navGallery', nav: true },
  { key: 'contacts', path: 'contacts', labelKey: 'navContacts', nav: true },
  { key: 'admin', path: ADMIN_PATH, labelKey: 'navAdmin', nav: false },
];

export const NAV_ROUTES = ROUTES.filter((r) => r.nav);

/** localStorage / sessionStorage keys. Namespaced so they never collide. */
export const STORAGE = {
  content: 'logi:content:v1',
  lang: 'logi:lang',
  theme: 'logi:theme',
  session: 'logi:admin-session',
};

/**
 * Where the published content lives. main.js fetches this at boot; if the file
 * is absent (a fresh clone) the built-in defaults are used instead. The admin
 * panel's Publish tab exports exactly this file.
 */
export const CONTENT_URL = 'data/content.json';

/**
 * Fallback PIN used when the owner has never set one. Stored as plain text on
 * purpose — see the security note in README.md. A client-side PIN keeps casual
 * visitors out of the editor; it is not, and cannot be, real access control,
 * because everything the browser can read a determined visitor can read too.
 * The real gate is that publishing requires a commit to the repository.
 */
export const DEFAULT_PIN = '1234';

/** Salt mixed into stored PIN hashes so they are not plain SHA-256 of digits. */
export const PIN_SALT = 'logimotors::admin::v1';

/** Longest edge, in pixels, that uploaded images are downscaled to. */
export const IMAGE_MAX_EDGE = 1600;

/** JPEG quality used when re-encoding uploads. */
export const IMAGE_QUALITY = 0.82;

/** Product categories and the filter tabs built from them. */
export const CATEGORIES = ['forklift', 'parts', 'wheels'];
export const MODES = ['sale', 'rent'];
export const FUELS = ['electric', 'diesel', 'gasoline'];
export const CONDITIONS = ['new', 'used'];
