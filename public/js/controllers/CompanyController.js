/**
 * CompanyController.js — Coordinates company listing and switching context.
 */
import { CompanyModel } from '../models/CompanyModel.js?v=49';
import { CompanyView }  from '../views/CompanyView.js?v=49';
import { toast }        from '../views/ToastView.js';

export class CompanyController {
  /** @param {HTMLElement} contentEl */
  constructor(contentEl) {
    this._contentEl = contentEl;
  }

  /** @returns {() => void} cleanup */
  show() {
    const view = new CompanyView(this._contentEl);
    
    const refresh = () => {
      view.destroy();
      view.render({
        companies: CompanyModel.getAll(),
        activeId: CompanyModel.getActiveId()
      });
    };

    view.onSwitch(id => {
      CompanyModel.setActiveId(id);
      const active = CompanyModel.getById(id);
      toast.show(`Kontext gewechselt zu: ${active.name}`, 'success');
      refresh();
    });

    view.onSave(data => {
      CompanyModel.save(data);
      toast.show('Betriebsdaten erfolgreich gespeichert.', 'success');
      refresh();
    });

    view.onDelete(id => {
      CompanyModel.delete(id);
      toast.show('Betrieb gelöscht.', 'info');
      refresh();
    });

    view.render({
      companies: CompanyModel.getAll(),
      activeId: CompanyModel.getActiveId()
    });

    return () => view.destroy();
  }
}
