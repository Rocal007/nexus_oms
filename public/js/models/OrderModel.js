/**
 * OrderModel.js — Order data schema and CRUD operations.
 * Persisted via LocalStorageAdapter. Pure data logic, no DOM.
 *
 * Status workflow: new → dispatched → accepted | declined → completed
 *
 * @typedef {{
 *   id:             number,
 *   source:         'phone'|'whatsapp'|'email'|'sonstiges',
 *   auftragsart:    string,
 *   caller_name:    string,
 *   anrede:         'herr'|'frau'|'firma',
 *   land:           string,
 *   ort:            string,
 *   plz:            string,
 *   bundesland:     string,
 *   strasse:        string,
 *   adress_detail:  string,
 *   telefon:        string,
 *   anfrage:        string,
 *   priority:       'low'|'normal'|'urgent'|'high'|'emergency',
 *   termin_wunsch:  string,
 *   termin_uhrzeit: string,
 *   distributor_id: number|'all'|null,
 *   branche_id:     string|null,
 *   status:         'new'|'dispatched'|'accepted'|'declined'|'completed',
 *   notes:          string,
 *   attachments:    string[],
 *   created_at:     string
 * }} Order
 */
import { LocalStorageAdapter } from '../store/LocalStorageAdapter.js';

const STORE_KEY = 'orders';

/** @returns {number} */
function nextId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

export const OrderModel = Object.freeze({
  /** @returns {Order[]} newest first */
  getAll() {
    const all = LocalStorageAdapter.get(STORE_KEY) ?? [];
    return [...all].sort((a, b) => b.id - a.id);
  },

  /** @param {number} id @returns {Order|null} */
  getById(id) {
    return (LocalStorageAdapter.get(STORE_KEY) ?? []).find(o => o.id === id) ?? null;
  },

  /**
   * Create a new order.
   * @param {Partial<Order>} data
   * @returns {Order} saved order with assigned id
   */
  create(data) {
    const all = LocalStorageAdapter.get(STORE_KEY) ?? [];
    const order = {
      source:         'phone',
      auftragsart:    '',
      caller_name:    '',
      anrede:         'herr',
      land:           'AT',
      ort:            '',
      plz:            '',
      bundesland:     '',
      strasse:        '',
      adress_detail:  '',
      telefon:        '',
      anfrage:        '',
      priority:       'normal',
      termin_wunsch:  '',
      termin_uhrzeit: '',
      distributor_id: null,
      branche_id:     null,
      status:         'new',
      notes:          '',
      attachments:    [],
      ...data,
      id:             nextId(all),
      created_at:     new Date().toISOString(),
    };
    all.push(order);
    LocalStorageAdapter.set(STORE_KEY, all);
    return order;
  },

  /**
   * Update status of an existing order.
   * @param {number} id
   * @param {'new'|'dispatched'|'accepted'|'declined'|'completed'} status
   */
  updateStatus(id, status) {
    const all = LocalStorageAdapter.get(STORE_KEY) ?? [];
    const idx = all.findIndex(o => o.id === id);
    if (idx > -1) {
      all[idx] = { ...all[idx], status };
      LocalStorageAdapter.set(STORE_KEY, all);
    }
  },

  /**
   * Assign a distributor to an order.
   * @param {number} orderId
   * @param {number|null} distributorId
   */
  assignDistributor(orderId, distributorId) {
    const all = LocalStorageAdapter.get(STORE_KEY) ?? [];
    const idx = all.findIndex(o => o.id === orderId);
    if (idx > -1) {
      all[idx] = { ...all[idx], distributor_id: distributorId };
      LocalStorageAdapter.set(STORE_KEY, all);
    }
  },

  /**
   * Update all editable fields of an existing order.
   * Immutable fields (id, created_at) are preserved.
   * @param {number}          id
   * @param {Partial<Order>}  data
   * @returns {Order|null}
   */
  update(id, data) {
    const all = LocalStorageAdapter.get(STORE_KEY) ?? [];
    const idx = all.findIndex(o => o.id === id);
    if (idx === -1) return null;
    all[idx] = {
      ...all[idx],
      ...data,
      id:         all[idx].id,          // never overwrite
      created_at: all[idx].created_at,  // never overwrite
    };
    LocalStorageAdapter.set(STORE_KEY, all);
    return all[idx];
  },


  /** @param {number} id */
  delete(id) {
    const filtered = (LocalStorageAdapter.get(STORE_KEY) ?? []).filter(o => o.id !== id);
    LocalStorageAdapter.set(STORE_KEY, filtered);
  },
});
