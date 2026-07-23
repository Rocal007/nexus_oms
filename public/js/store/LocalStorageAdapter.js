/**
 * LocalStorageAdapter.js — Single point of contact for localStorage.
 * All reads/writes go through here. No other file touches localStorage directly.
 */

const KEY_PREFIX = 'nexus_oms__';

export const LocalStorageAdapter = Object.freeze({
  /**
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    try {
      const raw = localStorage.getItem(KEY_PREFIX + key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * @param {string} key
   * @param {*}      value  — must be JSON-serialisable
   * @returns {boolean}
   */
  set(key, value) {
    try {
      localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  /** @param {string} key */
  remove(key) {
    localStorage.removeItem(KEY_PREFIX + key);
  },
});
