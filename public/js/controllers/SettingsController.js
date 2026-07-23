/**
 * SettingsController.js — Handles settings form persistence.
 */
import { SettingsModel } from '../models/SettingsModel.js';
import { SettingsView }  from '../views/SettingsView.js';
import { toast }         from '../views/ToastView.js';

export class SettingsController {
  /** @param {HTMLElement} contentEl */
  constructor(contentEl) {
    this._contentEl = contentEl;
  }

  /** @returns {() => void} cleanup */
  show() {
    const view = new SettingsView(this._contentEl, SettingsModel.get());
    view.render();

    view.onSave(data => {
      SettingsModel.set(data);
      toast.show('Einstellungen gespeichert.', 'success');
    });

    return () => view.destroy();
  }
}
