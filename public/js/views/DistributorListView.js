/**
 * DistributorListView.js — Table of all distributors with CRUD actions.
 * Emits callbacks: onNew(), onEdit(id), onDelete(id).
 */
import { BaseView } from './BaseView.js';
import { ce, empty } from '../utils/DOMHelper.js';

const STATUS_LABEL = { true: 'Aktiv', false: 'Inaktiv' };

export class DistributorListView extends BaseView {
  constructor(container) {
    super(container);
    this._onNew    = null;
    this._onEdit   = null;
    this._onDelete = null;
  }

  /**
   * @param {import('../models/DistributorModel.js').Distributor[]} distributors
   */
  render(distributors) {
    const wrapper = ce('div', {});

    // Page header
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: 'Distributoren' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'MODULE::DISTRIBUTOR_LAYER' }),
      ]),
      ce('div', { className: 'page-header__actions' }, [
        this._buildBtn('＋ Neu anlegen', 'btn btn--primary', () => this._onNew?.()),
      ]),
    ]);

    // Table
    const tableWrap = ce('div', { className: 'data-table-wrapper' });
    const table = ce('table', { className: 'data-table', role: 'table' });

    const thead = ce('thead', { className: 'data-table__head' });
    thead.innerHTML = `<tr>
      <th class="data-table__th">Name</th>
      <th class="data-table__th">E-Mail</th>
      <th class="data-table__th">Telefon</th>
      <th class="data-table__th">Region</th>
      <th class="data-table__th">Status</th>
      <th class="data-table__th">Aktionen</th>
    </tr>`;

    const tbody = ce('tbody', {});

    if (distributors.length === 0) {
      const empty = ce('tr', {});
      empty.innerHTML = `<td colspan="6" class="data-table__td">
        <div class="data-table__empty">
          <div class="data-table__empty-icon">🏭</div>
          <div class="data-table__empty-text">Noch keine Distributoren angelegt.<br>Klicken Sie auf „＋ Neu anlegen".</div>
        </div>
      </td>`;
      tbody.append(empty);
    } else {
      distributors.forEach(d => tbody.append(this._buildRow(d)));
    }

    table.append(thead, tbody);
    tableWrap.append(table);
    wrapper.append(header, tableWrap);

    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  /** @param {import('../models/DistributorModel.js').Distributor} d */
  _buildRow(d) {
    const statusClass = d.active ? 'badge--active' : 'badge--inactive';
    const row = ce('tr', { className: 'data-table__row' });

    row.innerHTML = `
      <td class="data-table__td data-table__td--primary">${this._esc(d.name)}</td>
      <td class="data-table__td data-table__td--mono">${this._esc(d.email)}</td>
      <td class="data-table__td">${this._esc(d.phone)}</td>
      <td class="data-table__td">${this._esc(d.region) || '<span style="opacity:.4">—</span>'}</td>
      <td class="data-table__td"><span class="badge ${statusClass}">${STATUS_LABEL[d.active]}</span></td>
      <td class="data-table__td">
        <div class="data-table__td--actions">
          <button class="btn btn--secondary btn--sm" data-action="edit"   data-id="${d.id}">✏️ Bearbeiten</button>
          <button class="btn btn--danger    btn--sm" data-action="delete" data-id="${d.id}">🗑️ Löschen</button>
        </div>
      </td>
    `;

    // Event delegation on the row
    row.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (btn.dataset.action === 'edit')   this._onEdit?.(id);
      if (btn.dataset.action === 'delete') this._onDelete?.(id);
    });

    return row;
  }

  _buildBtn(label, cls, fn) {
    const btn = ce('button', { className: cls, type: 'button', textContent: label });
    btn.addEventListener('click', fn);
    return btn;
  }

  /** Escape HTML to prevent XSS from stored data */
  _esc(str = '') {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  onNew(fn)    { this._onNew    = fn; }
  onEdit(fn)   { this._onEdit   = fn; }
  onDelete(fn) { this._onDelete = fn; }
}
