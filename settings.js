import { ServiceOSStore } from './main.js';

function initSettings() {
  setupSettingsTabs();
  loadSettings();
  setupSettingsForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSettings);
} else {
  initSettings();
}

function setupSettingsTabs() {
  const navBtns = document.querySelectorAll(".settings-nav-btn");
  const panels = document.querySelectorAll(".settings-panel");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-settings-tab");

      // Update button active state
      navBtns.forEach(b => {
        b.classList.remove("active");
        b.style.color = "var(--color-text-secondary)";
      });
      btn.classList.add("active");
      btn.style.color = "var(--color-text-primary)";

      // Update panels visibility
      panels.forEach(p => {
        if (p.getAttribute("data-settings-panel") === targetTab) {
          p.style.display = "block";
          p.classList.add("active");
        } else {
          p.style.display = "none";
          p.classList.remove("active");
        }
      });
      // If partner-management tab selected, render partner UI
      if (targetTab === "partner-management" && typeof window.renderPartnerManagement === "function") {
        window.renderPartnerManagement();
      }
    });
  });
}

function loadSettings() {
  const settings = ServiceOSStore.getSettings();

  // Populate inputs
  document.getElementById("set-language").value = settings.language;
  document.getElementById("set-currency").value = settings.currency;
  document.getElementById("set-doc-verify").checked = settings.docVerify;
  document.getElementById("set-gisa-verify").checked = settings.gisaVerify;
  document.getElementById("set-min-insurance").value = settings.minInsurance;
  document.getElementById("set-commission").value = settings.commission;
  document.getElementById("set-marketing-share").value = settings.marketingShare;
  document.getElementById("set-ai-model").value = settings.aiModel;
  document.getElementById("set-ai-temp").value = settings.aiTemp;
  document.getElementById("set-self-improve").checked = settings.selfImprove;
  document.getElementById("set-zero-trust").checked = settings.zeroTrust;
  document.getElementById("set-mfa").checked = settings.mfa;
  document.getElementById("set-log-retention").value = settings.logRetention;
}

function setupSettingsForm() {
  const form = document.getElementById("settings-form");
  const resetBtn = document.getElementById("btn-reset-settings");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const updated = {
      language: document.getElementById("set-language").value,
      currency: document.getElementById("set-currency").value,
      docVerify: document.getElementById("set-doc-verify").checked,
      gisaVerify: document.getElementById("set-gisa-verify").checked,
      minInsurance: parseFloat(document.getElementById("set-min-insurance").value),
      commission: parseFloat(document.getElementById("set-commission").value),
      marketingShare: parseFloat(document.getElementById("set-marketing-share").value),
      aiModel: document.getElementById("set-ai-model").value,
      aiTemp: parseFloat(document.getElementById("set-ai-temp").value),
      selfImprove: document.getElementById("set-self-improve").checked,
      zeroTrust: document.getElementById("set-zero-trust").checked,
      mfa: document.getElementById("set-mfa").checked,
      logRetention: document.getElementById("set-log-retention").value
    };

    ServiceOSStore.saveSettings(updated);

    // Visual feedback
    const saveBtn = form.querySelector("button[type='submit']");
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "✓ Erfolgreich gespeichert";
    saveBtn.style.background = "var(--color-secondary)";
    saveBtn.style.color = "white";

    setTimeout(() => {
      saveBtn.innerText = originalText;
      saveBtn.style.background = "";
      saveBtn.style.color = "";
    }, 2000);
  });

  resetBtn.addEventListener("click", () => {
    loadSettings();
  });
}
