/**
 * Pointer and motion effects.
 *
 * All four of these are decoration. Each one checks for a fine pointer and for
 * `prefers-reduced-motion` and simply does nothing when either says no, so the
 * site stays fully usable on a phone and for anyone who gets motion sick.
 *
 * They write to `style.transform` directly rather than going through a render,
 * because they run on every pointer move and a re-render per frame would be
 * absurd.
 */

const reduceMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const finePointer = () =>
  window.matchMedia?.('(pointer: fine)').matches ?? false;

/* --------------------------------------------------------------------------
   Cursor spotlight
   A soft radial glow that lags behind the pointer. One per document.
   -------------------------------------------------------------------------- */

let spotlight = null;

export function initSpotlight() {
  if (spotlight || !finePointer() || reduceMotion()) return () => {};

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.append(glow);

  let targetX = -1000;
  let targetY = -1000;
  let x = -1000;
  let y = -1000;
  let frame = 0;

  const onMove = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    glow.style.opacity = '1';
  };
  const onLeave = () => {
    glow.style.opacity = '0';
  };

  const tick = () => {
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;
    glow.style.transform = `translate(${x - 170}px, ${y - 170}px)`;
    frame = requestAnimationFrame(tick);
  };

  document.addEventListener('mousemove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);
  tick();

  spotlight = () => {
    cancelAnimationFrame(frame);
    document.removeEventListener('mousemove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    glow.remove();
    spotlight = null;
  };
  return spotlight;
}

/* --------------------------------------------------------------------------
   Card tilt
   -------------------------------------------------------------------------- */

/**
 * Tips a card towards the pointer. Attach with `h('div', { ref: attachTilt })`.
 * @param {HTMLElement} el
 */
export function attachTilt(el) {
  if (!el || !finePointer() || reduceMotion()) return;

  el.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.transform =
      `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
  });

  const reset = () => {
    el.style.transform = '';
  };
  el.addEventListener('pointerleave', reset);
  el.addEventListener('blur', reset);
}

/* --------------------------------------------------------------------------
   Hero parallax
   -------------------------------------------------------------------------- */

/**
 * Drifts the hero's glow orbs and tips the dial as the pointer crosses the
 * section. Amounts are small on purpose — it should read as depth, not motion.
 *
 * @param {HTMLElement} hero
 * @param {{orbA?: HTMLElement, orbB?: HTMLElement, dial?: HTMLElement}} parts
 */
export function attachHeroParallax(hero, parts) {
  if (!hero || !finePointer() || reduceMotion()) return;

  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const box = hero.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;

    if (parts.orbA) parts.orbA.style.transform = `translate(${x * 46}px, ${y * 34}px)`;
    if (parts.orbB) parts.orbB.style.transform = `translate(${x * -30}px, ${y * -22}px)`;
    if (parts.dial) {
      parts.dial.style.transform =
        `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
    }
  });

  hero.addEventListener('pointerleave', () => {
    for (const el of Object.values(parts)) {
      if (el) el.style.transform = '';
    }
  });
}

/* --------------------------------------------------------------------------
   Counting numbers
   -------------------------------------------------------------------------- */

/**
 * Counts an element up to `value`, starting when it first scrolls into view.
 * Returns a teardown function; the caller drops it when the view is replaced.
 *
 * @param {HTMLElement} el
 * @param {number} value
 * @param {string} suffix     e.g. '+' or '/7'
 * @param {object} [options]
 * @param {(n: number) => string} [options.format] renders each intermediate
 *        number — used to group thousands, so 80000 reads as "80 000"
 * @param {number} [options.duration] milliseconds
 * @returns {() => void}
 */
export function countUp(el, value, suffix = '', options = {}) {
  const { format = String, duration = 1400 } = options;
  const write = (n) => {
    el.textContent = `${format(n)}${suffix}`;
  };

  if (reduceMotion() || typeof IntersectionObserver === 'undefined') {
    write(value);
    return () => {};
  }

  write(0);
  let frame = 0;

  const run = () => {
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      // Cubic ease-out: fast at first, gliding into the final number.
      const eased = 1 - (1 - progress) ** 3;
      write(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        run();
      }
    },
    { threshold: 0.4 }
  );
  observer.observe(el);

  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
  };
}

/* --------------------------------------------------------------------------
   Reveal on scroll
   -------------------------------------------------------------------------- */

/**
 * Fades a section up the first time it enters the viewport.
 * @param {HTMLElement} el
 */
export function attachReveal(el) {
  if (!el || reduceMotion() || typeof IntersectionObserver === 'undefined') return;

  el.style.opacity = '0';
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.disconnect();
        el.style.opacity = '';
        el.style.animation = 'fade-up 0.6s ease both';
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  observer.observe(el);
}
