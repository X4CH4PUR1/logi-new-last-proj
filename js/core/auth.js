window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.auth = (function () {
  /**
   * Admin unlock.
   *
   * IMPORTANT — read this before relying on it.
   *
   * This is a lock on a drawer, not a lock on a building. Everything the browser
   * can check, a visitor can also read and bypass: the PIN hash ships inside
   * data/content.json and the check runs on their machine. It keeps the editor
   * out of the way of ordinary visitors and stops idle poking; it is not access
   * control and must never be treated as such.
   *
   * What actually protects the live site is that publishing requires a commit to
   * the GitHub repository. Someone who forces their way into this panel can edit
   * their own copy of the page in their own browser and nothing more.
   *
   * The PIN is stored as SHA-256 of PIN_SALT + pin, so the digits are at least
   * not sitting in the JSON in plain text.
   */

  const { DEFAULT_PIN, PIN_SALT, STORAGE } = Logi.data.config;
  const storage = Logi.util.storage;
  const store = Logi.core.store;
  /**
   * @param {string} pin
   * @returns {Promise<string|null>} hex digest, or null where WebCrypto is
   *          unavailable (an insecure origin, or a page opened via file://)
   */
  async function hashPin(pin) {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return null;
    const bytes = new TextEncoder().encode(`${PIN_SALT}${pin}`);
    const digest = await subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * @param {string} pin
   * @returns {Promise<boolean>}
   */
  async function verify(pin) {
    const stored = store.getContent().settings?.pinHash ?? null;

    // No PIN has ever been set — the factory default applies.
    if (!stored) return pin === DEFAULT_PIN;

    const hashed = await hashPin(pin);
    // Without WebCrypto we cannot check a hashed PIN at all. Refuse rather than
    // silently falling back to something weaker.
    if (hashed === null) return false;
    return timingSafeEqual(hashed, stored);
  }

  /**
   * @param {string} pin
   * @returns {Promise<{ok: boolean, reason?: string}>}
   */
  async function setPin(pin) {
    if (!/^\d{4,12}$/.test(pin)) {
      return { ok: false, reason: 'The PIN must be 4 to 12 digits.' };
    }
    const hashed = await hashPin(pin);
    if (hashed === null) {
      return {
        ok: false,
        reason: 'Changing the PIN needs a secure context. Open the site over https or on localhost.',
      };
    }
    store.update((draft) => {
      draft.settings.pinHash = hashed;
    });
    return { ok: true };
  }

  /** True when the PIN has never been changed from the shipped default. */
  function usingDefaultPin() {
    return !store.getContent().settings?.pinHash;
  }

  /* --------------------------------------------------------------------------
     Session
     The unlock lives in sessionStorage, so closing the tab locks it again.
     -------------------------------------------------------------------------- */

  function isUnlocked() {
    return storage.readSession(STORAGE.session) === '1';
  }

  function unlock() {
    storage.writeSession(STORAGE.session, '1');
  }

  function lock() {
    storage.clearSession(STORAGE.session);
  }

  /** Constant-time-ish comparison; cheap, and avoids a needless early return. */
  function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  return { hashPin, verify, setPin, usingDefaultPin, isUnlocked, unlock, lock };
})();
