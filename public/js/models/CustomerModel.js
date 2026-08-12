/**
 * CustomerModel.js — Custom Customer directory database.
 * Persisted via LocalStorageAdapter. Pure data logic, no DOM.
 *
 * @typedef {{
 *   id:              number,
 *   name:            string,
 *   email:           string,
 *   phone:           string,
 *   street:          string,
 *   city:            string,
 *   zip:             string,
 *   country:         string,
 *   notes:           string,
 *   created_at:      string
 * }} Customer
 */
import { LocalStorageAdapter } from '../store/LocalStorageAdapter.js';

const STORE_KEY = 'customers';

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

const DEFAULT_CUSTOMERS = [
  {
    id: 1,
    name: 'Musterkunde GmbH',
    email: 'info@musterkunde.at',
    phone: '+43 1 554433',
    street: 'Kundenstraße 12',
    city: 'Wien',
    zip: '1020',
    country: 'AT',
    notes: 'Premium-Kunde',
    created_at: new Date().toISOString()
  }
];

export const CustomerModel = Object.freeze({
  /** @returns {Customer[]} */
  getAll() {
    let list = LocalStorageAdapter.get(STORE_KEY);
    if (!list || list.length === 0) {
      list = DEFAULT_CUSTOMERS;
      LocalStorageAdapter.set(STORE_KEY, list);
    }
    return list;
  },

  /** @param {number} id @returns {Customer|null} */
  getById(id) {
    return this.getAll().find(c => c.id === id) ?? null;
  },

  /**
   * Save (create or update) a customer.
   * @param {Partial<Customer>} data
   * @returns {Customer} saved customer
   */
  save(data) {
    const all = this.getAll();
    let customer;
    if (data.id) {
      const idx = all.findIndex(c => c.id === data.id);
      if (idx > -1) {
        all[idx] = { ...all[idx], ...data };
        customer = all[idx];
      }
    } else {
      customer = {
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        zip: '',
        country: 'AT',
        notes: '',
        ...data,
        id: nextId(all),
        created_at: new Date().toISOString()
      };
      all.push(customer);
    }
    LocalStorageAdapter.set(STORE_KEY, all);
    return customer;
  },

  /** @param {number} id */
  delete(id) {
    const all = this.getAll();
    const filtered = all.filter(c => c.id !== id);
    LocalStorageAdapter.set(STORE_KEY, filtered);
  }
});
