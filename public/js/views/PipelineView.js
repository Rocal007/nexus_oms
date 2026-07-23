/**
 * PipelineView.js — Orchestrates StageCardView instances + row connectors.
 *
 * Layout decision (which stage IDs go in which row) lives here —
 * it is a VIEW concern, not a model concern.
 *
 * Owns its child StageCardView instances and destroys them on destroy().
 */
import { BaseView }      from './BaseView.js';
import { StageCardView } from './StageCardView.js';
import { ce }            from '../utils/DOMHelper.js';

/**
 * Row layout config — each sub-array is a row of stage IDs.
 * Changing the visual grouping only requires editing this constant.
 * @type {number[][]}
 */
const ROW_LAYOUT = [
  [0],       // Row 1: Input (full width)
  [1],       // Row 2: Parsing (full width)
  [2],       // Row 3: Dispatch CORE (full width, wide)
  [3, 4],    // Row 4: Distributors + Flow Control
  [5, 6, 7], // Row 5: Status + Monitoring + Reports
];

export class PipelineView extends BaseView {
  constructor(container) {
    super(container);
    /** @type {Map<number, StageCardView>} */
    this._cardViews = new Map();
  }

  /**
   * @param {import('../models/StageModel.js').Stage[]} stages
   * @returns {HTMLElement}
   */
  render(stages) {
    const stageMap = new Map(stages.map(s => [s.id, s]));

    const pipeline = ce('section', {
      className: 'pipeline fade-up',
      id:        'pipeline',
    });

    pipeline.append(
      ce('div', { className: 'section-label', textContent: 'Prozess-Pipeline · End-to-End-Durchlauf' }),
    );

    ROW_LAYOUT.forEach((rowIds, rowIndex) => {
      const row = ce('div', { className: 'stage-row' });

      rowIds.forEach(id => {
        const stage    = stageMap.get(id);
        const cardView = new StageCardView(row, stage);
        cardView.render();
        this._cardViews.set(id, cardView);
      });

      pipeline.append(row);

      // Connector between rows — not after the last row
      if (rowIndex < ROW_LAYOUT.length - 1) {
        pipeline.append(this._buildConnector());
      }
    });

    this.container.append(pipeline);
    this.el = pipeline;
    return pipeline;
  }

  /**
   * Set the active state on a card. Deactivates all others.
   * @param {number}  id
   * @param {boolean} active
   */
  setCardActive(id, active) {
    this._cardViews.forEach((view, cardId) => {
      view.setActive(active && cardId === id);
    });
  }

  /** @returns {HTMLElement} */
  _buildConnector() {
    return ce('div', { className: 'v-connector', 'aria-hidden': 'true' }, [
      ce('div', { className: 'v-connector__arrow', textContent: '↓' }),
    ]);
  }

  destroy() {
    this._cardViews.forEach(v => v.destroy());
    this._cardViews.clear();
    super.destroy();
  }
}
