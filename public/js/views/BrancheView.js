/**
 * BrancheView.js — Branchenübersicht mit Tab-System.
 * Aktuell: Entrümpelung & Antiquitäten.
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

// ── Branchendaten ─────────────────────────────────────────────
const BRANCHEN = [
  {
    id:    'entruempelung',
    icon:  '🏚️',
    label: 'Entrümpelung',
    color: 'var(--accent-cyan)',
    desc:  'Haushaltsauflösungen, Wohnungsräumungen, Kellerentrümpelungen, Messie-Wohnungen und Dachbodenräumungen.',
    kpis: [
      { icon: '📦', label: 'Ø Auftragsvolumen',   value: '3–8 Std.' },
      { icon: '🚛', label: 'Fahrzeuge',            value: 'LKW / Transporter' },
      { icon: '♻️', label: 'Entsorgung',           value: 'Kommunal + Sperrmüll' },
      { icon: '👷', label: 'Team-Größe',           value: '2–6 Personen' },
    ],
    leistungen: [
      { icon: '🏠', name: 'Hausräumung',          desc: 'Vollständige Räumung inkl. Entsorgung' },
      { icon: '🛋️', name: 'Wohnungsräumung',      desc: 'Wohnungen aller Größen, auch vermietet' },
      { icon: '🗝️', name: 'Verlassenschaft',      desc: 'Nachlass-Räumung für Notare & Behörden' },
      { icon: '🧹', name: 'Messie-Wohnung',        desc: 'Spezialreinigung und Räumung' },
      { icon: '📦', name: 'Kellerentrümpelung',    desc: 'Keller, Abstellräume, Garagen' },
      { icon: '🏗️', name: 'Dachbodenräumung',     desc: 'Dachböden und Speicher' },
      { icon: '🏪', name: 'Geschäftsauflösung',   desc: 'Büros, Läden, Lagerhallen' },
      { icon: '💰', name: 'Räumung mit Wertausgleich', desc: 'Verwertbare Gegenstände werden angerechnet' },
    ],
    prozess: [
      { step: '1', title: 'Anfrage & Besichtigung', desc: 'Kostenloser Vor-Ort-Termin zur Einschätzung des Aufwands' },
      { step: '2', title: 'Angebot & Auftrag',      desc: 'Transparentes Fixpreisangebot, keine versteckten Kosten' },
      { step: '3', title: 'Räumung & Entsorgung',  desc: 'Fachgerechte Demontage und umweltgerechte Entsorgung' },
      { step: '4', title: 'Übergabe & Protokoll',  desc: 'Besenreine Übergabe mit Übergabeprotokoll' },
    ],
    color_accent: '#38bdf8',
    badge_color:  'rgba(56,189,248,0.15)',
  },
  {
    id:    'antiquitaeten',
    icon:  '🏺',
    label: 'Antiquitäten',
    color: 'var(--accent-amber)',
    desc:  'Ankauf, Bewertung und Vermittlung von Antiquitäten, Kunst, Schmuck und Sammlerstücken.',
    kpis: [
      { icon: '🎨', label: 'Kategorien',          value: '20+ Sparten' },
      { icon: '📋', label: 'Bewertung',            value: 'Vor Ort & Online' },
      { icon: '🤝', label: 'Ankauf',              value: 'Sofortige Barzahlung' },
      { icon: '🌍', label: 'Märkte',              value: 'AT · DE · EU' },
    ],
    leistungen: [
      { icon: '🪑', name: 'Möbel & Einrichtung',  desc: 'Antike Möbel aller Epochen und Stile' },
      { icon: '🖼️', name: 'Gemälde & Grafiken',  desc: 'Ölgemälde, Aquarelle, Druckgrafiken' },
      { icon: '💍', name: 'Schmuck & Uhren',      desc: 'Gold, Silber, Edelsteine, Taschenuhren' },
      { icon: '🏺', name: 'Porzellan & Keramik',  desc: 'Meissen, KPM, Augarten und weitere' },
      { icon: '📚', name: 'Bücher & Dokumente',   desc: 'Erstausgaben, Handschriften, Karten' },
      { icon: '🥈', name: 'Silber & Tafelsilber', desc: 'Besteck, Serviersets, Leuchter' },
      { icon: '🧸', name: 'Spielzeug & Puppen',   desc: 'Historisches Spielzeug, Blechspielzeug' },
      { icon: '🎻', name: 'Instrumente',          desc: 'Historische Musikinstrumente' },
    ],
    prozess: [
      { step: '1', title: 'Kontakt & Fotos',    desc: 'Erstbewertung anhand von Fotos per E-Mail oder WhatsApp' },
      { step: '2', title: 'Vor-Ort-Besichtigung', desc: 'Kostenlose Begutachtung durch unseren Experten' },
      { step: '3', title: 'Angebot & Ankauf',   desc: 'Faires Angebot auf Basis aktueller Marktpreise' },
      { step: '4', title: 'Abholung & Zahlung', desc: 'Wir holen ab und zahlen sofort in bar oder per Überweisung' },
    ],
    color_accent: '#fbbf24',
    badge_color:  'rgba(251,191,36,0.15)',
  },
];

export class BrancheView extends BaseView {
  constructor(container) {
    super(container);
    this._activeTab = 'entruempelung';
  }

  render() {
    const wrapper = ce('div', { className: 'branche-page' });

    // ── Seitentitel ─────────────────────────────────────────
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: '🏷️ Branchen' }),
        ce('div', { className: 'page-header__subtitle', textContent: `${BRANCHEN.length} Branchen konfiguriert · MODULE::BRANCHE_MANAGER` }),
      ]),
    ]);
    wrapper.append(header);

    // ── Tab-Leiste ──────────────────────────────────────────
    const tabBar  = ce('div', { className: 'branche-tabs' });
    const tabPanes = ce('div', { className: 'branche-tab-panes' });

    BRANCHEN.forEach(b => {
      // Tab-Button
      const tab = ce('button', {
        type:      'button',
        className: 'branche-tab' + (b.id === this._activeTab ? ' branche-tab--active' : ''),
        textContent: `${b.icon} ${b.label}`,
        id: `tab-${b.id}`,
      });
      tab.dataset.tab = b.id;
      tab.style.setProperty('--tab-color', b.color);
      tabBar.append(tab);

      // Pane
      const pane = ce('div', {
        className: 'branche-pane' + (b.id === this._activeTab ? ' branche-pane--active' : ''),
        id: `pane-${b.id}`,
      });
      pane.append(this._buildPane(b));
      tabPanes.append(pane);
    });

    // Tab-Klick
    tabBar.addEventListener('click', e => {
      const btn = e.target.closest('.branche-tab');
      if (!btn) return;
      const id = btn.dataset.tab;
      tabBar.querySelectorAll('.branche-tab').forEach(t => t.classList.remove('branche-tab--active'));
      tabPanes.querySelectorAll('.branche-pane').forEach(p => p.classList.remove('branche-pane--active'));
      btn.classList.add('branche-tab--active');
      tabPanes.querySelector(`#pane-${id}`)?.classList.add('branche-pane--active');
    });

    wrapper.append(tabBar, tabPanes);
    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  _buildPane(b) {
    const frag = document.createDocumentFragment();

    // ── Hero-Banner ──────────────────────────────────────────
    const hero = ce('div', { className: 'branche-hero' });
    hero.style.setProperty('--b-accent', b.color_accent);
    hero.append(
      ce('div', { className: 'branche-hero__icon', textContent: b.icon }),
      ce('div', {}, [
        ce('h2', { className: 'branche-hero__title', textContent: b.label }),
        ce('p',  { className: 'branche-hero__desc',  textContent: b.desc  }),
      ]),
    );
    frag.append(hero);

    // ── KPI-Leiste ───────────────────────────────────────────
    const kpiRow = ce('div', { className: 'branche-kpis' });
    b.kpis.forEach(k => {
      kpiRow.append(ce('div', { className: 'branche-kpi' }, [
        ce('div', { className: 'branche-kpi__icon', textContent: k.icon }),
        ce('div', { className: 'branche-kpi__value', textContent: k.value }),
        ce('div', { className: 'branche-kpi__label', textContent: k.label }),
      ]));
    });
    frag.append(kpiRow);

    // ── Leistungen ───────────────────────────────────────────
    const secTitle1 = ce('div', { className: 'branche-section-title', textContent: '📋 Leistungsspektrum' });
    const grid = ce('div', { className: 'branche-grid' });
    b.leistungen.forEach(l => {
      const card = ce('div', { className: 'branche-card' });
      card.style.setProperty('--b-badge', b.badge_color);
      card.style.setProperty('--b-accent', b.color_accent);
      card.append(
        ce('div', { className: 'branche-card__icon', textContent: l.icon }),
        ce('div', { className: 'branche-card__name',  textContent: l.name }),
        ce('div', { className: 'branche-card__desc',  textContent: l.desc }),
      );
      grid.append(card);
    });
    frag.append(secTitle1, grid);

    // ── Prozess ──────────────────────────────────────────────
    const secTitle2 = ce('div', { className: 'branche-section-title', textContent: '🔄 Ablauf & Prozess' });
    const prozess = ce('div', { className: 'branche-prozess' });
    b.prozess.forEach((p, i) => {
      const step = ce('div', { className: 'branche-prozess__step' });
      step.style.setProperty('--b-accent', b.color_accent);
      step.append(
        ce('div', { className: 'branche-prozess__num', textContent: p.step }),
        ce('div', {}, [
          ce('div', { className: 'branche-prozess__title', textContent: p.title }),
          ce('div', { className: 'branche-prozess__desc',  textContent: p.desc  }),
        ]),
      );
      if (i < b.prozess.length - 1) {
        step.append(ce('div', { className: 'branche-prozess__arrow', textContent: '→' }));
      }
      prozess.append(step);
    });
    frag.append(secTitle2, prozess);

    return frag;
  }
}
