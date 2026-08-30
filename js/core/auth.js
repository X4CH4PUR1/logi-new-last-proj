window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.auth = (function () {

  const { DEFAULT_PIN, PIN_SALT, STORAGE } = Logi.data.config;
  const storage = Logi.util.storage;
  const store = Logi.core.store;
  async function hashPin(pin) {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return null;
    const bytes = new TextEncoder().encode(`${PIN_SALT}${pin}`);
    const digest = await subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function verify(pin) {
    const stored = store.getContent().settings?.pinHash ?? null;

    if (!stored) return pin === DEFAULT_PIN;

    const hashed = await hashPin(pin);
    if (hashed === null) return false;
    return timingSafeEqual(hashed, stored);
  }

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

  function usingDefaultPin() {
    return !store.getContent().settings?.pinHash;
  }


  function isUnlocked() {
    return storage.readSession(STORAGE.session) === '1';
  }

  function unlock() {
    storage.writeSession(STORAGE.session, '1');
  }

  function lock() {
    storage.clearSession(STORAGE.session);
  }

  function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  return { hashPin, verify, setPin, usingDefaultPin, isUnlocked, unlock, lock };
})();
