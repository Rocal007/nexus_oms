/**
 * DistributorFormView.js — Create / edit distributor form.
 * Mode determined by presence of initial data.
 * Callbacks: onSave(formData), onCancel().
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

export class DistributorFormView extends BaseView {
  /**
   * @param {HTMLElement} container
   * @param {import('../models/DistributorModel.js').Distributor|null} distributor
   */
  constructor(container, distributor = null) {
    super(container);
    this._distributor = distributor;
    this._onSave      = null;
    this._onCancel    = null;
    this._isEdit      = distributor !== null;
  }

  /**
   * @param {import('../models/BrancheModel.js').Branche[]} branchen
   */
  render(branchen = []) {
    const d = this._distributor ?? {};

    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: this._isEdit ? 'Distributor bearbeiten' : 'Distributor anlegen' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'MODULE::DISTRIBUTOR_LAYER' }),
      ]),
    ]);

    const form = ce('form', { className: 'form-card', novalidate: '' });

    // Branchen-Zuweisung (Mehrfachauswahl)
    const branchenSection = ce('div', { className: 'form-section-title', textContent: 'Branchen-Zuordnung' });
    const selectedBranchen = new Set(d.branche_ids ?? []);
    
    const chipGrid = ce('div', { className: 'form-chip-grid' });
    branchen.forEach(b => {
      const chip = ce('button', {
        type: 'button',
        className: 'form-chip' + (selectedBranchen.has(b.id) ? ' form-chip--active' : ''),
        textContent: `${b.icon} ${b.name}`,
      });
      chip.dataset.brancheId = b.id;
      chip.addEventListener('click', () => {
        const active = chip.classList.toggle('form-chip--active');
        if (active) selectedBranchen.add(b.id);
        else selectedBranchen.delete(b.id);
      });
      chipGrid.append(chip);
    });
    const branchenGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Zuständige Branchen' }),
      chipGrid
    ]);

    form.append(
      this._group('Name', 'name', 'text', d.name ?? '', true),
      this._row(
        this._group('E-Mail-Adresse', 'email', 'email', d.email ?? '', true),
        this._group('Telefon', 'phone', 'tel', d.phone ?? '', true),
      ),
      this._group('Region / Gebiet', 'region', 'text', d.region ?? '', false, 'z. B. Wien, Niederösterreich'),
      branchenSection,
      branchenGroup
    );

    // Active toggle
    const activeSection = ce('div', { className: 'form-section-title', textContent: 'Status' });
    const activeGroup = ce('div', { className: 'form-group' }, [
      ce('label', { className: 'form-label', textContent: 'Distributor ist aktiv' }),
      this._buildActiveToggle(d.active !== false),
    ]);
    form.append(activeSection, activeGroup);

    // Actions
    const actions = ce('div', { className: 'form-actions' }, [
      this._buildBtn(this._isEdit ? '💾 Speichern' : '＋ Anlegen', 'btn btn--primary', () => this._submit(form)),
      this._buildBtn('Abbrechen', 'btn btn--secondary', () => this._onCancel?.()),
    ]);
    form.append(actions);

    // Submit via Enter
    form.addEventListener('submit', e => { e.preventDefault(); this._submit(form); });

    const wrapper = ce('div', {});
    wrapper.append(header, form);
    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  _submit(form) {
    // HTML5 validation
    const inputs = form.querySelectorAll('[required]');
    for (const inp of inputs) {
      if (!inp.value.trim()) { inp.focus(); return; }
    }
    const branche_ids = [...form.querySelectorAll('.form-chip--active')]
      .map(c => c.dataset.brancheId)
      .filter(Boolean);

    const data = {
      name:        form.querySelector('[name="name"]').value.trim(),
      email:       form.querySelector('[name="email"]').value.trim(),
      phone:       form.querySelector('[name="phone"]').value.trim(),
      region:      form.querySelector('[name="region"]').value.trim(),
      active:      form.querySelector('[name="active"]').value === 'true',
      branche_ids: branche_ids,
    };
    if (this._isEdit) data.id = this._distributor.id;
    this._onSave?.(data);
  }

  _buildActiveToggle(isActive) {
    const input = ce('input', { type: 'hidden', name: 'active', value: String(isActive) });
    const yesBtn = ce('button', { type: 'button', className: `form-toggle__btn${isActive ? ' form-toggle__btn--active' : ''}`, textContent: '✓ Aktiv' });
    const noBtn  = ce('button', { type: 'button', className: `form-toggle__btn${!isActive ? ' form-toggle__btn--active' : ''}`, textContent: '✗ Inaktiv' });

    const toggle = (val) => {
      input.value = String(val);
      yesBtn.classList.toggle('form-toggle__btn--active', val);
      noBtn.classList.toggle('form-toggle__btn--active', !val);
    };

    yesBtn.addEventListener('click', () => toggle(true));
    noBtn.addEventListener('click',  () => toggle(false));

    return ce('div', { className: 'form-toggle' }, [input, yesBtn, noBtn]);
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
