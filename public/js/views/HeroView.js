/**
 * HeroView.js — Renders the page hero section.
 * No model imports. Pure rendering from static config.
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

/**
 * Meta chip definitions.
 * SVG icons are inline — kept here as static view config, not model data.
 */
const META_CHIPS = [
  {
    svg:   '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    label: 'Echtzeit-Monitoring',
  },
  {
    svg:   '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    label: 'NEXUS-Compliance',
  },
  {
    svg:   '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    label: '8 Systemmodule',
  },
];

export class HeroView extends BaseView {
  render() {
    const badge = ce('div', { className: 'hero__badge' }, [
      ce('span', { className: 'hero__badge-dot' }),
      'System · Online',
    ]);

    const title = ce('h1', {
      className: 'hero__title',
      innerHTML:  'NEXUS-OMS<br>Architektur',
    });

    const subtitle = ce('p', {
      className:   'hero__subtitle',
      textContent: 'Vollautomatisiertes Order-Management-System — von der E-Mail-Erfassung bis zur lückenlosen Ablaufkontrolle, Telemetrie und Berichtserstellung.',
    });

    const chips = META_CHIPS.map(({ svg, label }) => {
      const chip = ce('span', { className: 'hero__meta-chip' });
      chip.innerHTML = `${svg} ${label}`;
      return chip;
    });

    const meta = ce('div', { className: 'hero__meta' }, chips);

    const hero = ce('header', { className: 'hero fade-up' }, [badge, title, subtitle, meta]);

    this.container.append(hero);
    this.el = hero;
    return hero;
  }
}
