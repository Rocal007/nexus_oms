/**
 * BrancheController.js — Routes and business logic for Branchen.
 */
import { BrancheModel }      from '../models/BrancheModel.js';
import { DistributorModel }  from '../models/DistributorModel.js';
import { OrderModel }        from '../models/OrderModel.js';
import { BrancheListView }   from '../views/BrancheListView.js';
import { BrancheDetailView } from '../views/BrancheDetailView.js';
import { BrancheFormView }   from '../views/BrancheFormView.js';
import { toast }             from '../views/ToastView.js';

export class BrancheController {
  /**
   * @param {HTMLElement} contentEl
   * @param {import('./RouterController.js').RouterController} router
   */
  constructor(contentEl, router) {
    this._contentEl = contentEl;
    this._router    = router;
    this._view      = null;
  }

  showList() {
    const view = new BrancheListView(this._contentEl);
    view.render(BrancheModel.getAll(), OrderModel.getAll());
    view.onNew(() => this._router.navigate('/branche/new'));
    view.onSelect(id => this._router.navigate(`/branche/${id}`));
    
    this._view = view;
    return () => view.destroy();
  }

  showDetail(id) {
    const branche = BrancheModel.getById(id);
    if (!branche) {
      toast.show('Branche nicht gefunden.', 'error');
      this._router.navigate('/branche');
      return () => {};
    }

    const view = new BrancheDetailView(this._contentEl);
    view.render(branche, DistributorModel.getAll(), OrderModel.getAll());
    
    view.onOrders(() => {
      // In a real app we'd pass a filter to the OrderController, 
      // but for now we'll just navigate to orders and user can use search
      this._router.navigate('/orders');
    });
    view.onNewOrder(() => this._router.navigate(`/branche/${id}/orders/new`));
    view.onEdit(() => this._router.navigate(`/branche/${id}/edit`));
    view.onDelete(() => this._delete(id));
    
    this._view = view;
    return () => view.destroy();
  }

  showNewForm() {
    const view = new BrancheFormView(this._contentEl, null);
    view.render();
    view.onSave(data => this._save(data));
    view.onCancel(() => this._router.navigate('/branche'));
    this._view = view;
    return () => view.destroy();
  }

  showEditForm(id) {
    const branche = BrancheModel.getById(id);
    if (!branche) {
      this._router.navigate('/branche');
      return () => {};
    }
    const view = new BrancheFormView(this._contentEl, branche);
    view.render();
    view.onSave(data => this._save(data));
    view.onCancel(() => this._router.navigate(`/branche/${id}`));
    this._view = view;
    return () => view.destroy();
  }

  _save(data) {
    BrancheModel.save(data);
    toast.show(data.id ? 'Branche aktualisiert.' : 'Branche angelegt.', 'success');
    this._router.navigate('/branche');
  }

  _delete(id) {
    if (!confirm('Branche wirklich löschen? Zugeordnete Aufträge und Distributoren verlieren diese Zuordnung.')) return;
    
    // Cleanup references in distributors
    const dists = DistributorModel.getAll();
    let distChanged = false;
    dists.forEach(d => {
      if (d.branche_ids && d.branche_ids.includes(id)) {
        d.branche_ids = d.branche_ids.filter(bid => bid !== id);
        DistributorModel.save(d); // Uses the updated object
        distChanged = true;
      }
    });

    // Cleanup references in orders
    const orders = OrderModel.getAll();
    let orderChanged = false;
    orders.forEach(o => {
      if (o.branche_id === id) {
        o.branche_id = null;
        OrderModel.update(o.id, o);
        orderChanged = true;
      }
    });

    BrancheModel.delete(id);
    toast.show('Branche erfolgreich gelöscht.', 'warning');
    this._router.navigate('/branche');
  }
}
