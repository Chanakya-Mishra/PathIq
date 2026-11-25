import { createStore } from './store.js';
import { applyStaticTranslations, t } from './i18n.js';
import { syncLiteModeUI } from './liteMode.js';
import { createDashboardView } from './dashboardView.js';
import { createGuidanceView } from './qaView.js';
import { createDirectoryView } from './directoryView.js';
import {
  createSavedPlanView,
  loadSharedPlanByCode,
  parseShareCodeFromPath
} from './savedPlanView.js';

const store = createStore();

const tabButtons = Array.from(document.querySelectorAll('.nav-tab'));
const viewPanels = {
  dashboard: document.getElementById('view-dashboard'),
  guidance: document.getElementById('view-guidance'),
  directory: document.getElementById('view-directory'),
  saved: document.getElementById('view-saved')
};
const langButtons = Array.from(document.querySelectorAll('.lang-btn'));
const liteToggle = document.getElementById('lite-toggle');
const indicatorEl = document.getElementById('data-indicator');
const savedBadge = document.getElementById('saved-count-badge');
const toastEl = document.getElementById('toast');
const dashboardWorkspace = document.getElementById('dashboard-workspace');
const guidanceWorkspace = document.getElementById('guidance-workspace');
const directoryWorkspace = document.getElementById('directory-workspace');
const savedWorkspace = document.getElementById('saved-workspace');

let toastTimer = null;
let previousLang = store.getState().lang;

export function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2400);
}

const guidanceView = guidanceWorkspace
  ? createGuidanceView({ container: guidanceWorkspace, store, showToast })
  : null;
const dashboardView = dashboardWorkspace
  ? createDashboardView({
      container: dashboardWorkspace,
      store,
      showToast,
      onOpenPath: (pathId) => guidanceView?.openPath(pathId),
      onQuickDoubt: (question) => guidanceView?.openDoubt(question)
    })
  : null;
const directoryView = directoryWorkspace
  ? createDirectoryView({ container: directoryWorkspace, store, showToast })
  : null;
const savedPlanView = savedWorkspace
  ? createSavedPlanView({ container: savedWorkspace, store, showToast })
  : null;

function syncShell(state) {
  for (const btn of tabButtons) {
    const isActive = btn.dataset.tab === state.activeTab;
    if (isActive) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  }

  for (const [key, panel] of Object.entries(viewPanels)) {
    if (panel) panel.hidden = key !== state.activeTab;
  }

  for (const btn of langButtons) {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === state.lang));
  }

  if (savedBadge) {
    const completedCount = Object.keys(state.completedSteps).length;
    savedBadge.textContent = String(state.savedResourceIds.length + completedCount);
  }

  applyStaticTranslations(document, state.lang);
  syncLiteModeUI(state, { indicatorEl, toggleEl: liteToggle });

  if (dashboardView) dashboardView.render();
  if (guidanceView) guidanceView.onStateChange(previousLang);
  if (directoryView) directoryView.render();
  if (savedPlanView) savedPlanView.render();
  previousLang = state.lang;
}

for (const btn of tabButtons) {
  btn.addEventListener('click', () => {
    store.update({ activeTab: btn.dataset.tab });
  });
}

for (const btn of langButtons) {
  btn.addEventListener('click', () => {
    const nextLang = btn.dataset.lang;
    store.update({ lang: nextLang });
    showToast(t(nextLang, 'languageToast'));
  });
}

if (liteToggle) {
  liteToggle.addEventListener('click', () => {
    const state = store.getState();
    const next = !state.liteMode;
    store.update({ liteMode: next });
    showToast(t(state.lang, next ? 'liteEnabledToast' : 'liteDisabledToast'));
  });
}

store.subscribe(syncShell);

// Auto-seed realistic mock student data on first visit or via ?demo=1 / ?mock=1 parameter
try {
  const urlParams = new URLSearchParams(window.location.search);
  const forceDemo =
    urlParams.get('demo') === 'true' ||
    urlParams.get('demo') === '1' ||
    urlParams.get('mock') === 'true' ||
    urlParams.get('mock') === '1';
  const SEED_KEY = 'pathiq_mock_seeded_v1';
  if (forceDemo || !window.localStorage.getItem(SEED_KEY)) {
    store.loadMockData();
    window.localStorage.setItem(SEED_KEY, 'true');
  }
} catch {
  // Graceful fallback if localStorage is disabled or restricted
}

syncShell(store.getState());
if (dashboardView) dashboardView.init();
if (guidanceView) guidanceView.init();
if (directoryView) directoryView.init();
if (savedPlanView) savedPlanView.init();

const sharedCode = parseShareCodeFromPath(window.location.pathname);
if (sharedCode) {
  loadSharedPlanByCode(sharedCode, store).then((ok) => {
    showToast(t(store.getState().lang, ok ? 'planLoadedToast' : 'planNotFoundToast'));
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
