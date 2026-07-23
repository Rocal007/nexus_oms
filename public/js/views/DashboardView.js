/**
 * DashboardView.js — Composes all architecture overview views into one page.
 * Owns child views + PipelineController. Destroys them on destroy().
 */
import { BaseView }          from './BaseView.js';
import { HeroView }          from './HeroView.js';
import { MetricsView }       from './MetricsView.js';
import { PipelineView }      from './PipelineView.js';
import { DetailPanelView }   from './DetailPanelView.js';
import { FlowMapView }       from './FlowMapView.js';
import { MetricsModel }      from '../models/MetricsModel.js';
import { StageModel }        from '../models/StageModel.js';
import { PipelineController } from '../controllers/PipelineController.js';
import { createScrollFadeObserver } from '../utils/AnimationHelper.js';
import { ce }                from '../utils/DOMHelper.js';

export class DashboardView extends BaseView {
  constructor(container) {
    super(container);
    /** @type {import('./BaseView.js').BaseView[]} */
    this._children = [];
    this._pipelineCtrl = null;
    this._scrollFade   = null;
  }

  render() {
    const wrap = ce('div', { className: 'page-wrapper' });

    // Hero
    const heroView = new HeroView(wrap);
    heroView.render();
    this._children.push(heroView);

    // Metrics
    const metricsView = new MetricsView(wrap);
    metricsView.render(MetricsModel.getAll());
    this._children.push(metricsView);

    // Pipeline + detail panel share a wrapper
    const pipelineSection = ce('div', {});
    wrap.append(pipelineSection);

    const detailPanelView = new DetailPanelView(pipelineSection);
    this._children.push(detailPanelView);

    const pipelineView = new PipelineView(pipelineSection);
    pipelineView.render(StageModel.getAll());
    this._children.push(pipelineView);

    // Flow map
    const flowMapView = new FlowMapView(wrap);
    flowMapView.render();
    this._children.push(flowMapView);

    // Footer
    const footer = ce('footer', { className: 'site-footer' });
    footer.innerHTML = '<div class="footer-brand"><span>NEXUS</span>-OMS · Architektur-Übersicht</div><div class="footer-copy">© 2026 · v1.0.0</div>';
    wrap.append(footer);

    // Pipeline interaction
    this._pipelineCtrl = new PipelineController(pipelineView, detailPanelView);
    this._pipelineCtrl.bind();

    // Scroll animations
    this._scrollFade = createScrollFadeObserver();

    this.container.append(wrap);
    this.el = wrap;
    return wrap;
  }

  destroy() {
    this._pipelineCtrl?.destroy();
    this._scrollFade?.destroy();
    this._children.forEach(v => v.destroy());
    this._children      = [];
    this._pipelineCtrl  = null;
    this._scrollFade    = null;
    super.destroy();
  }
}
