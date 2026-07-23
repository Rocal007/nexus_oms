/**
 * DetailPanelView.js — Expandable stage detail panel.
 *
 * Lifecycle:
 *   new DetailPanelView(container) → _init() builds the DOM shell once.
 *   show(stage)                    → populates & reveals panel.
 *   hide()                         → hides panel.
 *   onClose(fn)                    → register close-button callback.
 *   destroy()                      → removes panel, clears references.
 *
 * Does NOT import models. Receives Stage data objects from the controller.
 */
import { BaseView }    from './BaseView.js';
import { ce, empty }   from '../utils/DOMHelper.js';

export class DetailPanelView extends BaseView {
  constructor(container) {
    super(container);

    /** @type {Function|null} */
    this._onCloseCallback = null;

    // Build the persistent DOM shell immediately
    this._buildShell();
  }

  // ── Private: build DOM shell (called once in constructor) ──

  _buildShell() {
    // Icon + title + code
    this._iconEl  = ce('div', { className: 'detail-panel__icon', 'aria-hidden': 'true' });
    this._titleEl = ce('div', { className: 'detail-panel__title' });
    this._codeEl  = ce('div', { className: 'detail-panel__code' });

    const titleGroup = ce('div', { className: 'detail-panel__title-group' }, [
      this._iconEl,
      ce('div', {}, [this._titleEl, this._codeEl]),
    ]);

    // Close button
    const closeBtn = ce('button', {
      className:   'detail-panel__close',
      type:        'button',
      'aria-label': 'Detail-Panel schließen',
      textContent: '✕',
    });
    closeBtn.addEventListener('click', () => this._onCloseCallback?.());

    const header = ce('div', { className: 'detail-panel__header' }, [titleGroup, closeBtn]);

    // Detail grid (populated in show())
    this._grid = ce('div', { className: 'detail-panel__grid', role: 'list' });

    const panel = ce('div', {
      className:   'detail-panel',
      id:          'detail-panel',
      role:        'region',
      'aria-label': 'Modul-Details',
    }, [header, this._grid]);

    // Prepend so it appears above the pipeline cards
    this.container.prepend(panel);
    this.el = panel;
  }

  // ── Public API ──────────────────────────────────────────────

  /**
   * Populate and reveal the panel with stage data.
   * @param {import('../models/StageModel.js').Stage} stage
   */
  show(stage) {
    // Icon
    this._iconEl.textContent       = stage.icon;
    this._iconEl.style.background  = stage.bgColor;
    this._iconEl.style.border      = `1px solid ${stage.accent}`;
    this._iconEl.style.borderRadius = 'var(--radius-lg)';

    // Header text
    this._titleEl.textContent = stage.title;
    this._codeEl.textContent  = `${stage.subtitle} · STAGE ${String(stage.id + 1).padStart(2, '0')}`;

    // Detail items
    empty(this._grid);
    stage.details.forEach(({ label, value }) => {
      const item = ce('div', { className: 'detail-item', role: 'listitem' }, [
        ce('div', { className: 'detail-item__label', textContent: label }),
        ce('div', { className: 'detail-item__value', innerHTML: value }),
      ]);
      this._grid.append(item);
    });

    this.el.classList.add('detail-panel--visible');
    this.el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /** Hide the panel without destroying its DOM. */
  hide() {
    this.el.classList.remove('detail-panel--visible');
  }

  /**
   * Register the close-button callback.
   * Controller passes its own handler here.
   * @param {() => void} fn
   */
  onClose(fn) {
    this._onCloseCallback = fn;
  }

  destroy() {
    this._onCloseCallback = null;
    super.destroy();
  }
}
