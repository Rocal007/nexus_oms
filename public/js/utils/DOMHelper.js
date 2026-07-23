/**
 * DOMHelper.js — Pure DOM utility functions.
 * No state, no side effects, no imports.
 * Every function is a pure utility — import and use anywhere.
 */

/**
 * Shorthand querySelector.
 * @param {string}            sel
 * @param {Element|Document}  [ctx=document]
 * @returns {Element|null}
 */
export const qs = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Shorthand querySelectorAll → real Array.
 * @param {string}            sel
 * @param {Element|Document}  [ctx=document]
 * @returns {Element[]}
 */
export const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Create element with attributes and optional children.
 *
 * Special attribute keys:
 *   className   → el.className
 *   innerHTML   → el.innerHTML  (use with trusted content only)
 *   textContent → el.textContent
 *   data-*      → el.dataset (camelCased)
 *   style.*     → el.style[prop]
 *   anything else → el.setAttribute(k, v)
 *
 * @param {string}                    tag
 * @param {Record<string,string>}     [attrs={}]
 * @param {(string|Node)[]}           [children=[]]
 * @returns {HTMLElement}
 */
export function ce(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  for (const [k, v] of Object.entries(attrs)) {
    switch (k) {
      case 'className':   el.className   = v; break;
      case 'innerHTML':   el.innerHTML   = v; break;
      case 'textContent': el.textContent = v; break;
      default:
        if (k.startsWith('data-')) {
          // data-stage-id → dataset.stageId
          const key = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          el.dataset[key] = v;
        } else if (k.startsWith('style.')) {
          el.style[k.slice(6)] = v;
        } else {
          el.setAttribute(k, v);
        }
    }
  }

  for (const child of children) {
    if (child == null) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }

  return el;
}

/**
 * Add event listener. Returns an unsubscribe function.
 * @param {EventTarget}  el
 * @param {string}       event
 * @param {Function}     fn
 * @param {*}            [opts]
 * @returns {() => void}
 */
export function on(el, event, fn, opts) {
  el.addEventListener(event, fn, opts);
  return () => el.removeEventListener(event, fn, opts);
}

/**
 * Remove all children of an element.
 * @param {Element} el
 */
export function empty(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/**
 * Set a CSS custom property on an element.
 * @param {HTMLElement} el
 * @param {string}      name   e.g. '--metric-color'
 * @param {string}      value
 */
export function setCssVar(el, name, value) {
  el.style.setProperty(name, value);
}
