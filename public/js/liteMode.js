import { t } from './i18n.js';

const TYPICAL_PORTAL_BASELINE_BYTES = 500 * 1024;

/**
 * Measure total transferred bytes from Browser Performance API when available.
 * Falls back to document HTML byte length estimate.
 * @returns {number}
 */
export function measureTransferredBytes() {
  try {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation') || [];
      const resEntries = performance.getEntriesByType('resource') || [];
      let total = 0;

      for (const entry of navEntries) {
        total += entry.transferSize || entry.encodedBodySize || 0;
      }
      for (const entry of resEntries) {
        total += entry.transferSize || entry.encodedBodySize || 0;
      }
      if (total > 0) return total;
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      return document.documentElement.outerHTML.length;
    }
  } catch {
    // Ignore measurement errors in restricted runtimes
  }
  return 18 * 1024;
}

/**
 * Calculate human-readable payload and cache savings metrics.
 * @param {{ transferBytes: number, qaCache: Record<string, unknown>, liteMode: boolean }} input
 */
export function computeDataStats({ transferBytes, qaCache, liteMode }) {
  const safeBytes = Math.max(1024, Number(transferBytes) || 0);
  const kb = (safeBytes / 1024).toFixed(1);

  let cacheBytes = 0;
  try {
    cacheBytes = JSON.stringify(qaCache || {}).length;
  } catch {
    cacheBytes = 0;
  }
  const savedKb = (cacheBytes / 1024).toFixed(1);
  const pct = Math.max(
    1,
    Math.min(99, Math.round((1 - safeBytes / TYPICAL_PORTAL_BASELINE_BYTES) * 100))
  );

  return { kb, savedKb, pct, liteMode: Boolean(liteMode) };
}

/**
 * Render Lite Mode state and data indicator bar.
 * @param {{ lang: string, liteMode: boolean, qaCache: Record<string, unknown> }} state
 * @param {{ indicatorEl: HTMLElement | null, toggleEl: HTMLElement | null }} els
 */
export function syncLiteModeUI(state, { indicatorEl, toggleEl }) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.lite = String(state.liteMode);
  }

  if (toggleEl) {
    toggleEl.setAttribute('aria-checked', String(state.liteMode));
    const labelEl = toggleEl.querySelector('[data-i18n]');
    if (labelEl) {
      labelEl.dataset.i18n = state.liteMode ? 'liteModeOn' : 'liteModeOff';
      labelEl.textContent = t(state.lang, labelEl.dataset.i18n);
    }
  }

  if (indicatorEl) {
    const stats = computeDataStats({
      transferBytes: measureTransferredBytes(),
      qaCache: state.qaCache,
      liteMode: state.liteMode
    });
    indicatorEl.textContent = state.liteMode
      ? t(state.lang, 'dataStatusLite', { kb: stats.kb, pct: stats.pct })
      : t(state.lang, 'dataStatusNormal', { kb: stats.kb, savedKb: stats.savedKb });
  }
}
