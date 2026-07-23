/**
 * PipelineController.js — Manages all pipeline interaction logic.
 *
 * Responsibilities:
 *   - Event delegation on the pipeline container (one listener, not N)
 *   - Mediates between StageModel (data) and PipelineView + DetailPanelView (display)
 *   - Keyboard accessibility (Enter / Space on cards)
 *
 * Does NOT touch the DOM directly. Calls view methods only.
 */
import { StageModel } from '../models/StageModel.js';

export class PipelineController {
  /**
   * @param {import('../views/PipelineView.js').PipelineView}          pipelineView
   * @param {import('../views/DetailPanelView.js').DetailPanelView}     detailPanelView
   */
  constructor(pipelineView, detailPanelView) {
    this._pipelineView    = pipelineView;
    this._detailPanelView = detailPanelView;
    this._activeId        = null;

    // Bind once so we can remove the exact same reference later
    this._onClickBound   = this._onPipelineClick.bind(this);
    this._onKeydownBound = this._onPipelineKeydown.bind(this);
  }

  /**
   * Attach event listeners.
   * Call after views have been rendered.
   */
  bind() {
    const el = this._pipelineView.el;
    el.addEventListener('click',   this._onClickBound);
    el.addEventListener('keydown', this._onKeydownBound);

    // Register close handler in the view
    this._detailPanelView.onClose(() => this._closeDetail());
  }

  /** Remove event listeners. */
  unbind() {
    const el = this._pipelineView.el;
    el.removeEventListener('click',   this._onClickBound);
    el.removeEventListener('keydown', this._onKeydownBound);
  }

  // ── Private: event handlers ─────────────────────────────────

  /** @param {MouseEvent} e */
  _onPipelineClick(e) {
    const card = e.target.closest('[data-stage-id]');
    if (!card) return;
    this._toggleDetail(Number(card.dataset.stageId));
  }

  /** @param {KeyboardEvent} e */
  _onPipelineKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-stage-id]');
    if (!card) return;
    e.preventDefault();
    this._toggleDetail(Number(card.dataset.stageId));
  }

  // ── Private: state transitions ──────────────────────────────

  /** @param {number} id */
  _toggleDetail(id) {
    // Clicking the active card closes the panel
    if (this._activeId === id) {
      this._closeDetail();
      return;
    }
    this._openDetail(id);
  }

  /** @param {number} id */
  _openDetail(id) {
    const stage = StageModel.getById(id);
    if (!stage) return;

    this._activeId = id;
    this._pipelineView.setCardActive(id, true);
    this._detailPanelView.show(stage);
  }

  _closeDetail() {
    if (this._activeId !== null) {
      this._pipelineView.setCardActive(this._activeId, false);
    }
    this._activeId = null;
    this._detailPanelView.hide();
  }

  destroy() {
    this.unbind();
    this._activeId = null;
  }
}
