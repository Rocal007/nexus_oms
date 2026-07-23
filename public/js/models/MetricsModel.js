/**
 * MetricsModel.js — KPI metric data definitions.
 * Pure data. No DOM access, no rendering logic.
 *
 * @typedef {{ value: string, label: string, delta: string, color: string }} Metric
 */

/** @type {readonly Metric[]} */
const METRICS = Object.freeze([
  { value: '8',     label: 'System-Module',      delta: '↑ Vollständig integriert',   color: 'var(--accent-cyan)'   },
  { value: '99.9%', label: 'Uptime-Ziel',        delta: '↑ SLA-konform',              color: 'var(--accent-green)'  },
  { value: '<30s',  label: 'Dispatch-Latenz',    delta: '↓ E-Mail → Distributor',     color: 'var(--accent-teal)'   },
  { value: '100%',  label: 'Audit-Trail',        delta: '↑ Lückenlose Telemetrie',    color: 'var(--accent-violet)' },
  { value: '∞',     label: 'Re-Dispatch-Zyklen', delta: '↑ Automatische Eskalation',  color: 'var(--accent-amber)'  },
]);

/**
 * MetricsModel — read-only interface to KPI data.
 */
export const MetricsModel = Object.freeze({
  /** @returns {readonly Metric[]} */
  getAll: () => METRICS,
});
