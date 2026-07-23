/**
 * DistributorModel.js — Distributor data schema and CRUD operations.
 * Persisted via LocalStorageAdapter. Pure data logic, no DOM.
 *
 * @typedef {{
 *   id:         number,
 *   name:       string,
 *   email:      string,
 *   phone:      string,
 *   region:     string,
 *   active:     boolean,
 *   branche_ids: string[],
 *   created_at: string
 * }} Distributor
 */
import { LocalStorageAdapter } from '../store/LocalStorageAdapter.js';

const STORE_KEY = 'distributors';

/** @returns {number} */
function nextId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

export const DistributorModel = Object.freeze({
  /** @returns {Distributor[]} */
  getAll() {
    return LocalStorageAdapter.get(STORE_KEY) ?? [];
  },

  /** @param {number} id @returns {Distributor|null} */
  getById(id) {
    return this.getAll().find(d => d.id === id) ?? null;
  },

  /** @returns {Distributor[]} Only active distributors */
  getActive() {
    return this.getAll().filter(d => d.active);
  },

  /**
   * Create or update a distributor.
   * Presence of `data.id` determines create vs update.
   * @param {Partial<Distributor>} data
   */
  save(data) {
    const all = this.getAll();
    if (data.id) {
      const idx = all.findIndex(d => d.id === data.id);
      if (idx > -1) all[idx] = { ...all[idx], ...data };
    } else {
      all.push({
        name:       '',
        email:      '',
        phone:      '',
        region:     '',
        active:     true,
        branche_ids: [],
        ...data,
        id:         nextId(all),
        created_at: new Date().toISOString(),
      });
    }
    LocalStorageAdapter.set(STORE_KEY, all);
  },

  /** @param {number} id */
  delete(id) {
    const filtered = this.getAll().filter(d => d.id !== id);
    LocalStorageAdapter.set(STORE_KEY, filtered);
  },
});
