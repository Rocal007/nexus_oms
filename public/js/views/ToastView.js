/**
 * ToastView.js — Singleton toast notification manager.
 * Import `toast` and call toast.show(msg, type).
 * No BaseView — not a page view, renders into a fixed portal.
 */
import { ce } from '../utils/DOMHelper.js';

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
const DEFAULT_DURATION = 3500;

class ToastView {
  constructor() {
    /** @type {HTMLElement|null} lazy-initialised */
    this._container = null;
  }

  _getContainer() {
    if (!this._container) {
      this._container = document.getElementById('toast-container');
    }
    return this._container;
  }

  /**
   * @param {string}  message
   * @param {'success'|'error'|'info'|'warning'} [type='success']
   * @param {number}  [duration=3500]
   */
  show(message, type = 'success', duration = DEFAULT_DURATION) {
    const container = this._getContainer();
    if (!container) return;

    const toast = ce('div', { className: `toast toast--${type}` }, [
      ce('span', { className: 'toast__icon', textContent: ICONS[type] ?? 'ℹ' }),
      ce('span', { className: 'toast__msg',  textContent: message }),
    ]);

    container.append(toast);

    // Auto-remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }
}

/** Singleton — import and use directly */
export const toast = new ToastView();
