// navigation.js – Fail-safe Accordion Sidebar Navigation

export function initNavigation() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const groupBtns = nav.querySelectorAll('.nav-group-btn');
  const sublists  = nav.querySelectorAll('.nav-sublist');
  const tabContents = document.querySelectorAll('.dashboard-tab-content');

  // Show a specific tab section
  function activateTab(tabId) {
    if (!tabId) return;

    tabContents.forEach(sec => {
      if (sec.id === tabId) {
        sec.style.display = 'block';
        sec.classList.add('active');
      } else {
        sec.style.display = 'none';
        sec.classList.remove('active');
      }
    });

    if (tabId === 'tab-command-center' && typeof window.renderCommandCenterView === 'function') window.renderCommandCenterView();
    if (tabId === 'tab-cases' && typeof window.renderCasesTable === 'function') window.renderCasesTable();
    if (tabId === 'tab-audit' && typeof window.renderAuditTrail === 'function') window.renderAuditTrail();
    if (tabId === 'tab-factorium' && typeof window.renderFactoriumModule === 'function') window.renderFactoriumModule('tab-factorium');
    if (tabId === 'tab-crm' && typeof window.renderCrmView === 'function') window.renderCrmView();
    if (tabId === 'tab-finance' && typeof window.renderFinanceView === 'function') window.renderFinanceView();
    if (tabId === 'tab-analytics' && typeof window.renderAnalyticsView === 'function') window.renderAnalyticsView();
    if (tabId === 'tab-profile' && typeof window.renderProfileView === 'function') window.renderProfileView();
    if (tabId === 'tab-tasks' && typeof window.renderTasksView === 'function') window.renderTasksView();
    if (tabId === 'tab-new-document' && typeof window.renderDocumentsView === 'function') window.renderDocumentsView();
    if (tabId === 'tab-partners' && typeof window.renderPartnersTable === 'function') window.renderPartnersTable();
    if (tabId === 'tab-branches' && typeof window.renderBranchesTable === 'function') window.renderBranchesTable();
  }

  window.activateTab = activateTab;

  // 1. Standalone Top-Level Buttons (Dashboard, Neuer Auftrag)
  nav.querySelectorAll('.nav-group-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = btn.getAttribute('data-tab');
      if (!tabId) return;

      // Close all accordion sublists
      sublists.forEach(s => s.classList.remove('active'));
      groupBtns.forEach(b => b.classList.remove('active'));
      nav.querySelectorAll('.nav-leaf').forEach(l => l.classList.remove('active'));

      btn.classList.add('active');
      activateTab(tabId);
    });
  });

  // 2. Accordion Group Buttons (Home, Inbox, Neu, Kalender, Konto)
  nav.querySelectorAll('.nav-group-btn[data-nav-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-nav-target');
      if (!target) return;

      const sub = nav.querySelector(`.nav-sublist[data-parent="${target}"]`);
      if (!sub) return;

      const isOpen = sub.classList.contains('active');

      // Close other sublists
      sublists.forEach(s => {
        if (s !== sub) s.classList.remove('active');
      });
      groupBtns.forEach(b => {
        if (b !== btn && b.getAttribute('data-nav-target')) b.classList.remove('active');
      });

      // Toggle current sublist
      if (isOpen) {
        sub.classList.remove('active');
        btn.classList.remove('active');
      } else {
        sub.classList.add('active');
        btn.classList.add('active');
      }
    });
  });

  // 3. Sub-Item Leaf Links inside Sublists
  nav.querySelectorAll('.nav-sublist .nav-leaf').forEach(leaf => {
    leaf.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = leaf.getAttribute('data-tab');
      if (!tabId) return;

      nav.querySelectorAll('.nav-sublist .nav-leaf').forEach(l => l.classList.remove('active'));
      leaf.classList.add('active');
      activateTab(tabId);
    });
  });
}
