/**
 * InvoiceListView.js — GoBD Invoices, Storno actions, & DATEV Export triggers.
 * Includes interactive GoBD chain verification banner.
 */
import { BaseView } from './BaseView.js';
import { ce } from '../utils/DOMHelper.js';

const STATUS_LABELS = {
  draft: '📝 Entwurf',
  sent: '📨 Ausgestellt / Offen',
  paid: '🟢 Bezahlt',
  cancelled: '❌ Storniert'
};

const DOC_TYPES = {
  invoice: 'Rechnung',
  correction_invoice: 'Korrekturbeleg (Storno)'
};

export class InvoiceListView extends BaseView {
  constructor(container) {
    super(container);
    this._onNewDraft = null;
    this._onCancel = null;
    this._onVerifyChain = null;
    this._onDatevExport = null;
  }

  /**
   * @param {{ invoices: import('../models/InvoiceModel.js').Invoice[], activeCompany: any }} data
   */
  render({ invoices, activeCompany }) {
    const wrapper = ce('div', {});

    // Header
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: `Rechnungsbuch — ${activeCompany.name}` }),
        ce('div', { className: 'page-header__subtitle', textContent: 'FINANCE::GOBD_COMPLIANT_LEDGER' }),
      ]),
      ce('div', { className: 'page-header__actions', 'style.display': 'flex', 'style.gap': 'var(--spacing-sm)' }, [
        ce('button', {
          className: 'btn btn--secondary',
          type: 'button',
          id: 'btn-verify-gobd',
          textContent: '🛡️ GoBD-Kettenprüfung'
        }),
        ce('button', {
          className: 'btn btn--primary',
          type: 'button',
          id: 'btn-new-invoice',
          textContent: '＋ Rechnung entwerfen'
        })
      ])
    ]);

    // GoBD Status Banner
    const verifyBanner = ce('div', {
      id: 'gobd-banner',
      'style.display': 'none',
      'style.padding': 'var(--spacing-md)',
      'style.borderRadius': 'var(--border-radius)',
      'style.marginBottom': 'var(--spacing-md)',
      'style.fontWeight': '600'
    });

    // Table
    const tableWrap = ce('div', { className: 'data-table-wrapper' });
    const table = ce('table', { className: 'data-table' });
    
    const thead = ce('thead', { className: 'data-table__head' });
    thead.innerHTML = `<tr>
      <th class="data-table__th">Belegnummer</th>
      <th class="data-table__th">Belegtyp</th>
      <th class="data-table__th">Kunde</th>
      <th class="data-table__th">Datum</th>
      <th class="data-table__th">Betrag</th>
      <th class="data-table__th">Status</th>
      <th class="data-table__th">Hash (GoBD-Kette)</th>
      <th class="data-table__th">Aktionen</th>
    </tr>`;

    const tbody = ce('tbody', {});

    if (invoices.length === 0) {
      const emptyRow = ce('tr', {});
      emptyRow.innerHTML = `<td colspan="8" class="data-table__td" style="text-align:center; opacity:0.5; padding:var(--spacing-lg);">
        Keine Belege vorhanden. Klicken Sie auf „Rechnung entwerfen“.
      </td>`;
      tbody.append(emptyRow);
    } else {
      invoices.forEach(inv => {
        const row = ce('tr', { className: 'data-table__row' });
        
        let statusBadgeClass = 'badge--active';
        if (inv.status === 'draft') statusBadgeClass = 'badge--inactive';
        if (inv.status === 'cancelled') statusBadgeClass = 'badge--danger'; // red
        if (inv.status === 'sent') statusBadgeClass = 'badge--warning'; // orange

        row.innerHTML = `
          <td class="data-table__td data-table__td--mono">${this._esc(inv.invoice_number)}</td>
          <td class="data-table__td">${DOC_TYPES[inv.document_type]}</td>
          <td class="data-table__td"><strong>${this._esc(inv.client_name)}</strong></td>
          <td class="data-table__td">${inv.date}</td>
          <td class="data-table__td" style="font-family:var(--font-mono); font-weight:600;">
            ${inv.total_amount.toFixed(2)} €
          </td>
          <td class="data-table__td"><span class="badge ${statusBadgeClass}">${STATUS_LABELS[inv.status]}</span></td>
          <td class="data-table__td data-table__td--mono" style="font-size:10px; opacity:0.35; max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${inv.cryptographic_hash || 'Noch nicht versiegelt'}">
            ${inv.cryptographic_hash || '📝 Draft'}
          </td>
          <td class="data-table__td">
            <div class="data-table__td--actions" style="display:flex; gap:4px;">
              ${inv.status === 'draft' ? `
                <button class="btn btn--primary btn--sm" data-action="finalize" data-id="${inv.id}">⛓️ Versiegeln</button>
              ` : ''}
              ${inv.status !== 'cancelled' && inv.status !== 'draft' ? `
                <button class="btn btn--danger btn--sm" data-action="cancel" data-id="${inv.id}">🗑️ Storno</button>
              ` : ''}
              ${inv.status !== 'draft' ? `
                <button class="btn btn--secondary btn--sm" data-action="datev" data-id="${inv.id}">📁 DATEV</button>
              ` : ''}
            </div>
          </td>
        `;

        tbody.append(row);
      });
    }

    table.append(thead, tbody);
    tableWrap.append(table);
    wrapper.append(header, verifyBanner, tableWrap);

    // Setup Actions
    wrapper.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);

      if (action === 'finalize') {
        this._onNewDraft?.({ id, finalize: true });
      }
      if (action === 'cancel') {
        if (confirm('Möchten Sie diese Rechnung GoBD-konform stornieren? Dadurch wird eine Korrekturrechnung angelegt.')) {
          this._onCancel?.(id);
        }
      }
      if (action === 'datev') {
        this._onDatevExport?.(id);
      }
    });

    // Verify chain button click
    wrapper.querySelector('#btn-verify-gobd').addEventListener('click', async () => {
      const banner = wrapper.querySelector('#gobd-banner');
      banner.style.display = 'block';
      banner.textContent = '🛡️ Analysiere kryptografische Kette...';
      banner.style.background = 'rgba(255,255,255,0.05)';
      banner.style.color = '#FFF';

      const isValid = await this._onVerifyChain?.();
      
      if (isValid) {
        banner.textContent = '🟢 GoBD-Kettenprüfung erfolgreich: Alle Hashing-Verbindungen sind intakt und revisionssicher!';
        banner.style.background = 'rgba(16, 185, 129, 0.1)';
        banner.style.color = 'var(--accent-teal)';
      } else {
        banner.textContent = '🔴 Warnung: Kettenbruch detektiert! Rechnungsdaten wurden manipuliert!';
        banner.style.background = 'rgba(239, 68, 68, 0.1)';
        banner.style.color = 'var(--accent-red)';
      }
    });

    // Create Draft Invoice Click
    wrapper.querySelector('#btn-new-invoice').addEventListener('click', () => {
      this._showCreateModal(activeCompany);
    });

    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  _showCreateModal(activeCompany) {
    const backdrop = ce('div', {
      className: 'modal-backdrop',
      'style.position': 'fixed',
      'style.top': '0',
      'style.left': '0',
      'style.width': '100vw',
      'style.height': '100vh',
      'style.background': 'rgba(0,0,0,0.6)',
      'style.zIndex': '1000',
      'style.display': 'flex',
      'style.alignItems': 'center',
      'style.justifyContent': 'center'
    });

    const modal = ce('div', {
      className: 'panel',
      'style.width': '500px',
      'style.maxWidth': '90%',
      'style.zIndex': '1001',
      'style.background': '#161F30',
      'style.padding': 'var(--spacing-lg)',
      'style.borderRadius': 'var(--border-radius)'
    }, [
      ce('h2', { className: 'panel__title', textContent: 'Rechnungsentwurf anlegen' })
    ]);

    const form = ce('form', { className: 'form', 'style.marginTop': 'var(--spacing-md)' });
    
    form.append(
      this._buildField('Kunde Name', ce('input', {
        type: 'text',
        name: 'client_name',
        className: 'form__control',
        required: 'true',
        placeholder: 'Musterkunde GmbH'
      })),
      this._buildField('Kunde E-Mail', ce('input', {
        type: 'email',
        name: 'client_email',
        className: 'form__control',
        required: 'true',
        placeholder: 'kunde@example.com'
      })),
      this._buildField('Leistungsposition 1 (Titel)', ce('input', {
        type: 'text',
        name: 'item_title',
        className: 'form__control',
        required: 'true',
        placeholder: 'Trockenbauarbeiten OG'
      })),
      ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr 1fr', 'style.gap': 'var(--spacing-sm)' }, [
        this._buildField('Menge', ce('input', {
          type: 'number',
          name: 'item_qty',
          className: 'form__control',
          required: 'true',
          value: '10'
        })),
        this._buildField('Preis (€ / Einheit)', ce('input', {
          type: 'number',
          name: 'item_price',
          className: 'form__control',
          required: 'true',
          value: '45'
        })),
        this._buildField('Einheit', ce('input', {
          type: 'text',
          name: 'item_unit',
          className: 'form__control',
          required: 'true',
          value: 'std'
        }))
      ]),
      ce('div', { 
        className: 'form__actions', 
        'style.display': 'flex', 
        'style.gap': 'var(--spacing-sm)',
        'style.marginTop': 'var(--spacing-lg)'
      }, [
        ce('button', { className: 'btn btn--primary', type: 'submit', textContent: '💾 Entwurf sichern' }),
        ce('button', { 
          className: 'btn btn--secondary', 
          type: 'button', 
          textContent: 'Abbrechen' 
        }, [], [
          modal.addEventListener('click', (e) => {
            if (e.target.textContent === 'Abbrechen') {
              backdrop.remove();
            }
          })
        ])
      ])
    );

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const draft = {
        company_id: activeCompany.id,
        client_name: formData.get('client_name'),
        client_email: formData.get('client_email'),
        items: [
          {
            title: formData.get('item_title'),
            quantity: Number(formData.get('item_qty')),
            price: Number(formData.get('item_price')),
            unit: formData.get('item_unit')
          }
        ]
      };

      this._onNewDraft?.(draft);
      backdrop.remove();
    });

    modal.append(form);
    backdrop.append(modal);
    document.body.appendChild(backdrop);
  }

  _buildField(label, input) {
    return ce('div', { className: 'form__group', 'style.marginBottom': 'var(--spacing-md)' }, [
      ce('label', { className: 'form__label', textContent: label }),
      input
    ]);
  }

  onNewDraft(fn) { this._onNewDraft = fn; }
  onCancel(fn) { this._onCancel = fn; }
  onVerifyChain(fn) { this._onVerifyChain = fn; }
  onDatevExport(fn) { this._onDatevExport = fn; }
}
