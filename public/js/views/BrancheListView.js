/**
 * BrancheListView.js — Shows all Branchen as cards.
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

export class BrancheListView extends BaseView {
  constructor(container) {
    super(container);
    this._onNew    = null;
    this._onSelect = null;
  }

  /**
   * @param {import('../models/BrancheModel.js').Branche[]} branchen
   * @param {import('../models/OrderModel.js').Order[]} orders
   */
  render(branchen, orders = []) {
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: '🏷️ Branchen' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'Zentrale Verwaltung der Leistungsbereiche' }),
      ]),
      ce('div', { className: 'page-header__actions' }, [
        ce('button', { className: 'btn btn--primary', textContent: '＋ Neue Branche', onclick: () => this._onNew?.() })
      ])
    ]);

    const grid = ce('div', { className: 'dashboard-grid', style: 'grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); margin-top: 1rem;' });

    if (branchen.length === 0) {
      grid.innerHTML = '<div style="color:var(--text-dim)">Keine Branchen vorhanden.</div>';
    } else {
      branchen.forEach(b => {
        const bOrders = orders.filter(o => o.branche_id === b.id);
        const open = bOrders.filter(o => ['new', 'dispatched'].includes(o.status)).length;
        
        const card = ce('div', { className: 'dashboard-card', style: `cursor:pointer; border-top: 3px solid ${b.color || 'var(--accent-cyan)'}` });
        card.innerHTML = `
          <div class="dashboard-card__header">
            <span class="dashboard-card__icon">${b.icon}</span>
          </div>
          <div class="dashboard-card__title">${this._esc(b.name)}</div>
          <div class="dashboard-card__desc" style="margin-bottom:1rem; flex:1;">${this._esc(b.description)}</div>
          
          <div style="display:flex; gap:1rem; border-top:1px solid var(--border); padding-top:1rem; margin-top:auto;">
            <div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text-primary)">${bOrders.length}</div>
              <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">Aufträge gesamt</div>
            </div>
            <div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--accent-amber)">${open}</div>
              <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">Offen</div>
            </div>
          </div>
        `;
        card.addEventListener('click', () => this._onSelect?.(b.id));
        grid.append(card);
      });
    }

    const wrapper = ce('div', {});
    wrapper.append(header, grid);
    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  onNew(fn)    { this._onNew = fn; }
  onSelect(fn) { this._onSelect = fn; }
}
