/**
 * SVGBuilder.js — Factory functions for SVG DOM nodes.
 * The ONLY place in the codebase where SVG elements are created.
 * Views import these builders — no raw SVG markup strings in views.
 */

/** SVG namespace constant */
const NS = 'http://www.w3.org/2000/svg';

/**
 * Create a namespaced SVG element with attributes.
 * @param {string}                        tag
 * @param {Record<string, string|number>} [attrs={}]
 * @returns {SVGElement}
 */
export function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el;
}

/** SVG <rect> */
export const svgRect   = (attrs)        => svgEl('rect',   attrs);

/** SVG <line> */
export const svgLine   = (attrs)        => svgEl('line',   attrs);

/** SVG <circle> */
export const svgCircle = (attrs)        => svgEl('circle', attrs);

/** SVG <path> with explicit `d` attribute */
export const svgPath   = (d, attrs = {}) => svgEl('path', { d, ...attrs });

/**
 * SVG <text> with text content.
 * @param {string}                        content
 * @param {Record<string, string|number>} [attrs={}]
 */
export function svgText(content, attrs = {}) {
  const el = svgEl('text', attrs);
  el.textContent = content;
  return el;
}

/**
 * SVG <g> group containing children.
 * @param {SVGElement[]} children
 * @param {Record<string, string|number>} [attrs={}]
 */
export function svgGroup(children = [], attrs = {}) {
  const g = svgEl('g', attrs);
  children.forEach(c => g.append(c));
  return g;
}

/**
 * SVG <marker> for arrowheads.
 * @param {string} id
 * @param {number} refX
 * @param {number} refY
 * @param {string} pathD  — path `d` attribute for the arrowhead shape
 * @param {string} color
 */
export function svgMarker(id, refX, refY, pathD, color) {
  const marker = svgEl('marker', {
    id,
    markerWidth:  8,
    markerHeight: 8,
    refX,
    refY,
    orient: 'auto',
  });
  marker.append(svgPath(pathD, { fill: color, opacity: '0.7' }));
  return marker;
}

/**
 * SVG root <svg> element.
 * @param {string} viewBox
 * @param {Record<string, string|number>} [attrs={}]
 */
export function svgRoot(viewBox, attrs = {}) {
  return svgEl('svg', { viewBox, width: '100%', xmlns: NS, ...attrs });
}

/**
 * SVG <defs> containing child elements.
 * @param {SVGElement[]} children
 */
export function svgDefs(children = []) {
  const defs = svgEl('defs');
  children.forEach(c => defs.append(c));
  return defs;
}

/**
 * Inline <style> block inside SVG.
 * @param {string} css
 */
export function svgStyle(css) {
  const el = svgEl('style');
  el.textContent = css;
  return el;
}

/**
 * Drop-shadow / glow <filter>.
 * @param {string} [id='glow']
 * @param {number} [stdDeviation=3]
 */
export function svgGlowFilter(id = 'glow', stdDeviation = 3) {
  const filter = svgEl('filter', { id });
  const blur   = svgEl('feGaussianBlur', { stdDeviation, result: 'coloredBlur' });
  const merge  = svgEl('feMerge');
  merge.append(svgEl('feMergeNode', { in: 'coloredBlur' }));
  merge.append(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  filter.append(blur, merge);
  return filter;
}
