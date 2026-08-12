/**
 * PartnerController.js — Coordinates subcontractor network and geo-proximity radar.
 */
import { PartnerModel } from '../models/PartnerModel.js';
import { PartnerView }  from '../views/PartnerView.js';
import { RadarView }    from '../views/RadarView.js';
import { toast }        from '../views/ToastView.js';

export class PartnerController {
  /**
   * @param {HTMLElement} contentEl
   * @param {import('./RouterController.js').RouterController} router
   */
  constructor(contentEl, router) {
    this._contentEl = contentEl;
    this._router = router;
  }

  /** @returns {() => void} cleanup */
  showList() {
    const view = new PartnerView(this._contentEl);

    const refresh = () => {
      view.destroy();
      view.render(PartnerModel.getAll());
    };

    view.onSave(data => {
      PartnerModel.save(data);
      toast.show('Subunternehmer erfolgreich gespeichert.', 'success');
      refresh();
    });

    view.onDelete(id => {
      PartnerModel.delete(id);
      toast.show('Partner aus Netzwerk gelöscht.', 'info');
      refresh();
    });

    view.onNavigateRadar(() => {
      this._router.navigate('/radar');
    });

    view.render(PartnerModel.getAll());

    return () => view.destroy();
  }

  /** @returns {() => void} cleanup */
  showRadar() {
    const view = new RadarView(this._contentEl);
    view.render(PartnerModel.getAll());
    return () => view.destroy();
  }
}
