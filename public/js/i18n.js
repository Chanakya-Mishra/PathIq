import { LOCALES, SUPPORTED_LANGS } from '../data/locales.js';

/**
 * Translate a UI key with optional parameter substitution.
 * Falls back cleanly to English if a key is missing.
 * @param {string} lang
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 * @returns {string}
 */
export function t(lang, key, params = {}) {
  const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
  const dict = LOCALES[safeLang] || LOCALES.en;
  let text = dict[key] ?? LOCALES.en[key] ?? key;

  for (const [k, v] of Object.entries(params)) {
    text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

/**
 * Resolve a localized field object { en, hi, ta, bn }.
 * @param {Record<string, any> | string} field
 * @param {string} lang
 * @returns {any}
 */
export function localizeField(field, lang) {
  if (typeof field === 'string') return field;
  if (!field || typeof field !== 'object') return '';
  return field[lang] ?? field.en ?? '';
}

/**
 * Apply translations to static DOM attributes under root.
 * @param {Document | HTMLElement} root
 * @param {string} lang
 */
export function applyStaticTranslations(root, lang) {
  if (typeof document !== 'undefined' && root === document) {
    document.documentElement.lang = lang;
    document.title = t(lang, 'appTitle');
  }

  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.textContent = t(lang, el.dataset.i18n);
  }
  for (const el of root.querySelectorAll('[data-i18n-placeholder]')) {
    el.setAttribute('placeholder', t(lang, el.dataset.i18nPlaceholder));
  }
  for (const el of root.querySelectorAll('[data-i18n-aria-label]')) {
    el.setAttribute('aria-label', t(lang, el.dataset.i18nAriaLabel));
  }
}
