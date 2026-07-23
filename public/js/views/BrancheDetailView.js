/**
 * BrancheDetailView.js — Detailed view for a specific Branche.
 * Shows distributor statistics and provides actions.
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

export class BrancheDetailView extends BaseView {
  constructor(container) {
    super(container);
    this._onEdit   = null;
    this._onDelete = null;
    this._onOrders = null;
    this._onNewOrder = null;
  }

  /**
   * @param {import('../models/BrancheModel.js').Branche} branche
   * @param {import('../models/DistributorModel.js').Distributor[]} distributors
   * @param {import('../models/OrderModel.js').Order[]} orders
   */
  render(branche, distributors, orders) {
    // Filter orders and distributors for this branche
    const bOrders = orders.filter(o => o.branche_id === branche.id);
    const bDistributors = distributors.filter(d => (d.branche_ids || []).includes(branche.id));

    const total = bOrders.length;
    const open = bOrders.filter(o => ['new', 'dispatched'].includes(o.status)).length;
    const completed = bOrders.filter(o => o.status === 'completed').length;
    const accepted = bOrders.filter(o => o.status === 'accepted').length;

    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('div', { className: 'page-header__back', textContent: '← Zurück zu Branchen', onclick: () => window.location.hash = '#/branche' }),
        ce('h1', { className: 'page-header__title', textContent: `${branche.icon} ${branche.name}` }),
        ce('div', { className: 'page-header__subtitle', textContent: branche.description }),
      ]),
      ce('div', { className: 'page-header__actions' }, [
        ce('button', { className: 'btn btn--secondary', textContent: '📋 Aufträge ansehen', onclick: () => this._onOrders?.() }),
        ce('button', { className: 'btn btn--primary', textContent: '✏️ Auftrag erfassen', onclick: () => this._onNewOrder?.() }),
        ce('button', { className: 'btn btn--secondary', textContent: '⚙️ Bearbeiten', onclick: () => this._onEdit?.() }),
      ])
    ]);

    // KPIs
    const kpis = ce('div', { className: 'dashboard-kpis', style: 'margin-bottom: 2rem;' });
    kpis.innerHTML = `
      <div class="dashboard-kpi">
        <div class="dashboard-kpi__value">${total}</div>
        <div class="dashboard-kpi__label">Aufträge gesamt</div>
      </div>
      <div class="dashboard-kpi">
        <div class="dashboard-kpi__value" style="color:var(--accent-amber)">${open}</div>
        <div class="dashboard-kpi__label">Offene Aufträge</div>
      </div>
      <div class="dashboard-kpi">
        <div class="dashboard-kpi__value" style="color:var(--accent-green)">${accepted + completed}</div>
        <div class="dashboard-kpi__label">Bearbeitet</div>
      </div>
      <div class="dashboard-kpi">
        <div class="dashboard-kpi__value">${bDistributors.length}</div>
        <div class="dashboard-kpi__label">Partnerfirmen</div>
      </div>
    `;

    // Distributor Table
    const tableWrap = ce('div', { className: 'data-table-wrapper' });
    const table = ce('table', { className: 'data-table' });
    
    table.innerHTML = `
      <thead>
        <tr>
          <th class="data-table__th">Partnerfirma (Distributor)</th>
          <th class="data-table__th">Region</th>
          <th class="data-table__th" style="text-align:right">Gesamt</th>
          <th class="data-table__th" style="text-align:right">Offen</th>
          <th class="data-table__th" style="text-align:right">Bearbeitet</th>
          <th class="data-table__th" style="text-align:right">Abgelehnt</th>
        </tr>
      </thead>
    `;
    
    const tbody = ce('tbody', {});
    
    if (bDistributors.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="data-table__td" style="text-align:center; padding: 2rem; color: var(--text-dim);">Noch keine Distributoren dieser Branche zugeordnet.</td></tr>`;
    } else {
      bDistributors.forEach(d => {
        const dOrders = bOrders.filter(o => o.distributor_id === String(d.id) || o.distributor_id === d.id);
        const dTotal = dOrders.length;
        const dOpen = dOrders.filter(o => ['new', 'dispatched'].includes(o.status)).length;
        const dProcessed = dOrders.filter(o => ['accepted', 'completed'].includes(o.status)).length;
        const dDeclined = dOrders.filter(o => o.status === 'declined').length;
        
        const row = ce('tr', { className: 'data-table__row' });
        row.innerHTML = `
          <td class="data-table__td data-table__td--primary">${this._esc(d.name)}</td>
          <td class="data-table__td">${this._esc(d.region || '—')}</td>
          <td class="data-table__td" style="text-align:right">${dTotal}</td>
          <td class="data-table__td" style="text-align:right; color:var(--accent-amber)">${dOpen}</td>
          <td class="data-table__td" style="text-align:right; color:var(--accent-green)">${dProcessed}</td>
          <td class="data-table__td" style="text-align:right; color:var(--accent-rose)">${dDeclined}</td>
        `;
        tbody.append(row);
      });
    }
    table.append(tbody);
    tableWrap.append(table);

    const wrapper = ce('div', {});
    wrapper.append(header, kpis, ce('h2', { style: 'font-size:1.1rem; margin-bottom:1rem;', textContent: 'Statistik der Partnerfirmen' }), tableWrap);
    
    // Add delete button at the bottom
    const bottomActions = ce('div', { style: 'margin-top: 3rem; text-align: right;' }, [
      ce('button', { className: 'btn btn--secondary', style: 'color: var(--accent-rose); border-color: var(--accent-rose);', textContent: 'Branche löschen', onclick: () => this._onDelete?.() })
    ]);
    wrapper.append(bottomActions);
    
    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  onEdit(fn)     { this._onEdit = fn; }
  onDelete(fn)   { this._onDelete = fn; }
  onOrders(fn)   { this._onOrders = fn; }
  onNewOrder(fn) { this._onNewOrder = fn; }
}
