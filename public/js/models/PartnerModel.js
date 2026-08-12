/**
 * PartnerModel.js — Partner & subcontractor network management.
 * Persisted via LocalStorageAdapter. Pure data logic, no DOM.
 *
 * @typedef {{
 *   id:              number,
 *   name:            string,
 *   email:           string,
 *   phone:           string,
 *   lat:             number,
 *   lng:             number,
 *   status:          'active'|'inactive'|'busy',
 *   commission_rate: number,
 *   commission_type: 'percentage'|'flat',
 *   address_street:  string,
 *   address_city:    string,
 *   address_zip:     string,
 *   address_country: string,
 *   created_at:      string
 * }} Partner
 */
import { LocalStorageAdapter } from '../store/LocalStorageAdapter.js';

const STORE_KEY = 'partners';

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

// Default partner coordinates matching Graz and Vienna regions for the radar map
const DEFAULT_PARTNERS = [
  {
    id: 1,
    name: 'Sanitär Schnellservice Graz',
    email: 'graz@sanitaer-schnell.at',
    phone: '+43 316 991122',
    lat: 47.0707, // Graz center
    lng: 15.4395,
    status: 'active',
    commission_rate: 12.0, // 12% margin
    commission_type: 'percentage',
    address_street: 'Jakominiplatz 1',
    address_city: 'Graz',
    address_zip: '8010',
    address_country: 'AT',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Elektro Blitzer Wien',
    email: 'office@elektro-blitzer.at',
    phone: '+43 1 883344',
    lat: 48.2082, // Vienna center
    lng: 16.3738,
    status: 'busy',
    commission_rate: 10.0,
    commission_type: 'percentage',
    address_street: 'Stephansplatz 3',
    address_city: 'Wien',
    address_zip: '1010',
    address_country: 'AT',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Trockenbau Meister Graz-Umgebung',
    email: 'info@tb-meister-graz.at',
    phone: '+43 3132 7755',
    lat: 47.1215, // Andritz (North Graz)
    lng: 15.4222,
    status: 'active',
    commission_rate: 150.0, // 150 EUR flat fee
    commission_type: 'flat',
    address_street: 'Andritzer Reichsstraße 54',
    address_city: 'Graz',
    address_zip: '8045',
    address_country: 'AT',
    created_at: new Date().toISOString()
  }
];

// Helper to calculate Haversine distance in km
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const PartnerModel = Object.freeze({
  /** @returns {Partner[]} */
  getAll() {
    let list = LocalStorageAdapter.get(STORE_KEY);
    if (!list || list.length === 0) {
      list = DEFAULT_PARTNERS;
      LocalStorageAdapter.set(STORE_KEY, list);
    }
    return list;
  },

  /** @param {number} id @returns {Partner|null} */
  getById(id) {
    return this.getAll().find(p => p.id === id) ?? null;
  },

  /** @returns {Partner[]} */
  getActive() {
    return this.getAll().filter(p => p.status === 'active');
  },

  /**
   * Get sorted partners by geographic proximity to target coordinates
   * @param {number} lat
   * @param {number} lng
   * @returns {{ partner: Partner, distance: number }[]}
   */
  getNearbyPartners(lat, lng) {
    if (!lat || !lng) return [];
    return this.getAll()
      .map(p => ({
        partner: p,
        distance: calculateDistance(lat, lng, p.lat, p.lng)
      }))
      .sort((a, b) => a.distance - b.distance);
  },

  /**
   * Save (create or update) a partner.
   * @param {Partial<Partner>} data
   * @returns {Partner} saved partner
   */
  save(data) {
    const all = this.getAll();
    let partner;
    if (data.id) {
      const idx = all.findIndex(p => p.id === data.id);
      if (idx > -1) {
        all[idx] = { ...all[idx], ...data };
        partner = all[idx];
      }
    } else {
      partner = {
        name: '',
        email: '',
        phone: '',
        lat: 47.0707,
        lng: 15.4395,
        status: 'active',
        commission_rate: 10.0,
        commission_type: 'percentage',
        address_street: '',
        address_city: '',
        address_zip: '',
        address_country: 'AT',
        ...data,
        id: nextId(all),
        created_at: new Date().toISOString()
      };
      all.push(partner);
    }
    LocalStorageAdapter.set(STORE_KEY, all);
    return partner;
  },

  /** @param {number} id */
  delete(id) {
    const all = this.getAll();
    const filtered = all.filter(p => p.id !== id);
    LocalStorageAdapter.set(STORE_KEY, filtered);
  }
});
