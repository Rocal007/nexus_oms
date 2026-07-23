/**
 * StageModel.js — Single source of truth for all 8 pipeline stage definitions.
 * Pure data object. No DOM access, no rendering, no side effects.
 * Frozen at module level — immutable after import.
 *
 * @typedef {{
 *   id:         number,
 *   icon:       string,
 *   title:      string,
 *   subtitle:   string,
 *   desc:       string,
 *   colorClass: string,
 *   accent:     string,
 *   bgColor:    string,
 *   isCore?:    boolean,
 *   tags:       string[],
 *   details:    { label: string, value: string }[]
 * }} Stage
 */

/** @type {readonly Stage[]} */
const STAGES = Object.freeze([
  {
    id:         0,
    icon:       '📧',
    title:      'Input · E-Mail-Empfang',
    subtitle:   'MODULE::INPUT_RECEIVER',
    desc:       'Automatisierter Eingang von Kundenaufträgen via E-Mail-Postfach, API-Webhook oder Webformular. Deduplizierung und Eingangs-Quittierung.',
    colorClass: 'c-cyan',
    accent:     '#38bdf8',
    bgColor:    'rgba(56,189,248,0.12)',
    tags:       ['IMAP / SMTP', 'Webhook', 'REST-API'],
    details: [
      { label: 'Protokolle',       value: '<code>IMAP</code>, <code>SMTP</code>, <code>REST-API</code>, <code>Webhook</code>' },
      { label: 'Funktion',         value: 'Automatisierter Eingang und Eingangs-Quittierung. Deduplizierung über Message-ID-Hash.' },
      { label: 'Fehlerbehandlung', value: 'Unzustellbare Mails → Dead-Letter-Queue mit Admin-Alert.' },
      { label: 'Output',           value: 'Rohdaten-Objekt (JSON) an Parsing-Modul übergeben.' },
      { label: 'SLA',              value: 'Eingang innerhalb von <code>&lt;5s</code> nach Postfach-Polling.' },
    ],
  },
  {
    id:         1,
    icon:       '🔍',
    title:      'Parsing & Validierung',
    subtitle:   'MODULE::PARSER_VALIDATOR',
    desc:       'Strukturierung des Rohtextes, Extraktion von Auftragsdaten, Adress- und Plausibilitätsprüfung. Fehlerhafte Aufträge → manuelle Review-Queue.',
    colorClass: 'c-teal',
    accent:     '#2dd4bf',
    bgColor:    'rgba(45,212,191,0.12)',
    tags:       ['NLP', 'Schema-Check', 'Geo-Validierung'],
    details: [
      { label: 'Technologie',          value: 'NLP-Extraktion, Regex-Patterns, Schema-Validator (JSON-Schema Draft-07).' },
      { label: 'Validierungsschritte', value: 'Adress-Geocoding, PLZ-Prüfung, Pflichtfeld-Check, Typ-Validierung.' },
      { label: 'Fehlerbehandlung',     value: 'Invalide Aufträge → <code>REVIEW_QUEUE</code> mit Fehlerprotokoll.' },
      { label: 'Output',               value: 'Strukturiertes Auftragsobjekt (normalisiert) an Dispatch-Engine.' },
      { label: 'Durchsatz',            value: 'Bis zu <code>500 msg/min</code> verarbeitbar.' },
    ],
  },
  {
    id:         2,
    icon:       '⚡',
    title:      'NEXUS-Dispatch · Zentrale Verteilung',
    subtitle:   'MODULE::DISPATCH_ENGINE · CORE',
    desc:       'Das Herzstück: Regelbasierte Zuweisung validierter Aufträge an Distributoren gemäß Kapazität, Region, SLA-Fristen und Priorisierungsmatrix. Jeder Vorgang wird im Audit-Log verankert.',
    colorClass: 'c-violet',
    accent:     '#a78bfa',
    bgColor:    'rgba(167,139,250,0.12)',
    isCore:     true,
    tags:       ['Rule Engine', 'Priority Queue', 'Geo-Routing', 'Audit-Log', 'SLA-Matrix'],
    details: [
      { label: 'Kernfunktion',     value: 'Regelbasierte Zuweisung: Kapazität, Geo-Region, SLA-Deadline, Priorisierungsrang.' },
      { label: 'Algorithmus',      value: 'Weighted Round-Robin mit Geo-Proximity-Scoring (Haversine-Formel).' },
      { label: 'Audit',            value: 'Jeder Dispatch-Vorgang im immutablen Audit-Log mit Timestamp verankert.' },
      { label: 'Fehlerbehandlung', value: 'Kein verfügbarer Distributor → Eskalation + Re-Dispatch-Flag.' },
      { label: 'Latenz',           value: 'Dispatch-Entscheidung innerhalb von <code>&lt;200ms</code>.' },
    ],
  },
  {
    id:         3,
    icon:       '🏭',
    title:      'Distributoren',
    subtitle:   'MODULE::DISTRIBUTOR_LAYER',
    desc:       'Externe Auftragnehmer erhalten Aufträge über sichere Kanäle. Bestätigung und Fortschrittsmeldungen fließen zurück ins System.',
    colorClass: 'c-amber',
    accent:     '#fbbf24',
    bgColor:    'rgba(251,191,36,0.12)',
    tags:       ['API-Push', 'E-Mail-Template', 'Webhook-ACK'],
    details: [
      { label: 'Kanäle',      value: '<code>API-Push</code> (REST/JSON), E-Mail-Template, Webhook-ACK.' },
      { label: 'Bestätigung', value: 'Distributor sendet ACK innerhalb der konfigurierten Frist zurück.' },
      { label: 'Tracking',    value: 'Jede Fortschrittsmeldung aktualisiert den Auftragsstatus in Echtzeit.' },
      { label: 'Fallback',    value: 'Ausbleibendes ACK → automatischer Re-Dispatch-Trigger nach Timeout.' },
      { label: 'Sicherheit',  value: 'mTLS-Verschlüsselung, API-Key-Rotation, Rate-Limiting.' },
    ],
  },
  {
    id:         4,
    icon:       '⏱️',
    title:      'Ablaufkontrolle',
    subtitle:   'MODULE::FLOW_CONTROL',
    desc:       'Laufende Überwachung aller Fristen und Telemetrie-Daten. Eskalation bei Fristüberschreitung. Automatische SLA-Warnungen.',
    colorClass: 'c-rose',
    accent:     '#fb7185',
    bgColor:    'rgba(251,113,133,0.12)',
    tags:       ['Frist-Tracker', 'Telemetrie', 'Eskalation'],
    details: [
      { label: 'Kernfunktion', value: 'Laufende SLA-Überwachung aller aktiven Aufträge. Frist-Countdown pro Job.' },
      { label: 'Telemetrie',   value: 'Metriken: Laufzeit, Durchsatz, Fehlerrate, Re-Dispatch-Anzahl → Prometheus / Grafana.' },
      { label: 'Eskalation',   value: 'Stufe 1 (80% Frist): Warnung. Stufe 2 (95%): Auto-Eskalation. Stufe 3: Incident.' },
      { label: 'Integration',  value: 'Bidirektionale Verbindung zu Monitoring & Re-Dispatch-Modul.' },
      { label: 'Retention',    value: 'Telemetrie-Daten: <code>90 Tage</code> rolling window.' },
    ],
  },
  {
    id:         5,
    icon:       '📡',
    title:      'Status-Feedback',
    subtitle:   'MODULE::STATUS_FEEDBACK',
    desc:       'Rückmeldung des Auftragsstatus an den Auftraggeber. Push-Notifikationen, Statusportal und E-Mail-Updates in Echtzeit.',
    colorClass: 'c-green',
    accent:     '#4ade80',
    bgColor:    'rgba(74,222,128,0.12)',
    tags:       ['Push', 'Portal', 'E-Mail'],
    details: [
      { label: 'Kanäle',        value: 'E-Mail-Statusmeldung, Push-Notification (Web/Mobile), Statusportal-API.' },
      { label: 'Ereignisse',    value: 'Auftragseingang → Dispatch → In Bearbeitung → Abgeschlossen / Storniert.' },
      { label: 'Format',        value: 'HTML-E-Mail mit Track-Link, JSON-Payload für API-Konsumenten.' },
      { label: 'Latenz',        value: 'Statusupdate innerhalb von <code>&lt;2s</code> nach Ereignis.' },
      { label: 'Lokalisierung', value: 'Mehrsprachig: DE, AT-regional, EN (konfigurierbar per Mandant).' },
    ],
  },
  {
    id:         6,
    icon:       '🔄',
    title:      'Monitoring & Re-Dispatch',
    subtitle:   'MODULE::MONITOR_REDISPATCH',
    desc:       'Kontinuierliches System-Health-Monitoring. Bei Ausfall eines Distributors automatischer Re-Dispatch an den nächstgeeigneten Auftragnehmer.',
    colorClass: 'c-cyan',
    accent:     '#38bdf8',
    bgColor:    'rgba(56,189,248,0.12)',
    tags:       ['Health-Check', 'Fallback', 'Auto-Retry'],
    details: [
      { label: 'Health-Checks',     value: 'Alle <code>30s</code> Ping auf alle aktiven Distributor-Endpunkte.' },
      { label: 'Re-Dispatch-Logik', value: 'Timeout / Ablehnung → nächstgeeigneter Distributor per Scoring-Matrix.' },
      { label: 'Max. Retries',      value: 'Konfigurierbar, Standard: <code>3 Versuche</code> → danach manuelles Incident.' },
      { label: 'Alerting',          value: 'PagerDuty / OpsGenie Integration für kritische Systemausfälle.' },
      { label: 'Dashboard',         value: 'Live-Karte aller aktiven Jobs, Distributor-Status und Queue-Tiefe.' },
    ],
  },
  {
    id:         7,
    icon:       '📊',
    title:      'Berichtswesen',
    subtitle:   'MODULE::REPORTING_ENGINE',
    desc:       'Automatisierte Erstellung von SLA-Reports, KPI-Dashboards und Compliance-Berichten. Export als PDF, CSV oder via BI-Connector.',
    colorClass: 'c-violet',
    accent:     '#a78bfa',
    bgColor:    'rgba(167,139,250,0.12)',
    tags:       ['PDF-Export', 'KPI-Dashboard', 'BI-Connector'],
    details: [
      { label: 'Report-Typen', value: 'SLA-Compliance, KPI-Summary, Distributor-Performance, Volumen-Trend.' },
      { label: 'Formate',      value: '<code>PDF</code>, <code>CSV</code>, <code>XLSX</code>, BI-Connector (Power BI / Tableau).' },
      { label: 'Zeitplan',     value: 'Täglich, wöchentlich, monatlich – automatisch per Cron-Job.' },
      { label: 'Empfänger',    value: 'Konfigurierbare Empfängerlisten pro Report-Typ und Mandant.' },
      { label: 'Compliance',   value: 'DSGVO-konforme Datenmaskierung in Exportdateien.' },
    ],
  },
]);

/**
 * StageModel — read-only interface to stage data.
 * Controllers import this; Views never import models directly.
 */
export const StageModel = Object.freeze({
  /** @returns {readonly Stage[]} */
  getAll:    ()    => STAGES,
  /** @param {number} id @returns {Stage|null} */
  getById:   (id)  => STAGES.find(s => s.id === id) ?? null,
  /** @returns {number} */
  count:     ()    => STAGES.length,
});
