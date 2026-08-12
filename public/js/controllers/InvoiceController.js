/**
 * InvoiceController.js — Coordinates GoBD billing, signature gathering, and DATEV exports.
 */
import { InvoiceModel } from '../models/InvoiceModel.js';
import { CompanyModel } from '../models/CompanyModel.js';
import { PartnerModel } from '../models/PartnerModel.js';
import { InvoiceListView } from '../views/InvoiceListView.js';
import { FastTrackView } from '../views/FastTrackView.js';
import { toast } from '../views/ToastView.js';

export class InvoiceController {
  /**
   * @param {HTMLElement} contentEl
   * @param {import('./RouterController.js').RouterController} router
   */
  constructor(contentEl, router) {
    this._contentEl = contentEl;
    this._router = router;
  }

  /** @returns {() => void} cleanup */
  showList() {
    const view = new InvoiceListView(this._contentEl);

    const refresh = () => {
      view.destroy();
      view.render({
        invoices: InvoiceModel.getAll(),
        activeCompany: CompanyModel.getActiveCompany()
      });
    };

    view.onNewDraft(async (data) => {
      if (data.finalize) {
        // Issuing draft
        toast.show('Versiegele Beleg in GoBD Kette...', 'info');
        await InvoiceModel.finalizeAndIssue(data.id);
        toast.show('Beleg erfolgreich signiert und in GoBD Kette eingereiht.', 'success');
      } else {
        // Creating draft
        InvoiceModel.saveDraft(data);
        toast.show('Entwurf erfolgreich gespeichert.', 'success');
      }
      refresh();
    });

    view.onCancel(async (id) => {
      toast.show('Storniere Beleg und generiere Ausgleichsbeleg...', 'info');
      await InvoiceModel.cancelInvoice(id);
      toast.show('Beleg erfolgreich storniert. Korrekturbeleg angelegt.', 'success');
      refresh();
    });

    view.onVerifyChain(async () => {
      return await InvoiceModel.verifyChain();
    });

    view.onDatevExport((id) => {
      const invoice = InvoiceModel.getById(id);
      if (!invoice) return;
      this._downloadDatevXml(invoice);
      toast.show(`DATEV XML für ${invoice.invoice_number} erfolgreich heruntergeladen.`, 'success');
    });

    view.render({
      invoices: InvoiceModel.getAll(),
      activeCompany: CompanyModel.getActiveCompany()
    });

    return () => view.destroy();
  }

  /** @returns {() => void} cleanup */
  showFastTrack() {
    const view = new FastTrackView(this._contentEl);

    view.onInvoiceCreated(async (invoiceData) => {
      try {
        toast.show('Erstelle Beleg...', 'info');
        
        // Save draft first
        const draft = InvoiceModel.saveDraft(invoiceData);
        
        // Finalize immediately to seal signature & hashes
        await InvoiceModel.finalizeAndIssue(draft.id);
        
        toast.show('Fast-Track Rechnung GoBD-konform erstellt & signiert!', 'success');
        
        // Redirect to invoices book
        this._router.navigate('/invoices');
      } catch (err) {
        toast.show(`Fehler bei Rechnungserstellung: ${err.message}`, 'error');
      }
    });

    view.render({
      activeCompany: CompanyModel.getActiveCompany(),
      partners: PartnerModel.getAll()
    });

    return () => view.destroy();
  }

  /**
   * Helper to generate and download DATEV compliant XML
   * @param {import('../models/InvoiceModel.js').Invoice} invoice
   */
  _downloadDatevXml(invoice) {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<invoice_export xmlns="http://xml.datev.de/bedi/tps/invoice/v010">
  <header>
    <generator_info>NEXUS-OMS-CraftCore</generator_info>
    <created_date>${new Date().toISOString()}</created_date>
  </header>
  <invoice>
    <invoice_number>${invoice.invoice_number}</invoice_number>
    <document_type>${invoice.document_type === 'invoice' ? 'Rechnung' : 'Gutschrift'}</document_type>
    <date>${invoice.date}</date>
    <client>
      <name>${invoice.client_name}</name>
      <email>${invoice.client_email}</email>
    </client>
    <totals>
      <subtotal>${invoice.subtotal.toFixed(2)}</subtotal>
      <tax_amount>${invoice.tax_amount.toFixed(2)}</tax_amount>
      <total>${invoice.total_amount.toFixed(2)}</total>
    </totals>
    <integrity_hash>${invoice.cryptographic_hash}</integrity_hash>
  </invoice>
</invoice_export>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DATEV_Export_${invoice.invoice_number}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
