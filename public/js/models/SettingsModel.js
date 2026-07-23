/**
 * SettingsModel.js — System configuration key/value store.
 * Merges saved values with defaults on every get().
 */
import { LocalStorageAdapter } from '../store/LocalStorageAdapter.js';

const STORE_KEY = 'settings';

/**
 * @typedef {{
 *   inbound_email:    string,
 *   admin_name:       string,
 *   default_region:   string,
 *   imap_host:        string,
 *   imap_port:        string,
 *   imap_user:        string,
 *   imap_password:    string,
 *   imap_ssl:         boolean,
 *   pop3_host:        string,
 *   pop3_port:        string,
 *   pop3_ssl:         boolean,
 *   smtp_host:        string,
 *   smtp_port:        string,
 *   smtp_user:        string,
 *   smtp_password:    string,
 *   smtp_ssl:         boolean
 * }} Settings
 */

/** @type {Settings} */
const DEFAULTS = Object.freeze({
  inbound_email:  '',
  admin_name:     'Admin',
  default_region: '',

  // IMAP — World4You
  imap_host:      'imap.world4you.com',
  imap_port:      '993',
  imap_user:      '',
  imap_password:  'E6paHG007#a2605',
  imap_ssl:       true,

  // POP3 — World4You (alternativ)
  pop3_host:      'pop3.world4you.com',
  pop3_port:      '995',
  pop3_ssl:       true,

  // SMTP — World4You (STARTTLS)
  smtp_host:      'smtp.world4you.com',
  smtp_port:      '587',
  smtp_user:      '',
  smtp_password:  'E6paHG007#a2605',
  smtp_ssl:       true,   // true = STARTTLS
});

export const SettingsModel = Object.freeze({
  /** @returns {Settings} — always returns full object with defaults filled in */
  get() {
    return { ...DEFAULTS, ...(LocalStorageAdapter.get(STORE_KEY) ?? {}) };
  },

  /**
   * Merge and persist partial settings update.
   * @param {Partial<Settings>} data
   */
  set(data) {
    LocalStorageAdapter.set(STORE_KEY, { ...this.get(), ...data });
  },
});
