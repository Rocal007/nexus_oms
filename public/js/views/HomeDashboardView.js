/**
 * HomeDashboardView.js — Simple home screen with functional navigation cards.
 * Receives live counts; renders clickable action cards.
 * No model imports — data passed via render().
 */
import { BaseView }  from './BaseView.js';
import { ce, setCssVar } from '../utils/DOMHelper.js';

/**
 * Static card definitions.
 * `route`  — where the card navigates to
 * `countKey` — key in the `counts` object to show as badge (null = no badge)
 * @type {Array<{icon:string, title:string, desc:string, route:string,
 *               color:string, countKey:string|null, primaryAction?:boolean}>}
 */
const CARDS = [
  {
    icon:     '🏷️',
    title:    'Branchen',
    desc:     'Übersicht und Verwaltung der Leistungsbereiche',
    route:    '/branche',
    color:    'var(--accent-violet)',
    countKey: 'branchen',
    primaryAction: true,
  },
  {
    icon:          '📞',
    title:         'Auftrag erfassen',
    desc:          'Telefonanruf oder E-Mail-Anfrage manuell eintragen',
    route:         '/orders/new',
    color:         'var(--accent-cyan)',
    countKey:      null,
  },
  {
    icon:     '📋',
    title:    'Aufträge',
    desc:     'Alle Aufträge einsehen, dispatchen und verwalten',
    route:    '/orders',
    color:    'var(--accent-teal)',
    countKey: 'orders',
  },
  {
    icon:     '🏭',
    title:    'Distributoren',
    desc:     'Auftragnehmer anlegen, bearbeiten und aktivieren',
    route:    '/distributors',
    color:    'var(--accent-violet)',
    countKey: 'distributors',
  },
  {
    icon:     '⚙️',
    title:    'Einstellungen',
    desc:     'Eingangs-E-Mail und Admin-Konfiguration',
    route:    '/settings',
    color:    'var(--accent-amber)',
    countKey: null,
  },
];

export class HomeDashboardView extends BaseView {
  constructor(container) {
    super(container);
    this._onNavigate = null;
  }

  /**
   * @param {{ orders: number, distributors: number }} counts
   */
  render(counts = {}) {
    const wrapper = ce('div', { className: 'home' });

    // ── Header ───────────────────────────────────────────────
    const header = ce('div', { className: 'home__header' }, [
      ce('div', { className: 'home__logo', textContent: 'NEXUS-OMS' }),
      ce('div', { className: 'home__tagline', textContent: 'Order Management System' }),
    ]);

    // ── Card grid ────────────────────────────────────────────
    const grid = ce('div', { className: 'home__grid' });

    CARDS.forEach(card => {
      const el = ce('button', {
        className: `home-card${card.primaryAction ? ' home-card--primary' : ''}`,
        type:      'button',
      });

      // Color accent via CSS var
      setCssVar(el, '--card-color', card.color);

      // Count badge
      const count = card.countKey ? counts[card.countKey] : null;
      const badge = count != null
        ? ce('span', { className: 'home-card__badge', textContent: String(count) })
        : null;

      el.append(
        ce('span', { className: 'home-card__icon', textContent: card.icon }),
        ce('span', { className: 'home-card__title', textContent: card.title }),
        ce('span', { className: 'home-card__desc',  textContent: card.desc  }),
        ...(badge ? [badge] : []),
      );

      el.addEventListener('click', () => this._onNavigate?.(card.route));
      grid.append(el);
    });

    wrapper.append(header, grid);
    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  /** @param {(route: string) => void} fn */
  onNavigate(fn) { this._onNavigate = fn; }
}
