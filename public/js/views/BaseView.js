/**
 * BaseView.js — Abstract base class for all views.
 *
 * Contract:
 *   - render(data?) → void   must be implemented by subclass
 *   - destroy()              removes `this.el` from DOM, nulls reference
 *   - this.container         the DOM element views append into
 *   - this.el                the root element created by render()
 *
 * Views MUST NOT import Models. They receive data via render(data).
 */
export class BaseView {
  /**
   * @param {string|HTMLElement} container — CSS selector or DOM element.
   * @throws {TypeError} if instantiated directly (abstract class guard).
   */
  constructor(container) {
    if (new.target === BaseView) {
      throw new TypeError('BaseView is abstract and cannot be instantiated directly.');
    }

    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error(`${this.constructor.name}: container not found for "${container}".`);
    }

    /** @type {HTMLElement|null} Root element created by render(). */
    this.el = null;
  }

  /**
   * Build and append the view's DOM into this.container.
   * Must set this.el to the root element.
   * @param {*} [data]
   */
  render(data) { // eslint-disable-line no-unused-vars
    throw new Error(`${this.constructor.name}.render() must be implemented.`);
  }

  /**
   * Remove this.el from the DOM and null the reference.
   * Subclasses that own child views should override and call super.destroy().
   */
  destroy() {
    this.el?.remove();
    this.el = null;
  }

  /**
   * Escape HTML to prevent XSS from stored data.
   * @param {string} str
   * @returns {string}
   */
  _esc(str = '') {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
