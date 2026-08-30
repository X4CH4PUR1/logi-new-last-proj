window.Logi = window.Logi || {};
Logi.core = Logi.core || {};
Logi.core.effects = (function () {

  const reduceMotion = () =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const finePointer = () =>
    window.matchMedia?.('(pointer: fine)').matches ?? false;


  let spotlight = null;

  function initSpotlight() {
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


  function attachTilt(el) {
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


  function attachHeroParallax(hero, parts) {
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


  function countUp(el, value, suffix = '', options = {}) {
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


  function attachReveal(el) {
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

  return { initSpotlight, attachTilt, attachHeroParallax, countUp, attachReveal };
})();
