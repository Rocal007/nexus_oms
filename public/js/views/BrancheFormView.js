/**
 * BrancheFormView.js — Create / edit Branche form.
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

export class BrancheFormView extends BaseView {
  /**
   * @param {HTMLElement} container
   * @param {import('../models/BrancheModel.js').Branche|null} branche
   */
  constructor(container, branche = null) {
    super(container);
    this._branche   = branche;
    this._onSave    = null;
    this._onCancel  = null;
    this._isEdit    = branche !== null;
  }

  render() {
    const b = this._branche ?? {};

    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: this._isEdit ? 'Branche bearbeiten' : 'Neue Branche anlegen' }),
      ]),
    ]);

    const form = ce('form', { className: 'form-card', novalidate: '' });

    // Name & Icon
    form.append(
      this._row(
        this._group('Name der Branche', 'name', 'text', b.name ?? '', true, 'z.B. Umzug, Gartenpflege'),
        this._group('Icon (Emoji)', 'icon', 'text', b.icon ?? '🏷️', true, 'z.B. 🚚, 🌳')
      ),
      this._group('Beschreibung', 'description', 'text', b.description ?? '', false),
      this._group('Design-Farbe (CSS var oder HEX)', 'color', 'text', b.color ?? 'var(--accent-cyan)', false, 'z.B. var(--accent-violet) oder #ff0000')
    );

    // Actions
    const actions = ce('div', { className: 'form-actions' }, [
      this._buildBtn(this._isEdit ? '💾 Speichern' : '＋ Anlegen', 'btn btn--primary', () => this._submit(form)),
      this._buildBtn('Abbrechen', 'btn btn--secondary', () => this._onCancel?.()),
    ]);
    form.append(actions);

    form.addEventListener('submit', e => { e.preventDefault(); this._submit(form); });

    const wrapper = ce('div', {});
    wrapper.append(header, form);
    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  _submit(form) {
    const inputs = form.querySelectorAll('[required]');
    for (const inp of inputs) {
      if (!inp.value.trim()) { inp.focus(); return; }
    }
    const data = {
      name:        form.querySelector('[name="name"]').value.trim(),
      icon:        form.querySelector('[name="icon"]').value.trim(),
      description: form.querySelector('[name="description"]').value.trim(),
      color:       form.querySelector('[name="color"]').value.trim(),
    };
    if (this._isEdit) data.id = this._branche.id;
    this._onSave?.(data);
  }

  _group(label, name, type, value, required, hint = '') {
    const labelEl = ce('label', { className: `form-label${required ? ' form-label--required' : ''}`, textContent: label });
    const input   = ce('input', { className: 'form-input', type, name, value });
    if (required) input.setAttribute('required', '');
    const children = [labelEl, input];
    if (hint) children.push(ce('span', { className: 'form-hint', textContent: hint }));
    return ce('div', { className: 'form-group' }, children);
  }

  _row(...groups) {
    return ce('div', { className: 'form-row' }, groups);
  }

  _buildBtn(label, cls, fn) {
    const btn = ce('button', { className: cls, type: 'button', textContent: label });
    btn.addEventListener('click', fn);
    return btn;
  }

  onSave(fn)   { this._onSave   = fn; }
  onCancel(fn) { this._onCancel = fn; }
}
