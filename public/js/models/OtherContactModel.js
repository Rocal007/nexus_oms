/**
 * OtherContactModel.js — Other contacts directory (e.g., real estate agents, suppliers).
 * Can be promoted to B2B Partner status.
 * Persisted via LocalStorageAdapter. Pure data logic, no DOM.
 *
 * @typedef {{
 *   id:              number,
 *   name:            string,
 *   type:            string, // e.g. 'Immomakler', 'Lieferant'
 *   email:           string,
 *   phone:           string,
 *   address_street:  string,
 *   address_city:    string,
 *   address_zip:     string,
 *   address_country: string,
 *   socials:         Array<{platform: string, value: string}>,
 *   created_at:      string
 * }} OtherContact
 */
import { LocalStorageAdapter } from '../store/LocalStorageAdapter.js';

const STORE_KEY = 'other_contacts';

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

const DEFAULT_OTHER_CONTACTS = [
  {
    id: 1,
    name: 'Real Estate Graz-Nord',
    type: 'Immomakler',
    email: 'graz-nord@immomakler.at',
    phone: '+43 316 778899',
    address_street: 'Maklerweg 4',
    address_city: 'Graz',
    address_zip: '8010',
    address_country: 'AT',
    socials: [
      { platform: 'facebook', value: 'immograznord' }
    ],
    created_at: new Date().toISOString()
  }
];

export const OtherContactModel = Object.freeze({
  /** @returns {OtherContact[]} */
  getAll() {
    let list = LocalStorageAdapter.get(STORE_KEY);
    if (!list || list.length === 0) {
      list = DEFAULT_OTHER_CONTACTS;
      LocalStorageAdapter.set(STORE_KEY, list);
    }
    return list;
  },

  /** @param {number} id @returns {OtherContact|null} */
  getById(id) {
    return this.getAll().find(c => c.id === id) ?? null;
  },

  /**
   * Save (create or update) a contact.
   * @param {Partial<OtherContact>} data
   * @returns {OtherContact} saved contact
   */
  save(data) {
    const all = this.getAll();
    let contact;
    if (data.id) {
      const idx = all.findIndex(c => c.id === data.id);
      if (idx > -1) {
        all[idx] = { ...all[idx], ...data };
        contact = all[idx];
      }
    } else {
      contact = {
        name: '',
        type: 'Sonstiges',
        email: '',
        phone: '',
        address_street: '',
        address_city: '',
        address_zip: '',
        address_country: 'AT',
        socials: [],
        ...data,
        id: nextId(all),
        created_at: new Date().toISOString()
      };
      all.push(contact);
    }
    LocalStorageAdapter.set(STORE_KEY, all);
    return contact;
  },

  /** @param {number} id */
  delete(id) {
    const all = this.getAll();
    const filtered = all.filter(c => c.id !== id);
    LocalStorageAdapter.set(STORE_KEY, filtered);
  }
});
