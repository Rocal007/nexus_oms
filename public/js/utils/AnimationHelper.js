/**
 * AnimationHelper.js — Particle system + scroll-reveal observer.
 * Factory functions only. Each returns a controller with .destroy().
 * No global state. Caller owns the lifecycle.
 */

/** @type {string[]} */
const PARTICLE_COLORS = ['#38bdf8', '#2dd4bf', '#a78bfa', '#4ade80'];
const PARTICLE_COUNT  = 30;

/**
 * Spawn floating ambient particles into a container element.
 * Each particle uses CSS animation `drift` defined in animations.css.
 *
 * @param {HTMLElement} container
 * @returns {{ destroy: () => void }}
 */
export function createParticleSystem(container) {
  /** @type {HTMLElement[]} */
  const nodes = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const size     = Math.random() * 3 + 1;
    const color    = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    const left     = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay    = Math.random() * -30;
    const driftX   = (Math.random() - 0.5) * 200;

    const el = document.createElement('div');
    Object.assign(el.style, {
      position:     'absolute',
      borderRadius: '50%',
      width:        `${size}px`,
      height:       `${size}px`,
      background:   color,
      boxShadow:    `0 0 ${size * 2}px ${color}`,
      left:         `${left}%`,
      animation:    `drift ${duration}s ${delay}s linear infinite`,
      opacity:      '0.35',
      pointerEvents: 'none',
    });
    el.style.setProperty('--drift-x', `${driftX}px`);

    container.append(el);
    nodes.push(el);
  }

  return {
    destroy() { nodes.forEach(n => n.remove()); },
  };
}

/**
 * Observe elements matching `selector` and add `.visible` when they
 * enter the viewport. Uses IntersectionObserver with staggered delay.
 *
 * CSS class `.fade-up` + `.visible` defined in base.css.
 *
 * @param {string} [selector='.fade-up']
 * @returns {{ destroy: () => void }}
 */
export function createScrollFadeObserver(selector = '.fade-up') {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.05 },
  );

  document.querySelectorAll(selector).forEach(el => observer.observe(el));

  return {
    destroy() { observer.disconnect(); },
  };
}
