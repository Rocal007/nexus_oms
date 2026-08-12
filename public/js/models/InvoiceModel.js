/**
 * InvoiceModel.js — GoBD-compliant Invoicing & Commissions.
 * Persisted via LocalStorageAdapter. Pure data logic, no DOM.
 * Includes SHA-256 hash chaining using Web Crypto API.
 *
 * @typedef {{
 *   id:                 number,
 *   company_id:         number,
 *   order_id:           number|null,
 *   partner_id:         number|null,
 *   invoice_number:     string,
 *   document_type:      'invoice'|'correction_invoice',
 *   client_name:        string,
 *   client_email:       string,
 *   date:               string,
 *   due_date:           string,
 *   items:              { title: string, quantity: number, price: number, unit: string }[],
 *   subtotal:           number,
 *   tax_rate:           number,
 *   tax_amount:         number,
 *   total_amount:       number,
 *   cancellation_of_id: number|null,
 *   signature_data:     string|null, -- base64 signature image or canvas data
 *   status:             'draft'|'sent'|'paid'|'cancelled',
 *   cryptographic_hash: string,
 *   created_at:         string
 * }} Invoice
 *
 * @typedef {{
 *   id:                 number,
 *   invoice_id:         number,
 *   partner_id:         number,
 *   base_amount:        number,
 *   commission_amount:  number,
 *   direction:          'inbound'|'outbound',
 *   status:             'unbilled'|'billed'|'paid',
 *   created_at:         string
 * }} CommissionLedger
 */
import { LocalStorageAdapter } from '../store/LocalStorageAdapter.js';
import { PartnerModel } from './PartnerModel.js';

const STORE_KEY = 'invoices';
const COMM_STORE_KEY = 'commission_ledger';

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

// Simple browser-native SHA-256 hash generator (async)
async function calculateSHA256(text) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const InvoiceModel = Object.freeze({
  /** @returns {Invoice[]} */
  getAll() {
    return LocalStorageAdapter.get(STORE_KEY) ?? [];
  },

  /** @param {number} id @returns {Invoice|null} */
  getById(id) {
    return this.getAll().find(inv => inv.id === id) ?? null;
  },

  /** @returns {CommissionLedger[]} */
  getCommissions() {
    return LocalStorageAdapter.get(COMM_STORE_KEY) ?? [];
  },

  /**
   * Save an invoice draft.
   * @param {Partial<Invoice>} data
   * @returns {Invoice}
   */
  saveDraft(data) {
    const all = this.getAll();
    let invoice;
    if (data.id) {
      const idx = all.findIndex(inv => inv.id === data.id);
      if (idx > -1) {
        if (all[idx].status !== 'draft') {
          throw new Error('GoBD-Verstoß: Finalisierte Rechnungen dürfen nicht editiert werden!');
        }
        all[idx] = { ...all[idx], ...data };
        invoice = all[idx];
      }
    } else {
      const year = new Date().getFullYear();
      const count = all.filter(inv => inv.invoice_number.startsWith(`RE-${year}-`)).length + 1;
      const invoiceNumber = `RE-${year}-${String(count).padStart(4, '0')}`;

      invoice = {
        company_id: 1,
        order_id: null,
        partner_id: null,
        invoice_number: invoiceNumber,
        document_type: 'invoice',
        client_name: '',
        client_email: '',
        date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
        items: [],
        subtotal: 0,
        tax_rate: 20.0, // Default Austria 20%
        tax_amount: 0,
        total_amount: 0,
        cancellation_of_id: null,
        signature_data: null,
        status: 'draft',
        cryptographic_hash: '',
        created_at: new Date().toISOString(),
        ...data,
        id: nextId(all)
      };
      all.push(invoice);
    }
    LocalStorageAdapter.set(STORE_KEY, all);
    return invoice;
  },

  /**
   * Finalize and issue invoice (GoBD lock-in & cryptographic chaining)
   * @param {number} id
   * @returns {Promise<Invoice>}
   */
  async finalizeAndIssue(id) {
    const all = this.getAll();
    const idx = all.findIndex(inv => inv.id === id);
    if (idx === -1) throw new Error('Rechnung nicht gefunden.');
    if (all[idx].status !== 'draft') return all[idx];

    // Calc totals
    const invoice = all[idx];
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    invoice.tax_amount = invoice.subtotal * (invoice.tax_rate / 100.0);
    invoice.total_amount = invoice.subtotal + invoice.tax_amount;

    // Chaining hash
    const finalizedInvoices = all.filter(inv => inv.status !== 'draft' && inv.cryptographic_hash);
    const prevHash = finalizedInvoices.length > 0 
      ? finalizedInvoices[finalizedInvoices.length - 1].cryptographic_hash 
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const payload = `${invoice.id}|${invoice.invoice_number}|${invoice.total_amount.toFixed(2)}|${prevHash}`;
    invoice.cryptographic_hash = await calculateSHA256(payload);
    invoice.status = 'sent';

    all[idx] = invoice;
    LocalStorageAdapter.set(STORE_KEY, all);

    // Calculate Partner Commission if partner attached
    if (invoice.partner_id) {
      this._calculatePartnerCommission(invoice);
    }

    return invoice;
  },

  /**
   * GoBD Storno (Creates a correction invoice and cancels the original)
   * @param {number} id
   * @returns {Promise<Invoice>} Correction invoice
   */
  async cancelInvoice(id) {
    const all = this.getAll();
    const originalIdx = all.findIndex(inv => inv.id === id);
    if (originalIdx === -1) throw new Error('Original-Rechnung nicht gefunden.');
    
    const original = all[originalIdx];
    if (original.status === 'draft') {
      original.status = 'cancelled';
      LocalStorageAdapter.set(STORE_KEY, all);
      return original;
    }
    
    if (original.status === 'cancelled') {
      throw new Error('Rechnung ist bereits storniert.');
    }

    // Create Correction Invoice (Negative totals)
    const year = new Date().getFullYear();
    const count = all.filter(inv => inv.invoice_number.startsWith(`RE-${year}-`)).length + 1;
    const correctionNumber = `RE-${year}-${String(count).padStart(4, '0')}`;

    const correctionItems = original.items.map(item => ({
      ...item,
      quantity: -item.quantity // negative quantity to reverse revenue
    }));

    const correction = {
      id: nextId(all),
      company_id: original.company_id,
      order_id: original.order_id,
      partner_id: original.partner_id,
      invoice_number: correctionNumber,
      document_type: 'correction_invoice',
      client_name: original.client_name,
      client_email: original.client_email,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      items: correctionItems,
      subtotal: -original.subtotal,
      tax_rate: original.tax_rate,
      tax_amount: -original.tax_amount,
      total_amount: -original.total_amount,
      cancellation_of_id: original.id,
      signature_data: null,
      status: 'draft',
      cryptographic_hash: '',
      created_at: new Date().toISOString()
    };

    all.push(correction);
    LocalStorageAdapter.set(STORE_KEY, all);

    // Update original status to cancelled
    all[originalIdx].status = 'cancelled';
    LocalStorageAdapter.set(STORE_KEY, all);

    // Finalize correction invoice immediately to chain it cryptographically
    return await this.finalizeAndIssue(correction.id);
  },

  /**
   * Internal partner commission ledger calculator
   * @param {Invoice} invoice
   */
  _calculatePartnerCommission(invoice) {
    const partner = PartnerModel.getById(invoice.partner_id);
    if (!partner) return;

    const baseAmount = invoice.subtotal;
    let commissionAmount = 0;

    if (partner.commission_type === 'percentage') {
      commissionAmount = baseAmount * (partner.commission_rate / 100.0);
    } else {
      commissionAmount = partner.commission_rate;
    }

    const ledgers = this.getCommissions();
    const newEntry = {
      id: nextId(ledgers),
      invoice_id: invoice.id,
      partner_id: partner.id,
      base_amount: baseAmount,
      commission_amount: commissionAmount,
      direction: 'inbound', // Partner paying commission to the holding
      status: 'unbilled',
      created_at: new Date().toISOString()
    };

    ledgers.push(newEntry);
    LocalStorageAdapter.set(COMM_STORE_KEY, ledgers);
  },

  /**
   * Verify integrity of GoBD hash chain
   * @returns {Promise<boolean>}
   */
  async verifyChain() {
    const all = this.getAll().filter(inv => inv.status !== 'draft' && inv.cryptographic_hash);
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (const invoice of all) {
      const payload = `${invoice.id}|${invoice.invoice_number}|${invoice.total_amount.toFixed(2)}|${prevHash}`;
      const expectedHash = await calculateSHA256(payload);
      if (invoice.cryptographic_hash !== expectedHash) {
        console.error(`GoBD chain broken at invoice ID ${invoice.id}. Expected ${expectedHash}, got ${invoice.cryptographic_hash}`);
        return false;
      }
      prevHash = invoice.cryptographic_hash;
    }
    return true;
  }
});
