/**
 * BrancheModel.js — Data schema and CRUD operations for Branchen.
 * Persisted via LocalStorageAdapter.
 *
 * @typedef {{
 *   id:          string,
 *   name:        string,
 *   icon:        string,
 *   description: string,
 *   color:       string,
 *   created_at:  string
 * }} Branche
 */
import { LocalStorageAdapter } from '../store/LocalStorageAdapter.js';

const STORE_KEY = 'branchen';

const DEFAULT_BRANCHEN = [
  {
    id:          'entruempelung',
    name:        'Entrümpelung',
    icon:        '🏚️',
    description: 'Haushaltsauflösungen, Wohnungsräumungen, Kellerentrümpelungen, Messie-Wohnungen und Dachbodenräumungen.',
    color:       'var(--accent-cyan)',
    created_at:  new Date().toISOString()
  },
  {
    id:          'antiquitaeten',
    name:        'Antiquitäten',
    icon:        '🏺',
    description: 'Ankauf, Bewertung und Vermittlung von Antiquitäten, Kunst, Schmuck und Sammlerstücken.',
    color:       'var(--accent-amber)',
    created_at:  new Date().toISOString()
  }
];

export const BrancheModel = Object.freeze({
  /** @returns {Branche[]} */
  getAll() {
    let all = LocalStorageAdapter.get(STORE_KEY);
    if (!all || all.length === 0) {
      all = DEFAULT_BRANCHEN;
      LocalStorageAdapter.set(STORE_KEY, all);
    }
    return all;
  },

  /** @param {string} id @returns {Branche|null} */
  getById(id) {
    return this.getAll().find(b => b.id === id) ?? null;
  },

  /**
   * Create or update a branche.
   * @param {Partial<Branche>} data
   */
  save(data) {
    const all = this.getAll();
    const idx = all.findIndex(b => b.id === data.id);
    
    if (idx > -1) {
      all[idx] = { ...all[idx], ...data };
    } else {
      // Create new: generate id from name if not provided
      const newId = data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      all.push({
        id:          newId,
        name:        data.name || 'Neue Branche',
        icon:        data.icon || '🏷️',
        description: data.description || '',
        color:       data.color || 'var(--accent-violet)',
        created_at:  new Date().toISOString(),
        ...data
      });
    }
    LocalStorageAdapter.set(STORE_KEY, all);
  },

  /** @param {string} id */
  delete(id) {
    const filtered = this.getAll().filter(b => b.id !== id);
    LocalStorageAdapter.set(STORE_KEY, filtered);
  }
});
