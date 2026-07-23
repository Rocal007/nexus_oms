/**
 * FlowMapView.js — Renders the SVG system flow map diagram.
 *
 * All SVG node creation is delegated to SVGBuilder.
 * No raw SVG strings, no createElementNS calls in this file.
 * Node definitions are co-located here as view config (not model data).
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';
import {
  svgRoot, svgDefs, svgStyle, svgGlowFilter,
  svgMarker, svgRect, svgText, svgLine, svgPath, svgGroup,
} from '../utils/SVGBuilder.js';

// ── View-level config (presentation data, not business data) ──

/**
 * @typedef {{ x:number, y:number, w:number, h:number,
 *             stroke:string, fill:string, icon:string,
 *             label:string, sub:string, tag?:string }} FlowNode
 */

/** @type {FlowNode[]} */
const FLOW_NODES = [
  { x: 10,  y: 80,  w: 110, h: 60,  stroke: '#38bdf8', fill: 'rgba(56,189,248,0.1)',   icon: '📧', label: 'Input',           sub: 'E-Mail'              },
  { x: 155, y: 80,  w: 110, h: 60,  stroke: '#2dd4bf', fill: 'rgba(45,212,191,0.1)',   icon: '🔍', label: 'Parsing',          sub: 'Validierung'          },
  { x: 300, y: 60,  w: 140, h: 100, stroke: '#a78bfa', fill: 'rgba(167,139,250,0.12)', icon: '⚡', label: 'NEXUS-Dispatch',   sub: 'Zentrale Verteilung', tag: 'CORE ENGINE' },
  { x: 490, y: 50,  w: 120, h: 55,  stroke: '#fbbf24', fill: 'rgba(251,191,36,0.1)',   icon: '🏭', label: 'Distributoren',    sub: 'Ext. Auftragnehmer'  },
  { x: 490, y: 115, w: 120, h: 55,  stroke: '#fb7185', fill: 'rgba(251,113,133,0.1)',  icon: '⏱️', label: 'Ablaufkontrolle',  sub: 'Fristen & Telemetrie'},
  { x: 650, y: 50,  w: 115, h: 55,  stroke: '#4ade80', fill: 'rgba(74,222,128,0.1)',   icon: '📡', label: 'Status-Feedback',  sub: 'Echtzeit'            },
  { x: 650, y: 82,  w: 115, h: 55,  stroke: '#38bdf8', fill: 'rgba(56,189,248,0.1)',   icon: '🔄', label: 'Monitoring',       sub: 'Re-Dispatch'          },
  { x: 650, y: 145, w: 115, h: 55,  stroke: '#a78bfa', fill: 'rgba(167,139,250,0.1)',  icon: '📊', label: 'Berichtswesen',    sub: 'Reports & KPI'        },
];

/** @type {{ type: 'line'|'rect', stroke: string, fill?: string, label: string }[]} */
const LEGEND_ITEMS = [
  { type: 'line', stroke: '#38bdf8',                            label: 'Primär-Datenfluss'         },
  { type: 'line', stroke: '#4ade80',                            label: 'Re-Dispatch / Rückkopplung' },
  { type: 'rect', fill: 'rgba(167,139,250,0.2)', stroke: '#a78bfa', label: 'Core Engine'            },
  { type: 'rect', fill: 'rgba(56,189,248,0.2)',  stroke: '#38bdf8', label: 'Input / Output'         },
  { type: 'rect', fill: 'rgba(251,191,36,0.2)',  stroke: '#fbbf24', label: 'Ext. Auftragnehmer'     },
  { type: 'rect', fill: 'rgba(251,113,133,0.2)', stroke: '#fb7185', label: 'Überwachung & Kontrolle'},
];

// SVG inline styles — scoped to the SVG, keyframes in animations.css
const SVG_CSS = `
  .svg-flow-line      { stroke-dasharray: 6,4; animation: svg-dash      1.5s linear infinite; }
  .svg-flow-line--back { stroke-dasharray: 6,4; animation: svg-dash-back 2s   linear infinite; }
`;

export class FlowMapView extends BaseView {
  render() {
    const section   = ce('section', { className: 'flowmap-section fade-up' });
    const label     = ce('div', { className: 'section-label', textContent: 'Systemfluss-Karte · Schematische Übersicht' });
    const container = ce('div', { className: 'flowmap-container' });
    const wrap      = ce('div', { className: 'flowmap-svg-wrap' });

    const svg = svgRoot('0 0 1100 220');

    svg.append(svgDefs([
      svgStyle(SVG_CSS),
      svgGlowFilter('glow'),
      svgMarker('arrow',      7, 3, 'M0,0 L0,6 L8,3 z', '#38bdf8'),
      svgMarker('arrow-back', 1, 3, 'M8,0 L8,6 L0,3 z', '#4ade80'),
    ]));

    // Nodes
    FLOW_NODES.forEach(n => svg.append(this._buildNode(n)));

    // Connections
    svg.append(
      svgLine({ class: 'svg-flow-line', x1: 120, y1: 110, x2: 154, y2: 110, stroke: '#38bdf8', 'stroke-width': 1.5, 'marker-end': 'url(#arrow)' }),
      svgLine({ class: 'svg-flow-line', x1: 265, y1: 110, x2: 299, y2: 110, stroke: '#2dd4bf', 'stroke-width': 1.5, 'marker-end': 'url(#arrow)' }),
      svgLine({ class: 'svg-flow-line', x1: 440, y1: 90,  x2: 489, y2: 80,  stroke: '#fbbf24', 'stroke-width': 1.5, 'marker-end': 'url(#arrow)' }),
      svgLine({ class: 'svg-flow-line', x1: 440, y1: 130, x2: 489, y2: 140, stroke: '#fb7185', 'stroke-width': 1.5, 'marker-end': 'url(#arrow)' }),
      svgLine({ class: 'svg-flow-line', x1: 610, y1: 77,  x2: 649, y2: 77,  stroke: '#4ade80', 'stroke-width': 1.5, 'marker-end': 'url(#arrow)' }),
      svgLine({ class: 'svg-flow-line', x1: 610, y1: 143, x2: 649, y2: 103, stroke: '#38bdf8', 'stroke-width': 1.5, 'marker-end': 'url(#arrow)' }),
      svgLine({ class: 'svg-flow-line', x1: 610, y1: 143, x2: 649, y2: 155, stroke: '#a78bfa', 'stroke-width': 1.5, 'marker-end': 'url(#arrow)' }),
    );

    // Re-Dispatch feedback loop arc
    svg.append(
      svgPath(
        'M765 109 C860 109 860 30 370 30 C340 30 330 60 330 60',
        {
          class: 'svg-flow-line--back',
          fill:             'none',
          stroke:           '#4ade80',
          'stroke-width':   1.2,
          'stroke-dasharray': '5,4',
          'marker-end':     'url(#arrow-back)',
          opacity:          '0.6',
        },
      ),
      svgText('Re-Dispatch Loop', {
        x: 580, y: 24,
        'text-anchor': 'middle',
        fill: '#4ade80',
        'font-size': 7.5,
        'font-family': 'JetBrains Mono,monospace',
        opacity: '0.7',
      }),
    );

    // Legend
    svg.append(this._buildLegend());

    wrap.append(svg);
    container.append(wrap);
    section.append(label, container);
    this.container.append(section);
    this.el = section;
    return section;
  }

  // ── Private helpers ─────────────────────────────────────────

  /** @param {FlowNode} n */
  _buildNode(n) {
    const cx = n.x + n.w / 2;
    const cy = n.y + n.h / 2;

    const rect = svgRect({
      x: n.x, y: n.y, width: n.w, height: n.h, rx: 10,
      fill: n.fill, stroke: n.stroke,
      'stroke-width': n.tag ? 1.8 : 1.2,
      filter: 'url(#glow)',
    });

    const icon = svgText(n.icon, {
      x: cx, y: cy - 8,
      'text-anchor': 'middle',
      fill: n.stroke,
      'font-size': n.tag ? 22 : 18,
    });

    const label = svgText(n.label, {
      x: cx, y: cy + 12,
      'text-anchor': 'middle',
      fill: '#e2e8f0',
      'font-size': n.tag ? 9.5 : 9,
      'font-family': 'Inter,sans-serif',
      'font-weight': n.tag ? 700 : 600,
    });

    const sub = svgText(n.sub, {
      x: cx, y: cy + 24,
      'text-anchor': 'middle',
      fill: '#94a3b8',
      'font-size': 7.5,
      'font-family': 'JetBrains Mono,monospace',
    });

    const children = [rect, icon, label, sub];

    if (n.tag) {
      children.push(svgText(n.tag, {
        x: cx, y: cy + 37,
        'text-anchor': 'middle',
        fill: n.stroke,
        'font-size': 7,
        'font-family': 'JetBrains Mono,monospace',
      }));
    }

    return svgGroup(children);
  }

  _buildLegend() {
    const bg      = svgRect({ x: 800, y: 40, width: 280, height: 150, rx: 10, fill: 'rgba(13,21,41,0.7)', stroke: 'rgba(56,189,248,0.15)', 'stroke-width': 1 });
    const heading = svgText('LEGENDE', { x: 815, y: 60, fill: '#94a3b8', 'font-size': 8, 'font-family': 'Inter,sans-serif', 'font-weight': 700, 'letter-spacing': 1 });

    const items = LEGEND_ITEMS.map((item, i) => {
      const yBase = 73 + i * 17;
      const labelEl = svgText(item.label, { x: 848, y: yBase + 3, fill: '#94a3b8', 'font-size': 8, 'font-family': 'Inter,sans-serif' });

      const marker = item.type === 'line'
        ? svgLine({ x1: 815, y1: yBase, x2: 840, y2: yBase, stroke: item.stroke, 'stroke-width': 1.5, 'stroke-dasharray': '5,3' })
        : svgRect({ x: 815, y: yBase - 7, width: 10, height: 10, rx: 2, fill: item.fill, stroke: item.stroke, 'stroke-width': 1 });

      return svgGroup([marker, labelEl]);
    });

    return svgGroup([bg, heading, ...items]);
  }
}
