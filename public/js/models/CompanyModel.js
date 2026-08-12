/**
 * CompanyModel.js — Multi-firm context management.
 * Persisted via LocalStorageAdapter. Pure data logic, no DOM.
 */
import { LocalStorageAdapter } from '../store/LocalStorageAdapter.js';

const STORE_KEY = 'companies_v12';
const ACTIVE_KEY = 'active_company_id';

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

const DEFAULT_COMPANIES = [
  {
    id: 1,
    name: 'Bau GmbH',
    industries: ['Trockenbau'],
    branding_color: '#2563EB',
    legal_form: 'GmbH',
    insurance_active: true,
    insurance_details: 'Generali Haftpflicht, Polizze: GEN-887711, Deckungssumme: € 5.000.000',
    licences: 'Konzessionierter Trockenbaubetrieb (AT), Meisterprüfung Denkmalpflege (AT)',
    licences_list: [
      { name: 'Konzessionierter Trockenbaubetrieb', country: 'AT' },
      { name: 'Meisterprüfung Denkmalpflege', country: 'AT' }
    ],
    managing_director: 'Peter Gruber (GF)',
    managing_directors: [{ position: 'GF', name: 'Peter Gruber' }],
    bank_iban: 'AT89 3000 0000 1111 2222',
    bank_bic: 'GNEAT2WXXXX',
    // Founded & Staff
    founded: '2010',
    employee_names: ['Peter Gruber', 'Stefan Leitner'],
    helper_names: ['Manuel Brandner'],
    // Registers (AT)
    at_fn: 'FN 554433 z',
    at_gisa: '12345678',
    at_tax_number: '68-123/4567',
    at_gln: '9001234567890',
    at_ersb: '',
    de_hr: '',
    de_tax_number: '',
    de_widnr: '',
    ch_che: '',
    ch_mwst: '',
    vat_id: 'ATU12345678',
    intl_eori: 'ATEOS1000012345',
    intl_lei: '529900REQX805NH8G965',
    intl_oss_ioss: 'IM0401234567',
    locations: [
      { type: 'main', name: 'Zentrale Graz', street: 'Gewerbestraße 12', zip: '8010', city: 'Graz', country: 'AT' },
      { type: 'secondary', name: 'Lager & Logistik Graz-Ost', street: 'Liebenauer Gürtel 5', zip: '8041', city: 'Graz', country: 'AT' }
    ],
    phones: [
      { label: 'Zentrale', number: '+43 316 990011' },
      { label: 'Notdienst 24h', number: '+43 664 1234567' }
    ],
    emails: [
      { label: 'Büro', address: 'office@bau-gmbh.at' },
      { label: 'Rechnungswesen', address: 'invoices@bau-gmbh.at' }
    ],
    websites: [
      { label: 'Hauptseite', url: 'https://www.bau-gmbh.at' }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Sanitär & Heizung GmbH',
    industries: ['SHK'],
    branding_color: '#10B981',
    legal_form: 'GmbH',
    insurance_active: true,
    insurance_details: 'Uniqa Gewerbe-Kasko, Polizze: UQ-445522, Deckungssumme: € 3.000.000',
    licences: 'Konzessionierte Gas- und Sanitärtechnik (AT), Meisterprüfung Heizungstechnik (AT)',
    licences_list: [
      { name: 'Konzessionierte Gas- und Sanitärtechnik', country: 'AT' },
      { name: 'Meisterprüfung Heizungstechnik', country: 'AT' }
    ],
    managing_director: 'DI Hans Müller (GF)',
    managing_directors: [{ position: 'GF', name: 'DI Hans Müller' }],
    bank_iban: 'AT43 2011 1000 9999 8888',
    bank_bic: 'UNIQAT2WXXXX',
    // Founded & Staff
    founded: '2018',
    employee_names: ['DI Hans Müller', 'Andreas Huber'],
    helper_names: [],
    // Registers (AT)
    at_fn: 'FN 998877 x',
    at_gisa: '87654321',
    at_tax_number: '09-444/5555',
    at_gln: '9009876543210',
    at_ersb: '',
    de_hr: '',
    de_tax_number: '',
    de_widnr: '',
    ch_che: '',
    ch_mwst: '',
    vat_id: 'ATU87654321',
    intl_eori: '',
    intl_lei: '',
    intl_oss_ioss: '',
    locations: [
      { type: 'main', name: 'Hauptsitz Wien', street: 'Technikerstraße 4', zip: '1010', city: 'Wien', country: 'AT' },
      { type: 'secondary', name: 'Zweigstelle Linz', street: 'Landstraße 88', zip: '4020', city: 'Linz', country: 'AT' }
    ],
    phones: [
      { label: 'Kundenservice', number: '+43 1 883399' }
    ],
    emails: [
      { label: 'Support', address: 'service@sanitaer-heizung.at' }
    ],
    websites: [
      { label: 'Web', url: 'https://www.sanitaer-heizung.at' }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Gipser & Maler AG',
    industries: ['Malerei & Anstrich', 'Sonstige'],
    branding_color: '#D97706',
    legal_form: 'AG',
    insurance_active: true,
    insurance_details: 'Helvetia Betriebshaftpflicht, Polizze: HEL-1234, Deckungssumme: CHF 10.000.000',
    licences: 'Eidgenössisches Malerdiplom (CH), Mitglied SMGV (CH)',
    licences_list: [
      { name: 'Eidgenössisches Malerdiplom', country: 'CH' },
      { name: 'Mitglied SMGV', country: 'CH' }
    ],
    managing_director: 'Beat Sutter (Vorstand)',
    managing_directors: [{ position: 'Vorstand', name: 'Beat Sutter' }],
    bank_iban: 'CH89 0000 0000 9999 8888 7',
    bank_bic: 'SWISCHZHXXX',
    // Founded & Staff
    founded: '2005',
    employee_names: ['Beat Sutter', 'Ursula Frei'],
    helper_names: ['Roman Keller', 'Fabian Wicki'],
    // Registers (CH)
    at_fn: '',
    at_gisa: '',
    at_tax_number: '',
    at_gln: '',
    at_ersb: '',
    de_hr: '',
    de_tax_number: '',
    de_widnr: '',
    ch_che: 'CHE-999.888.777',
    ch_mwst: 'CHE-999.888.777 MWST',
    vat_id: 'CHE-999.888.777 MWST',
    intl_eori: '',
    intl_lei: '',
    intl_oss_ioss: '',
    locations: [
      { type: 'main', name: 'Hauptstandort Zürich', street: 'Bahnhofstrasse 14', zip: '8001', city: 'Zürich', country: 'CH' },
      { type: 'secondary', name: 'Filiale Winterthur', street: 'Technoparkstrasse 2', zip: '8400', city: 'Winterthur', country: 'CH' }
    ],
    phones: [
      { label: 'Zentrale Zürich', number: '+41 44 222 3344' },
      { label: 'Filiale Winterthur', number: '+41 52 111 2233' }
    ],
    emails: [
      { label: 'Zentrale', address: 'info@gipser-maler.ch' },
      { label: 'Support CH', address: 'support@gipser-maler.ch' }
    ],
    websites: [
      { label: 'Offiziell', url: 'https://www.gipser-maler.ch' }
    ],
    created_at: new Date().toISOString()
  }
];

export const CompanyModel = Object.freeze({
  /** @returns {Company[]} */
  getAll() {
    let list = LocalStorageAdapter.get(STORE_KEY);
    if (!list || list.length === 0) {
      list = DEFAULT_COMPANIES;
      LocalStorageAdapter.set(STORE_KEY, list);
    }
    return list;
  },

  /** @param {number} id @returns {Company|null} */
  getById(id) {
    return this.getAll().find(c => c.id === id) ?? null;
  },

  /** @returns {number} Active company ID */
  getActiveId() {
    let id = LocalStorageAdapter.get(ACTIVE_KEY);
    if (!id) {
      const all = this.getAll();
      id = all[0].id;
      LocalStorageAdapter.set(ACTIVE_KEY, id);
    }
    return Number(id);
  },

  /** @returns {Company} Active company object */
  getActiveCompany() {
    const id = this.getActiveId();
    return this.getById(id) ?? this.getAll()[0];
  },

  /** @param {number} id */
  setActiveId(id) {
    LocalStorageAdapter.set(ACTIVE_KEY, Number(id));
    // Trigger globally to update styles and UI context
    window.dispatchEvent(new CustomEvent('nexus:company-switched', { detail: { companyId: id } }));
  },

  /**
   * Create or update a company.
   * @param {Partial<Company>} data
   * @returns {Company} saved company
   */
  save(data) {
    const all = this.getAll();
    let company;

    // Backward-compatible string representation for managing director
    if (data.managing_directors && data.managing_directors.length > 0) {
      data.managing_director = data.managing_directors
        .map(d => `${d.name} (${d.position || 'GF'})`)
        .join(', ');
    } else {
      data.managing_director = '';
    }

    // Backward-compatible string representation for licences (including qualifications)
    if (data.licences_list && data.licences_list.length > 0) {
      data.licences = data.licences_list
        .map(l => `${l.name}${l.qualification ? ` [Qualifikation: ${l.qualification}]` : ''} (${l.country})`)
        .join(', ');
    } else {
      data.licences = '';
    }

    if (data.id) {
      const idx = all.findIndex(c => c.id === data.id);
      if (idx > -1) {
        all[idx] = { ...all[idx], ...data };
        company = all[idx];
      }
    } else {
      company = {
        name: '',
        industries: [],
        vat_id: '',
        locations: [],
        phones: [],
        emails: [],
        websites: [],
        branding_color: '#2563EB',
        legal_form: '',
        insurance_active: false,
        insurance_details: '',
        licences: '',
        licences_list: [],
        managing_director: '',
        managing_directors: [],
        bank_iban: '',
        bank_bic: '',
        // Founded & Staff
        founded: '',
        employee_names: [],
        helper_names: [],
        // Register default states
        at_fn: '',
        at_gisa: '',
        at_tax_number: '',
        at_gln: '',
        at_ersb: '',
        de_hr: '',
        de_tax_number: '',
        de_widnr: '',
        ch_che: '',
        ch_mwst: '',
        intl_eori: '',
        intl_lei: '',
        intl_oss_ioss: '',
        ...data,
        id: nextId(all),
        created_at: new Date().toISOString()
      };
      all.push(company);
    }
    LocalStorageAdapter.set(STORE_KEY, all);
    return company;
  },

  /** @param {number} id */
  delete(id) {
    const all = this.getAll();
    const filtered = all.filter(c => c.id !== id);
    LocalStorageAdapter.set(STORE_KEY, filtered);
    if (this.getActiveId() === id && filtered.length > 0) {
      this.setActiveId(filtered[0].id);
    }
  }
});
