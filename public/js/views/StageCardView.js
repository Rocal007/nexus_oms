/**
 * StageCardView.js — Renders exactly ONE pipeline stage card.
 * Reusable: PipelineView creates one instance per stage.
 * Exposes setActive(bool) for active-state management by PipelineView.
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

export class StageCardView extends BaseView {
  /**
   * @param {HTMLElement}                               container
   * @param {import('../models/StageModel.js').Stage}   stage
   */
  constructor(container, stage) {
    super(container);
    this._stage = stage;
  }

  render() {
    const { id, icon, title, subtitle, desc, colorClass, tags, isCore } = this._stage;

    // Stage number badge (01, 02, …)
    const stageNum = ce('span', {
      className:   'stage-card__stage-num',
      textContent: String(id + 1).padStart(2, '0'),
    });

    // Icon wrapper with badge
    const iconEl = ce('div', { className: 'stage-card__icon' }, [
      stageNum,
      icon,
    ]);

    // Tags
    const tagEls = tags.map(t => ce('span', { className: 'tag', textContent: t }));
    const tagsEl = ce('div', { className: 'stage-card__tags' }, tagEls);

    // Compose card
    const classes = ['stage-card', colorClass, isCore ? 'stage-card--core' : ''].filter(Boolean);

    const card = ce('article', {
      className:     classes.join(' '),
      'data-stage-id': String(id),
      role:          'button',
      tabindex:      '0',
      'aria-label':  `Modul ${id + 1}: ${title}`,
    }, [
      ce('span', { className: 'stage-card__status', 'aria-hidden': 'true' }),
      iconEl,
      ce('h3',  { className: 'stage-card__title',    textContent: title    }),
      ce('div', { className: 'stage-card__subtitle', textContent: subtitle }),
      ce('p',   { className: 'stage-card__desc',     textContent: desc     }),
      tagsEl,
    ]);

    this.container.append(card);
    this.el = card;
    return card;
  }

  /**
   * Toggle the active CSS modifier.
   * Called by PipelineView on behalf of PipelineController.
   * @param {boolean} active
   */
  setActive(active) {
    this.el?.classList.toggle('stage-card--active', active);
  }
}
