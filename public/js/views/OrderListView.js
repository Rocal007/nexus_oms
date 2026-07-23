/**
 * OrderListView.js — Table of all orders with status actions, email dispatch,
 * and a slide-in detail drawer with full inline edit mode on row click.
 * Callbacks: onNew(), onDispatch(id), onAccept(id), onDecline(id),
 *            onDelete(id), onEdit(id, data).
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

const STATUS_LABEL = {
  new:        'Neu',
  dispatched: 'Versendet',
  accepted:   'Angenommen',
  declined:   'Abgelehnt',
  completed:  'Abgeschlossen',
};
const PRIORITY_LABEL = {
  low:       '🔵 Niedrig',
  normal:    '🟢 Normal',
  urgent:    '🟡 Dringend',
  high:      '🟠 Sehr dringend',
  emergency: '🔴 Notfall',
};
const SOURCE_ICON  = { phone: '📞', whatsapp: '💬', email: '📧', sonstiges: '🌐' };
const SOURCE_LABEL = { phone: 'Telefon', whatsapp: 'WhatsApp', email: 'E-Mail', sonstiges: 'Sonstiges' };
const ANREDE_LABEL = { herr: 'Hr.', frau: 'Fr.', firma: 'Firma' };

const AUFTRAGSARTEN = [
  'Verlassenschaft','Hausräumung','Wohnungsräumung','Entrümpelung','Messie',
  'Ankauf','Antiquitäten Ankauf','Räumung mit Wertausgleich','Umzug',
  'Geschäftsauflösung','Dachbodenräumung','Kellerräumung',
];
const BUNDESLAENDER = [
  'Wien','Niederösterreich','Oberösterreich','Steiermark','Tirol',
  'Kärnten','Salzburg','Vorarlberg','Burgenland',
];
const LAENDER = [
  { value: 'AT', label: '🇦🇹 Österreich' },
  { value: 'DE', label: '🇩🇪 Deutschland' },
  { value: 'IT', label: '🇮🇹 Italien'     },
  { value: 'SI', label: '🇸🇮 Slowenien'   },
  { value: 'HU', label: '🇭🇺 Ungarn'      },
  { value: 'CZ', label: '🇨🇿 Tschechien'  },
  { value: 'XX', label: '🌐 Sonstiges'    },
];
const PRIORITIES = [
  { value: 'low',       label: '🔵 Niedrig'      },
  { value: 'normal',    label: '🟢 Normal'        },
  { value: 'urgent',    label: '🟡 Dringend'      },
  { value: 'high',      label: '🟠 Sehr dringend' },
  { value: 'emergency', label: '🔴 Notfall'       },
];
const SOURCES = [
  { value: 'phone',     label: '📞 Telefonanruf' },
  { value: 'whatsapp',  label: '💬 WhatsApp'     },
  { value: 'email',     label: '📧 E-Mail'        },
  { value: 'sonstiges', label: '🌐 Sonstiges'     },
];

export class OrderListView extends BaseView {
  constructor(container) {
    super(container);
    this._onNew      = null;
    this._onDispatch = null;
    this._onAccept   = null;
    this._onDecline  = null;
    this._onDelete   = null;
    this._onEdit     = null;
    this._drawer        = null;
    this._drawerOverlay = null;
    this._activeRow     = null;
    this._expandedRow   = null; // currently expanded detail row
    this._currentOrder  = null;
    this._distMap       = new Map();
  }

  /**
   * @param {import('../models/OrderModel.js').Order[]}             orders
   * @param {import('../models/DistributorModel.js').Distributor[]} distributors
   * @param {import('../models/BrancheModel.js').Branche[]} branchen
   */
  render(orders, distributors, branchen = []) {
    this._distMap    = new Map(distributors.map(d => [d.id, d]));
    this._brancheMap = new Map(branchen.map(b => [b.id, b]));
    this._orders     = orders;

    const wrapper = ce('div', {});

    // ── Header ──────────────────────────────────────────────
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: 'Auftragsübersicht' }),
        ce('div', { className: 'page-header__subtitle', textContent: `${orders.length} Einträge · MODULE::ORDER_MANAGER` }),
      ]),
      ce('div', { className: 'page-header__actions' }, [
        this._btn('✏️ Auftrag erfassen', 'btn btn--primary', () => this._onNew?.()),
      ]),
    ]);

    // ── Stats bar ────────────────────────────────────────────
    const counts = {
      total:      orders.length,
      new:        orders.filter(o => o.status === 'new').length,
      dispatched: orders.filter(o => o.status === 'dispatched').length,
      accepted:   orders.filter(o => o.status === 'accepted').length,
      emergency:  orders.filter(o => o.priority === 'emergency').length,
    };
    const statsBar = ce('div', { className: 'ol-stats-bar' });
    const statDefs = [
      { label: 'Gesamt',     value: counts.total,      mod: 'total',       key: '' },
      { label: 'Neu',        value: counts.new,         mod: 'new',         key: 'new' },
      { label: 'Versendet',  value: counts.dispatched,  mod: 'dispatched',  key: 'dispatched' },
      { label: 'Angenommen', value: counts.accepted,    mod: 'accepted',    key: 'accepted' },
      { label: 'Notfall',    value: counts.emergency,   mod: 'emergency',   key: '__emergency__' },
    ];

    let activeFilter = '';
    let filterInput; // forward-declared for use in click handlers

    const applyFilters = () => {
      const q    = filterInput?.value.toLowerCase().trim() ?? '';
      const stat = statusSel?.value ?? '';
      const prio = prioritySel?.value ?? '';

      let visible = 0;
      const allRows = [...tbody.querySelectorAll('tr:not(.ol-no-results)')];
      for (let i = 0; i < allRows.length; i += 2) {
        const mainRow   = allRows[i];
        const expandRow = allRows[i + 1];
        const o = mainRow?._order;
        if (!o) continue;

        const matchQ = !q ||
          (o.caller_name  || '').toLowerCase().includes(q) ||
          (o.ort          || '').toLowerCase().includes(q) ||
          (o.plz          || '').toLowerCase().includes(q) ||
          (o.auftragsart  || '').toLowerCase().includes(q) ||
          String(o.id).includes(q);

        const matchStat   = !stat || o.status === stat;
        const matchPrio   = !prio || o.priority === prio;
        const matchActive = !activeFilter ||
          (activeFilter === '__emergency__' ? o.priority === 'emergency' : o.status === activeFilter);

        const show = matchQ && matchStat && matchPrio && matchActive;
        mainRow.style.display = show ? '' : 'none';
        if (expandRow) {
          expandRow.style.display = show
            ? (expandRow.classList.contains('data-table__expand-row--open') ? 'table-row' : 'none')
            : 'none';
        }
        if (show) visible++;
      }
      if (noResultsRow) noResultsRow.style.display = (visible === 0 && orders.length > 0) ? '' : 'none';
    };

    statDefs.forEach(({ label, value, mod, key }, idx) => {
      const chip = ce('button', { type: 'button', className: `ol-stat-chip ol-stat-chip--${mod}` });
      chip.innerHTML = `<span class="ol-stat-chip__val">${value}</span><span class="ol-stat-chip__lbl">${label}</span>`;
      chip.addEventListener('click', () => {
        [...statsBar.children].forEach(c => c.classList.remove('ol-stat-chip--active'));
        if (activeFilter === key) {
          activeFilter = '';
          statsBar.children[0]?.classList.add('ol-stat-chip--active');
        } else {
          activeFilter = key;
          chip.classList.add('ol-stat-chip--active');
        }
        applyFilters();
      });
      if (idx === 0) chip.classList.add('ol-stat-chip--active');
      statsBar.append(chip);
    });

    // ── Toolbar (search + filters) ───────────────────────────
    const toolbar = ce('div', { className: 'ol-toolbar' });

    filterInput = ce('input', {
      type: 'text',
      className: 'ol-search',
      placeholder: '🔍  Name, Ort, Auftragsart, #ID …',
      id: 'order-search',
    });

    const statusSel = ce('select', { className: 'ol-filter-sel', id: 'order-status-filter' });
    [
      ['', 'Alle Status'],
      ['new',        '🆕 Neu'],
      ['dispatched', '📤 Versendet'],
      ['accepted',   '✅ Angenommen'],
      ['declined',   '❌ Abgelehnt'],
      ['completed',  '✔️  Abgeschlossen'],
    ].forEach(([val, lbl]) => statusSel.append(ce('option', { value: val, textContent: lbl })));

    const prioritySel = ce('select', { className: 'ol-filter-sel', id: 'order-priority-filter' });
    [
      ['', 'Alle Prioritäten'],
      ['emergency', '🔴 Notfall'],
      ['high',      '🟠 Sehr dringend'],
      ['urgent',    '🟡 Dringend'],
      ['normal',    '🟢 Normal'],
      ['low',       '🔵 Niedrig'],
    ].forEach(([val, lbl]) => prioritySel.append(ce('option', { value: val, textContent: lbl })));

    const resetBtn = ce('button', { type: 'button', className: 'btn btn--secondary btn--sm ol-reset-btn', textContent: '✕ Filter' });
    resetBtn.addEventListener('click', () => {
      filterInput.value = '';
      statusSel.value   = '';
      prioritySel.value = '';
      activeFilter = '';
      [...statsBar.children].forEach(c => c.classList.remove('ol-stat-chip--active'));
      statsBar.children[0]?.classList.add('ol-stat-chip--active');
      applyFilters();
    });

    toolbar.append(filterInput, statusSel, prioritySel, resetBtn);

    // ── Table ────────────────────────────────────────────────
    const wrap  = ce('div', { className: 'data-table-wrapper ol-table-wrapper' });
    const table = ce('table', { className: 'data-table', role: 'table' });
    const thead = ce('thead', { className: 'data-table__head data-table__head--sticky' });
    thead.innerHTML = `<tr>
      <th class="data-table__th">#</th>
      <th class="data-table__th">Quelle</th>
      <th class="data-table__th">Name</th>
      <th class="data-table__th">Auftragsart</th>
      <th class="data-table__th">Ort</th>
      <th class="data-table__th">Priorität</th>
      <th class="data-table__th">Termin</th>
      <th class="data-table__th">Distributor</th>
      <th class="data-table__th">Status</th>
      <th class="data-table__th">Aktionen</th>
      <th class="data-table__th data-table__th--chevron"></th>
    </tr>`;

    const tbody = ce('tbody', {});
    this._tbody = tbody;

    let noResultsRow = null;

    if (orders.length === 0) {
      const row = ce('tr', {});
      row.innerHTML = `<td colspan="11" class="data-table__td">
        <div class="data-table__empty">
          <div class="data-table__empty-icon">📋</div>
          <div class="data-table__empty-text">Noch keine Aufträge vorhanden.<br>Klicken Sie auf „✏️ Auftrag erfassen".</div>
        </div>
      </td>`;
      tbody.append(row);
    } else {
      orders.forEach(o => {
        const frag = this._buildRow(o);
        // Tag each child with the order object for filtering
        [...frag.childNodes].forEach(r => { r._order = o; });
        tbody.append(frag);
      });

      noResultsRow = ce('tr', { className: 'ol-no-results' });
      noResultsRow.style.display = 'none';
      noResultsRow.innerHTML = `<td colspan="11" class="data-table__td">
        <div class="data-table__empty">
          <div class="data-table__empty-icon">🔍</div>
          <div class="data-table__empty-text">Keine Aufträge gefunden.<br>Filter oder Suchbegriff anpassen.</div>
        </div>
      </td>`;
      tbody.append(noResultsRow);
    }

    filterInput.addEventListener('input',   applyFilters);
    statusSel.addEventListener('change',    applyFilters);
    prioritySel.addEventListener('change',  applyFilters);

    table.append(thead, tbody);
    wrap.append(table);
    wrapper.append(header, wrap);
    this.container.append(wrapper);
    this.el = wrapper;

    this._buildDrawer();
    return wrapper;
  }

  // ── Row ──────────────────────────────────────────────────────

  _buildRow(o) {
    const dist   = this._distMap.get(o.distributor_id);
    const termin = o.termin_wunsch
      ? new Date(o.termin_wunsch).toLocaleDateString('de-AT', { dateStyle: 'short' })
        + (o.termin_uhrzeit ? ` ${o.termin_uhrzeit}` : '')
      : '—';
    const branche = o.branche_id ? this._brancheMap.get(o.branche_id) : null;
    let art = o.auftragsart
      ? (o.auftragsart.length > 26 ? o.auftragsart.slice(0, 24) + '…' : o.auftragsart)
      : '—';
    
    if (branche) {
      art = `${branche.icon} ${art}`;
    }
    const anrede = ANREDE_LABEL[o.anrede] ?? '';
    const name   = [anrede, o.caller_name].filter(Boolean).join(' ');
    const ort    = [o.plz, o.ort].filter(Boolean).join(' ') || '—';

    const row = ce('tr', { className: 'data-table__row data-table__row--clickable' });
    row.innerHTML = `
      <td class="data-table__td data-table__td--mono">#${o.id}</td>
      <td class="data-table__td"><span class="badge badge--${o.source}">${SOURCE_ICON[o.source] ?? '🌐'} ${SOURCE_LABEL[o.source] ?? o.source}</span></td>
      <td class="data-table__td data-table__td--primary">${this._esc(name)}</td>
      <td class="data-table__td" style="font-size:.8rem">${this._esc(art)}</td>
      <td class="data-table__td">${this._esc(ort)}</td>
      <td class="data-table__td"><span class="badge badge--${o.priority}">${PRIORITY_LABEL[o.priority] ?? o.priority}</span></td>
      <td class="data-table__td data-table__td--mono" style="font-size:.75rem">${termin}</td>
      <td class="data-table__td">${dist ? this._esc(dist.name) : (o.distributor_id === 'all' ? '<span style="color:var(--accent-cyan)">📢 Alle</span>' : '<span style="opacity:.4">—</span>')}</td>
      <td class="data-table__td"><span class="badge badge--${o.status}">${STATUS_LABEL[o.status]}</span></td>
      <td class="data-table__td"><div class="data-table__td--actions" id="row-actions-${o.id}"></div></td>
      <td class="data-table__td data-table__td--chevron"><span class="row-chevron" aria-hidden="true">›</span></td>
    `;

    const actionsEl = row.querySelector(`#row-actions-${o.id}`);
    actionsEl.append(...this._buildActions(o));

    // ── Expand row ─────────────────────────────────────
    const expandRow = ce('tr', { className: 'data-table__expand-row' });
    const expandCell = ce('td', { className: 'data-table__expand-cell', colSpan: '11' });
    const expandInner = ce('div', { className: 'data-table__expand-inner' });
    expandInner.append(this._buildExpandContent(o));
    expandCell.append(expandInner);
    expandRow.append(expandCell);

    // Edit button inside expand panel opens the drawer
    expandInner.addEventListener('click', e => {
      const btn = e.target.closest('[data-expand-edit]');
      if (btn) {
        this._currentOrder = o;
        this._openDrawer(o, 'edit');
        return;
      }
      // action buttons
      const abtn = e.target.closest('[data-action]');
      if (abtn) {
        const id = Number(abtn.dataset.id), action = abtn.dataset.action;
        if (action === 'dispatch') this._onDispatch?.(id);
        if (action === 'accept')   this._onAccept?.(id);
        if (action === 'decline')  this._onDecline?.(id);
        if (action === 'delete')   this._onDelete?.(id);
      }
    });

    // ── Toggle expand on row click ───────────────────────
    row.addEventListener('click', e => {
      if (e.target.closest('[data-action]')) return;
      const isOpen = expandRow.classList.contains('data-table__expand-row--open');

      // close any other open row
      if (this._expandedRow && this._expandedRow !== expandRow) {
        this._expandedRow.classList.remove('data-table__expand-row--open');
        this._activeRow?.classList.remove('data-table__row--active');
      }

      if (isOpen) {
        expandRow.classList.remove('data-table__expand-row--open');
        row.classList.remove('data-table__row--active');
        row.querySelector('.row-chevron').classList.remove('row-chevron--open');
        this._expandedRow = null;
        this._activeRow   = null;
      } else {
        expandRow.classList.add('data-table__expand-row--open');
        row.classList.add('data-table__row--active');
        row.querySelector('.row-chevron').classList.add('row-chevron--open');
        this._expandedRow = expandRow;
        this._activeRow   = row;
        // smooth scroll into view
        setTimeout(() => expandRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }
    });

    // action buttons in the main row (not inside expand)
    row.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = Number(btn.dataset.id), action = btn.dataset.action;
      if (action === 'dispatch') this._onDispatch?.(id);
      if (action === 'accept')   this._onAccept?.(id);
      if (action === 'decline')  this._onDecline?.(id);
      if (action === 'delete')   this._onDelete?.(id);
    });

    // Return a fragment with both rows
    const frag = document.createDocumentFragment();
    frag.append(row, expandRow);
    return frag;
  }

  // ── Expand detail content card ───────────────────────────

  _buildExpandContent(o) {
    const dist   = this._distMap.get(o.distributor_id);
    const anrede = ANREDE_LABEL[o.anrede] ?? '';
    const adresse = [o.strasse, o.adress_detail].filter(Boolean).join(' ');
    const ortParts = [o.plz, o.ort, o.bundesland, o.land !== 'AT' ? o.land : ''].filter(Boolean).join(' ');
    const termin = o.termin_wunsch
      ? new Date(o.termin_wunsch).toLocaleDateString('de-AT', { dateStyle: 'long' })
        + (o.termin_uhrzeit ? `, ${o.termin_uhrzeit} Uhr` : '')
      : '—';
    let distStr = '—';
    if (o.distributor_id === 'all') distStr = '📢 Offener Auftrag (alle)';
    else if (dist) distStr = `${dist.name}${dist.region ? ` · ${dist.region}` : ''}`;
    const created = new Date(o.created_at).toLocaleString('de-AT', { dateStyle: 'medium', timeStyle: 'short' });

    const card = ce('div', { className: 'expand-card' });

    // Card header
    const cardHeader = ce('div', { className: 'expand-card__header' });
    cardHeader.append(
      ce('div', { className: 'expand-card__id', textContent: `Auftrag #${o.id}` }),
      ce('div', { className: 'expand-card__meta', textContent: `Erfasst am ${created}` }),
      ce('div', { className: 'expand-card__badges' }, [
        ce('span', { className: `badge badge--${o.source}`,   textContent: `${SOURCE_ICON[o.source] ?? '🌐'} ${SOURCE_LABEL[o.source] ?? o.source}` }),
        ce('span', { className: `badge badge--${o.priority}`, textContent: PRIORITY_LABEL[o.priority] ?? o.priority }),
        ce('span', { className: `badge badge--${o.status}`,   textContent: STATUS_LABEL[o.status] }),
      ]),
    );
    card.append(cardHeader);

    // Info grid
    const grid = ce('div', { className: 'expand-card__grid' });

    const infoBlock = (icon, title, lines) => {
      const block = ce('div', { className: 'expand-card__block' });
      block.append(ce('div', { className: 'expand-card__block-title' }, [
        ce('span', { textContent: icon }),
        ce('span', { textContent: ' ' + title }),
      ]));
      lines.forEach(([label, value]) => {
        if (!value) return;
        const row = ce('div', { className: 'expand-card__line' });
        row.append(
          ce('span', { className: 'expand-card__line-label', textContent: label }),
          ce('span', { className: 'expand-card__line-value', innerHTML: value }),
        );
        block.append(row);
      });
      return block;
    };

    grid.append(
      infoBlock('📋', 'Auftragsart', [
        ['Art / Leistung', this._esc(o.auftragsart || '—')],
        ...(o.entruempelung  ? [['Entrümpelung',   this._esc(o.entruempelung)]]  : []),
        ...(o.verlassenschaft? [['Verlassenschaft',this._esc(o.verlassenschaft)]]: []),
        ...(o.messie         ? [['Messie',          this._esc(o.messie)]]          : []),
        ...(o.umzug          ? [['Umzug',            this._esc(o.umzug)]]           : []),
        ...(o.geschaeft      ? [['Geschäft',         this._esc(o.geschaeft)]]      : []),
        ...(o.antiquitaeten  ? [['Antiquitäten',    this._esc(o.antiquitaeten)]]  : []),
      ]),
      infoBlock('👤', 'Kontaktperson', [
        ['Anrede',  this._esc(anrede || '—')],
        ['Name',    this._esc(o.caller_name || '—')],
        ['Telefon', o.telefon ? `<a href="tel:${this._esc(o.telefon)}" class="expand-card__link">${this._esc(o.telefon)}</a>` : '—'],
      ]),
      infoBlock('📍', 'Auftragsort', [
        ['Land',      this._esc(o.land || 'AT')],
        ['PLZ / Ort', this._esc(ortParts || '—')],
        ['Adresse',   this._esc(adresse  || '—')],
      ]),
      infoBlock('📅', 'Termin & Priorität', [
        ['Terminwunsch', this._esc(termin)],
        ['Priorität',    PRIORITY_LABEL[o.priority] ?? o.priority],
      ]),
      infoBlock('🏢', 'Distributor', [
        ['Zugewiesen an', this._esc(distStr)],
      ]),
    );

    if (o.anfrage) {
      grid.append(infoBlock('📝', 'Notiz', [
        ['Details', this._esc(o.anfrage).replace(/\n/g, '<br>')],
      ]));
    }

    card.append(grid);

    // Actions bar
    const actBar = ce('div', { className: 'expand-card__actions' });
    const editBtn = ce('button', {
      type: 'button', className: 'btn btn--primary btn--sm',
      textContent: '✏️ Bearbeiten', 'data-expand-edit': '1',
    });
    actBar.append(editBtn, ...this._buildActions(o));
    card.append(actBar);

    return card;
  }

  // ── Drawer shell (built once) ─────────────────────────────────

  _buildDrawer() {
    this._drawerOverlay = ce('div', { className: 'order-drawer-overlay' });
    this._drawerOverlay.addEventListener('click', () => this._closeDrawer());

    this._drawer = ce('div', {
      className:   'order-drawer',
      role:        'dialog',
      'aria-modal': 'true',
      'aria-label': 'Auftragsdetails',
    });

    const closeBtn = ce('button', {
      type: 'button', className: 'order-drawer__close',
      textContent: '✕', 'aria-label': 'Schließen',
    });
    closeBtn.addEventListener('click', () => this._closeDrawer());

    this._drawerHeader  = ce('div', { className: 'order-drawer__header' });
    this._drawerContent = ce('div', { className: 'order-drawer__content' });

    this._drawer.append(closeBtn, this._drawerHeader, this._drawerContent);
    document.body.append(this._drawerOverlay, this._drawer);
  }

  // ── View mode ────────────────────────────────────────────────

  _openDrawer(o, mode = 'edit') {
    // Expand rows handle view mode; drawer is edit-only
    mode === 'edit' ? this._renderEditMode(o) : this._renderViewMode(o);
    this._drawerOverlay.classList.add('order-drawer-overlay--visible');
    this._drawer.classList.add('order-drawer--open');
    document.body.style.overflow = 'hidden';
  }

  _renderViewMode(o) {
    const dist   = this._distMap.get(o.distributor_id);
    const anrede = ANREDE_LABEL[o.anrede] ?? '';
    const adresse = [o.strasse, o.adress_detail].filter(Boolean).join(' ');
    const ortParts = [o.plz, o.ort, o.bundesland, o.land !== 'AT' ? o.land : ''].filter(Boolean).join(' ');
    const termin = o.termin_wunsch
      ? new Date(o.termin_wunsch).toLocaleDateString('de-AT', { dateStyle: 'long' })
        + (o.termin_uhrzeit ? `, ${o.termin_uhrzeit} Uhr` : '')
      : '—';
    let distStr = '—';
    if (o.distributor_id === 'all') distStr = '📢 Offener Auftrag (alle)';
    else if (dist) distStr = `${dist.name}${dist.region ? ` · ${dist.region}` : ''}`;
    const created = new Date(o.created_at).toLocaleString('de-AT', { dateStyle: 'medium', timeStyle: 'short' });

    // Header
    this._drawerHeader.innerHTML = '';
    this._drawerHeader.append(
      ce('div', { className: 'order-drawer__id', textContent: `Auftrag #${o.id}` }),
      ce('div', { className: 'order-drawer__badges' }, [
        ce('span', { className: `badge badge--${o.source}`,   textContent: `${SOURCE_ICON[o.source] ?? '🌐'} ${SOURCE_LABEL[o.source] ?? o.source}` }),
        ce('span', { className: `badge badge--${o.priority}`, textContent: PRIORITY_LABEL[o.priority] ?? o.priority }),
        ce('span', { className: `badge badge--${o.status}`,   textContent: STATUS_LABEL[o.status] }),
      ]),
      ce('div', { className: 'order-drawer__meta', textContent: `Erfasst am ${created}` }),
    );

    // Content
    this._drawerContent.innerHTML = '';

    const sections = [
      { title: '📋 Auftragsart',   items: [{ label: 'Art / Leistung', value: o.auftragsart || '—' }] },
      {
        title: '👤 Kontaktperson',
        items: [
          { label: 'Anrede', value: anrede || '—' },
          { label: 'Name',   value: o.caller_name || '—' },
          { label: 'Telefon', value: o.telefon
              ? `<a href="tel:${this._esc(o.telefon)}" class="order-drawer__link">${this._esc(o.telefon)}</a>`
              : '—' },
        ],
      },
      {
        title: '📍 Auftragsort',
        items: [
          { label: 'Land',      value: o.land || 'AT'  },
          { label: 'PLZ / Ort', value: ortParts || '—' },
          { label: 'Adresse',   value: adresse || '—'  },
        ],
      },
      {
        title: '📅 Termin & Priorität',
        items: [
          { label: 'Terminwunsch', value: termin },
          { label: 'Priorität',    value: PRIORITY_LABEL[o.priority] ?? o.priority },
        ],
      },
      { title: '🏢 Distributor', items: [{ label: 'Zugewiesen an', value: distStr }] },
    ];
    if (o.anfrage) {
      sections.push({ title: '📝 Notiz', items: [{ label: 'Auftragsdetails', value: this._esc(o.anfrage).replace(/\n/g, '<br>') }] });
    }
    if (o.attachments?.length) {
      sections.push({ title: '📎 Anhänge', items: o.attachments.map(a => ({ label: 'Datei', value: this._esc(a) })) });
    }

    sections.forEach(sec => {
      const secEl = ce('div', { className: 'order-drawer__section' });
      const grid  = ce('div', { className: 'order-drawer__grid' });
      sec.items.forEach(({ label, value }) => {
        const item = ce('div', { className: 'order-drawer__item' });
        item.append(
          ce('div', { className: 'order-drawer__item-label', textContent: label }),
          ce('div', { className: 'order-drawer__item-value', innerHTML: value }),
        );
        grid.append(item);
      });
      secEl.append(
        ce('div', { className: 'order-drawer__section-title', textContent: sec.title }),
        grid,
      );
      this._drawerContent.append(secEl);
    });

    // Actions bar
    const bar = ce('div', { className: 'order-drawer__actions' });
    const editBtn = ce('button', { type: 'button', className: 'btn btn--primary btn--sm', textContent: '✏️ Bearbeiten' });
    editBtn.addEventListener('click', () => this._renderEditMode(o));
    bar.append(editBtn, ...this._buildActions(o));
    bar.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = Number(btn.dataset.id), action = btn.dataset.action;
      if (action === 'dispatch') { this._onDispatch?.(id); this._closeDrawer(); }
      if (action === 'accept')   { this._onAccept?.(id);   this._closeDrawer(); }
      if (action === 'decline')  { this._onDecline?.(id);  this._closeDrawer(); }
      if (action === 'delete')   { this._onDelete?.(id);   this._closeDrawer(); }
    });
    this._drawerContent.append(bar);
  }

  // ── Edit mode ────────────────────────────────────────────────

  _renderEditMode(o) {
    // Header stays, just update badge
    this._drawerHeader.innerHTML = '';
    this._drawerHeader.append(
      ce('div', { className: 'order-drawer__id', textContent: `Auftrag #${o.id} bearbeiten` }),
      ce('div', { className: 'order-drawer__meta', textContent: 'Alle Felder sind bearbeitbar · Änderungen mit Speichern bestätigen' }),
    );

    this._drawerContent.innerHTML = '';

    // ── Build the full edit form ─────────────────────────────
    const f = ce('div', { className: 'order-drawer__edit-form' });

    // Helper: section label
    const sec = (title) => {
      const el = ce('div', { className: 'order-drawer__section-title', textContent: title });
      return el;
    };
    // Helper: labeled input group
    const field = (label, input) => {
      const g = ce('div', { className: 'order-drawer__field' });
      g.append(ce('label', { className: 'form-label', textContent: label }), input);
      return g;
    };
    const inp = (attrs) => ce('input', { className: 'form-input', ...attrs });
    const sel = (name, options, current) => {
      const s = ce('select', { className: 'form-select', name });
      options.forEach(([val, lbl]) => {
        const opt = ce('option', { value: val, textContent: lbl });
        if (val === current) opt.selected = true;
        s.append(opt);
      });
      return s;
    };
    const textarea = (name, val) => ce('textarea', {
      className: 'form-textarea', name,
      textContent: val || '',
      style: 'min-height:80px',
    });

    // ── 1. Quelle ──────────────────────────────────────────
    f.append(sec('📡 Eingangskanal'));
    const sourceHidden = inp({ type: 'hidden', name: 'source', value: o.source });
    const sourceBtns   = SOURCES.map(s => {
      const b = ce('button', {
        type: 'button', className: 'form-toggle__btn' + (s.value === o.source ? ' form-toggle__btn--active' : ''),
        textContent: s.label,
      });
      b.dataset.source = s.value;
      return b;
    });
    sourceBtns.forEach(b => b.addEventListener('click', () => {
      sourceBtns.forEach(x => x.classList.remove('form-toggle__btn--active'));
      b.classList.add('form-toggle__btn--active');
      sourceHidden.value = b.dataset.source;
    }));
    f.append(ce('div', { className: 'form-group' }, [
      sourceHidden,
      ce('div', { className: 'form-toggle' }, sourceBtns),
    ]));

    // ── 2. Auftragsart (Chips) ──────────────────────────────
    f.append(sec('📋 Auftragsart'));
    const selectedArten = new Set(
      (o.auftragsart || '').split(',').map(s => s.trim()).filter(Boolean)
    );
    const auftragsartHidden = inp({ type: 'hidden', name: 'auftragsart', value: o.auftragsart || '' });
    const chipGrid = ce('div', { className: 'form-chip-grid' });
    AUFTRAGSARTEN.forEach(art => {
      const chip = ce('button', {
        type: 'button',
        className: 'form-chip' + (selectedArten.has(art) ? ' form-chip--active' : ''),
        textContent: art,
      });
      chip.addEventListener('click', () => {
        const active = chip.classList.toggle('form-chip--active');
        if (active) selectedArten.add(art); else selectedArten.delete(art);
        auftragsartHidden.value = [...selectedArten].join(', ');
      });
      chipGrid.append(chip);
    });
    f.append(auftragsartHidden);
    f.append(ce('div', { className: 'form-group' }, [chipGrid]));

    // ── 3. Ort ──────────────────────────────────────────────
    f.append(sec('📍 Auftragsort'));

    // Land toggles
    const landHidden = inp({ type: 'hidden', name: 'land', value: o.land || 'AT' });
    const landBtns = LAENDER.map(l => {
      const b = ce('button', {
        type: 'button',
        className: 'form-toggle__btn form-toggle__btn--sm' + ((o.land || 'AT') === l.value ? ' form-toggle__btn--active' : ''),
        textContent: l.label,
      });
      b.dataset.land = l.value;
      return b;
    });
    landBtns.forEach(b => b.addEventListener('click', () => {
      landBtns.forEach(x => x.classList.remove('form-toggle__btn--active'));
      b.classList.add('form-toggle__btn--active');
      landHidden.value = b.dataset.land;
    }));
    f.append(landHidden);
    f.append(ce('div', { className: 'form-group' }, [
      ce('div', { className: 'form-toggle form-toggle--wrap' }, landBtns),
    ]));

    // Ort + PLZ + Bundesland
    const ortInp = inp({ type: 'text', name: 'ort',  value: o.ort  || '', placeholder: 'Ort' });
    const plzInp = inp({ type: 'text', name: 'plz',  value: o.plz  || '', placeholder: 'PLZ' });
    const blSel  = sel('bundesland',
      [['', '— Bundesland —'], ...BUNDESLAENDER.map(b => [b, b])],
      o.bundesland || ''
    );
    f.append(ce('div', { className: 'form-row--3' }, [
      field('Ort',        ortInp),
      field('PLZ',        plzInp),
      field('Bundesland', blSel),
    ]));

    // Strasse + Nr/Stiege/Tür
    const strasseInp = inp({ type: 'text', name: 'strasse',       value: o.strasse       || '', placeholder: 'Straße / Gasse' });
    const addrInp    = inp({ type: 'text', name: 'adress_detail', value: o.adress_detail || '', placeholder: 'Nr. / Stiege / Tür' });
    f.append(ce('div', { className: 'form-row' }, [
      field('Straße', strasseInp),
      field('Hausnummer / Stiege / Tür', addrInp),
    ]));

    // ── 4. Kontaktperson ────────────────────────────────────
    f.append(sec('👤 Kontaktperson'));

    const anredeHidden = inp({ type: 'hidden', name: 'anrede', value: o.anrede || 'herr' });
    const anredeBtns = [
      { value: 'herr', label: 'Hr.' }, { value: 'frau', label: 'Fr.' }, { value: 'firma', label: 'Firma' },
    ].map(a => {
      const b = ce('button', {
        type: 'button',
        className: 'form-anrede__btn' + (a.value === (o.anrede || 'herr') ? ' form-anrede__btn--active' : ''),
        textContent: a.label,
      });
      b.dataset.anrede = a.value;
      return b;
    });
    anredeBtns.forEach(b => b.addEventListener('click', () => {
      anredeBtns.forEach(x => x.classList.remove('form-anrede__btn--active'));
      b.classList.add('form-anrede__btn--active');
      anredeHidden.value = b.dataset.anrede;
    }));

    const nameInp   = inp({ type: 'text', name: 'caller_name', value: o.caller_name || '', placeholder: 'Vor- und Nachname / Firmenname' });
    const telefonInp = inp({ type: 'tel',  name: 'telefon',     value: o.telefon     || '', placeholder: '+43 …' });

    const nameGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Anrede & Name' }),
      ce('div', { style: 'display:flex;flex-direction:column;gap:.5rem' }, [
        ce('div', { className: 'form-anrede' }, [anredeHidden, ...anredeBtns]),
        nameInp,
      ]),
    ]);
    const telGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Telefon' }),
      telefonInp,
    ]);
    f.append(ce('div', { className: 'form-row' }, [nameGroup, telGroup]));

    // ── 5. Notiz ────────────────────────────────────────────
    f.append(sec('📝 Notiz'));
    f.append(ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Auftragsdetails / Notizen' }),
      textarea('anfrage', o.anfrage),
    ]));

    // ── 6. Termin & Priorität ────────────────────────────────
    f.append(sec('📅 Termin & Priorität'));

    const datumInp   = inp({ type: 'date', name: 'termin_wunsch',  value: o.termin_wunsch  || '' });
    const uhrzeitInp = inp({ type: 'time', name: 'termin_uhrzeit', value: o.termin_uhrzeit || '' });
    f.append(ce('div', { className: 'form-row' }, [
      field('Datum (Terminwunsch)', datumInp),
      field('Uhrzeit', uhrzeitInp),
    ]));

    const prioHidden = inp({ type: 'hidden', name: 'priority', value: o.priority || 'normal' });
    const prioChips  = PRIORITIES.map(p => {
      const chip = ce('button', {
        type: 'button',
        className: 'form-prio-chip' + (p.value === (o.priority || 'normal') ? ' form-prio-chip--active' : ''),
        textContent: p.label,
      });
      chip.dataset.prio = p.value;
      return chip;
    });
    prioChips.forEach(chip => chip.addEventListener('click', () => {
      prioChips.forEach(c => c.classList.remove('form-prio-chip--active'));
      chip.classList.add('form-prio-chip--active');
      prioHidden.value = chip.dataset.prio;
    }));
    f.append(prioHidden);
    f.append(ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Priorität' }),
      ce('div', { className: 'form-prio-bar' }, prioChips),
    ]));

    // ── 7. Distributor ──────────────────────────────────────
    f.append(sec('🏢 Distributor'));
    const currentDist = o.distributor_id === 'all' ? 'all' : (o.distributor_id ? String(o.distributor_id) : '');
    const distOpts = [
      ['', '— Nicht zugewiesen —'],
      ['all', '📢 An alle freigeben (Offener Auftrag)'],
      ...this._distributors.filter(d => d.active).map(d => [
        String(d.id),
        `${d.name}${d.region ? ` · ${d.region}` : ''}${d.email ? ` (${d.email})` : ''}`,
      ]),
    ];
    const distSel = sel('distributor_id', distOpts, currentDist);
    f.append(ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Distributor' }),
      distSel,
    ]));

    // ── Status ──────────────────────────────────────────────
    f.append(sec('🔄 Status'));
    const statusSel = sel('status', [
      ['new',        '🆕 Neu'],
      ['dispatched', '📤 Versendet'],
      ['accepted',   '✅ Angenommen'],
      ['declined',   '❌ Abgelehnt'],
      ['completed',  '✔️ Abgeschlossen'],
    ], o.status);
    f.append(ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Status' }),
      statusSel,
    ]));

    this._drawerContent.append(f);

    // ── Save / Cancel bar ───────────────────────────────────
    const bar = ce('div', { className: 'order-drawer__actions' });

    const saveBtn = ce('button', { type: 'button', className: 'btn btn--primary btn--sm', textContent: '💾 Speichern' });
    saveBtn.addEventListener('click', () => {
      // Collect all values from the form
      const getVal = name => f.querySelector(`[name="${name}"]`)?.value?.trim() ?? '';
      const rawDist = getVal('distributor_id');
      const data = {
        source:         getVal('source'),
        auftragsart:    getVal('auftragsart'),
        anrede:         getVal('anrede'),
        land:           getVal('land'),
        ort:            getVal('ort'),
        plz:            getVal('plz'),
        bundesland:     getVal('bundesland'),
        strasse:        getVal('strasse'),
        adress_detail:  getVal('adress_detail'),
        caller_name:    getVal('caller_name'),
        telefon:        getVal('telefon'),
        anfrage:        f.querySelector('[name="anfrage"]')?.value?.trim() ?? '',
        priority:       getVal('priority'),
        termin_wunsch:  getVal('termin_wunsch'),
        termin_uhrzeit: getVal('termin_uhrzeit'),
        distributor_id: rawDist === 'all' ? 'all' : (rawDist ? Number(rawDist) : null),
        status:         getVal('status'),
      };
      this._onEdit?.(o.id, data);
    });

    const cancelBtn = ce('button', { type: 'button', className: 'btn btn--secondary btn--sm', textContent: 'Abbrechen' });
    cancelBtn.addEventListener('click', () => this._renderViewMode(o));

    bar.append(saveBtn, cancelBtn);
    this._drawerContent.append(bar);
  }

  // ── Close ────────────────────────────────────────────────────

  _closeDrawer() {
    this._drawer?.classList.remove('order-drawer--open');
    this._drawerOverlay?.classList.remove('order-drawer-overlay--visible');
    document.body.style.overflow = '';
    this._activeRow?.classList.remove('data-table__row--active');
    this._activeRow = null;
    this._currentOrder = null;
  }

  // ── Shared helpers ───────────────────────────────────────────

  _buildActions(o) {
    const id = o.id, btns = [];
    if (o.status === 'new' && o.distributor_id)
      btns.push(this._actionBtn('📤 Senden', 'btn--amber', 'dispatch', id));
    if (o.status === 'dispatched') {
      btns.push(this._actionBtn('✓ Angenommen', 'btn--success', 'accept',  id));
      btns.push(this._actionBtn('✗ Abgelehnt',  'btn--danger',  'decline', id));
    }
    if (o.status === 'accepted')
      btns.push(this._actionBtn('✓ Abschließen', 'btn--success', 'accept', id));
    btns.push(this._actionBtn('🗑️', 'btn--danger btn--icon', 'delete', id));
    return btns;
  }

  _actionBtn(label, cls, action, id) {
    return ce('button', {
      className: `btn btn--sm ${cls}`, type: 'button',
      textContent: label, 'data-action': action, 'data-id': String(id),
    });
  }

  _btn(label, cls, fn) {
    const btn = ce('button', { className: cls, type: 'button', textContent: label });
    btn.addEventListener('click', fn);
    return btn;
  }

  _esc(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  destroy() {
    this._closeDrawer();
    this._drawer?.remove();
    this._drawerOverlay?.remove();
    document.body.style.overflow = '';
    super.destroy();
  }

  onNew(fn)      { this._onNew      = fn; }
  onDispatch(fn) { this._onDispatch  = fn; }
  onAccept(fn)   { this._onAccept   = fn; }
  onDecline(fn)  { this._onDecline  = fn; }
  onDelete(fn)   { this._onDelete   = fn; }
  onEdit(fn)     { this._onEdit     = fn; }
}
