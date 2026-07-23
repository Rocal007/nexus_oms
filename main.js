// Nexus OMS Dashboard Logic
import { runComplianceCheck, verifyIdDisjointness, calculateLuposScore, SemanticCache, analyzeCicero7Q, calculateHaversineDistance, generateLinkSilo, generateCryptographicId } from './axiom.ts';
import { renderLudusWidget, getLudusTelemetryState } from './ludus.js';
import { renderFactoriumModule } from './factorium.js';
import { initCrmModule, renderCrmView } from './crm.js';
import { initFinanceModule, renderFinanceView } from './finance.js';
import { initAnalyticsModule, renderAnalyticsView } from './analytics.js';
import { initProfileModule, renderProfileView } from './profile.js';
import { initTasksModule, renderTasksView } from './tasks.js';
import { initDocumentsModule, renderDocumentsView } from './documents.js';
import { initNavigation } from './navigation.js';
import { initCalendar } from './calendar.js';
import { initPartnersModule } from './partners.js';
import { initBranchesModule } from './branches.js';
import { initOrchestratorModule, renderCommandCenterView } from './orchestrator.js';

const complianceCache = new SemanticCache();

export function calculateQNexusScore(text, branch, companyId) {
  const settings = ServiceOSStore.getSettings();
  const enforceGisa = settings.gisaVerify !== false;
  const locale = settings.language || "de-AT";

  // Cache lookup
  let compliance = complianceCache.get(text);
  if (!compliance) {
    compliance = runComplianceCheck(text, locale, branch, enforceGisa, companyId);
    complianceCache.set(text, compliance);
  }

  // Syntax Score: basic check if we have all necessary fields
  let sScore = 1.0;
  if (!text || text.trim().length < 5) sScore -= 0.3;
  if (!branch) sScore -= 0.2;

  const vScore = compliance.score;
  const lScore = calculateLuposScore(text);

  // Weights
  const w1 = 0.25;
  const w2 = 0.35;
  const w3 = 0.25;
  const w4 = 0.15;

  const qNexus = w1 * sScore + w2 * vScore + w3 * lScore + w4 * (sScore * vScore * lScore);

  return {
    qNexus: parseFloat(qNexus.toFixed(3)),
    sScore: parseFloat(sScore.toFixed(2)),
    vScore: parseFloat(vScore.toFixed(2)),
    lScore: parseFloat(lScore.toFixed(2)),
    compliance
  };
}

window.calculateQNexusScore = calculateQNexusScore;
window.runComplianceCheck = runComplianceCheck;
window.analyzeCicero7Q = analyzeCicero7Q;
window.calculateHaversineDistance = calculateHaversineDistance;
window.generateLinkSilo = generateLinkSilo;
window.renderLudusWidget = renderLudusWidget;
window.getLudusTelemetryState = getLudusTelemetryState;
window.renderFactoriumModule = renderFactoriumModule;
window.renderCrmView = renderCrmView;
window.renderFinanceView = renderFinanceView;
window.renderAnalyticsView = renderAnalyticsView;
window.renderProfileView = renderProfileView;
window.renderTasksView = renderTasksView;
window.renderDocumentsView = renderDocumentsView;
window.generateCryptographicId = generateCryptographicId;

export function generateCrossSellingSuggestions(branch, reason = "", subcategories = []) {
  const suggestions = [];
  const text = (reason + " " + (Array.isArray(subcategories) ? subcategories.join(" ") : subcategories)).toLowerCase();

  if (text.includes("verlassenschaft") || text.includes("nachlass") || text.includes("todesfall")) {
    suggestions.push({
      branch: "Antiquitäten",
      title: "Verlassenschafts-Bewertung & Ankauf",
      reason: "Wertanrechnung verwertbarer Erbstücke & Kunstgegenstände",
      suggestedValue: 1200
    });
    suggestions.push({
      branch: "Immobilienmakler",
      title: "Immobilien-Bewertung & Verkauf",
      reason: "Professionelle Vermarktung nach der Räumung",
      suggestedValue: 3500
    });
    suggestions.push({
      branch: "Reinigung",
      title: "Besenreine Spezialreinigung & Desinfektion",
      reason: "Bezugsfertige Übergabe an Vermieter oder Käufer",
      suggestedValue: 450
    });
  }

  if (text.includes("messie") || text.includes("zwangsräumung") || text.includes("mietnomaden")) {
    suggestions.push({
      branch: "Entrümpelung",
      title: "Spezialreinigung & Schädlingsbekämpfung",
      reason: "Hygieneherstellung nach extremer Belastung",
      suggestedValue: 850
    });
    suggestions.push({
      branch: "Entrümpelung",
      title: "Maler- & Renovierungsarbeiten",
      reason: "Rückbau & bezugsfertige Herrichtung",
      suggestedValue: 1600
    });
  }

  if (text.includes("gewerbeauflösung") || text.includes("insolvenz") || text.includes("büro")) {
    suggestions.push({
      branch: "Umzug",
      title: "Firmen- & EDV-Transport (Spedition)",
      reason: "Sicherer Abtransport verbliebener Büroausstattung",
      suggestedValue: 950
    });
    suggestions.push({
      branch: "Antiquitäten",
      title: "Inventar- & Maschinenbewertung",
      reason: "Verwertung von Gewerbeinventar",
      suggestedValue: 1500
    });
  }

  if (branch === "Solar") {
    suggestions.push({
      branch: "Solar",
      title: "Speicher-Nachrüstung & Energiemanagement",
      reason: "Maximierung des Eigenverbrauchs",
      suggestedValue: 4200
    });
  }

  if (branch === "Umzug") {
    suggestions.push({
      branch: "Entrümpelung",
      title: "Altmöbel-Entrümpelung & Wertstoff-Abtransport",
      reason: "Bereinigung nicht mehr benötigten Umzugsguts",
      suggestedValue: 380
    });
    suggestions.push({
      branch: "Reinigung",
      title: "Endreinigung der Altwohnung",
      reason: "Übergabegarantie für Kaution",
      suggestedValue: 320
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      branch: "Reinigung",
      title: "Spezial- & Endreinigung",
      reason: "Qualitätssicherung bei Übergabe",
      suggestedValue: 350
    });
  }

  return suggestions;
}

window.generateCrossSellingSuggestions = generateCrossSellingSuggestions;

// ServiceOS Store Configuration
const DEFAULT_USERS = [
  { id: "USR-001", name: "Alex Dev", role: "Superadmin", email: "alex@serviceos.com" },
  { id: "USR-002", name: "Sarah Admin", role: "Administrator", email: "sarah@serviceos.com" },
  { id: "USR-003", name: "Klaus Müller", role: "Partner", email: "klaus@mueller-entruempelung.at", companyId: "COMP-001" },
  { id: "USR-004", name: "Hans Schmid", role: "Sub-Partner", email: "hans@schmid-transporte.at", companyId: "COMP-002", parentCompanyId: "COMP-001" }
];

const DEFAULT_COMPANIES = [
  { id: "COMP-001", name: "Müller Entrümpelung GmbH", type: "Partner", branches: ["Entrümpelung", "Reinigung"], active: true, gisa: "GISA-12948574" },
  { id: "COMP-002", name: "Schmid Transporte", type: "Sub-Partner", parentId: "COMP-001", branches: ["Transport"], active: true, gisa: "GISA-98274381" }
];

const DEFAULT_ORDERS = [];

const DEFAULT_BRANCHES = [
  { 
    id: "BR-001", 
    name: "Entrümpelung", 
    description: "Räumung und Entsorgung", 
    active: true,
    subcategories: [
      {
        group: "Nach Objekt- & Immobilienart",
        items: [
          "Wohnung entrümpeln",
          "Haus entrümpeln",
          "Keller & Dachboden entrümpeln",
          "Garage, Schuppen & Gartenhaus",
          "Gewerbe- & Firmenentrümpelung (Büro, Lager, Werkstatt, Ladengeschäft)",
          "Hotel- & Gastronomieauflösung",
          "Nebengebäude & Scheunen"
        ]
      },
      {
        group: "Nach Anlass & Situation",
        items: [
          "Messie-Wohnung entrümpeln",
          "Verlassenschaften & Nachlassverwertung",
          "Entrümpelung nach Todesfall",
          "Zwangsräumung / Mietnomaden-Räumung",
          "Gewerbeauflösung / Insolvenzräumung"
        ]
      },
      {
        group: "Nach Leistungsumfang & Spezial-Services",
        items: [
          "Besenreine Räumung",
          "Antiquitäten Ankauf & Wertanrechnung",
          "Demontage & Rückbau (Einbaumöbel, Deckenverkleidungen, Bodenbeläge, Fliesen)",
          "Möbel- & Wertsachenanrechnung (Verkaufbares wird vom Preis abgezogen)",
          "Spezialreinigung & Desinfektion (z. B. nach Messie-Räumung)",
          "Maler- & Renovierungsarbeiten (zur bezugsfertigen bzw. übergabereifen Herrichtung)"
        ]
      }
    ]
  },
  { 
    id: "BR-002", 
    name: "Umzug", 
    description: "Privat- und Firmenumzüge", 
    active: true,
    subcategories: [
      {
        group: "Nach Art des Umzugs",
        items: [
          "Privatumzug",
          "Firmenumzug",
          "Büro-Umzug",
          "Seniorenumzug",
          "Studentenumzug",
          "Mitarbeiterumzug / Relocation Service",
          "Behörden- & Praxisumzug"
        ]
      },
      {
        group: "Nach Entfernung & Logistik",
        items: [
          "Umzug innerhalb des Ortes",
          "Umzug innerhalb 50 km",
          "Umzug innerhalb 100 km",
          "Umzug über 100 km",
          "Umzug in ein anderes Bundesland",
          "Fernumzug / Deutschlandweiter Umzug",
          "Internationaler Umzug / EU-Umzug",
          "Überseeumzug"
        ]
      },
      {
        group: "Nach Leistungsumfang & Spezial-Services",
        items: [
          "Transport (Reiner Beiladungsservice / Transport von A nach B)",
          "Demontage & Montage (Möbel & Einbauküchen)",
          "Umzug mit Entrümpelung",
          "Full-Service-Umzug (inkl. Ein- und Auspackservice)",
          "Spezial- & Schwerguttransport (z. B. Klavier, Tresor)",
          "Einlagerung & Zwischenlagerung (Self-Storage)",
          "Einrichten von Halteverbotszonen",
          "Außenaufzug- / Möbelaufzug-Einsatz"
        ]
      }
    ]
  },
  { 
    id: "BR-003", 
    name: "Antiquitäten", 
    description: "Ankauf und Verkauf von Antiquitäten", 
    active: true,
    subcategories: ["Antiquitäten Ankauf", "Verlassenschafts-Bewertung", "Kunstgegenstände", "Münzen & Gold"]
  },
  { 
    id: "BR-004", 
    name: "Solar", 
    description: "Photovoltaik und Solaranlagen", 
    active: true,
    subcategories: ["Photovoltaik Erstinstallation", "Speicher-Nachrüstung", "Wartung & Reinigung", "Wechselrichter-Tausch"]
  },
  { 
    id: "BR-005", 
    name: "Immobilienmakler", 
    description: "Vermittlung von Immobilien", 
    active: true,
    subcategories: ["Wohnungsvermietung", "Hausverkauf", "Gewerbeflächen-Vermittlung", "Immobilien-Bewertung"]
  },
  { 
    id: "BR-006", 
    name: "Überwachungskameras", 
    description: "Sicherheitstechnik und Kameras", 
    active: true,
    subcategories: ["WLAN Kamera Setup", "IP-Videoüberwachung", "Alarmanlagen Integration", "Wartung Security"]
  }
];

export class ServiceOSStore {
  static get(key, defaultValue) {
    const val = localStorage.getItem(`serviceos_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  }

  static set(key, value) {
    localStorage.setItem(`serviceos_${key}`, JSON.stringify(value));
    window.dispatchEvent(new Event('storage'));
  }

  static init() {
    if (!localStorage.getItem("serviceos_users") || JSON.parse(localStorage.getItem("serviceos_users")).length <= 2) this.set("users", DEFAULT_USERS);
    if (!localStorage.getItem("serviceos_companies") || JSON.parse(localStorage.getItem("serviceos_companies")).length === 0) this.set("companies", DEFAULT_COMPANIES);
    if (!localStorage.getItem("serviceos_orders")) {
      // Enrich default orders with calculated Q_NEXUS scores
      const enriched = DEFAULT_ORDERS.map(o => {
        const today = new Date().toISOString().split('T')[0];
        const metrics = calculateQNexusScore(o.description, o.branch, o.companyId);
        return {
          ...o,
          date: o.date || today,
          qNexusMetrics: metrics
        };
      });
      this.set("orders", enriched);
    }
    if (!localStorage.getItem("serviceos_audit")) this.set("audit", []);
    if (!localStorage.getItem("serviceos_current_user_id")) localStorage.setItem("serviceos_current_user_id", "USR-001");
    if (!localStorage.getItem("serviceos_settings")) this.set("settings", {
      language: "de-AT",
      currency: "EUR",
      docVerify: true,
      gisaVerify: true,
      minInsurance: 1000000,
      commission: 15,
      marketingShare: 20,
      aiModel: "gemini-1.5-pro",
      aiTemp: 0.2,
      selfImprove: true,
      zeroTrust: false,
      mfa: false,
      logRetention: "90",
      dashboardFavorites: [
        "kpi-card-revenue", "kpi-card-active", "kpi-card-completed", "kpi-card-time", 
        "kpi-card-requests", "kpi-card-action", "btn-kpi-new-order",
        "kpi-card-flow", "kpi-card-status", "kpi-card-calc"
      ]
    });
    if (!localStorage.getItem("serviceos_branches")) {
      this.set("branches", DEFAULT_BRANCHES);
    } else {
      const currentBranches = this.getBranches();
      const br1 = currentBranches.find(b => b.id === "BR-001" || b.name.includes("Entrümpelung"));
      if (br1) {
        br1.subcategories = DEFAULT_BRANCHES[0].subcategories;
      }
      const br2 = currentBranches.find(b => b.id === "BR-002" || b.name.includes("Umzug"));
      if (br2) {
        br2.subcategories = DEFAULT_BRANCHES[1].subcategories;
      }
      this.set("branches", currentBranches);
    }
    if (!localStorage.getItem("serviceos_cases")) this.set("cases", []);
  }

  static getUsers() { return this.get("users", []); }
  static getCompanies() { return this.get("companies", []); }
  static getOrders() { return this.get("orders", []); }
  static getCases() { return this.get("cases", []); }
  static getAuditLogs() { return this.get("audit", []); }
  static getBranches() { return this.get("branches", []); }

  static getCaseById(id) {
    if (!id) return null;
    return this.getCases().find(c => c.id === id || c.caseNumber === id);
  }

  static createCase(caseData) {
    const cases = this.getCases();
    const caseId = caseData.id || generateCryptographicId("CAS");
    const caseNumber = caseData.caseNumber || generateCryptographicId("SO");
    const suggestions = caseData.crossSellingSuggestions || generateCrossSellingSuggestions(caseData.branch, caseData.reason || caseData.description, caseData.subcategories);
    const newCase = {
      id: caseId,
      caseNumber: caseNumber,
      client: caseData.client || "Unbekannter Kunde",
      location: caseData.location || caseData.address || "Direktauftrag",
      branch: caseData.branch || "General",
      reason: caseData.reason || caseData.description || "Serviceanfrage",
      subcategories: caseData.subcategories || [],
      status: caseData.status || "Pending",
      createdAt: caseData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyId: caseData.companyId || null,
      orders: caseData.orders || [],
      crossSellingSuggestions: suggestions,
      timeline: caseData.timeline || [
        {
          timestamp: new Date().toISOString(),
          title: "Fallakte angelegt",
          author: caseData.author || "System",
          type: "CREATE",
          details: `Fallakte ${caseNumber} (${caseId}) für Kunde ${caseData.client || ''} registriert.`
        }
      ]
    };
    cases.unshift(newCase);
    this.set("cases", cases);
    this.logAudit("CASE_CREATED", `Neue Fallakte ${caseNumber} (${caseId}) angelegt.`);
    return newCase;
  }

  static addTimelineEventToCase(caseId, event) {
    const cases = this.getCases();
    const cIndex = cases.findIndex(c => c.id === caseId || c.caseNumber === caseId);
    if (cIndex !== -1) {
      if (!cases[cIndex].timeline) cases[cIndex].timeline = [];
      cases[cIndex].timeline.unshift({
        timestamp: new Date().toISOString(),
        title: event.title || "Aktualisierung",
        author: event.author || "System",
        type: event.type || "INFO",
        details: event.details || ""
      });
      cases[cIndex].updatedAt = new Date().toISOString();
      this.set("cases", cases);
    }
  }

  static addOrderToCase(caseId, orderId) {
    const cases = this.getCases();
    const cIndex = cases.findIndex(c => c.id === caseId || c.caseNumber === caseId);
    if (cIndex !== -1) {
      if (!cases[cIndex].orders) cases[cIndex].orders = [];
      if (!cases[cIndex].orders.includes(orderId)) {
        cases[cIndex].orders.push(orderId);
      }
      cases[cIndex].updatedAt = new Date().toISOString();
      this.set("cases", cases);
    }
  }
  
  static getSettings() {
    const defaultSettings = {
      language: "de-AT",
      currency: "EUR",
      docVerify: true,
      gisaVerify: true,
      minInsurance: 1000000,
      commission: 15,
      marketingShare: 20,
      aiModel: "gemini-1.5-pro",
      aiTemp: 0.2,
      selfImprove: true,
      zeroTrust: false,
      mfa: false,
      logRetention: "90",
      dashboardFavorites: [
        "kpi-card-revenue", "kpi-card-active", "kpi-card-completed", "kpi-card-time", 
        "kpi-card-requests", "kpi-card-action", "btn-kpi-new-order",
        "kpi-card-flow", "kpi-card-status", "kpi-card-calc"
      ]
    };
    return this.get("settings", defaultSettings);
  }

  static saveSettings(settings) {
    this.set("settings", settings);
    this.logAudit("CONFIG_CHANGE", "Updated platform settings configurations");
  }
  
  static getCurrentUserId() { 
    return localStorage.getItem("serviceos_current_user_id") || "USR-001"; 
  }
  
  static setCurrentUserId(id) { 
    localStorage.setItem("serviceos_current_user_id", id);
    this.logAudit("USER_SWITCH", `Switched active user to ${id}`);
  }

  static getCurrentUser() {
    const id = this.getCurrentUserId();
    return this.getUsers().find(u => u.id === id) || DEFAULT_USERS[0];
  }

  static logAudit(action, details) {
    const user = this.getCurrentUser();
    const logs = this.getAuditLogs();
    const timestamp = new Date().toISOString();

    const previousHash = logs.length > 0 ? (logs[0].hash || "GENESIS") : "GENESIS";
    const generateHash = window.generateAuditHash || function(p, t, u, a, d) { return "HASH-" + Math.floor(10000000 + Math.random() * 90000000); };
    const hash = generateHash(previousHash, timestamp, user.name || user.id, action, details);

    logs.unshift({
      timestamp,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      user: user.name || user.id,
      role: user.role,
      action,
      details,
      previousHash,
      hash
    });
    this.set("audit", logs);
  }

  static verifyIntegrity() {
    const logs = this.getAuditLogs();
    if (window.verifyAuditTrailIntegrity) {
      return window.verifyAuditTrailIntegrity(logs);
    }
    return { isValid: true, corruptedIndex: -1, logsCount: logs.length };
  }
}

window.ServiceOSStore = ServiceOSStore;
ServiceOSStore.init();

window.createCrossSellingSubOrder = function(caseId, targetBranch, targetTitle, suggestedValue) {
  const caseObj = ServiceOSStore.getCaseById(caseId);
  if (!caseObj) {
    alert("Fallakte nicht gefunden.");
    return;
  }
  const orderId = generateCryptographicId("ORD");
  const today = new Date().toISOString().split('T')[0];
  const currentUser = ServiceOSStore.getCurrentUser();
  const assignedCompanyId = (currentUser.role === "Partner" || currentUser.role === "Sub-Partner") ? currentUser.companyId : null;
  const description = `Cross-Selling Teilauftrag: ${targetTitle} im Rahmen der Fallakte ${caseObj.caseNumber}.`;
  const metrics = calculateQNexusScore(description, targetBranch, assignedCompanyId);

  const newOrder = {
    id: orderId,
    caseId: caseObj.id,
    caseNumber: caseObj.caseNumber,
    client: caseObj.client,
    product: targetTitle,
    description: description,
    value: parseFloat(suggestedValue) || 450.00,
    priority: "Normal",
    status: "Pending", // Anfragen
    date: today,
    branch: targetBranch,
    companyId: assignedCompanyId,
    qNexusMetrics: metrics
  };

  const allOrders = ServiceOSStore.getOrders();
  allOrders.unshift(newOrder);
  ServiceOSStore.set("orders", allOrders);
  
  ServiceOSStore.addOrderToCase(caseObj.id, orderId);
  ServiceOSStore.addTimelineEventToCase(caseObj.id, {
    title: `Teilauftrag angelegt: ${targetTitle}`,
    author: currentUser.name || "System",
    type: "SUB_ORDER",
    details: `Zusatzleistung ${targetTitle} (${targetBranch}) als Teilauftrag ${orderId} hinzugefügt.`
  });

  ServiceOSStore.logAudit("SUB_ORDER_CREATION", `Cross-Selling Teilauftrag ${orderId} (${targetBranch}) zur Fallakte ${caseObj.caseNumber} hinzugefügt.`);
  alert(`✓ Cross-Selling Teilauftrag ${orderId} (${targetTitle}) wurde erfolgreich zur Fallakte ${caseObj.caseNumber} hinzugefügt!`);

  renderApp();
};

function getFilteredOrdersForRole() {
  const allOrders = ServiceOSStore.getOrders();
  const user = ServiceOSStore.getCurrentUser();
  
  if (user.role === "Superadmin" || user.role === "Administrator") {
    return allOrders;
  } else {
    // Partner companies ONLY see orders assigned to their company!
    return allOrders.filter(o => o.companyId === user.companyId || o.partnerId === user.companyId);
  }
}

function applyRolePermissionsUI() {
  const user = ServiceOSStore.getCurrentUser();
  if (!user) return;
  
  const isPartner = user.role === "Partner" || user.role === "Sub-Partner";

  // Sensitive navigation items hidden from Partner companies
  const restrictedTabsForPartner = [
    'tab-finance',
    'tab-analytics',
    'tab-partners',
    'tab-branches',
    'tab-factorium',
    'tab-audit'
  ];

  document.querySelectorAll('.nav-leaf').forEach(leaf => {
    const tabId = leaf.getAttribute('data-tab');
    if (restrictedTabsForPartner.includes(tabId)) {
      const li = leaf.closest('li');
      if (li) {
        li.style.display = isPartner ? 'none' : 'block';
      }
    }
  });

  // Admin Console Card in profile
  const adminConsoleCard = document.getElementById('admin-console-card');
  if (adminConsoleCard) {
    adminConsoleCard.style.display = isPartner ? 'none' : 'block';
  }

  // Hide Revenue & SLA Configurator from partner company
  const revenueCard = document.getElementById('kpi-card-revenue');
  if (revenueCard) {
    revenueCard.style.display = isPartner ? 'none' : 'flex';
  }

  const calcCard = document.getElementById('kpi-card-calc');
  if (calcCard) {
    calcCard.style.display = isPartner ? 'none' : 'block';
  }
}

let ordersList = [];
let currentFulfillmentRange = "7d";
let chartData = [
  { day: "10 Jul", amount: 5800 },
  { day: "11 Jul", amount: 7750 },
  { day: "12 Jul", amount: 10950 },
  { day: "13 Jul", amount: 11800 },
  { day: "14 Jul", amount: 24300 },
  { day: "15 Jul", amount: 28800 }
];

let activeFilter = "all";
let searchQuery = "";

function loadOrdersFromStore() {
  ordersList = getFilteredOrdersForRole();
}

function updateUserHeaderProfile() {
  const user = ServiceOSStore.getCurrentUser();
  const avatarEl = document.getElementById("current-user-avatar");
  const nameEl = document.getElementById("current-user-name");
  const roleEl = document.getElementById("current-user-role");
  const selector = document.getElementById("role-selector");

  if (selector) {
    const currentUserId = ServiceOSStore.getCurrentUserId();
    let users = ServiceOSStore.getUsers();
    const companies = ServiceOSStore.getCompanies();

    // Ensure user entries exist for all companies in store
    companies.forEach(company => {
      let companyUser = users.find(u => u.companyId === company.id);
      if (!companyUser) {
        companyUser = {
          id: `USR-${company.id}`,
          name: company.contactPerson ? `${company.name} (${company.contactPerson})` : company.name,
          email: company.emails && company.emails.length > 0 ? company.emails[0].value : 'partner@serviceos.com',
          role: company.type || 'Partner',
          companyId: company.id
        };
        users.push(companyUser);
      }
    });

    // Remove orphaned user accounts if company was deleted
    const validCompanyIds = new Set(companies.map(c => c.id));
    users = users.filter(u => !u.companyId || validCompanyIds.has(u.companyId));
    ServiceOSStore.set('users', users);

    // Build options
    const adminUsers = users.filter(u => u.role === "Superadmin" || u.role === "Administrator");

    let optionsHtml = `
      <optgroup label="Zentrale / System-Admins">
        ${adminUsers.map(u => `
          <option value="${u.id}" ${u.id === currentUserId ? 'selected' : ''}>
            👤 ${u.name} (${u.role})
          </option>
        `).join('')}
      </optgroup>
      <optgroup label="Registrierte Partnerfirmen (${companies.length})">
        ${companies.map(c => {
          const cUser = users.find(u => u.companyId === c.id);
          const uId = cUser ? cUser.id : `USR-${c.id}`;
          const contactStr = c.contactPerson ? ` - ${c.contactPerson}` : '';
          return `
            <option value="${uId}" ${uId === currentUserId ? 'selected' : ''}>
              🏢 ${c.name}${contactStr} (${c.active ? 'Aktiv' : 'Inaktiv'})
            </option>
          `;
        }).join('')}
      </optgroup>
    `;

    if (selector.innerHTML !== optionsHtml) {
      selector.innerHTML = optionsHtml;
    }

    if (!users.some(u => u.id === currentUserId)) {
      const fallbackUser = users[0] ? users[0].id : "USR-001";
      ServiceOSStore.setCurrentUserId(fallbackUser);
      selector.value = fallbackUser;
    } else {
      selector.value = currentUserId;
    }
  }

  const updatedUser = ServiceOSStore.getCurrentUser();
  if (avatarEl && updatedUser) {
    const initials = updatedUser.name ? updatedUser.name.split(" ").map(n => n[0]).join("") : "PA";
    avatarEl.innerText = initials;
  }
  if (nameEl && updatedUser) nameEl.innerText = updatedUser.name;
  if (roleEl && updatedUser) roleEl.innerText = updatedUser.role;
}

window.updateUserHeaderProfile = updateUserHeaderProfile;

// Elements
const bodyTable = document.getElementById("orders-list-body");
const searchInput = document.getElementById("global-search");
const filterButtons = document.querySelectorAll(".filter-btn");

// KPI elements
const kpiRevenueToday = document.getElementById("kpi-revenue-today");
const kpiRevenueWeek = document.getElementById("kpi-revenue-week");
const kpiRevenueMonth = document.getElementById("kpi-revenue-month");
const kpiActiveToday = document.getElementById("kpi-active-today");
const kpiActiveWeek = document.getElementById("kpi-active-week");
const kpiActiveMonth = document.getElementById("kpi-active-month");
const kpiCompletedToday = document.getElementById("kpi-completed-today");
const kpiCompletedWeek = document.getElementById("kpi-completed-week");
const kpiCompletedMonth = document.getElementById("kpi-completed-month");
const kpiAvgTimeToday = document.getElementById("kpi-avg-time-today");
const kpiAvgTimeWeek = document.getElementById("kpi-avg-time-week");
const kpiAvgTimeMonth = document.getElementById("kpi-avg-time-month");
const kpiRequestsToday = document.getElementById("kpi-requests-today");
const kpiRequestsWeek = document.getElementById("kpi-requests-week");
const kpiRequestsMonth = document.getElementById("kpi-requests-month");
const kpiActionToday = document.getElementById("kpi-action-today");
const kpiActionWeek = document.getElementById("kpi-action-week");
const kpiActionMonth = document.getElementById("kpi-action-month");

// Progress bars
const barPending = document.getElementById("bar-pending");
const barShipped = document.getElementById("bar-shipped");
const barDelivered = document.getElementById("bar-delivered");
const barCancelled = document.getElementById("bar-cancelled");
const barReturns = document.getElementById("bar-returns");

const labelPending = document.getElementById("label-pending");
const labelShipped = document.getElementById("label-shipped");
const labelDelivered = document.getElementById("label-delivered");
const labelCancelled = document.getElementById("label-cancelled");
const labelReturns = document.getElementById("label-returns");

// Modal Elements
const orderModal = document.getElementById("order-modal");
const btnOpenModal = document.getElementById("btn-open-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelForm = document.getElementById("btn-cancel-form");
const createOrderForm = document.getElementById("create-order-form");

// Init App
function initApp() {
  renderApp();
  setupEventListeners();
  initNavigation();
  initCalendar();
  initPartnersModule();
  initBranchesModule();
  initCrmModule();
  initFinanceModule();
  initAnalyticsModule();
  initProfileModule();
  initTasksModule();
  initDocumentsModule();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function setupEventListeners() {
  // Search
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderOrdersList();
  });

  // Filter Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter");
      renderOrdersList();
    });
  });

  // Chart Time Filters
  const chartTimeBtns = document.querySelectorAll("#chart-time-filters .filter-btn");
  chartTimeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      chartTimeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const range = btn.getAttribute("data-time");
      
      const legend = document.querySelector('.chart-legend');
      if (range === "7d") {
        chartData = [
          { day: "10 Jul", amount: 5800 },
          { day: "11 Jul", amount: 7750 },
          { day: "12 Jul", amount: 10950 },
          { day: "13 Jul", amount: 11800 },
          { day: "14 Jul", amount: 24300 },
          { day: "15 Jul", amount: 28800 }
        ];
        if (legend) legend.innerText = '7-Tage Transaktionsverlauf';
      } else if (range === "1m") {
        chartData = [
          { day: "Woche 1", amount: 45000 },
          { day: "Woche 2", amount: 52000 },
          { day: "Woche 3", amount: 48000 },
          { day: "Woche 4", amount: 65000 }
        ];
        if (legend) legend.innerText = '1-Monat Transaktionsverlauf';
      } else if (range === "3m") {
        chartData = [
          { day: "Mai", amount: 185000 },
          { day: "Juni", amount: 210000 },
          { day: "Juli", amount: 250000 }
        ];
        if (legend) legend.innerText = '3-Monate Transaktionsverlauf';
      } else if (range === "1y") {
        chartData = [
          { day: "Q3 '25", amount: 520000 },
          { day: "Q4 '25", amount: 680000 },
          { day: "Q1 '26", amount: 450000 },
          { day: "Q2 '26", amount: 720000 }
        ];
        if (legend) legend.innerText = '1-Jahr Transaktionsverlauf';
      }
      renderChart();
    });
  });

  // Fulfillment Time Filters
  const fulfillmentTimeBtns = document.querySelectorAll("#fulfillment-time-filters .filter-btn");
  fulfillmentTimeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      fulfillmentTimeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFulfillmentRange = btn.getAttribute("data-time");
      updateKPIs();
    });
  });

  // KPI New Order Card
  const btnKpiNewOrder = document.getElementById("btn-kpi-new-order");
  if (btnKpiNewOrder) {
    btnKpiNewOrder.addEventListener("click", () => {
      const wizardTabBtn = document.querySelector('.nav-leaf[data-tab="tab-wizard"]');
      if (wizardTabBtn) {
        wizardTabBtn.click();
      }
    });
  }

  // Interactive KPIs Detail Panel logic
  const kpiCards = document.querySelectorAll('.kpi-card:not(#btn-kpi-new-order)');
  const detailsPanel = document.getElementById('kpi-details-panel');
  const detailsTitle = document.getElementById('kpi-details-title');
  const detailsContent = document.getElementById('kpi-details-content');
  const btnCloseDetails = document.getElementById('btn-close-kpi-details');

  if (detailsPanel && btnCloseDetails) {
    btnCloseDetails.addEventListener('click', () => {
      detailsPanel.style.display = 'none';
      kpiCards.forEach(c => c.classList.remove('active-kpi'));
    });

    kpiCards.forEach(card => {
      card.addEventListener('click', () => {
        // Toggle active state
        kpiCards.forEach(c => c.classList.remove('active-kpi'));
        card.classList.add('active-kpi');

        // Show panel
        detailsPanel.style.display = 'block';

        // Render content based on card ID
        const cardTitle = card.querySelector('.kpi-title')?.innerText || 'Details';
        detailsTitle.innerText = cardTitle + ' - Erweiterte Ansicht';
        
        let htmlContent = '';
        switch(card.id) {
          case 'kpi-card-revenue':
            htmlContent = `
              <div style="margin-top:16px;">
                <p>Umsatzaufschlüsselung des aktuellen Monats.</p>
                <table class="data-table" style="width:100%; margin-top:12px;">
                  <thead><tr><th>Kategorie</th><th>Betrag</th><th>Trend</th></tr></thead>
                  <tbody>
                    <tr><td>Entrümpelungen</td><td>€ 12.450,00</td><td style="color:var(--color-delivered)">+4%</td></tr>
                    <tr><td>Transporte</td><td>€ 8.300,00</td><td style="color:var(--color-delivered)">+2%</td></tr>
                    <tr><td>Sonstiges</td><td>€ 2.100,00</td><td style="color:var(--color-text-muted)">±0%</td></tr>
                  </tbody>
                </table>
              </div>
            `;
            break;
          case 'kpi-card-active': {
            const activeOrders = ordersList.filter(o => o.status === "Shipped");
            htmlContent = `
              <div style="margin-top:16px;">
                <p style="margin-bottom:12px; color: var(--color-text-secondary);">
                  Übersicht der <strong>aktiven Aufträge</strong> (vom Kunden erteilte Aufträge in Bearbeitung / Disponiert).
                </p>
                <div style="margin-top:12px;">
                  ${activeOrders.length > 0 ? `
                    <table class="data-table" style="width:100%; border-collapse:collapse;">
                      <thead>
                        <tr style="border-bottom: 1px solid var(--color-border); text-align:left;">
                          <th style="padding: 8px;">ID</th>
                          <th style="padding: 8px;">Kunde</th>
                          <th style="padding: 8px;">Produkt / Service</th>
                          <th style="padding: 8px;">Wert</th>
                          <th style="padding: 8px;">Aktion</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${activeOrders.map(r => `
                          <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: 8px; font-weight:bold; color:var(--color-primary);">${r.id}</td>
                            <td style="padding: 8px;">${r.client}</td>
                            <td style="padding: 8px;">${r.product || r.branch}</td>
                            <td style="padding: 8px;">€ ${r.value.toFixed(2)}</td>
                            <td style="padding: 8px;">
                              <button onclick="window.updateOrderStatus('${r.id}', 'Delivered')" style="padding:6px 12px; font-size:0.75rem; background:rgba(59, 130, 246, 0.2); color:#60a5fa; border:1px solid rgba(59, 130, 246, 0.4); border-radius:4px; cursor:pointer; font-weight:600;">
                                ✓ Auftrag abschließen
                              </button>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  ` : `<div style="padding:16px; text-align:center; color:var(--color-text-muted); background:rgba(255,255,255,0.02); border-radius:6px;">Derzeit keine aktiven Aufträge in Bearbeitung.</div>`}
                </div>
              </div>
            `;
            break;
          }
          case 'kpi-card-requests': {
            const pendingRequests = ordersList.filter(o => o.status === "Pending");
            htmlContent = `
              <div style="margin-top:16px;">
                <p style="margin-bottom:12px; color: var(--color-text-secondary);">
                  Alle eingegangenen <strong>Anfragen</strong>. Alle angelegten Einträge starten als Anfrage. Erst wenn der Kunde den Auftrag erteilt, werden sie zu aktiven Aufträgen.
                </p>
                <div style="margin-top:12px;">
                  ${pendingRequests.length > 0 ? `
                    <table class="data-table" style="width:100%; border-collapse:collapse;">
                      <thead>
                        <tr style="border-bottom: 1px solid var(--color-border); text-align:left;">
                          <th style="padding: 8px;">ID</th>
                          <th style="padding: 8px;">Kunde</th>
                          <th style="padding: 8px;">Produkt / Service</th>
                          <th style="padding: 8px;">Betrag</th>
                          <th style="padding: 8px;">Datum</th>
                          <th style="padding: 8px;">Aktion</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${pendingRequests.map(r => `
                          <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: 8px; font-weight:bold; color:var(--color-primary);">${r.id}</td>
                            <td style="padding: 8px;">${r.client}</td>
                            <td style="padding: 8px;">${r.product || r.branch}</td>
                            <td style="padding: 8px;">€ ${r.value.toFixed(2)}</td>
                            <td style="padding: 8px;">${r.date}</td>
                            <td style="padding: 8px;">
                              <button onclick="window.updateOrderStatus('${r.id}', 'Shipped')" style="padding:6px 12px; font-size:0.75rem; background:rgba(16, 185, 129, 0.2); color:#34d399; border:1px solid rgba(16, 185, 129, 0.4); border-radius:4px; cursor:pointer; font-weight:600;">
                                ⚡ Kunde gibt Auftrag
                              </button>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  ` : `<div style="padding:16px; text-align:center; color:var(--color-text-muted); background:rgba(255,255,255,0.02); border-radius:6px;">Derzeit liegen keine unbestätigten Anfragen vor.</div>`}
                </div>
              </div>
            `;
            break;
          }
          case 'kpi-card-completed':
            htmlContent = `
              <div style="margin-top:16px;">
                <p>Zusammenfassung der abgeschlossenen Aufträge.</p>
                <div style="margin-top:12px; display:flex; gap:16px;">
                  <div style="flex:1; padding:16px; background:var(--color-bg-sidebar); border-radius:8px;">
                    <h4>Zufriedenheitsquote</h4>
                    <p style="font-size:1.5rem; color:var(--color-delivered);">98,4%</p>
                  </div>
                  <div style="flex:1; padding:16px; background:var(--color-bg-sidebar); border-radius:8px;">
                    <h4>Retouren / Reklamationen</h4>
                    <p style="font-size:1.5rem; color:var(--color-pending);">1,6%</p>
                  </div>
                </div>
              </div>
            `;
            break;
          default:
            htmlContent = `<p style="margin-top:16px;">Erweiterte Daten für <strong>${cardTitle}</strong> werden derzeit generiert und stehen in Kürze hier zur Verfügung.</p>`;
        }
        
        detailsContent.innerHTML = htmlContent;
        
        // Scroll to panel
        detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  // Modal Open
  if (btnOpenModal) {
    btnOpenModal.addEventListener("click", () => {
      orderModal.classList.add("active");
      document.getElementById("customerName").focus();
    });
  }

  // Modal Close
  const closeModal = () => {
    orderModal.classList.remove("active");
    createOrderForm.reset();
  };
  btnCloseModal.addEventListener("click", closeModal);
  btnCancelForm.addEventListener("click", closeModal);

  // Role Selector Event Listener
  const selector = document.getElementById("role-selector");
  if (selector) {
    selector.addEventListener("change", (e) => {
      ServiceOSStore.setCurrentUserId(e.target.value);
      renderApp();
    });
  }


  // Form Submit
  createOrderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const client = document.getElementById("customerName").value;
    const product = document.getElementById("productName").value;
    const value = parseFloat(document.getElementById("orderValue").value);
    const priority = document.getElementById("orderPriority").value;
    const status = document.getElementById("orderStatus").value;
    
    const orderId = generateCryptographicId("ORD");
    const caseId = generateCryptographicId("CAS");
    const caseNumber = generateCryptographicId("SO");
    const today = new Date().toISOString().split('T')[0];

    const currentUser = ServiceOSStore.getCurrentUser();
    const assignedCompanyId = (currentUser.role === "Partner" || currentUser.role === "Sub-Partner") ? currentUser.companyId : null;

    const description = `Standardauftrag für ${product} bei Client ${client}.`;
    const metrics = calculateQNexusScore(description, "General", assignedCompanyId);

    // Create Case (Fallakte) in Store
    const newCase = ServiceOSStore.createCase({
      id: caseId,
      caseNumber: caseNumber,
      client: client,
      location: "Direkterfassung",
      branch: "General",
      reason: description,
      status: status,
      companyId: assignedCompanyId,
      orders: [orderId],
      author: currentUser.name || "Zentrale"
    });

    const newOrder = { 
      id: orderId, 
      caseId: newCase.id,
      caseNumber: newCase.caseNumber,
      client, 
      product, 
      description,
      value, 
      priority, 
      status, 
      date: today,
      branch: "General",
      companyId: assignedCompanyId,
      qNexusMetrics: metrics
    };
    
    // Add to store
    const allOrders = ServiceOSStore.getOrders();
    allOrders.unshift(newOrder);
    ServiceOSStore.set("orders", allOrders);
    ServiceOSStore.logAudit("ORDER_CREATION", `Created order ${orderId} (Fallakte ${newCase.caseNumber}) for client ${client}`);

    // Update Chart flow values
    updateChartDataForNewOrder(newOrder);

    // Re-render
    renderApp();
    closeModal();
  });

  // LUDUS Gamification Calculator Logic
  const calcSlider = document.getElementById("calc-priority-slider");
  const calcDays = document.getElementById("calc-days");
  const calcPkgSlider = document.getElementById("calc-packaging-slider");
  const calcPkgLevel = document.getElementById("calc-pkg-level");
  const calcExpressCheck = document.getElementById("calc-express-check");
  const calcBaseCostEl = document.getElementById("calc-base-cost");
  const calcExtraCostEl = document.getElementById("calc-extra-cost");
  const calcCostResult = document.getElementById("calc-cost-result");
  const calcResourceResult = document.getElementById("calc-resource-result");

  const updateCalculator = () => {
    if (!calcSlider) return;
    const days = parseInt(calcSlider.value, 10);
    const pkgLevel = parseInt(calcPkgSlider ? calcPkgSlider.value : 2, 10);
    const isExpress = calcExpressCheck ? calcExpressCheck.checked : false;

    if (calcDays) calcDays.innerText = days;
    if (calcPkgLevel) calcPkgLevel.innerText = pkgLevel;
    
    // Calculate costs
    const baseCost = 350;
    
    let extraCost = 0;
    // Priority speed overhead
    extraCost += (11 - days) * 20;
    // Packaging overhead
    extraCost += (pkgLevel - 1) * 80;
    // Express overhead
    if (isExpress) extraCost += 150;

    // Pull config commission & currency
    const settings = ServiceOSStore.getSettings();
    const formatter = new Intl.NumberFormat(settings.language || "de-AT", { 
      style: "currency", 
      currency: settings.currency || "EUR" 
    });

    const commissionFee = (baseCost + extraCost) * ((settings.commission || 15) / 100);
    const totalCost = baseCost + extraCost + commissionFee;

    if (calcBaseCostEl) calcBaseCostEl.innerText = formatter.format(baseCost);
    if (calcExtraCostEl) calcExtraCostEl.innerText = formatter.format(extraCost);
    if (calcCostResult) calcCostResult.innerText = formatter.format(totalCost);

    if (calcResourceResult) {
      if (days <= 2 || isExpress) {
        calcResourceResult.innerText = "Critical load";
        calcResourceResult.style.color = "var(--color-priority-critical)";
      } else if (days <= 5) {
        calcResourceResult.innerText = "High load";
        calcResourceResult.style.color = "var(--color-priority-high)";
      } else {
        calcResourceResult.innerText = "Optimal";
        calcResourceResult.style.color = "var(--color-delivered)";
      }
    }

    // LUDUS-Telemetry (Bot-Immunity): Ping analytics on physical interaction
    console.log(`[LUDUS Telemetry] User adjusted SLA Configurator. Target Days: ${days}, Est. Cost: ${totalCost}`);
  };

  if (calcSlider) {
    calcSlider.addEventListener("input", (e) => {
      updateCalculator();
    });
    // Init state
    updateCalculator();
  }
  
  if (calcPkgSlider) {
    calcPkgSlider.addEventListener("input", (e) => {
      updateCalculator();
    });
  }
  
  if (calcExpressCheck) {
    calcExpressCheck.addEventListener("change", (e) => {
      updateCalculator();
    });
  }
}

function updateChartDataForNewOrder(order) {
  // Add amount to the last item in chartData if it matches today's date
  // For mock simulation, we just increase the last day's volume
  if (chartData.length > 0) {
    chartData[chartData.length - 1].amount += order.value;
  }
}

function renderCasesTable() {
  const tableBody = document.getElementById("cases-table-body");
  if (!tableBody) return;

  const searchVal = (document.getElementById("cases-search-input")?.value || "").toLowerCase();
  let cases = ServiceOSStore.getCases();

  if (searchVal) {
    cases = cases.filter(c => 
      (c.caseNumber || "").toLowerCase().includes(searchVal) ||
      (c.id || "").toLowerCase().includes(searchVal) ||
      (c.client || "").toLowerCase().includes(searchVal) ||
      (c.location || "").toLowerCase().includes(searchVal) ||
      (c.branch || "").toLowerCase().includes(searchVal)
    );
  }

  tableBody.innerHTML = "";

  if (cases.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Fallakten gefunden.</td></tr>`;
    return;
  }

  cases.forEach(c => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--color-border)";
    const orderCount = (c.orders || []).length;
    const timelineCount = (c.timeline || []).length;

    tr.innerHTML = `
      <td style="padding: 12px; font-family: var(--font-heading); font-weight: 600;">
        <div style="color: #f59e0b;">${c.caseNumber || c.id}</div>
        <div style="font-size: 0.7rem; color: var(--color-text-muted); font-family: monospace;">ID: ${c.id}</div>
      </td>
      <td style="padding: 12px;">
        <div style="font-weight: 500; color: var(--color-text-primary);">${c.client}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${c.location || 'Direktauftrag'}</div>
      </td>
      <td style="padding: 12px;">
        <div style="font-size: 0.85rem; color: var(--color-text-primary); font-weight: 500;">${c.branch}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${c.reason || 'Serviceanfrage'}</div>
      </td>
      <td style="padding: 12px; text-align: center;">
        <span style="font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; font-weight: bold;">
          ${orderCount} Teilauftrag${orderCount !== 1 ? 'äge' : ''}
        </span>
      </td>
      <td style="padding: 12px; text-align: center;">
        <span class="badge-status ${(c.status || 'Pending').toLowerCase()}" style="font-size: 0.75rem;">
          ${c.status || 'Pending'}
        </span>
      </td>
      <td style="padding: 12px; text-align: right;">
        <button type="button" class="btn btn-sm btn-open-case-modal" data-id="${c.id}" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); font-weight: 600; cursor: pointer;">
          📜 Akte öffnen (${timelineCount})
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll(".btn-open-case-modal").forEach(btn => {
    btn.addEventListener("click", () => openCaseDetailModal(btn.getAttribute("data-id")));
  });
}

function openCaseDetailModal(caseId) {
  const caseObj = ServiceOSStore.getCaseById(caseId);
  if (!caseObj) return;

  const modal = document.getElementById("case-modal-detail");
  if (!modal) return;

  document.getElementById("case-modal-title").textContent = `📁 Fallakte ${caseObj.caseNumber || caseObj.id}`;
  document.getElementById("case-modal-subtitle").textContent = `Kunde: ${caseObj.client} | Branche: ${caseObj.branch} | Ort: ${caseObj.location || 'k.A.'}`;

  // Render Linked Orders
  const ordersListEl = document.getElementById("case-modal-orders-list");
  const allOrders = ServiceOSStore.getOrders();
  const linkedOrders = allOrders.filter(o => o.caseId === caseObj.id || o.caseNumber === caseObj.caseNumber || (caseObj.orders || []).includes(o.id));

  if (ordersListEl) {
    if (linkedOrders.length === 0) {
      ordersListEl.innerHTML = `<div style="font-size: 0.8rem; color: var(--color-text-muted);">Keine Teilaufträge verknüpft.</div>`;
    } else {
      ordersListEl.innerHTML = linkedOrders.map(o => `
        <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid var(--color-border); border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
          <div>
            <span style="font-family: monospace; font-weight: bold; color: var(--color-primary);">${o.id}</span>
            <span style="margin-left: 8px; color: var(--color-text-primary); font-weight: 500;">${o.product || o.branch}</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <strong style="color: #34d399;">€ ${(o.value || 0).toFixed(2)}</strong>
            <span class="badge-status ${o.status.toLowerCase()}" style="font-size: 0.7rem;">${o.status}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Render Timeline
  renderCaseTimelineList(caseObj);

  // Set up add note handler
  const addBtn = document.getElementById("btn-add-case-timeline-entry");
  const inputEl = document.getElementById("case-timeline-new-input");

  if (addBtn && inputEl) {
    const newAddBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAddBtn, addBtn);

    newAddBtn.addEventListener("click", () => {
      const noteText = inputEl.value.trim();
      if (!noteText) return;
      const currentUser = ServiceOSStore.getCurrentUser();
      ServiceOSStore.addTimelineEventToCase(caseObj.id, {
        title: "Manuelle Aktennotiz",
        author: currentUser.name || "Bearbeiter",
        type: "NOTE",
        details: noteText
      });
      inputEl.value = "";
      const updatedCase = ServiceOSStore.getCaseById(caseObj.id);
      renderCaseTimelineList(updatedCase);
      renderCasesTable();
    });
  }

  const closeBtn = document.getElementById("btn-close-case-modal");
  if (closeBtn) closeBtn.onclick = () => { modal.style.display = "none"; };

  modal.style.display = "flex";
}

function renderCaseTimelineList(caseObj) {
  const container = document.getElementById("case-modal-timeline-container");
  if (!container) return;
  const timeline = caseObj.timeline || [];

  if (timeline.length === 0) {
    container.innerHTML = `<div style="font-size: 0.8rem; color: var(--color-text-muted);">Keine Einträge in der Akten-Timeline.</div>`;
    return;
  }

  container.innerHTML = timeline.map(t => `
    <div style="background: rgba(30, 41, 59, 0.5); border-left: 3px solid #3b82f6; border-radius: 4px; padding: 8px 12px; font-size: 0.8rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <strong style="color: var(--color-text-primary);">${t.title || 'Ereignis'}</strong>
        <span style="font-size: 0.7rem; color: var(--color-text-muted);">${new Date(t.timestamp).toLocaleString('de-AT')} (${t.author || 'System'})</span>
      </div>
      <div style="color: var(--color-text-secondary);">${t.details || t.description || ''}</div>
    </div>
  `).join('');
}

window.renderCasesTable = renderCasesTable;

function renderApp() {
  loadOrdersFromStore();
  updateKPIs();
  renderOrdersList();
  renderCasesTable();
  renderChart();
  updateUserHeaderProfile();
  applyRolePermissionsUI();
}

function updateKPIs() {
  // Mock subset logic for demo purposes based on totals
  const calcSubsets = (total, isCurrency = false) => {
    const today = isCurrency ? total * 0.12 : Math.round(total * 0.12);
    const week = isCurrency ? total * 0.45 : Math.round(total * 0.45);
    const month = total;
    return { today, week, month };
  };

  const formatEuro = (val) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(val);

  // Total Revenue
  const totalRevenue = ordersList
    .filter(o => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.value, 0);
  const rev = calcSubsets(totalRevenue, true);
  if (kpiRevenueToday) kpiRevenueToday.innerText = formatEuro(rev.today);
  if (kpiRevenueWeek) kpiRevenueWeek.innerText = formatEuro(rev.week);
  if (kpiRevenueMonth) kpiRevenueMonth.innerText = formatEuro(rev.month);

  // Active Orders (Shipped - vom Kunden erteilte Aufträge in Bearbeitung)
  const activeOrdersCount = ordersList.filter(o => o.status === "Shipped").length;
  const act = calcSubsets(activeOrdersCount);
  if (kpiActiveToday) kpiActiveToday.innerText = act.today;
  if (kpiActiveWeek) kpiActiveWeek.innerText = act.week;
  if (kpiActiveMonth) kpiActiveMonth.innerText = act.month;

  // Completed Orders
  const completedOrdersCount = ordersList.filter(o => o.status === "Delivered").length;
  const comp = calcSubsets(completedOrdersCount);
  if (kpiCompletedToday) kpiCompletedToday.innerText = comp.today;
  if (kpiCompletedWeek) kpiCompletedWeek.innerText = comp.week;
  if (kpiCompletedMonth) kpiCompletedMonth.innerText = comp.month;

  // Additional static/mock updates for average delivery time
  if (kpiAvgTimeToday) kpiAvgTimeToday.innerText = "1,8 Std.";
  if (kpiAvgTimeWeek) kpiAvgTimeWeek.innerText = "2,1 Std.";
  if (kpiAvgTimeMonth) kpiAvgTimeMonth.innerText = "2,0 Std.";

  // Anfragen (Pending - eingegangene Anfragen, wartend auf Kunden-Auftrag)
  const pendingRequestsCount = ordersList.filter(o => o.status === "Pending").length;
  const req = calcSubsets(pendingRequestsCount);
  if (kpiRequestsToday) kpiRequestsToday.innerText = req.today;
  if (kpiRequestsWeek) kpiRequestsWeek.innerText = req.week;
  if (kpiRequestsMonth) kpiRequestsMonth.innerText = req.month;

  if (kpiActionToday) kpiActionToday.innerText = Math.round(activeOrdersCount * 0.1);
  if (kpiActionWeek) kpiActionWeek.innerText = Math.round(activeOrdersCount * 0.2);
  if (kpiActionMonth) kpiActionMonth.innerText = Math.round(activeOrdersCount * 0.5);

  // Progress calculations
  const totalOrders = ordersList.length || 1;
  const pendingCount = ordersList.filter(o => o.status === "Pending").length;
  const shippedCount = ordersList.filter(o => o.status === "Shipped").length;
  const deliveredCount = ordersList.filter(o => o.status === "Delivered").length;
  const cancelledCount = ordersList.filter(o => o.status === "Cancelled").length;
  // Mock returns count (e.g. 5% of delivered or random)
  const returnsCount = Math.round(deliveredCount * 0.05);

  let pctPending = Math.round((pendingCount / totalOrders) * 100);
  let pctShipped = Math.round((shippedCount / totalOrders) * 100);
  let pctDelivered = Math.round((deliveredCount / totalOrders) * 100);
  let pctCancelled = Math.round((cancelledCount / totalOrders) * 100);
  let pctReturns = Math.round((returnsCount / totalOrders) * 100);

  // Apply mock scaling based on selected time range
  if (currentFulfillmentRange === "1m") {
    pctPending = Math.min(100, Math.round(pctPending * 1.5));
    pctShipped = Math.max(0, Math.round(pctShipped * 0.8));
    pctDelivered = Math.min(100, Math.round(pctDelivered * 1.1));
    pctCancelled = Math.round(pctCancelled * 1.2);
    pctReturns = Math.round(pctReturns * 1.4);
  } else if (currentFulfillmentRange === "3m") {
    pctPending = Math.max(0, Math.round(pctPending * 0.6));
    pctShipped = Math.max(0, Math.round(pctShipped * 1.3));
    pctDelivered = Math.min(100, Math.round(pctDelivered * 1.4));
    pctCancelled = Math.round(pctCancelled * 0.9);
    pctReturns = Math.round(pctReturns * 1.1);
  } else if (currentFulfillmentRange === "1y") {
    pctPending = Math.max(0, Math.round(pctPending * 0.3));
    pctShipped = Math.max(0, Math.round(pctShipped * 0.5));
    pctDelivered = Math.min(100, Math.round(pctDelivered * 1.8));
    pctCancelled = Math.round(pctCancelled * 0.5);
    pctReturns = Math.round(pctReturns * 0.8);
  }

  // Normalize to 100% (excluding cancelled/returns which are separate health metrics in some contexts, 
  // but let's just use the absolute percentages for the bars)
  if (barPending) barPending.style.width = pctPending + "%";
  if (barShipped) barShipped.style.width = pctShipped + "%";
  if (barDelivered) barDelivered.style.width = pctDelivered + "%";
  if (barCancelled) barCancelled.style.width = pctCancelled + "%";
  if (barReturns) barReturns.style.width = pctReturns + "%";

  if (labelPending) labelPending.innerText = pctPending + "%";
  if (labelShipped) labelShipped.innerText = pctShipped + "%";
  if (labelDelivered) labelDelivered.innerText = pctDelivered + "%";
  if (labelCancelled) labelCancelled.innerText = pctCancelled + "%";
  if (labelReturns) labelReturns.innerText = pctReturns + "%";
}

function renderOrdersList() {
  bodyTable.innerHTML = "";

  const filtered = ordersList.filter(order => {
    // Filter Tab
    const matchesFilter = activeFilter === "all" || order.status === activeFilter;
    
    // Search Query
    const matchesSearch = order.id.toLowerCase().includes(searchQuery) ||
                          order.client.toLowerCase().includes(searchQuery) ||
                          order.product.toLowerCase().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    bodyTable.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--color-text-muted); padding: 32px;">Keine passenden Datensätze gefunden.</td></tr>`;
    return;
  }

  filtered.forEach((order, index) => {
    const tr = document.createElement("tr");
    tr.className = "animate-row";
    tr.style.animationDelay = `${index * 0.05}s`;

    // Format currency
    const formattedVal = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(order.value);

    // Actions
    let actionButtons = "";
    if (order.status === "Pending") {
      actionButtons = `
        <button class="action-row-btn complete" onclick="window.updateOrderStatus('${order.id}', 'Shipped')" title="Kunde gibt Auftrag" style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; font-size:0.75rem; background:rgba(16, 185, 129, 0.15); color:#10b981; border:1px solid rgba(16, 185, 129, 0.3); border-radius:4px; font-weight:600; cursor:pointer;">
          ⚡ Kunde gibt Auftrag
        </button>
        <button class="action-row-btn cancel" onclick="window.updateOrderStatus('${order.id}', 'Cancelled')" title="Anfrage stornieren">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;
    } else if (order.status === "Shipped") {
      actionButtons = `
        <button class="action-row-btn complete" onclick="window.updateOrderStatus('${order.id}', 'Delivered')" title="Auftrag abschließen" style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; font-size:0.75rem; background:rgba(59, 130, 246, 0.15); color:#60a5fa; border:1px solid rgba(59, 130, 246, 0.3); border-radius:4px; font-weight:600; cursor:pointer;">
          ✓ Auftrag abschließen
        </button>
      `;
    } else {
      actionButtons = `<span style="color: var(--color-text-muted); font-size: 0.75rem;">Gesperrt</span>`;
    }

    const scoreVal = order.qNexusMetrics ? order.qNexusMetrics.qNexus : 1.0;
    let scoreColorClass = "q-excellent";
    if (scoreVal < 0.6) scoreColorClass = "q-critical";
    else if (scoreVal < 0.85) scoreColorClass = "q-warning";

    const priorityText = { "Normal": "Normal", "High": "Hoch", "Critical": "Kritisch" }[order.priority] || order.priority;
    const statusText = { "Pending": "Anfrage (Wartet auf Kunden)", "Shipped": "Auftrag erteilt", "Delivered": "Abgeschlossen", "Cancelled": "Storniert" }[order.status] || order.status;

    const caseObj = ServiceOSStore.getCaseById(order.caseId || order.caseNumber);
    const suggestions = generateCrossSellingSuggestions(order.branch, order.description, order.subcategories);

    tr.innerHTML = `
      <td style="font-family: var(--font-heading); font-weight: 600; color: var(--color-primary);">
        <div>${order.id}</div>
        ${order.caseNumber ? `<div style="font-size: 0.65rem; color: #f59e0b; font-weight: normal; margin-top: 2px;">📁 ${order.caseNumber}</div>` : ''}
      </td>
      <td>
        <div style="font-weight: 500; color: var(--color-text-primary);">${order.client}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${order.date}</div>
      </td>
      <td>
        <div>${order.product}</div>
        <div style="display:inline-flex; align-items:center; gap:4px; font-size: 0.65rem; color: var(--color-secondary); margin-top:4px; padding: 2px 6px; background: var(--color-secondary-glow); border-radius: 4px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Geo-Validiert
        </div>
      </td>
      <td style="font-weight: 600; color: var(--color-text-primary);">${formattedVal}</td>
      <td><span class="priority-indicator ${order.priority}">${priorityText}</span></td>
      <td>
        <span class="q-score-badge ${scoreColorClass}" style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-family: monospace; font-weight: bold;">
          ${scoreVal.toFixed(3)}
        </span>
      </td>
      <td><span class="badge-status ${order.status.toLowerCase()}">${statusText}</span></td>
      <td>
        <div style="display: flex; gap: 8px;">
          ${actionButtons}
        </div>
      </td>
    `;
    
    // Add cursor pointer to indicate it's clickable
    tr.style.cursor = 'pointer';
    
    // Fetch registered companies for partner assignment dropdown
    const companies = ServiceOSStore.getCompanies();

    // Detail Row with Edit & Partner Assignment Panel
    const detailTr = document.createElement("tr");
    detailTr.className = "expandable-detail-row";
    detailTr.style.display = "none";
    detailTr.innerHTML = `
      <td colspan="8" style="padding: 0; border: none;">
        <div class="expandable-content" style="padding: 20px 24px; background: var(--color-bg-sidebar); border-bottom: 1px solid var(--color-border); box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1.1fr; gap: 24px; align-items: start;">
            
            <!-- Spalte 1: Kunden- & Auftragsdaten bearbeiten -->
            <div>
              <h4 style="margin-bottom: 12px; color: #60a5fa; font-size: 0.95rem; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                👤 Kunden & Auftragsdaten
              </h4>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Kundenname</label>
                  <input type="text" class="wizard-input edit-order-client" value="${(order.client || '').replace(/"/g, '&quot;')}" style="height: 36px; padding: 0 10px; font-size: 0.85rem;" />
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Auftragswert (€)</label>
                  <input type="number" step="0.01" class="wizard-input edit-order-value" ${isPartner ? 'disabled' : ''} value="${order.value || 0}" style="height: 36px; padding: 0 10px; font-size: 0.85rem; background: ${isPartner ? 'rgba(15,23,42,0.4)' : 'transparent'}; color: ${isPartner ? 'var(--color-text-muted)' : 'var(--color-text-primary)'}; cursor: ${isPartner ? 'not-allowed' : 'text'};" />
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Beschreibung / Notizen</label>
                  <textarea class="wizard-input edit-order-desc" rows="2" style="padding: 8px 10px; font-size: 0.85rem; width: 100%; resize: vertical;">${order.description || ''}</textarea>
                </div>
                
                <!-- Risk Shield Zustandsdokumentation -->
                <div style="margin-top: 6px; border-top: 1px dashed var(--color-border); padding-top: 8px;">
                  <label style="font-size: 0.75rem; color: #60a5fa; display: flex; align-items: center; gap: 4px; margin-bottom: 4px; font-weight: 600;">
                    🛡️ Risk Shield - Zustandsprotokoll
                  </label>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div>
                      <span style="font-size: 0.7rem; color: var(--color-text-secondary);">Vorher-Zustand (Start):</span>
                      <input type="text" class="wizard-input edit-order-statedoc-pre" value="${(order.stateDocPre || '').replace(/"/g, '&quot;')}" placeholder="Protokollierung bei Besichtigung / Übernahme" style="height: 32px; font-size: 0.8rem; width: 100%;" />
                    </div>
                    <div>
                      <span style="font-size: 0.7rem; color: var(--color-text-secondary);">Nachher-Zustand (Abnahme):</span>
                      <input type="text" class="wizard-input edit-order-statedoc-post" value="${(order.stateDocPost || '').replace(/"/g, '&quot;')}" placeholder="Besenreine Übergabe / Mängelprüfung" style="height: 32px; font-size: 0.8rem; width: 100%;" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Spalte 2: Partnerfirma zuweisen & Workflow -->
            <div>
              <h4 style="margin-bottom: 12px; color: #60a5fa; font-size: 0.95rem; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                🏢 Partnerfirma zuweisen
              </h4>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Zugeordnete Partnerfirma</label>
                  <select class="wizard-input edit-order-company" ${isPartner ? 'disabled' : ''} style="height: 36px; padding: 0 10px; font-size: 0.85rem; background: ${isPartner ? 'rgba(15,23,42,0.4)' : 'rgba(15, 23, 42, 0.9)'}; border: 1px solid var(--color-border); color: ${isPartner ? 'var(--color-text-muted)' : 'var(--color-text-primary)'}; border-radius: var(--border-radius-sm); width: 100%; cursor: ${isPartner ? 'not-allowed' : 'pointer'};">
                    <option value="">-- Direktauftrag (Zentrale / Keine) --</option>
                    ${companies.map(c => `
                      <option value="${c.id}" ${order.companyId === c.id ? 'selected' : ''}>
                        ${c.name} (${c.id} - ${c.active ? 'GISA OK' : 'Inaktiv'})
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Auftragsstatus</label>
                  <select class="wizard-input edit-order-status" style="height: 36px; padding: 0 10px; font-size: 0.85rem; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--color-border); color: var(--color-text-primary); border-radius: var(--border-radius-sm); width: 100%;">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Anfrage (Wartet auf Kunden)</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Auftrag erteilt (In Bearbeitung)</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Abgeschlossen / Geliefert</option>
                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Storniert</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Prioritäts-Level</label>
                  <select class="wizard-input edit-order-priority" style="height: 36px; padding: 0 10px; font-size: 0.85rem; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--color-border); color: var(--color-text-primary); border-radius: var(--border-radius-sm); width: 100%;">
                    <option value="Normal" ${order.priority === 'Normal' ? 'selected' : ''}>Normal</option>
                    <option value="High" ${order.priority === 'High' ? 'selected' : ''}>Hoch</option>
                    <option value="Critical" ${order.priority === 'Critical' ? 'selected' : ''}>Kritisch</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Spalte 3: Details, Speichern, KI Cross-Selling & Dokument-Aktion -->
            <div>
              <h4 style="margin-bottom: 12px; color: #60a5fa; font-size: 0.95rem; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                ⚙️ Metriken & Aktionen
              </h4>
              <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 12px; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px; border: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 4px;">
                <div><strong style="color: var(--color-text-primary);">Fallakte:</strong> <span style="font-family: monospace; color: #f59e0b; font-weight: bold;">${order.caseNumber || caseObj?.caseNumber || 'Keine Fallakte'}</span></div>
                <div><strong style="color: var(--color-text-primary);">Branche:</strong> ${order.branch || order.product || 'Allgemein'}</div>
                <div><strong style="color: var(--color-text-primary);">Partner Name:</strong> ${order.partner || (order.companyId ? order.companyId : 'Zentrale')}</div>
                <div><strong style="color: var(--color-text-primary);">Q_NEXUS Score:</strong> <span style="font-family: monospace; color: #34d399; font-weight: bold;">${scoreVal.toFixed(3)}</span></div>
                ${order.subcategories && order.subcategories.length > 0 ? `
                  <div style="margin-top: 2px;">
                    <strong style="color: var(--color-text-primary);">Unterbereiche:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px;">
                      ${order.subcategories.map(s => `<span style="font-size: 0.7rem; padding: 1px 5px; border-radius: 3px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">${s}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button type="button" class="btn-save-order-changes" style="background: var(--color-delivered); color: #fff; border: none; padding: 9px 14px; font-size: 0.85rem; border-radius: var(--border-radius-sm); cursor: pointer; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  ✓ Änderungen speichern
                </button>
                <button type="button" class="btn-create-doc-from-order" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); padding: 9px 14px; font-size: 0.85rem; border-radius: var(--border-radius-sm); cursor: pointer; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  📄 Angebot / Rechnung erstellen
                </button>
              </div>

              ${suggestions && suggestions.length > 0 ? `
                <div style="margin-top: 14px; border-top: 1px dashed var(--color-border); padding-top: 10px;">
                  <h5 style="color: #f59e0b; font-size: 0.8rem; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                    ✨ KI Cross-Selling Empfehlungen
                  </h5>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${suggestions.map(s => `
                      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 8px; border-radius: 6px; font-size: 0.75rem;">
                        <div style="font-weight: 600; color: #fbbf24; font-size: 0.8rem;">${s.title} (${s.branch})</div>
                        <div style="color: var(--color-text-secondary); margin: 2px 0 4px 0;">${s.reason}</div>
                        <button type="button" onclick="window.createCrossSellingSubOrder('${caseObj ? caseObj.id : (order.caseId || order.id)}', '${s.branch}', '${s.title.replace(/'/g, "\\'")}', ${s.suggestedValue})" style="padding: 4px 8px; font-size: 0.7rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 4px; cursor: pointer; font-weight: 600; width: 100%;">
                          ⚡ Teilauftrag anlegen (€ ${s.suggestedValue})
                        </button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

          </div>
        </div>
      </td>
    `;

    // Event handler for saving edits & partner assignment
    detailTr.querySelector('.btn-save-order-changes').addEventListener('click', (e) => {
      e.stopPropagation();
      const newClient = detailTr.querySelector('.edit-order-client').value.trim();
      const newVal = parseFloat(detailTr.querySelector('.edit-order-value').value) || 0;
      const newDesc = detailTr.querySelector('.edit-order-desc').value.trim();
      const newCompanyId = detailTr.querySelector('.edit-order-company').value;
      const newStatus = detailTr.querySelector('.edit-order-status').value;
      const newPriority = detailTr.querySelector('.edit-order-priority').value;
      const stateDocPre = detailTr.querySelector('.edit-order-statedoc-pre')?.value.trim() || '';
      const stateDocPost = detailTr.querySelector('.edit-order-statedoc-post')?.value.trim() || '';

      const allOrders = ServiceOSStore.getOrders();
      const targetIdx = allOrders.findIndex(o => o.id === order.id);

      if (targetIdx > -1) {
        let partnerName = "Direktauftrag (Zentrale)";
        if (newCompanyId) {
          const matchedCompany = companies.find(c => c.id === newCompanyId);
          if (matchedCompany) {
            partnerName = matchedCompany.name;
            if (window.calculatePartnerTrustScore) {
              const trust = window.calculatePartnerTrustScore(matchedCompany);
              if (trust.trafficLight.includes("Gesperrt")) {
                alert(`⚠️ Risk Shield Sperre: Die Partnerfirma "${matchedCompany.name}" ist aktuell gesperrt (${trust.trafficLight}). Auftragszuweisung abgelehnt.`);
                return;
              }
            }
          }
        }

        allOrders[targetIdx] = {
          ...allOrders[targetIdx],
          client: newClient,
          value: newVal,
          description: newDesc,
          companyId: newCompanyId || null,
          partner: partnerName,
          partnerId: newCompanyId || null,
          status: newStatus,
          priority: newPriority,
          stateDocPre: stateDocPre,
          stateDocPost: stateDocPost
        };

        ServiceOSStore.set("orders", allOrders);
        ServiceOSStore.logAudit("ORDER_UPDATED", `Auftrag ${order.id} für ${newClient} aktualisiert (Partner: ${partnerName}, Status: ${newStatus}).`);
        alert(`✓ Auftrag ${order.id} wurde erfolgreich aktualisiert!`);
        renderApp();
      }
    });

    // Event handler for creating documents from order
    detailTr.querySelector('.btn-create-doc-from-order').addEventListener('click', (e) => {
      e.stopPropagation();
      const docNavBtn = document.querySelector('.nav-leaf[data-tab="tab-new-document"]');
      if (docNavBtn) {
        docNavBtn.click();
        setTimeout(() => {
          const docType = document.getElementById('doc-type');
          const docClient = document.getElementById('doc-client');
          const docTitle = document.getElementById('doc-title');
          const docNetto = document.getElementById('doc-netto');
          const docCaseId = document.getElementById('doc-case-id');

          if (docType) docType.value = "Rechnung (§ 11 UStG)";
          if (docClient) docClient.value = order.client || '';
          if (docTitle) docTitle.value = `Honorarrechnung für ${order.product || order.branch || 'Dienstleistung'} (${order.id})`;
          if (docNetto) docNetto.value = ((order.value || 450) / 1.2).toFixed(2);
          if (docCaseId && (order.caseId || order.caseNumber)) docCaseId.value = order.caseId || order.caseNumber;

          const evt = new Event('input');
          if (docTitle) docTitle.dispatchEvent(evt);
          if (docNetto) docNetto.dispatchEvent(evt);
        }, 100);
      }
    });

    // Stop propagation inside detailTr inputs so clicking inputs does not collapse row
    detailTr.querySelectorAll('input, select, textarea, button').forEach(el => {
      el.addEventListener('click', (e) => e.stopPropagation());
    });

    // Click handler for expansion
    tr.addEventListener('click', (e) => {
      // Ignore clicks on action buttons inside top row
      if (e.target.closest('button')) return;
      
      const isExpanded = detailTr.style.display === 'table-row';
      detailTr.style.display = isExpanded ? 'none' : 'table-row';
      if (!isExpanded) {
        tr.style.backgroundColor = 'rgba(99,102,241,0.05)';
      } else {
        tr.style.backgroundColor = '';
      }
    });

    bodyTable.appendChild(tr);
    bodyTable.appendChild(detailTr);
  });
}

// Global scope bindings for inline onclick handlers
window.updateOrderStatus = (id, newStatus) => {
  const allOrders = ServiceOSStore.getOrders();
  const idx = allOrders.findIndex(o => o.id === id);
  if (idx !== -1) {
    const order = allOrders[idx];
    const user = ServiceOSStore.getCurrentUser();
    
    let hasPermission = false;
    if (user.role === "Superadmin" || user.role === "Administrator") {
      hasPermission = true;
    } else if (user.role === "Partner" && order.companyId === user.companyId) {
      hasPermission = true;
    }

    if (hasPermission) {
      const oldStatus = order.status;
      order.status = newStatus;
      ServiceOSStore.set("orders", allOrders);
      ServiceOSStore.logAudit("ORDER_STATUS_CHANGE", `Order ${id} status changed from ${oldStatus} to ${newStatus}`);
      renderApp();
    } else {
      alert(`Zugriff verweigert: Als ${user.role} haben Sie keine Berechtigung, diesen Auftrag zu aktualisieren.`);
      ServiceOSStore.logAudit("UNAUTHORIZED_ACCESS_ATTEMPT", `Attempted to change order ${id} status from ${order.status} to ${newStatus} without permission.`);
    }
  }
};

function renderChart() {
  const chartContent = document.getElementById("chart-content");
  chartContent.innerHTML = "";

  if (chartData.length === 0) return;

  const width = 500;
  const height = 150;
  const paddingX = 50;
  const paddingY = 20;

  const maxVal = Math.max(...chartData.map(d => d.amount)) * 1.15 || 1000;
  const minVal = 0;

  const stepX = width / (chartData.length - 1 || 1);

  // Compute Points coordinates
  let points = [];
  chartData.forEach((d, i) => {
    const x = paddingX + i * stepX;
    const ratio = (d.amount - minVal) / (maxVal - minVal);
    const y = height + paddingY - ratio * height;
    points.push({ x, y, day: d.day, amount: d.amount });
  });

  // 1. Render Axis Text (X-Axis days)
  points.forEach((p) => {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", p.x);
    text.setAttribute("y", height + paddingY + 20);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("class", "chart-text");
    text.textContent = p.day;
    chartContent.appendChild(text);
  });

  // Y-Axis labels (3 levels)
  const yLabels = [maxVal, maxVal / 2, 0];
  const yPositions = [paddingY, paddingY + height / 2, paddingY + height];
  
  yLabels.forEach((val, i) => {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", paddingX - 10);
    text.setAttribute("y", yPositions[i] + 4);
    text.setAttribute("text-anchor", "end");
    text.setAttribute("class", "chart-text");
    
    // Format Y values (K format)
    const formattedY = val >= 1000 ? (val / 1000).toFixed(1) + "k" : Math.round(val);
    text.textContent = "€" + formattedY;
    chartContent.appendChild(text);
  });

  // 2. Build Path Lines
  let dPath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    dPath += ` L ${points[i].x} ${points[i].y}`;
  }

  // Draw Area under curve
  let dArea = `${dPath} L ${points[points.length - 1].x} ${height + paddingY} L ${points[0].x} ${height + paddingY} Z`;

  const areaElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  areaElement.setAttribute("d", dArea);
  areaElement.setAttribute("class", "chart-area");
  chartContent.appendChild(areaElement);

  const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  lineElement.setAttribute("d", dPath);
  lineElement.setAttribute("class", "chart-line");
  chartContent.appendChild(lineElement);

  // 3. Render Nodes
  points.forEach((p) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("class", "chart-point");
    
    // Simple HTML title tooltip
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${p.day}: €${p.amount.toFixed(2)}`;
    circle.appendChild(title);

    chartContent.appendChild(circle);
  });
}

window.showComplianceDetails = (id) => {
  const allOrders = ServiceOSStore.getOrders();
  const order = allOrders.find(o => o.id === id);
  if (!order) return;

  const modal = document.getElementById("compliance-details-modal");
  if (!modal) return;

  const title = document.getElementById("comp-modal-title");
  const desc = document.getElementById("comp-modal-desc");
  const scoreVal = document.getElementById("comp-modal-score");
  const details = document.getElementById("comp-modal-details");

  if (title) title.innerText = `Compliance-Audit: ${order.id}`;
  if (desc) desc.innerText = `Kunde: ${order.client} | Service: ${order.product}`;
  
  if (scoreVal && order.qNexusMetrics) {
    const score = order.qNexusMetrics.qNexus;
    scoreVal.innerText = score.toFixed(3);
    
    // reset classes
    scoreVal.className = "comp-large-score";
    if (score >= 0.85) scoreVal.classList.add("q-excellent");
    else if (score >= 0.6) scoreVal.classList.add("q-warning");
    else scoreVal.classList.add("q-critical");
  }

  if (details && order.qNexusMetrics) {
    const metrics = order.qNexusMetrics;
    const comp = metrics.compliance;
    
    let html = `
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; text-align: center;">
        <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 4px;">Syntax Score (S)</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: var(--color-primary);">${(metrics.sScore * 100).toFixed(0)}%</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 4px;">Verification (V)</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: var(--color-secondary);">${(metrics.vScore * 100).toFixed(0)}%</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 4px;">Lupos (FRE) (L)</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: #a855f7;">${(metrics.lScore * 100).toFixed(0)}%</div>
        </div>
      </div>
      
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 0.9rem; margin-bottom: 8px; font-family: var(--font-heading);">Validierter Textinhalt</h4>
        <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border); font-size: 0.85rem; line-height: 1.5; font-style: italic;">
          "${order.description || "N/A"}"
        </div>
      </div>
    `;

    if (comp.modifications && comp.modifications.length > 0) {
      html += `
        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 0.9rem; margin-bottom: 8px; color: var(--color-pending); font-family: var(--font-heading);">Linguistische Anpassungen (LINGUA-LOCAL)</h4>
          <ul style="padding-left: 20px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 8px; text-align: left;">
      `;
      comp.modifications.forEach(m => {
        html += `<li>Ersetzt: <s>"${m.original}"</s> &rarr; <strong>"${m.replaced}"</strong><br><small style="color: var(--color-text-muted);">${m.reason}</small></li>`;
      });
      html += `</ul></div>`;
    }

    if (comp.errors && comp.errors.length > 0) {
      html += `
        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 0.9rem; margin-bottom: 8px; color: var(--color-cancelled); font-family: var(--font-heading);">Compliance-Verstöße</h4>
          <ul style="padding-left: 20px; font-size: 0.8rem; color: #fda4af; display: flex; flex-direction: column; gap: 4px; text-align: left;">
      `;
      comp.errors.forEach(e => {
        html += `<li>${e}</li>`;
      });
      html += `</ul></div>`;
    } else {
      html += `
        <div style="color: var(--color-delivered); font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; margin-top: 16px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Verifizierung abgeschlossen: Fixpunkt erreicht ($T(X^*) = X^*$).
        </div>
      `;
    }

    details.innerHTML = html;
  }

  modal.classList.add("active");
};

// Close Compliance Modal Listeners
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("btn-close-comp-modal");
  const okBtn = document.getElementById("btn-close-comp-modal-ok");
  const modal = document.getElementById("compliance-details-modal");

  const close = () => {
    if (modal) modal.classList.remove("active");
  };

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (okBtn) okBtn.addEventListener("click", close);

  if (typeof initOrchestratorModule === "function") initOrchestratorModule();
});

if (typeof window !== "undefined") {
  window.renderCommandCenterView = renderCommandCenterView;
}
