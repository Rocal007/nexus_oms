/**
 * OrderController.js — Order management: create, dispatch, status updates.
 *
 * E-Mail dispatch: opens mailto: link with pre-formatted order details.
 * The admin's local e-mail client handles actual sending.
 */
import { OrderModel }       from '../models/OrderModel.js';
import { DistributorModel } from '../models/DistributorModel.js';
import { BrancheModel }     from '../models/BrancheModel.js';
import { SettingsModel }    from '../models/SettingsModel.js';
import { OrderListView }    from '../views/OrderListView.js';
import { OrderFormView }    from '../views/OrderFormView.js';
import { EmailInboxView }   from '../views/EmailInboxView.js';
import { EmailPoller }      from '../store/EmailPoller.js';
import { toast }            from '../views/ToastView.js';

const PRIORITY_LABEL = {
  low:       'Niedrig 🔵',
  normal:    'Normal',
  urgent:    'DRINGEND ⚠️',
  high:      'SEHR DRINGEND 🟠',
  emergency: 'NOTFALL 🔴',
};
const SOURCE_LABEL   = {
  phone:     'Telefonanruf',
  whatsapp:  'WhatsApp',
  email:     'E-Mail',
  sonstiges: 'Sonstiges',
};
const ANREDE_LABEL = { herr: 'Hr.', frau: 'Fr.', firma: 'Firma' };

export class OrderController {
  /**
   * @param {HTMLElement}                                      contentEl
   * @param {import('./RouterController.js').RouterController} router
   */
  constructor(contentEl, router) {
    this._contentEl = contentEl;
    this._router    = router;
    this._view      = null;
  }

  /** Render order list. */
  showList() {
    const view = new OrderListView(this._contentEl);
    view.render(OrderModel.getAll(), DistributorModel.getAll(), BrancheModel.getAll());

    view.onNew(()        => this._router.navigate('/orders/new'));
    view.onDispatch(id   => this._dispatch(id, view));
    view.onAccept(id     => this._updateStatus(id, 'accepted', view));
    view.onDecline(id    => this._updateStatus(id, 'declined', view));
    view.onDelete(id     => this._delete(id, view));
    view.onEdit((id, data) => {
      OrderModel.update(id, data);
      toast.show('✅ Auftrag aktualisiert.', 'success');
      this._refreshList(view);
    });

    this._view = view;
    return () => view.destroy();
  }

  /** Render new order form. */
  showForm(brancheId = null) {
    const distributors = DistributorModel.getActive();
    const branchen     = BrancheModel.getAll();
    const view = new OrderFormView(this._contentEl, distributors, branchen, brancheId);
    view.render();

    view.onSave(data => {
      OrderModel.create(data);
      toast.show('Auftrag gespeichert.', 'success');
      this._router.navigate('/orders');
    });
    view.onCancel(() => this._router.navigate('/orders'));

    this._view = view;
    return () => view.destroy();
  }

  /** Render E-Mail-Posteingang (neue Mails vom IMAP-Server). */
  showInbox() {
    const view = new EmailInboxView(this._contentEl);
    view.render();

    /** Bei 404 (Server neu gestartet, Liste veraltet): Poll auslösen + View neu laden */
    const handleStale = () => {
      toast.show('🔄 Posteingang wird neu geladen …', 'info');
      EmailPoller.pollNow();
      // Kurz warten damit der Poll startet, dann View neu rendern
      setTimeout(() => { view.destroy(); this.showInbox(); }, 2000);
    };

    view.onImport(async (uid) => {
      try {
        const res  = await fetch(`${EmailPoller.apiBase}/api/emails/${uid}/import`, { method: 'POST' });
        if (res.status === 404) return handleStale();
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error ?? 'Unbekannter Fehler');
        OrderModel.create(data.draft);
        toast.show('✅ E-Mail als Auftrag angelegt.', 'success');
        EmailPoller.pollNow();
      } catch (err) {
        toast.show(`Fehler: ${err.message}`, 'error');
      }
    });

    view.onDelete(async (uid) => {
      try {
        const res  = await fetch(`${EmailPoller.apiBase}/api/emails/${uid}`, { method: 'DELETE' });
        if (res.status === 404) return handleStale();
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Löschen fehlgeschlagen');
        toast.show('🗑️ Mail gelöscht.', 'warning');
        EmailPoller.pollNow();
      } catch (err) {
        toast.show(`Fehler: ${err.message}`, 'error');
      }
    });

    view.onSpam(async (uid, from) => {
      try {
        const res  = await fetch(`${EmailPoller.apiBase}/api/emails/${uid}/spam`, { method: 'POST' });
        if (res.status === 404) return handleStale();
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Spam-Aktion fehlgeschlagen');
        const folder = data.folder ? ` → „${data.folder}"` : '';
        toast.show(`⛔ Absender gesperrt${folder}.`, 'warning');
        EmailPoller.pollNow();
      } catch (err) {
        toast.show(`Fehler: ${err.message}`, 'error');
      }
    });

    view.onRefresh(() => {
      toast.show('📬 Postfach wird abgerufen …', 'info');
      EmailPoller.pollNow();
    });

    this._view = view;
    return () => view.destroy();
  }


  // ── Private ─────────────────────────────────────────────────

  /**
   * Open mailto: link to dispatch order to assigned distributor.
   * @param {number}         id
   * @param {OrderListView}  view
   */
  _dispatch(id, view) {
    const order = OrderModel.getById(id);
    if (!order) return;

    const dist = DistributorModel.getById(order.distributor_id);
    if (!dist) {
      toast.show('Kein Distributor zugewiesen.', 'error');
      return;
    }

    const settings   = SettingsModel.get();
    const termin     = order.termin_wunsch
      ? new Date(order.termin_wunsch).toLocaleDateString('de-AT', { dateStyle: 'long' })
      : 'Keine Angabe';
    const uhrzeit    = order.termin_uhrzeit || 'Keine Angabe';
    const anrede     = ANREDE_LABEL[order.anrede] ?? '';
    const landStr    = order.land && order.land !== 'AT' ? ` (${order.land})` : '';
    const ort        = [order.plz, order.ort, order.bundesland].filter(Boolean).join(' ') + landStr;
    const adresse    = [order.strasse, order.adress_detail].filter(Boolean).join(' ');

    const subject = `[NEXUS-OMS #${order.id}] ${order.auftragsart || 'Auftragsanfrage'} – ${ort || order.ort}`;
    const body    = [
      `Sehr geehrte/r ${dist.name},`,
      '',
      `wir möchten Ihnen folgenden Auftrag anfragen:`,
      '',
      `Auftragsnummer : #${order.id}`,
      `Eingang        : ${SOURCE_LABEL[order.source] ?? order.source}`,
      `Auftragsart    : ${order.auftragsart || '—'}`,
      `Auftraggeber   : ${anrede} ${order.caller_name}`.trim(),
      `Telefon        : ${order.telefon || '—'}`,
      `Ort / PLZ      : ${ort || '—'}`,
      `Adresse        : ${adresse || '—'}`,
      `Priorität      : ${PRIORITY_LABEL[order.priority]}`,
      `Terminwunsch   : ${termin} um ${uhrzeit}`,
      '',
      `Notiz / Anfrage:`,
      `${order.anfrage || order.notes || '—'}`,
      '',
      `Bitte bestätigen Sie die Übernahme per Rückantwort auf diese E-Mail.`,
      '',
      `Mit freundlichen Grüßen,`,
      `${settings.admin_name || 'NEXUS-OMS Admin'}`,
    ].join('\n');


    const mailto = `mailto:${encodeURIComponent(dist.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    OrderModel.updateStatus(id, 'dispatched');
    toast.show(`E-Mail an ${dist.name} vorbereitet.`, 'info');

    // Re-render list to reflect new status
    this._refreshList(view);
  }

  /**
   * @param {number}        id
   * @param {string}        status
   * @param {OrderListView} view
   */
  _updateStatus(id, status, view) {
    // If accepted and was already accepted → mark as completed
    const order = OrderModel.getById(id);
    const newStatus = (order?.status === 'accepted' && status === 'accepted') ? 'completed' : status;

    const labels = { accepted: 'Angenommen', declined: 'Abgelehnt', completed: 'Abgeschlossen' };
    OrderModel.updateStatus(id, newStatus);
    toast.show(`Auftrag #${id} – ${labels[newStatus] ?? newStatus}.`, 'success');
    this._refreshList(view);
  }

  /** @param {number} id @param {OrderListView} view */
  _delete(id, view) {
    if (!confirm(`Auftrag #${id} wirklich löschen?`)) return;
    OrderModel.delete(id);
    toast.show(`Auftrag #${id} gelöscht.`, 'warning');
    this._refreshList(view);
  }

  /** Re-render the order list in the same container without full navigation. */
  _refreshList(oldView) {
    oldView?.destroy();
    this.showList();
  }
}
