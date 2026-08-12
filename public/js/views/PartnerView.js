/**
 * PartnerView.js — Partner network management UI.
 * Handles listing, switching capacities (active/busy/inactive), and editing partners.
 */
import { BaseView } from './BaseView.js';
import { ce } from '../utils/DOMHelper.js';

const STATUS_LABELS = {
  active: '🟢 Aktiv (Bereit)',
  inactive: '🔴 Inaktiv',
  busy: '🟡 Ausgelastet (Beschäftigt)'
};

const COMMISSION_LABELS = {
  percentage: '% Prozentsatz',
  flat: '💶 Fixpreis (€)'
};

export class PartnerView extends BaseView {
  constructor(container) {
    super(container);
    this._onSave = null;
    this._onDelete = null;
    this._onNavigateRadar = null;
  }

  /**
   * @param {import('../models/PartnerModel.js').Partner[]} partners
   */
  render(partners) {
    const wrapper = ce('div', {});

    const radarBtn = ce('button', { 
      className: 'btn btn--primary', 
      type: 'button', 
      textContent: '📡 Kapazitäten-Radar (Karte)',
      'style.background': 'var(--accent-teal)'
    });
    radarBtn.addEventListener('click', () => {
      this._onNavigateRadar?.();
    });

    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: 'Subunternehmer-Netzwerk' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'PARTNER::NETWORK_MANAGEMENT' }),
      ]),
      ce('div', { className: 'page-header__actions', 'style.display': 'flex', 'style.gap': 'var(--spacing-sm)' }, [
        radarBtn
      ])
    ]);

    const grid = ce('div', { 
      className: 'branche-detail__grid', 
      'style.display': 'grid', 
      'style.gridTemplateColumns': '1.2fr 0.8fr', 
      'style.gap': 'var(--spacing-lg)' 
    });

    // ── Spalte 1: Liste ──────────────────────────────────────────
    const leftPanel = ce('div', { className: 'panel' }, [
      ce('h2', { className: 'panel__title', textContent: 'Kooperationspartner' })
    ]);

    const tableWrap = ce('div', { className: 'data-table-wrapper', 'style.marginTop': 'var(--spacing-md)' });
    const table = ce('table', { className: 'data-table' });
    
    const thead = ce('thead', { className: 'data-table__head' });
    thead.innerHTML = `<tr>
      <th class="data-table__th">Name / Kontakt</th>
      <th class="data-table__th">Standort</th>
      <th class="data-table__th">Status</th>
      <th class="data-table__th">Provision</th>
      <th class="data-table__th">Aktionen</th>
    </tr>`;

    const tbody = ce('tbody', {});

    if (partners.length === 0) {
      const emptyRow = ce('tr', {});
      emptyRow.innerHTML = `<td colspan="5" class="data-table__td" style="text-align:center; opacity:0.5; padding:var(--spacing-lg);">
        Keine Partner im Netzwerk registriert.
      </td>`;
      tbody.append(emptyRow);
    } else {
      partners.forEach(partner => {
        const row = ce('tr', { className: 'data-table__row' });
        
        let statusBadgeClass = 'badge--active';
        if (partner.status === 'inactive') statusBadgeClass = 'badge--inactive';
        if (partner.status === 'busy') statusBadgeClass = 'badge--warning'; // fallback or similar

        row.innerHTML = `
          <td class="data-table__td data-table__td--primary">
            <strong>${this._esc(partner.name)}</strong>
            <div style="font-size:12px; opacity:0.6; margin-top:2px;">${this._esc(partner.email)} · ${this._esc(partner.phone)}</div>
          </td>
          <td class="data-table__td">
            ${this._esc(partner.address_city)}
            <div style="font-size:11px; opacity:0.4; margin-top:2px;">Lat: ${partner.lat.toFixed(4)}, Lng: ${partner.lng.toFixed(4)}</div>
          </td>
          <td class="data-table__td">
            <span class="badge ${statusBadgeClass}">${STATUS_LABELS[partner.status]}</span>
          </td>
          <td class="data-table__td" style="font-family:var(--font-mono); font-weight:600;">
            ${partner.commission_rate}${partner.commission_type === 'percentage' ? '%' : '€'}
          </td>
          <td class="data-table__td">
            <div class="data-table__td--actions">
              <button class="btn btn--secondary btn--sm" data-action="edit" data-id="${partner.id}">✏️ Bearbeiten</button>
            </div>
          </td>
        `;

        row.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-action="edit"]');
          if (!btn) return;
          this._fillForm(partner);
        });

        tbody.append(row);
      });
    }

    table.append(thead, tbody);
    tableWrap.append(table);
    leftPanel.append(tableWrap);

    // ── Spalte 2: Editor ──────────────────────────────────────────
    const rightPanel = ce('div', { className: 'panel' }, [
      ce('h2', { className: 'panel__title', id: 'form-title', textContent: 'Neuen Partner anlegen' })
    ]);

    const form = ce('form', { className: 'form', 'style.marginTop': 'var(--spacing-md)' });
    const idInput = ce('input', { type: 'hidden', name: 'id', value: '' });

    const nameGroup = this._buildField('Partner Name / Firma', ce('input', {
      type: 'text',
      name: 'name',
      className: 'form__control',
      required: 'true',
      placeholder: 'z.B. Sanitärtechnik Graz-Ost'
    }));

    const contactRow = ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr', 'style.gap': 'var(--spacing-sm)' }, [
      this._buildField('E-Mail', ce('input', {
        type: 'email',
        name: 'email',
        className: 'form__control',
        required: 'true',
        placeholder: 'partner@example.com'
      })),
      this._buildField('Telefon', ce('input', {
        type: 'text',
        name: 'phone',
        className: 'form__control',
        required: 'true',
        placeholder: '+43 664 ...'
      }))
    ]);

    const statusGroup = this._buildField('Kapazitäts-Status', ce('select', {
      name: 'status',
      className: 'form__control'
    }, [
      ce('option', { value: 'active', textContent: STATUS_LABELS.active }),
      ce('option', { value: 'busy', textContent: STATUS_LABELS.busy }),
      ce('option', { value: 'inactive', textContent: STATUS_LABELS.inactive })
    ]));

    const addressGroup = this._buildField('Straße & Hausnummer', ce('input', {
      type: 'text',
      name: 'address_street',
      className: 'form__control',
      required: 'true',
      placeholder: 'Wiener Straße 124'
    }));

    const geoRow = ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 2fr 1fr', 'style.gap': 'var(--spacing-sm)' }, [
      this._buildField('PLZ', ce('input', {
        type: 'text',
        name: 'address_zip',
        className: 'form__control',
        required: 'true',
        placeholder: '8020'
      })),
      this._buildField('Stadt', ce('input', {
        type: 'text',
        name: 'address_city',
        className: 'form__control',
        required: 'true',
        placeholder: 'Graz'
      })),
      this._buildField('Land', ce('select', {
        name: 'address_country',
        className: 'form__control'
      }, [
        ce('option', { value: 'AT', textContent: 'AT' }),
        ce('option', { value: 'DE', textContent: 'DE' })
      ]))
    ]);

    const coordsRow = ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr', 'style.gap': 'var(--spacing-sm)' }, [
      this._buildField('Breitengrad (Latitude)', ce('input', {
        type: 'number',
        step: 'any',
        name: 'lat',
        className: 'form__control',
        required: 'true',
        value: '47.0707'
      })),
      this._buildField('Längengrad (Longitude)', ce('input', {
        type: 'number',
        step: 'any',
        name: 'lng',
        className: 'form__control',
        required: 'true',
        value: '15.4395'
      }))
    ]);

    const commissionRow = ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr', 'style.gap': 'var(--spacing-sm)' }, [
      this._buildField('Provisionstyp', ce('select', {
        name: 'commission_type',
        className: 'form__control'
      }, [
        ce('option', { value: 'percentage', textContent: COMMISSION_LABELS.percentage }),
        ce('option', { value: 'flat', textContent: COMMISSION_LABELS.flat })
      ])),
      this._buildField('Satz / Betrag', ce('input', {
        type: 'number',
        step: '0.01',
        name: 'commission_rate',
        className: 'form__control',
        required: 'true',
        value: '10'
      }))
    ]);

    const btnRow = ce('div', { 
      className: 'form__actions', 
      'style.display': 'flex', 
      'style.justifyContent': 'space-between',
      'style.marginTop': 'var(--spacing-lg)'
    }, [
      ce('div', { 'style.display': 'flex', 'style.gap': 'var(--spacing-sm)' }, [
        ce('button', { className: 'btn btn--primary', type: 'submit', textContent: '💾 Speichern' }),
        ce('button', { 
          className: 'btn btn--secondary', 
          type: 'button', 
          textContent: '❌ Abbrechen' 
        }, [], [
          form.addEventListener('click', (e) => {
            if (e.target.textContent.includes('Abbrechen')) {
              this._resetForm(form);
            }
          })
        ])
      ]),
      ce('button', { 
        className: 'btn btn--danger', 
        type: 'button', 
        textContent: '🗑️ Löschen',
        id: 'btn-delete-partner',
        'style.display': 'none'
      })
    ]);

    form.append(idInput, nameGroup, contactRow, statusGroup, addressGroup, geoRow, coordsRow, commissionRow, btnRow);

    // Form Submit Event
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        status: formData.get('status'),
        address_street: formData.get('address_street'),
        address_zip: formData.get('address_zip'),
        address_city: formData.get('address_city'),
        address_country: formData.get('address_country'),
        lat: Number(formData.get('lat')),
        lng: Number(formData.get('lng')),
        commission_type: formData.get('commission_type'),
        commission_rate: Number(formData.get('commission_rate'))
      };
      const id = formData.get('id');
      if (id) data.id = Number(id);

      this._onSave?.(data);
      this._resetForm(form);
    });

    // Delete partner event
    form.addEventListener('click', (e) => {
      if (e.target.id === 'btn-delete-partner') {
        const id = Number(form.querySelector('[name="id"]').value);
        if (confirm('Möchten Sie diesen Partner wirklich löschen?')) {
          this._onDelete?.(id);
          this._resetForm(form);
        }
      }
    });

    rightPanel.append(form);
    grid.append(leftPanel, rightPanel);
    wrapper.append(header, grid);

    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  _buildField(label, input) {
    return ce('div', { className: 'form__group', 'style.marginBottom': 'var(--spacing-md)' }, [
      ce('label', { className: 'form__label', textContent: label }),
      input
    ]);
  }

  _fillForm(partner) {
    const form = this.el.querySelector('form');
    if (!form) return;

    form.querySelector('[name="id"]').value = partner.id;
    form.querySelector('[name="name"]').value = partner.name;
    form.querySelector('[name="email"]').value = partner.email;
    form.querySelector('[name="phone"]').value = partner.phone;
    form.querySelector('[name="status"]').value = partner.status;
    form.querySelector('[name="address_street"]').value = partner.address_street;
    form.querySelector('[name="address_zip"]').value = partner.address_zip;
    form.querySelector('[name="address_city"]').value = partner.address_city;
    form.querySelector('[name="address_country"]').value = partner.address_country;
    form.querySelector('[name="lat"]').value = partner.lat;
    form.querySelector('[name="lng"]').value = partner.lng;
    form.querySelector('[name="commission_type"]').value = partner.commission_type;
    form.querySelector('[name="commission_rate"]').value = partner.commission_rate;

    this.el.querySelector('#form-title').textContent = 'Partner bearbeiten';
    this.el.querySelector('#btn-delete-partner').style.display = 'block';
  }

  _resetForm(form) {
    form.reset();
    form.querySelector('[name="id"]').value = '';
    this.el.querySelector('#form-title').textContent = 'Neuen Partner anlegen';
    this.el.querySelector('#btn-delete-partner').style.display = 'none';
  }

  onSave(fn) { this._onSave = fn; }
  onDelete(fn) { this._onDelete = fn; }
  onNavigateRadar(fn) { this._onNavigateRadar = fn; }
}
