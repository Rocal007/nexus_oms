/**
 * MetricsView.js — Renders the KPI metrics bar.
 * Receives data from AppController. No model imports.
 */
import { BaseView }  from './BaseView.js';
import { ce, setCssVar } from '../utils/DOMHelper.js';

export class MetricsView extends BaseView {
  /**
   * @param {import('../models/MetricsModel.js').Metric[]} metrics
   */
  render(metrics) {
    const cards = metrics.map(m => {
      const card = ce('div', { className: 'metric-card' }, [
        ce('div', { className: 'metric-card__value', textContent: m.value }),
        ce('div', { className: 'metric-card__label', textContent: m.label }),
        ce('div', { className: 'metric-card__delta', textContent: m.delta }),
      ]);
      // CSS custom property drives the accent color via pipeline-card.css
      setCssVar(card, '--metric-color', m.color);
      return card;
    });

    const bar = ce('section', { className: 'metrics-bar fade-up' }, cards);
    this.container.append(bar);
    this.el = bar;
    return bar;
  }
}
