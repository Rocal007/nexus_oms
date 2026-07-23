/**
 * RouterController.js — Hash-based SPA router.
 *
 * Usage:
 *   const router = new RouterController(contentEl);
 *   router.register('/',              () => { ... return cleanup; });
 *   router.register('/distributors',  () => { ... });
 *   router.register('/distributors/:id/edit', ({ id }) => { ... });
 *   router.bind();
 *
 * Handlers receive a params object and may return a cleanup function.
 * The cleanup is called before each route transition.
 */
export class RouterController {
  /**
   * @param {HTMLElement} contentEl — Content area to clear/fill on navigation.
   */
  constructor(contentEl) {
    this._contentEl     = contentEl;
    /** @type {Array<{ pattern: string, handler: Function }>} */
    this._routes        = [];
    this._currentCleanup = null;
    this._onHashChange  = this._resolve.bind(this);
  }

  /**
   * Register a route.
   * @param {string}   pattern  — e.g. '/orders/:id/edit'
   * @param {Function} handler  — receives params object, may return cleanup fn
   * @returns {this}
   */
  register(pattern, handler) {
    this._routes.push({ pattern, handler });
    return this;
  }

  /** Navigate programmatically. */
  navigate(path) {
    window.location.hash = path.startsWith('/') ? path : '/' + path;
  }

  /** Attach hashchange listener and resolve current hash. */
  bind() {
    window.addEventListener('hashchange', this._onHashChange);
    this._resolve();
  }

  unbind() {
    window.removeEventListener('hashchange', this._onHashChange);
    this._currentCleanup?.();
  }

  // ── Private ─────────────────────────────────────────────────

  _resolve() {
    // Strip leading '#'
    const path = window.location.hash.replace(/^#/, '') || '/';

    for (const { pattern, handler } of this._routes) {
      const params = this._match(pattern, path);
      if (params === null) continue;

      // Cleanup previous route
      this._currentCleanup?.();
      this._currentCleanup = null;

      // Clear content
      while (this._contentEl.firstChild) {
        this._contentEl.removeChild(this._contentEl.firstChild);
      }

      // Invoke handler
      const cleanup = handler(params);
      if (typeof cleanup === 'function') this._currentCleanup = cleanup;
      return;
    }

    // No match — redirect to root
    this.navigate('/');
  }

  /**
   * Match a URL pattern against a path.
   * Returns params object if matched, null otherwise.
   * @param {string} pattern
   * @param {string} path
   * @returns {Record<string,string>|null}
   */
  _match(pattern, path) {
    const pp = pattern.split('/').filter(Boolean);
    const rp = path.split('/').filter(Boolean);

    if (pp.length !== rp.length) return null;

    const params = {};
    for (let i = 0; i < pp.length; i++) {
      if (pp[i].startsWith(':')) {
        params[pp[i].slice(1)] = rp[i];
      } else if (pp[i] !== rp[i]) {
        return null;
      }
    }
    return params;
  }
}
