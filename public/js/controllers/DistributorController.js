/**
 * DistributorController.js — CRUD operations for distributors.
 * Mediates between DistributorModel and list/form views.
 */
import { DistributorModel }     from '../models/DistributorModel.js';
import { BrancheModel }         from '../models/BrancheModel.js';
import { DistributorListView }  from '../views/DistributorListView.js';
import { DistributorFormView }  from '../views/DistributorFormView.js';
import { toast }                from '../views/ToastView.js';

export class DistributorController {
  /**
   * @param {HTMLElement}                                    contentEl
   * @param {import('./RouterController.js').RouterController} router
   */
  constructor(contentEl, router) {
    this._contentEl = contentEl;
    this._router    = router;
    this._view      = null;
  }

  /** Render distributor list. */
  showList() {
    const view = new DistributorListView(this._contentEl);
    view.render(DistributorModel.getAll());

    view.onNew(()    => this._router.navigate('/distributors/new'));
    view.onEdit(id   => this._router.navigate(`/distributors/${id}/edit`));
    view.onDelete(id => this._delete(id));

    this._view = view;
    return () => view.destroy();
  }

  /**
   * Render form for creating a new distributor.
   * @returns {() => void} cleanup
   */
  showNewForm() {
    const view = new DistributorFormView(this._contentEl, null);
    view.render(BrancheModel.getAll());

    view.onSave(data => this._save(data));
    view.onCancel(()  => this._router.navigate('/distributors'));

    this._view = view;
    return () => view.destroy();
  }

  /**
   * Render form for editing an existing distributor.
   * @param {number} id
   * @returns {() => void} cleanup
   */
  showEditForm(id) {
    const distributor = DistributorModel.getById(id);
    if (!distributor) {
      toast.show('Distributor nicht gefunden.', 'error');
      this._router.navigate('/distributors');
      return () => {};
    }

    const view = new DistributorFormView(this._contentEl, distributor);
    view.render(BrancheModel.getAll());

    view.onSave(data => this._save(data));
    view.onCancel(()  => this._router.navigate('/distributors'));

    this._view = view;
    return () => view.destroy();
  }

  // ── Private ─────────────────────────────────────────────────

  /** @param {Partial<import('../models/DistributorModel.js').Distributor>} data */
  _save(data) {
    DistributorModel.save(data);
    const msg = data.id ? 'Distributor aktualisiert.' : 'Distributor angelegt.';
    toast.show(msg, 'success');
    this._router.navigate('/distributors');
  }

  /** @param {number} id */
  _delete(id) {
    if (!confirm('Distributor wirklich löschen?')) return;
    DistributorModel.delete(id);
    toast.show('Distributor gelöscht.', 'warning');
    // Re-render list in place
    this._view?.destroy();
    this.showList();
  }
}
