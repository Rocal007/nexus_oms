import { ServiceOSStore } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  const btnSaveFavorites = document.getElementById('btn-save-favorites');
  if (!btnSaveFavorites) return;

  // Initialize checkboxes based on stored settings
  function loadFavoritesUI() {
    const settings = ServiceOSStore.getSettings();
    const favorites = settings.dashboardFavorites || [
      "kpi-card-revenue", "kpi-card-active", "kpi-card-completed", 
      "kpi-card-time", "kpi-card-requests", "kpi-card-action", "btn-kpi-new-order",
      "kpi-card-flow", "kpi-card-status", "kpi-card-calc"
    ];

    document.querySelectorAll('.favorite-toggle').forEach(checkbox => {
      checkbox.checked = favorites.includes(checkbox.value);
    });
    
    applyFavoritesToDashboard(favorites);
  }

  // Apply visibility to dashboard KPI cards
  function applyFavoritesToDashboard(favorites) {
    const allCards = [
      "kpi-card-revenue", "kpi-card-active", "kpi-card-completed", 
      "kpi-card-time", "kpi-card-requests", "kpi-card-action", "btn-kpi-new-order",
      "kpi-card-flow", "kpi-card-status", "kpi-card-calc"
    ];
    
    allCards.forEach(id => {
      const card = document.getElementById(id);
      if (card) {
        if (favorites.includes(id)) {
          card.style.display = ''; // Reset to default
        } else {
          card.style.display = 'none';
        }
      }
    });
  }

  // Save changes
  btnSaveFavorites.addEventListener('click', () => {
    const selected = [];
    document.querySelectorAll('.favorite-toggle:checked').forEach(checkbox => {
      selected.push(checkbox.value);
    });

    const settings = ServiceOSStore.getSettings();
    settings.dashboardFavorites = selected;
    ServiceOSStore.saveSettings(settings);
    
    applyFavoritesToDashboard(selected);
    ServiceOSStore.logAudit("FAVORITES_UPDATED", `Dashboard Favoriten aktualisiert.`);
    
    alert("Favoriten wurden erfolgreich gespeichert!");
  });

  // Re-apply when tab changes to dashboard to ensure it's always correct
  document.querySelectorAll('.nav-leaf').forEach(nav => {
    nav.addEventListener('click', (e) => {
      if (e.target.getAttribute('data-tab') === 'tab-dashboard') {
        const settings = ServiceOSStore.getSettings();
        applyFavoritesToDashboard(settings.dashboardFavorites || []);
      }
    });
  });

  // Listen for cross-tab storage events
  window.addEventListener('storage', () => {
    loadFavoritesUI();
  });

  // Initial load
  loadFavoritesUI();
});
