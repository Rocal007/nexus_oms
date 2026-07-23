/**
 * OrderFormView.js — Admin form to record orders from any channel.
 * 7-step structured form:
 *   1. Quelle (Phone / WhatsApp / E-Mail / Sonstiges)
 *   2. Was (Auftragsart – Mehrfachauswahl als Chips)
 *   3. Ort (Ort + PLZ + Bundesland) + Land (AT/DE/IT/SI/HU/CZ/Sonstiges)
 *   4. Name (Anrede + Freitextfeld)
 *   5. Notiz & Anhänge (Textarea + File-Upload bei E-Mail)
 *   6. Termin & Priorität (Datum + Uhrzeit + 5-stufige Priorität)
 *   7. Distributor-Zuweisung (inkl. "An alle freigeben")
 *
 * Callbacks: onSave(data), onCancel().
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

const AUFTRAGSARTEN = [
  'Verlassenschaft',
  'Entrümpelung',
  'Messie',
  'Antiquitäten Ankauf',
  'Umzug',
  'Geschäftsauflösung',
  'Flohmarktsachen',
  'Sonstiges',
];

/** Unterkategorien für Antiquitäten Ankauf */
const ANTIQUITAETEN_KATEGORIEN = [
  'Ankauf',
  'Bücher',
  'Möbel',
  'Gemälde',
  'Militaria',
  'Silber',
  'Teppiche',
  'Schmuck',
  'Uhren',
  'Münzen',
  'Postkarten',
  'Design',
  'Sammlungen',
  'Porzellan',
  'Luster',
  'Klavier',
  'Sonstiges',
];

/** Unterkategorien für Entrümpelung */
const ENTRUEMPELUNG_KATEGORIEN = [
  'Wohnungsräumung',
  'Hausräumung',
  'Dachbodenräumung',
  'Keller Entrümpelung',
  'Räumung mit Wertausgleich',
  'Entrümpelung',
];

/** Unterkategorien für Verlassenschaft */
const VERLASSENSCHAFT_KATEGORIEN = [
  'Verlassenschaft mit Entrümpelung',
  'Verlassenschaft Wohnung',
  'Verlassenschaft Haus',
  'Verlassenschaft Ankauf',
];

/** Unterkategorien für Messie */
const MESSIE_KATEGORIEN = [
  'Messie Wohnung',
  'Messie Haus',
  'Messie Verlassenschaft',
  'Messie Wohnungsleiche',
  'Messie Sonstiges',
];

/** Unterkategorien für Umzug */
const UMZUG_KATEGORIEN = [
  'Umzug innerhalb des Ortes',
  'Umzug bis 25 km',
  'Umzug bis 50 km',
  'Umzug über 50 km',
  'Umzug in ein anderes Bundesland',
  'Umzug ins Ausland',
];

/** Unterkategorien für Geschäftsauflösung */
const GESCHAEFTSAUFLOESUNG_KATEGORIEN = [
  'Hotel- / Pensionsräumung',
  'Lager',
  'Gastronomie',
  'Verkaufsgeschäft',
  'Werkstatt',
  'Sonstiges',
];

const BUNDESLAENDER = [
  'Wien',
  'Niederösterreich',
  'Oberösterreich',
  'Steiermark',
  'Tirol',
  'Kärnten',
  'Salzburg',
  'Vorarlberg',
  'Burgenland',
];

const LAENDER = [
  { value: 'AT', label: '🇦🇹 Österreich' },
  { value: 'DE', label: '🇩🇪 Deutschland' },
  { value: 'IT', label: '🇮🇹 Italien' },
  { value: 'SI', label: '🇸🇮 Slowenien' },
  { value: 'HU', label: '🇭🇺 Ungarn' },
  { value: 'CZ', label: '🇨🇿 Tschechien' },
  { value: 'XX', label: '🌐 Sonstiges' },
];

/** 5-stufige Priorität */
const PRIORITIES = [
  { value: 'low',       label: '🔵 Niedrig',     prio: 'low'       },
  { value: 'normal',    label: '🟢 Normal',       prio: 'normal'    },
  { value: 'urgent',    label: '🟡 Dringend',     prio: 'urgent'    },
  { value: 'high',      label: '🟠 Sehr dringend', prio: 'high'     },
  { value: 'emergency', label: '🔴 Notfall',       prio: 'emergency' },
];

export class OrderFormView extends BaseView {
  /**
   * @param {HTMLElement} container
   * @param {import('../models/DistributorModel.js').Distributor[]} distributors
   * @param {import('../models/BrancheModel.js').Branche[]} branchen
   * @param {string|null} brancheId
   */
  constructor(container, distributors = [], branchen = [], brancheId = null) {
    super(container);
    this._distributors         = distributors;
    this._branchen             = branchen;
    this._brancheId            = brancheId;
    this._source               = 'phone';
    this._anrede               = 'herr';
    this._land                 = 'AT';
    this._selectedArten            = new Set(); // Mehrfachauswahl Auftragsart
    this._selectedAntiquitaeten    = new Set(); // Mehrfachauswahl Antiquitäten-Kategorien
    this._selectedEntruempelung    = new Set(); // Mehrfachauswahl Entrümpelung-Kategorien
    this._selectedVerlassenschaft  = new Set(); // Mehrfachauswahl Verlassenschaft-Kategorien
    this._selectedMessie           = new Set(); // Mehrfachauswahl Messie-Kategorien
    this._selectedUmzug            = new Set(); // Mehrfachauswahl Umzug-Kategorien
    this._selectedGeschaeft        = new Set(); // Mehrfachauswahl Geschäftsauflösung-Kategorien
    this._attachments              = [];         // { name, file }[]
    this._onSave               = null;
    this._onCancel             = null;
  }

  render() {
    // ── Page header ──────────────────────────────────────────
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: 'Auftrag erfassen' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'Neue Auftragsanfrage manuell eintragen' }),
      ]),
    ]);

    const form = ce('form', { className: 'form-card', novalidate: '' });
    form.style.maxWidth = '820px';

    // ══════════════════════════════════════════════════════════
    // 0. BRANCHE (NEU)
    // ══════════════════════════════════════════════════════════
    form.append(this._sectionTitle('0', '🏷️ Branche'));
    
    const brancheInput = ce('input', { type: 'hidden', name: 'branche_id', value: this._brancheId || '' });
    const brancheGrid = ce('div', { className: 'form-chip-grid' });
    const brancheChips = this._branchen.map(b => {
      const isSelected = this._brancheId === b.id;
      const chip = ce('button', {
        type: 'button',
        className: 'form-chip' + (isSelected ? ' form-chip--active' : ''),
        textContent: `${b.icon} ${b.name}`
      });
      chip.dataset.id = b.id;
      return chip;
    });

    brancheChips.forEach(chip => {
      chip.addEventListener('click', () => {
        brancheChips.forEach(c => c.classList.remove('form-chip--active'));
        chip.classList.add('form-chip--active');
        const val = chip.dataset.id;
        brancheInput.value = val;
        this._brancheId = val;
      });
    });
    
    brancheGrid.append(...brancheChips);
    form.append(ce('div', { className: 'form-group' }, [brancheInput, brancheGrid]));

    // ══════════════════════════════════════════════════════════
    // 1. QUELLE
    // ══════════════════════════════════════════════════════════
    form.append(this._sectionTitle('1', '📡 Eingangskanal'));

    const sourceInput = ce('input', { type: 'hidden', name: 'source', value: 'phone' });

    const sources = [
      { value: 'phone',     label: '📞 Telefonanruf' },
      { value: 'whatsapp',  label: '💬 WhatsApp'     },
      { value: 'email',     label: '📧 E-Mail'        },
      { value: 'sonstiges', label: '🌐 Sonstiges'     },
    ];

    const sourceBtns = sources.map(s => {
      const btn = ce('button', {
        type:        'button',
        className:   'form-toggle__btn' + (s.value === 'phone' ? ' form-toggle__btn--active' : ''),
        textContent: s.label,
      });
      btn.dataset.source = s.value;
      return btn;
    });

    const emailHint = ce('div', { className: 'form-hint', style: 'display:none; margin-top:0.5rem;' });
    emailHint.innerHTML = '📎 Anhänge im Abschnitt <strong>Notiz & Anhänge</strong> hinzufügen.';

    sourceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sourceBtns.forEach(b => b.classList.remove('form-toggle__btn--active'));
        btn.classList.add('form-toggle__btn--active');
        const val = btn.dataset.source;
        sourceInput.value = val;
        this._source = val;
        emailHint.style.display = val === 'email' ? 'block' : 'none';
        this._updateAttachmentVisibility(attachmentSection, val);
      });
    });

    form.append(
      ce('div', { className: 'form-group' }, [
        ce('label', { className: 'form-label', textContent: 'Quelle' }),
        ce('div', { className: 'form-toggle' }, [sourceInput, ...sourceBtns]),
        emailHint,
      ]),
    );

    // ══════════════════════════════════════════════════════════
    // 2. WAS (Auftragsart – Mehrfachauswahl als Chips)
    // ══════════════════════════════════════════════════════════
    form.append(this._sectionTitle('2', '📋 Auftragsart'));

    // Hidden input stores comma-joined selection
    const auftragsartInput        = ce('input', { type: 'hidden', name: 'auftragsart',       value: '' });
    const antiquitaetenInput      = ce('input', { type: 'hidden', name: 'antiquitaeten',     value: '' });
    const entruempelungInput      = ce('input', { type: 'hidden', name: 'entruempelung',     value: '' });
    const verlassenschaftInput    = ce('input', { type: 'hidden', name: 'verlassenschaft',   value: '' });
    const messieInput             = ce('input', { type: 'hidden', name: 'messie',            value: '' });
    const umzugInput              = ce('input', { type: 'hidden', name: 'umzug',             value: '' });
    const geschaeftInput          = ce('input', { type: 'hidden', name: 'geschaeft',         value: '' });
    const chipCounter             = ce('span',  { className: 'form-chip-counter', textContent: '0 ausgewählt' });
    const antiqCounter            = ce('span',  { className: 'form-chip-counter form-chip-counter--sub', textContent: '0 Kategorien' });
    const entruepCounter          = ce('span',  { className: 'form-chip-counter form-chip-counter--sub', textContent: '0 Kategorien' });
    const verlassCounter          = ce('span',  { className: 'form-chip-counter form-chip-counter--sub', textContent: '0 Kategorien' });
    const messieCounter           = ce('span',  { className: 'form-chip-counter form-chip-counter--sub', textContent: '0 Kategorien' });
    const umzugCounter            = ce('span',  { className: 'form-chip-counter form-chip-counter--sub', textContent: '0 Kategorien' });
    const geschaeftCounter        = ce('span',  { className: 'form-chip-counter form-chip-counter--sub', textContent: '0 Kategorien' });

    // ── Antiquitäten sub-panel (multi-select chips) ──────────
    const antiqChipGrid = ce('div', { className: 'form-chip-grid form-chip-grid--sub' });
    ANTIQUITAETEN_KATEGORIEN.forEach(kat => {
      const subChip = ce('button', { type: 'button', className: 'form-chip form-chip--sub', textContent: kat });
      subChip.dataset.kat = kat;
      subChip.addEventListener('click', () => {
        const isActive = subChip.classList.toggle('form-chip--active');
        if (isActive) {
          this._selectedAntiquitaeten.add(kat);
        } else {
          this._selectedAntiquitaeten.delete(kat);
        }
        antiquitaetenInput.value = [...this._selectedAntiquitaeten].join(', ');
        antiqCounter.textContent = `${this._selectedAntiquitaeten.size} Kategorien`;
        antiqCounter.style.color = this._selectedAntiquitaeten.size > 0
          ? 'var(--accent-amber)' : 'var(--text-dim)';
      });
      antiqChipGrid.append(subChip);
    });

    const antiqPanel = ce('div', { className: 'form-antiq-panel' }, [
      ce('div', { className: 'form-antiq-panel__header' }, [
        ce('span', { className: 'form-antiq-panel__icon', textContent: '🏺' }),
        ce('span', { className: 'form-antiq-panel__label', textContent: 'Antiquitäten-Kategorien (Mehrfachauswahl)' }),
        antiqCounter,
      ]),
      antiqChipGrid,
    ]);
    antiqPanel.style.display = 'none';

    // ── Entrümpelung sub-panel (multi-select chips) ──────────
    const entruepChipGrid = ce('div', { className: 'form-chip-grid form-chip-grid--sub' });
    ENTRUEMPELUNG_KATEGORIEN.forEach(kat => {
      const subChip = ce('button', { type: 'button', className: 'form-chip form-chip--sub form-chip--sub-teal', textContent: kat });
      subChip.dataset.kat = kat;
      subChip.addEventListener('click', () => {
        const isActive = subChip.classList.toggle('form-chip--active');
        if (isActive) {
          this._selectedEntruempelung.add(kat);
        } else {
          this._selectedEntruempelung.delete(kat);
        }
        entruempelungInput.value = [...this._selectedEntruempelung].join(', ');
        entruepCounter.textContent = `${this._selectedEntruempelung.size} Kategorien`;
        entruepCounter.style.color = this._selectedEntruempelung.size > 0
          ? 'var(--accent-teal, #2dd4bf)' : 'var(--text-dim)';
      });
      entruepChipGrid.append(subChip);
    });

    const entruepPanel = ce('div', { className: 'form-antiq-panel form-entruep-panel' }, [
      ce('div', { className: 'form-antiq-panel__header' }, [
        ce('span', { className: 'form-antiq-panel__icon', textContent: '🏚️' }),
        ce('span', { className: 'form-antiq-panel__label form-entruep-panel__label', textContent: 'Entrümpelung – Art (Mehrfachauswahl)' }),
        entruepCounter,
      ]),
      entruepChipGrid,
    ]);
    entruepPanel.style.display = 'none';

    // ── Verlassenschaft sub-panel (multi-select chips) ───────
    const verlassChipGrid = ce('div', { className: 'form-chip-grid form-chip-grid--sub' });
    VERLASSENSCHAFT_KATEGORIEN.forEach(kat => {
      const subChip = ce('button', { type: 'button', className: 'form-chip form-chip--sub form-chip--sub-violet', textContent: kat });
      subChip.dataset.kat = kat;
      subChip.addEventListener('click', () => {
        const isActive = subChip.classList.toggle('form-chip--active');
        if (isActive) {
          this._selectedVerlassenschaft.add(kat);
        } else {
          this._selectedVerlassenschaft.delete(kat);
        }
        verlassenschaftInput.value = [...this._selectedVerlassenschaft].join(', ');
        verlassCounter.textContent = `${this._selectedVerlassenschaft.size} Kategorien`;
        verlassCounter.style.color = this._selectedVerlassenschaft.size > 0
          ? '#a78bfa' : 'var(--text-dim)';
      });
      verlassChipGrid.append(subChip);
    });

    const verlassPanel = ce('div', { className: 'form-antiq-panel form-verlassenschaft-panel' }, [
      ce('div', { className: 'form-antiq-panel__header' }, [
        ce('span', { className: 'form-antiq-panel__icon', textContent: '⚖️' }),
        ce('span', { className: 'form-antiq-panel__label form-verlassenschaft-panel__label', textContent: 'Verlassenschaft – Art (Mehrfachauswahl)' }),
        verlassCounter,
      ]),
      verlassChipGrid,
    ]);
    verlassPanel.style.display = 'none';

    // ── Messie sub-panel (multi-select chips) ──────────────
    const messieChipGrid = ce('div', { className: 'form-chip-grid form-chip-grid--sub' });
    MESSIE_KATEGORIEN.forEach(kat => {
      const subChip = ce('button', { type: 'button', className: 'form-chip form-chip--sub form-chip--sub-rose', textContent: kat });
      subChip.dataset.kat = kat;
      subChip.addEventListener('click', () => {
        const isActive = subChip.classList.toggle('form-chip--active');
        if (isActive) {
          this._selectedMessie.add(kat);
        } else {
          this._selectedMessie.delete(kat);
        }
        messieInput.value = [...this._selectedMessie].join(', ');
        messieCounter.textContent = `${this._selectedMessie.size} Kategorien`;
        messieCounter.style.color = this._selectedMessie.size > 0
          ? '#fb7185' : 'var(--text-dim)';
      });
      messieChipGrid.append(subChip);
    });

    const messiePanel = ce('div', { className: 'form-antiq-panel form-messie-panel' }, [
      ce('div', { className: 'form-antiq-panel__header' }, [
        ce('span', { className: 'form-antiq-panel__icon', textContent: '🧹' }),
        ce('span', { className: 'form-antiq-panel__label form-messie-panel__label', textContent: 'Messie – Art (Mehrfachauswahl)' }),
        messieCounter,
      ]),
      messieChipGrid,
    ]);
    messiePanel.style.display = 'none';

    // ── Umzug sub-panel (multi-select chips) ───────────────
    const umzugChipGrid = ce('div', { className: 'form-chip-grid form-chip-grid--sub' });
    UMZUG_KATEGORIEN.forEach(kat => {
      const subChip = ce('button', { type: 'button', className: 'form-chip form-chip--sub form-chip--sub-orange', textContent: kat });
      subChip.dataset.kat = kat;
      subChip.addEventListener('click', () => {
        const isActive = subChip.classList.toggle('form-chip--active');
        if (isActive) {
          this._selectedUmzug.add(kat);
        } else {
          this._selectedUmzug.delete(kat);
        }
        umzugInput.value = [...this._selectedUmzug].join(', ');
        umzugCounter.textContent = `${this._selectedUmzug.size} ausgewählt`;
        umzugCounter.style.color = this._selectedUmzug.size > 0
          ? '#f97316' : 'var(--text-dim)';
      });
      umzugChipGrid.append(subChip);
    });

    const umzugPanel = ce('div', { className: 'form-antiq-panel form-umzug-panel' }, [
      ce('div', { className: 'form-antiq-panel__header' }, [
        ce('span', { className: 'form-antiq-panel__icon', textContent: '🚛' }),
        ce('span', { className: 'form-antiq-panel__label form-umzug-panel__label', textContent: 'Umzug – Reichweite (Mehrfachauswahl)' }),
        umzugCounter,
      ]),
      umzugChipGrid,
    ]);
    umzugPanel.style.display = 'none';

    // ── Geschäftsauflösung sub-panel (multi-select chips) ──────
    const geschaeftChipGrid = ce('div', { className: 'form-chip-grid form-chip-grid--sub' });
    GESCHAEFTSAUFLOESUNG_KATEGORIEN.forEach(kat => {
      const subChip = ce('button', { type: 'button', className: 'form-chip form-chip--sub form-chip--sub-indigo', textContent: kat });
      subChip.dataset.kat = kat;
      subChip.addEventListener('click', () => {
        const isActive = subChip.classList.toggle('form-chip--active');
        if (isActive) {
          this._selectedGeschaeft.add(kat);
        } else {
          this._selectedGeschaeft.delete(kat);
        }
        geschaeftInput.value = [...this._selectedGeschaeft].join(', ');
        geschaeftCounter.textContent = `${this._selectedGeschaeft.size} Kategorien`;
        geschaeftCounter.style.color = this._selectedGeschaeft.size > 0
          ? '#818cf8' : 'var(--text-dim)';
      });
      geschaeftChipGrid.append(subChip);
    });

    const geschaeftPanel = ce('div', { className: 'form-antiq-panel form-geschaeft-panel' }, [
      ce('div', { className: 'form-antiq-panel__header' }, [
        ce('span', { className: 'form-antiq-panel__icon', textContent: '🏬' }),
        ce('span', { className: 'form-antiq-panel__label form-geschaeft-panel__label', textContent: 'Geschäftsauflösung – Art (Mehrfachauswahl)' }),
        geschaeftCounter,
      ]),
      geschaeftChipGrid,
    ]);
    geschaeftPanel.style.display = 'none';

    // ── Main chip grid ───────────────────────────────────────
    const chipGrid = ce('div', { className: 'form-chip-grid' });
    AUFTRAGSARTEN.forEach(art => {
      const chip = ce('button', { type: 'button', className: 'form-chip', textContent: art });
      chip.dataset.art = art;

      chip.addEventListener('click', () => {
        const isActive = chip.classList.toggle('form-chip--active');
        if (isActive) {
          this._selectedArten.add(art);
        } else {
          this._selectedArten.delete(art);
          // Reset Antiquitäten sub-selection when deselecting parent chip
          if (art === 'Antiquitäten Ankauf') {
            this._selectedAntiquitaeten.clear();
            antiquitaetenInput.value = '';
            antiqCounter.textContent = '0 Kategorien';
            antiqCounter.style.color = 'var(--text-dim)';
            antiqChipGrid.querySelectorAll('.form-chip--active').forEach(c => c.classList.remove('form-chip--active'));
          }
          // Reset Entrümpelung sub-selection when deselecting parent chip
          if (art === 'Entrümpelung') {
            this._selectedEntruempelung.clear();
            entruempelungInput.value = '';
            entruepCounter.textContent = '0 Kategorien';
            entruepCounter.style.color = 'var(--text-dim)';
            entruepChipGrid.querySelectorAll('.form-chip--active').forEach(c => c.classList.remove('form-chip--active'));
          }
          // Reset Verlassenschaft sub-selection when deselecting parent chip
          if (art === 'Verlassenschaft') {
            this._selectedVerlassenschaft.clear();
            verlassenschaftInput.value = '';
            verlassCounter.textContent = '0 Kategorien';
            verlassCounter.style.color = 'var(--text-dim)';
            verlassChipGrid.querySelectorAll('.form-chip--active').forEach(c => c.classList.remove('form-chip--active'));
          }
          // Reset Messie sub-selection when deselecting parent chip
          if (art === 'Messie') {
            this._selectedMessie.clear();
            messieInput.value = '';
            messieCounter.textContent = '0 Kategorien';
            messieCounter.style.color = 'var(--text-dim)';
            messieChipGrid.querySelectorAll('.form-chip--active').forEach(c => c.classList.remove('form-chip--active'));
          }
          // Reset Umzug sub-selection when deselecting parent chip
          if (art === 'Umzug') {
            this._selectedUmzug.clear();
            umzugInput.value = '';
            umzugCounter.textContent = '0 Kategorien';
            umzugCounter.style.color = 'var(--text-dim)';
            umzugChipGrid.querySelectorAll('.form-chip--active').forEach(c => c.classList.remove('form-chip--active'));
          }
          // Reset Geschäftsauflösung sub-selection when deselecting parent chip
          if (art === 'Geschäftsauflösung') {
            this._selectedGeschaeft.clear();
            geschaeftInput.value = '';
            geschaeftCounter.textContent = '0 Kategorien';
            geschaeftCounter.style.color = 'var(--text-dim)';
            geschaeftChipGrid.querySelectorAll('.form-chip--active').forEach(c => c.classList.remove('form-chip--active'));
          }
        }
        auftragsartInput.value = [...this._selectedArten].join(', ');
        chipCounter.textContent = `${this._selectedArten.size} ausgewählt`;
        chipCounter.style.color = this._selectedArten.size > 0
          ? 'var(--accent-cyan)' : 'var(--text-dim)';
        // Show/hide sub-panels
        if (art === 'Antiquitäten Ankauf') {
          antiqPanel.style.display = isActive ? 'block' : 'none';
          if (isActive) antiqPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (art === 'Entrümpelung') {
          entruepPanel.style.display = isActive ? 'block' : 'none';
          if (isActive) entruepPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (art === 'Verlassenschaft') {
          verlassPanel.style.display = isActive ? 'block' : 'none';
          if (isActive) verlassPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (art === 'Messie') {
          messiePanel.style.display = isActive ? 'block' : 'none';
          if (isActive) messiePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (art === 'Umzug') {
          umzugPanel.style.display = isActive ? 'block' : 'none';
          if (isActive) umzugPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (art === 'Geschäftsauflösung') {
          geschaeftPanel.style.display = isActive ? 'block' : 'none';
          if (isActive) geschaeftPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      chipGrid.append(chip);
    });

    form.append(auftragsartInput, antiquitaetenInput, entruempelungInput, verlassenschaftInput, messieInput, umzugInput, geschaeftInput);
    form.append(
      ce('div', { className: 'form-group' }, [
        ce('div', { style: 'display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;' }, [
          ce('label', { className: 'form-label form-label--required', textContent: 'Art des Auftrags (Mehrfachauswahl)' }),
          chipCounter,
        ]),
        chipGrid,
        verlassPanel,
        messiePanel,
        umzugPanel,
        geschaeftPanel,
        entruepPanel,
        antiqPanel,
      ]),
    );

    // ══════════════════════════════════════════════════════════
    // 3. ORT (Land + Ort + PLZ + Bundesland)
    // ══════════════════════════════════════════════════════════
    form.append(this._sectionTitle('3', '📍 Auftragsort'));

    // — Zeile 3a: Land-Auswahl ———————————————————————————————
    const landInput = ce('input', { type: 'hidden', name: 'land', value: 'AT' });

    const landBtns = LAENDER.map(l => {
      const btn = ce('button', {
        type:        'button',
        className:   'form-toggle__btn form-toggle__btn--sm' + (l.value === 'AT' ? ' form-toggle__btn--active' : ''),
        textContent: l.label,
      });
      btn.dataset.land = l.value;
      return btn;
    });

    landBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        landBtns.forEach(b => b.classList.remove('form-toggle__btn--active'));
        btn.classList.add('form-toggle__btn--active');
        landInput.value = btn.dataset.land;
        this._land = btn.dataset.land;
        // Bundesland-Dropdown nur bei AT sinnvoll
        blGroup.style.opacity = this._land === 'AT' ? '1' : '0.4';
      });
    });

    form.append(landInput);
    form.append(
      ce('div', { className: 'form-group' }, [
        ce('label', { className: 'form-label', textContent: 'Land' }),
        ce('div', { className: 'form-toggle form-toggle--wrap' }, landBtns),
      ]),
    );

    // — Zeile 3b: Ort + PLZ + Bundesland ————————————————————
    const ortInput = ce('input', {
      className:   'form-input',
      type:        'text',
      name:        'ort',
      required:    '',
      placeholder: 'z. B. Wien, Graz, Linz …',
    });
    const plzInput = ce('input', {
      className:   'form-input',
      type:        'text',
      name:        'plz',
      required:    '',
      placeholder: '1010',
      maxlength:   '6',
    });
    const bundeslandSelect = ce('select', { className: 'form-select', name: 'bundesland', required: '' });
    bundeslandSelect.append(ce('option', { value: '', textContent: '— Bundesland —' }));
    BUNDESLAENDER.forEach(bl => {
      bundeslandSelect.append(ce('option', { value: bl, textContent: bl }));
    });

    const ortGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label form-label--required', textContent: 'Ort' }),
      ortInput,
    ]);
    const plzGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label form-label--required', textContent: 'PLZ' }),
      plzInput,
    ]);
    const blGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label form-label--required', textContent: 'Bundesland' }),
      bundeslandSelect,
    ]);

    form.append(ce('div', { className: 'form-row--3' }, [ortGroup, plzGroup, blGroup]));

    // — Zeile 3c: Adresse + Hausnummer/Stiege/Tür ————————————
    const strasseInput = ce('input', {
      className:   'form-input',
      type:        'text',
      name:        'strasse',
      placeholder: 'Straße / Gasse',
    });
    const adressdetailInput = ce('input', {
      className:   'form-input',
      type:        'text',
      name:        'adress_detail',
      placeholder: 'Nr. / Stiege / Tür',
    });

    const strasseGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Straße' }),
      strasseInput,
    ]);
    const adressdetailGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Hausnummer / Stiege / Tür' }),
      adressdetailInput,
    ]);

    form.append(ce('div', { className: 'form-row' }, [strasseGroup, adressdetailGroup]));

    // ══════════════════════════════════════════════════════════
    // 4. NAME (Anrede + Name)
    // ══════════════════════════════════════════════════════════
    form.append(this._sectionTitle('4', '👤 Kontaktperson'));

    const anredeInput = ce('input', { type: 'hidden', name: 'anrede', value: 'herr' });

    const anredeBtns = [
      { value: 'herr',  label: 'Hr.'   },
      { value: 'frau',  label: 'Fr.'   },
      { value: 'firma', label: 'Firma' },
    ].map(a => {
      const btn = ce('button', {
        type:      'button',
        className: 'form-anrede__btn' + (a.value === 'herr' ? ' form-anrede__btn--active' : ''),
        textContent: a.label,
      });
      btn.dataset.anrede = a.value;
      return btn;
    });

    anredeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        anredeBtns.forEach(b => b.classList.remove('form-anrede__btn--active'));
        btn.classList.add('form-anrede__btn--active');
        anredeInput.value = btn.dataset.anrede;
        this._anrede = btn.dataset.anrede;
      });
    });

    const nameInput = ce('input', {
      className:   'form-input',
      type:        'text',
      name:        'caller_name',
      required:    '',
      placeholder: 'Vor- und Nachname / Firmenname',
    });
    const telefonInput = ce('input', {
      className:   'form-input',
      type:        'tel',
      name:        'telefon',
      placeholder: '+43 …',
    });

    const nameGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label form-label--required', textContent: 'Anrede & Name' }),
      ce('div', { style: 'display:flex; flex-direction:column; gap:0.5rem;' }, [
        ce('div', { className: 'form-anrede' }, [anredeInput, ...anredeBtns]),
        nameInput,
      ]),
    ]);
    const telefonGroup4 = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Telefonnummer' }),
      telefonInput,
    ]);

    form.append(ce('div', { className: 'form-row' }, [nameGroup, telefonGroup4]));

    // ══════════════════════════════════════════════════════════
    // 5. NOTIZ & ANHÄNGE
    // ══════════════════════════════════════════════════════════
    form.append(this._sectionTitle('5', '📝 Notiz & Anhänge'));

    const notizTextarea = ce('textarea', {
      className:   'form-textarea',
      name:        'anfrage',
      placeholder: 'Notizen, Details zum Auftrag, besondere Hinweise …',
    });
    form.append(
      ce('div', { className: 'form-group' }, [
        ce('label', { className: 'form-label', textContent: 'Notiz / Auftragsdetails' }),
        notizTextarea,
      ]),
    );

    // Attachment section – shown for e-mail source
    const attachFileInput = ce('input', {
      type:      'file',
      multiple:  '',
      className: 'form-attachment__input',
      id:        'attachment-file-input',
      accept:    '*/*',
    });
    const attachList = ce('ul', { className: 'form-attachment__list' });

    const attachClickZone = ce('div', { className: 'form-attachment__label' });
    attachClickZone.innerHTML = '📂 Dateien hierher ziehen oder <span>Durchsuchen</span>';
    attachClickZone.querySelector('span').addEventListener('click', () => attachFileInput.click());

    const attachmentSection = ce('div', { className: 'form-group', style: 'display:none;' }, [
      ce('label', { className: 'form-label', textContent: 'Anhänge (E-Mail)' }),
      ce('div', { className: 'form-attachment' }, [
        attachClickZone,
        attachFileInput,
        attachList,
      ]),
      ce('span', { className: 'form-hint', textContent: 'Anhänge werden lokal gespeichert und können an den Distributor weitergeleitet werden.' }),
    ]);

    attachFileInput.addEventListener('change', () => {
      this._addFiles(Array.from(attachFileInput.files), attachList);
      attachFileInput.value = '';
    });

    const dropZone = attachmentSection.querySelector('.form-attachment');
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('form-attachment--dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('form-attachment--dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('form-attachment--dragover');
      this._addFiles(Array.from(e.dataTransfer.files), attachList);
    });

    form.append(attachmentSection);

    // ══════════════════════════════════════════════════════════
    // 6. TERMIN & PRIORITÄT (5 Stufen)
    // ══════════════════════════════════════════════════════════
    form.append(this._sectionTitle('6', '📅 Termin & Priorität'));

    const datumInput = ce('input', {
      className: 'form-input',
      type:      'date',
      name:      'termin_wunsch',
      id:        'termin-datum',
    });
    const uhrzeitInput = ce('input', {
      className:   'form-input',
      type:        'time',
      name:        'termin_uhrzeit',
      id:          'termin-uhrzeit',
      placeholder: 'HH:MM',
    });

    const datumGroup   = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Datum (Terminwunsch)', htmlFor: 'termin-datum' }),
      datumInput,
    ]);
    const uhrzeitGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Uhrzeit', htmlFor: 'termin-uhrzeit' }),
      uhrzeitInput,
    ]);

    form.append(ce('div', { className: 'form-row' }, [datumGroup, uhrzeitGroup]));

    // Priorität als 5-stufige Chip-Leiste
    const prioInput = ce('input', { type: 'hidden', name: 'priority', value: 'normal' });
    const prioChips = PRIORITIES.map(p => {
      const chip = ce('button', {
        type:      'button',
        className: 'form-prio-chip' + (p.value === 'normal' ? ' form-prio-chip--active' : ''),
        textContent: p.label,
      });
      chip.dataset.prio = p.value;
      return chip;
    });

    prioChips.forEach(chip => {
      chip.addEventListener('click', () => {
        prioChips.forEach(c => c.classList.remove('form-prio-chip--active'));
        chip.classList.add('form-prio-chip--active');
        prioInput.value = chip.dataset.prio;
        // Apply color class to wrapper
        prioWrapper.dataset.prio = chip.dataset.prio;
      });
    });

    const prioWrapper = ce('div', { className: 'form-prio-bar', 'data-prio': 'normal' }, [prioInput, ...prioChips]);

    form.append(
      ce('div', { className: 'form-group' }, [
        ce('label', { className: 'form-label', textContent: 'Priorität' }),
        prioWrapper,
      ]),
    );

    // ══════════════════════════════════════════════════════════
    // 7. DISTRIBUTOR
    // ══════════════════════════════════════════════════════════
    form.append(this._sectionTitle('7', '🏢 Distributor zuweisen'));

    const distSelect = ce('select', { className: 'form-select', name: 'distributor_id', id: 'distributor-select' });
    distSelect.append(ce('option', { value: '',      textContent: '— Noch nicht zuweisen —' }));
    distSelect.append(ce('option', { value: 'all',   textContent: '📢 An alle freigeben (Offener Auftrag)' }));

    this._distributors
      .filter(d => d.active)
      .forEach(d => distSelect.append(ce('option', {
        value:       String(d.id),
        textContent: `${d.name}${d.region ? ` · ${d.region}` : ''}${d.email ? ` (${d.email})` : ''}`,
      })));

    form.append(
      ce('div', { className: 'form-group' }, [
        ce('label', { className: 'form-label', textContent: 'Distributor', htmlFor: 'distributor-select' }),
        distSelect,
        ce('span', { className: 'form-hint', textContent: '„An alle freigeben" erstellt einen offenen Auftrag, den jeder Distributor annehmen kann. Alternativ direkt zuweisen oder später vergeben.' }),
      ]),
    );

    // ── Actions ──────────────────────────────────────────────
    const actions = ce('div', { className: 'form-actions' }, [
      this._btn('💾 Auftrag speichern', 'btn btn--primary', () => this._submit(form)),
      this._btn('Abbrechen', 'btn btn--secondary', () => this._onCancel?.()),
    ]);
    form.append(actions);

    form.addEventListener('submit', e => { e.preventDefault(); this._submit(form); });

    const wrapper = ce('div', {});
    wrapper.append(header, form);
    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  // ── Private helpers ──────────────────────────────────────────

  _sectionTitle(num, text) {
    const el = ce('div', { className: 'form-section-title' });
    el.append(
      ce('span', { className: 'form-step-badge', textContent: num }),
      document.createTextNode(' ' + text),
    );
    return el;
  }

  _updateAttachmentVisibility(section, source) {
    section.style.display = source === 'email' ? 'flex' : 'none';
  }

  _addFiles(files, listEl) {
    files.forEach(file => {
      if (this._attachments.find(a => a.name === file.name)) return;
      this._attachments.push({ name: file.name, file });

      const item = ce('li', { className: 'form-attachment__item' });
      const removeBtn = ce('button', {
        type: 'button', className: 'form-attachment__remove',
        textContent: '✕', title: 'Entfernen',
      });
      removeBtn.addEventListener('click', () => {
        this._attachments = this._attachments.filter(a => a.name !== file.name);
        item.remove();
      });
      item.append(ce('span', { textContent: file.name }), removeBtn);
      listEl.append(item);
    });
  }

  _submit(form) {
    // Validate: at least one Auftragsart selected
    if (this._selectedArten.size === 0) {
      const grid = form.querySelector('.form-chip-grid');
      grid?.classList.add('form-chip-grid--error');
      setTimeout(() => grid?.classList.remove('form-chip-grid--error'), 1500);
      return;
    }

    // Validate required text inputs
    const required = form.querySelectorAll('[required]');
    let valid = true;
    for (const inp of required) {
      if (!inp.value.trim()) {
        inp.focus();
        inp.style.borderColor = 'var(--accent-rose)';
        inp.addEventListener('input', () => { inp.style.borderColor = ''; }, { once: true });
        if (valid) valid = false;
      }
    }
    if (!valid) return;

    const fd = new FormData(form);
    const rawDist = fd.get('distributor_id');

    this._onSave?.({
      branche_id:       fd.get('branche_id') || null,
      source:           fd.get('source'),
      auftragsart:      fd.get('auftragsart')?.trim(),
      antiquitaeten:    fd.get('antiquitaeten')?.trim()    || null,
      entruempelung:    fd.get('entruempelung')?.trim()    || null,
      verlassenschaft:  fd.get('verlassenschaft')?.trim()  || null,
      messie:           fd.get('messie')?.trim()           || null,
      umzug:            fd.get('umzug')?.trim()            || null,
      geschaeft:        fd.get('geschaeft')?.trim()        || null,
      caller_name:      fd.get('caller_name')?.trim(),
      anrede:         fd.get('anrede'),
      land:           fd.get('land'),
      ort:            fd.get('ort')?.trim(),
      plz:            fd.get('plz')?.trim(),
      bundesland:     fd.get('bundesland'),
      strasse:        fd.get('strasse')?.trim(),
      adress_detail:  fd.get('adress_detail')?.trim(),
      telefon:        fd.get('telefon')?.trim(),
      anfrage:        fd.get('anfrage')?.trim(),
      priority:       fd.get('priority'),
      termin_wunsch:  fd.get('termin_wunsch') || '',
      termin_uhrzeit: fd.get('termin_uhrzeit') || '',
      distributor_id: rawDist === 'all' ? 'all' : (rawDist ? Number(rawDist) : null),
      attachments:    this._attachments.map(a => a.name),
    });
  }

  _btn(label, cls, fn) {
    const btn = ce('button', { className: cls, type: 'button', textContent: label });
    btn.addEventListener('click', fn);
    return btn;
  }

  onSave(fn)   { this._onSave   = fn; }
  onCancel(fn) { this._onCancel = fn; }
}
