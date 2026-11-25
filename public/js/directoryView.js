import { RESOURCES } from '../data/resources.js';
import { LANG_NAMES, SUPPORTED_LANGS } from '../data/locales.js';
import { t, localizeField } from './i18n.js';
import { filterResources } from './resourceFilter.js';

export { filterResources };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Mount and manage the Free-Resource Directory view.
 * @param {{ container: HTMLElement, store: any, showToast: (msg: string) => void }} opts
 */
export function createDirectoryView({ container, store, showToast }) {
  const filters = {
    search: '',
    domain: 'all',
    format: 'all',
    language: 'all',
    dataUsage: 'all'
  };

  function makeSelectField(id, labelText, options, currentVal, onChange) {
    const wrap = el('div', 'filter-field');
    const lbl = el('label', 'field-label-sm', labelText);
    lbl.setAttribute('for', id);
    const sel = document.createElement('select');
    sel.id = id;
    sel.className = 'select-input';
    for (const optDef of options) {
      const opt = el('option', '', optDef.label);
      opt.value = optDef.value;
      opt.selected = currentVal === optDef.value;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => onChange(sel.value));
    wrap.append(lbl, sel);
    return wrap;
  }

  function render() {
    const state = store.getState();
    const lang = state.lang;
    const activeFocusId =
      typeof document !== 'undefined' && container.contains(document.activeElement)
        ? document.activeElement.id
        : null;
    const selectionStart =
      activeFocusId === 'dir-search' && document.activeElement
        ? document.activeElement.selectionStart
        : null;

    container.innerHTML = '';

    // Filter Controls
    const filterBox = el('div', 'filter-bar');

    const searchWrap = el('div', 'filter-search-row');
    const searchLbl = el('label', 'field-label-sm', t(lang, 'filterSearchLabel'));
    searchLbl.setAttribute('for', 'dir-search');
    const searchInput = document.createElement('input');
    searchInput.id = 'dir-search';
    searchInput.type = 'search';
    searchInput.className = 'text-input';
    searchInput.value = filters.search;
    searchInput.placeholder = t(lang, 'filterSearchPlaceholder');
    searchInput.addEventListener('input', () => {
      filters.search = searchInput.value;
      render();
    });

    const resetBtn = el('button', 'btn btn-secondary', t(lang, 'clearFilters'));
    resetBtn.type = 'button';
    resetBtn.addEventListener('click', () => {
      filters.search = '';
      filters.domain = 'all';
      filters.format = 'all';
      filters.language = 'all';
      filters.dataUsage = 'all';
      render();
    });

    const searchInputRow = el('div', 'qa-input-row');
    searchInputRow.append(searchInput, resetBtn);
    searchWrap.append(searchLbl, searchInputRow);

    const filterGrid = el('div', 'filter-grid');

    filterGrid.appendChild(
      makeSelectField(
        'dir-domain',
        t(lang, 'filterDomain'),
        [
          { value: 'all', label: t(lang, 'filterAll') },
          ...['tech', 'data', 'design', 'govt', 'communication'].map((d) => ({
            value: d,
            label: t(lang, `domain_${d}`)
          }))
        ],
        filters.domain,
        (val) => {
          filters.domain = val;
          render();
        }
      )
    );

    filterGrid.appendChild(
      makeSelectField(
        'dir-format',
        t(lang, 'filterFormat'),
        [
          { value: 'all', label: t(lang, 'filterAll') },
          ...['text', 'interactive', 'video'].map((f) => ({
            value: f,
            label: t(lang, `format_${f}`)
          }))
        ],
        filters.format,
        (val) => {
          filters.format = val;
          render();
        }
      )
    );

    filterGrid.appendChild(
      makeSelectField(
        'dir-language',
        t(lang, 'filterLanguage'),
        [
          { value: 'all', label: t(lang, 'filterAll') },
          ...SUPPORTED_LANGS.map((l) => ({
            value: l,
            label: LANG_NAMES[l]
          }))
        ],
        filters.language,
        (val) => {
          filters.language = val;
          render();
        }
      )
    );

    filterGrid.appendChild(
      makeSelectField(
        'dir-data',
        t(lang, 'filterData'),
        [
          { value: 'all', label: t(lang, 'filterAll') },
          { value: 'low', label: t(lang, 'data_low') },
          { value: 'moderate', label: t(lang, 'data_moderate') }
        ],
        filters.dataUsage,
        (val) => {
          filters.dataUsage = val;
          render();
        }
      )
    );

    filterBox.append(searchWrap, filterGrid);

    const filtered = filterResources(RESOURCES, filters, lang);
    const countBar = el('p', 'results-count', t(lang, 'resourcesCount', { count: filtered.length }));

    container.append(filterBox, countBar);

    if (filtered.length === 0) {
      const emptyBox = el('div', 'empty-box');
      emptyBox.appendChild(el('p', 'muted', t(lang, 'noResourcesMatch')));
      const emptyReset = el('button', 'btn btn-outline', t(lang, 'clearFilters'));
      emptyReset.type = 'button';
      emptyReset.addEventListener('click', () => {
        filters.search = '';
        filters.domain = 'all';
        filters.format = 'all';
        filters.language = 'all';
        filters.dataUsage = 'all';
        render();
      });
      emptyBox.appendChild(emptyReset);
      container.appendChild(emptyBox);
    } else {
      const list = el('div', 'resource-grid');
      for (const item of filtered) {
        const isSaved = state.savedResourceIds.includes(item.id);
        const card = el('article', 'resource-card');

        const titleEl = el('h3', 'resource-card-title', localizeField(item.title, lang));

        const badges = el('div', 'badge-row');
        badges.appendChild(el('span', 'badge badge-free', t(lang, 'badgeFree')));
        badges.appendChild(
          el(
            'span',
            `badge ${item.dataUsage === 'low' ? 'badge-low' : 'badge-mod'}`,
            t(lang, `data_${item.dataUsage}`)
          )
        );
        badges.appendChild(el('span', 'badge badge-neutral', t(lang, `domain_${item.domain}`)));
        badges.appendChild(el('span', 'badge badge-neutral', t(lang, `format_${item.format}`)));
        for (const l of item.languages) {
          badges.appendChild(el('span', 'badge badge-lang', LANG_NAMES[l] || l.toUpperCase()));
        }

        const whyEl = el(
          'p',
          'resource-why',
          `${t(lang, 'whyRecommended')} ${localizeField(item.why, lang)}`
        );

        const actions = el('div', 'card-actions');
        const openLink = el('a', 'btn btn-secondary', t(lang, 'openResource'));
        openLink.href = item.url;
        openLink.target = '_blank';
        openLink.rel = 'noopener noreferrer';

        const saveBtn = el(
          'button',
          `btn ${isSaved ? 'btn-saved' : 'btn-outline'}`,
          t(lang, isSaved ? 'savedInPlan' : 'saveToPlan')
        );
        saveBtn.type = 'button';
        saveBtn.setAttribute('aria-pressed', String(isSaved));
        saveBtn.addEventListener('click', () => {
          store.toggleSavedResource(item.id);
          showToast(t(lang, 'savedToast'));
        });

        const reportBtn = el('button', 'link-btn', t(lang, 'reportLinkBtn'));
        reportBtn.type = 'button';
        reportBtn.addEventListener('click', async () => {
          try {
            await fetch('/api/report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                resourceId: item.id,
                reason: 'Reported from directory',
                lang
              })
            });
          } catch {
            // Ignore offline errors
          }
          showToast(t(lang, 'reportSentToast'));
        });

        actions.append(openLink, saveBtn, reportBtn);
        card.append(titleEl, badges, whyEl, actions);
        list.appendChild(card);
      }
      container.appendChild(list);
    }

    if (activeFocusId) {
      const elToFocus = document.getElementById(activeFocusId);
      if (elToFocus) {
        elToFocus.focus();
        if (selectionStart !== null && typeof elToFocus.setSelectionRange === 'function') {
          elToFocus.setSelectionRange(selectionStart, selectionStart);
        }
      }
    }
  }

  return {
    init: render,
    render
  };
}
