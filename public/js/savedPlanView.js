import { RESOURCES } from '../data/resources.js';
import { CAREER_PATHS } from '../data/careerPaths.js';
import { t, localizeField } from './i18n.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Extract share code from URL pathname such as /p/A8K2M3.
 * @param {string} pathname
 * @returns {string | null}
 */
export function parseShareCodeFromPath(pathname) {
  const match = String(pathname || '').match(/^\/p\/([A-Za-z0-9]{6,12})\/?$/);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Collect career paths that have at least one checked milestone.
 * @param {Record<string, boolean>} completedSteps
 */
export function getActiveRoadmaps(completedSteps = {}) {
  const active = [];
  for (const path of CAREER_PATHS) {
    const doneSteps = path.steps.filter((s) => completedSteps[`${path.id}::${s.id}`]);
    if (doneSteps.length > 0) {
      active.push({
        path,
        doneCount: doneSteps.length,
        totalCount: path.steps.length
      });
    }
  }
  return active;
}

/**
 * Format saved resources and roadmap progress as WhatsApp-friendly Plain Text or Markdown.
 */
export function formatPlanExport(state, { format = 'text', lang = 'en' } = {}) {
  const isMd = format === 'markdown';
  const resourceMap = new Map(RESOURCES.map((r) => [r.id, r]));
  const savedResources = (state.savedResourceIds || [])
    .map((id) => resourceMap.get(id))
    .filter(Boolean);
  const activeRoadmaps = getActiveRoadmaps(state.completedSteps);

  const lines = [];
  if (isMd) {
    lines.push(`# ${t(lang, 'savedHeading')}`);
    lines.push('');
  } else {
    lines.push(`*${t(lang, 'savedHeading')} (PathIQ)*`);
    lines.push('');
  }

  if (activeRoadmaps.length > 0) {
    lines.push(isMd ? `## ${t(lang, 'savedRoadmapsTitle')}` : `*${t(lang, 'savedRoadmapsTitle')}*`);
    for (const { path, doneCount, totalCount } of activeRoadmaps) {
      const pathTitle = localizeField(path.title, lang);
      const progressText = t(lang, 'progressLabel', { done: doneCount, total: totalCount });
      lines.push(isMd ? `### ${pathTitle} (${progressText})` : `- ${pathTitle} (${progressText})`);

      for (const step of path.steps) {
        const checked = Boolean(state.completedSteps?.[`${path.id}::${step.id}`]);
        const stepTitle = localizeField(step.title, lang);
        if (isMd) {
          lines.push(`- [${checked ? 'x' : ' '}] ${stepTitle}`);
        } else {
          lines.push(`  ${checked ? '[x]' : '[ ]'} ${stepTitle}`);
        }
      }
      lines.push('');
    }
  }

  if (savedResources.length > 0) {
    lines.push(isMd ? `## ${t(lang, 'savedResourcesTitle')}` : `*${t(lang, 'savedResourcesTitle')}*`);
    for (const res of savedResources) {
      const title = localizeField(res.title, lang);
      const why = localizeField(res.why, lang);
      if (isMd) {
        lines.push(`- [${title}](${res.url}) (${t(lang, 'badgeFree')}, ${t(lang, `data_${res.dataUsage}`)}) — ${why}`);
      } else {
        lines.push(`• ${title} (${t(lang, 'badgeFree')} | ${t(lang, `data_${res.dataUsage}`)})`);
        lines.push(`  ${res.url}`);
      }
    }
    lines.push('');
  }

  if (savedResources.length === 0 && activeRoadmaps.length === 0) {
    lines.push(t(lang, 'savedEmpty'));
  }

  return lines.join('\n').trim();
}

async function copyTextSafe(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to execCommand below
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Load a shared learning plan from /api/plans/:code into the local store.
 */
export async function loadSharedPlanByCode(rawCode, store) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6,12}$/.test(code)) return false;

  try {
    const res = await fetch(`/api/plans/${code}`);
    if (!res.ok) return false;
    const plan = await res.json();
    store.update({
      lang: plan.lang || store.getState().lang,
      savedResourceIds: Array.isArray(plan.savedResourceIds) ? plan.savedResourceIds : [],
      completedSteps: plan.completedSteps || {},
      activeTab: 'saved'
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Mount and manage the "My Saved Plan" workspace.
 */
export function createSavedPlanView({ container, store, showToast }) {
  let latestShareInfo = null;

  function makeLoadCodeBar(lang) {
    const wrap = el('div', 'share-code-bar');
    wrap.appendChild(el('p', 'section-mini-title', t(lang, 'shareCodeTitle')));

    const form = el('form', 'qa-input-row');
    const codeInput = document.createElement('input');
    codeInput.type = 'text';
    codeInput.className = 'text-input';
    codeInput.maxLength = 12;
    codeInput.placeholder = t(lang, 'loadCodePlaceholder');

    const loadBtn = el('button', 'btn btn-outline', t(lang, 'loadCodeBtn'));
    loadBtn.type = 'submit';
    form.append(codeInput, loadBtn);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ok = await loadSharedPlanByCode(codeInput.value, store);
      showToast(t(store.getState().lang, ok ? 'planLoadedToast' : 'planNotFoundToast'));
    });

    wrap.appendChild(form);
    return wrap;
  }

  function render() {
    const state = store.getState();
    const lang = state.lang;
    const resourceMap = new Map(RESOURCES.map((r) => [r.id, r]));
    const savedResources = state.savedResourceIds
      .map((id) => resourceMap.get(id))
      .filter(Boolean);
    const activeRoadmaps = getActiveRoadmaps(state.completedSteps);

    container.innerHTML = '';

    if (savedResources.length === 0 && activeRoadmaps.length === 0) {
      const emptyBox = el('div', 'empty-box');
      emptyBox.appendChild(el('p', 'muted', t(lang, 'savedEmpty')));
      const navBtns = el('div', 'card-actions empty-actions');

      const goGuide = el('button', 'btn btn-primary', t(lang, 'navGuidance'));
      goGuide.type = 'button';
      goGuide.addEventListener('click', () => store.update({ activeTab: 'guidance' }));

      const goDir = el('button', 'btn btn-outline', t(lang, 'navResources'));
      goDir.type = 'button';
      goDir.addEventListener('click', () => store.update({ activeTab: 'directory' }));

      const loadDemo = el('button', 'btn btn-outline', t(lang, 'loadDemoBtn'));
      loadDemo.type = 'button';
      loadDemo.addEventListener('click', () => {
        store.loadMockData();
        showToast(t(lang, 'demoLoadedToast'));
      });

      navBtns.append(goGuide, goDir, loadDemo);
      emptyBox.append(navBtns, makeLoadCodeBar(lang));
      container.appendChild(emptyBox);
      return;
    }

    const plainText = formatPlanExport(state, { format: 'text', lang });
    const markdownText = formatPlanExport(state, { format: 'markdown', lang });

    // 1. Export & Share Controls
    const exportBlock = el('section', 'saved-block');
    exportBlock.appendChild(el('h3', 'qa-section-title', t(lang, 'exportTitle')));

    const exportActions = el('div', 'export-actions');

    const copyPlainBtn = el('button', 'btn btn-primary', t(lang, 'copyPlainBtn'));
    copyPlainBtn.type = 'button';
    copyPlainBtn.addEventListener('click', async () => {
      await copyTextSafe(plainText);
      showToast(t(lang, 'copiedToast'));
    });

    const copyMdBtn = el('button', 'btn btn-outline', t(lang, 'copyMdBtn'));
    copyMdBtn.type = 'button';
    copyMdBtn.addEventListener('click', async () => {
      await copyTextSafe(markdownText);
      showToast(t(lang, 'copiedToast'));
    });

    const waLink = el('a', 'btn btn-secondary', t(lang, 'shareWaBtn'));
    waLink.href = `https://wa.me/?text=${encodeURIComponent(plainText)}`;
    waLink.target = '_blank';
    waLink.rel = 'noopener noreferrer';

    const dlTxtBtn = el('button', 'btn btn-secondary', t(lang, 'downloadTxtBtn'));
    dlTxtBtn.type = 'button';
    dlTxtBtn.addEventListener('click', () => {
      downloadTextFile('pathiq-learning-plan.txt', plainText, 'text/plain;charset=utf-8');
    });

    const dlMdBtn = el('button', 'btn btn-secondary', t(lang, 'downloadMdBtn'));
    dlMdBtn.type = 'button';
    dlMdBtn.addEventListener('click', () => {
      downloadTextFile('pathiq-learning-plan.md', markdownText, 'text/markdown;charset=utf-8');
    });

    const shareCodeBtn = el('button', 'btn btn-outline', t(lang, 'createShareCodeBtn'));
    shareCodeBtn.type = 'button';
    shareCodeBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lang,
            savedResourceIds: state.savedResourceIds,
            completedSteps: state.completedSteps
          })
        });
        if (res.ok) {
          latestShareInfo = await res.json();
          render();
        }
      } catch {
        showToast(t(lang, 'planNotFoundToast'));
      }
    });

    const clearBtn = el('button', 'btn btn-danger-outline', t(lang, 'clearPlanBtn'));
    clearBtn.type = 'button';
    clearBtn.addEventListener('click', () => {
      latestShareInfo = null;
      store.clearSavedPlan();
      showToast(t(lang, 'clearedToast'));
    });

    const loadDemoBtn = el('button', 'btn btn-outline', t(lang, 'loadDemoBtn'));
    loadDemoBtn.type = 'button';
    loadDemoBtn.addEventListener('click', () => {
      store.loadMockData();
      showToast(t(lang, 'demoLoadedToast'));
    });

    exportActions.append(copyPlainBtn, copyMdBtn, waLink, dlTxtBtn, dlMdBtn, shareCodeBtn, clearBtn, loadDemoBtn);

    const previewPre = el('pre', 'export-preview', plainText);
    exportBlock.append(exportActions, previewPre);

    if (latestShareInfo?.code) {
      const shareBar = el('div', 'share-code-bar');
      const codeBadge = el(
        'strong',
        'progress-pill',
        t(lang, 'shareCodeReady', { code: latestShareInfo.code })
      );
      const copyShareLink = el('button', 'btn btn-secondary', t(lang, 'copyShareLinkBtn'));
      copyShareLink.type = 'button';
      copyShareLink.addEventListener('click', async () => {
        const fullUrl = `${window.location.origin}/p/${latestShareInfo.code}`;
        await copyTextSafe(fullUrl);
        showToast(t(lang, 'copiedToast'));
      });
      shareBar.append(codeBadge, copyShareLink);
      exportBlock.appendChild(shareBar);
    }

    exportBlock.appendChild(makeLoadCodeBar(lang));
    container.appendChild(exportBlock);

    // 2. Active Roadmap Progress
    if (activeRoadmaps.length > 0) {
      const roadmapsSec = el('section', 'saved-section');
      roadmapsSec.appendChild(el('h3', 'qa-section-title', t(lang, 'savedRoadmapsTitle')));

      for (const { path, doneCount, totalCount } of activeRoadmaps) {
        const block = el('div', 'saved-block');
        const head = el('div', 'roadmap-head');
        head.append(
          el('strong', '', localizeField(path.title, lang)),
          el('span', 'progress-pill', t(lang, 'progressLabel', { done: doneCount, total: totalCount }))
        );
        block.appendChild(head);

        const list = el('ol', 'roadmap-list');
        path.steps.forEach((step, idx) => {
          const checked = Boolean(state.completedSteps[`${path.id}::${step.id}`]);
          const li = el('li', `roadmap-step ${checked ? 'is-done' : ''}`);
          const lbl = el('label', 'step-check-label');
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.className = 'step-checkbox';
          cb.checked = checked;
          cb.addEventListener('change', () => {
            store.setStepCompleted(path.id, step.id, cb.checked);
            showToast(t(lang, 'savedToast'));
          });
          lbl.append(cb, el('span', 'step-title', `${idx + 1}. ${localizeField(step.title, lang)}`));
          li.appendChild(lbl);
          list.appendChild(li);
        });
        block.appendChild(list);
        roadmapsSec.appendChild(block);
      }

      container.appendChild(roadmapsSec);
    }

    // 3. Bookmarked Free Resources
    if (savedResources.length > 0) {
      const resSec = el('section', 'saved-section');
      resSec.appendChild(el('h3', 'qa-section-title', t(lang, 'savedResourcesTitle')));
      const grid = el('div', 'resource-grid');

      for (const res of savedResources) {
        const card = el('article', 'resource-card');
        card.appendChild(el('h4', 'resource-card-title', localizeField(res.title, lang)));

        const badges = el('div', 'badge-row');
        badges.appendChild(el('span', 'badge badge-free', t(lang, 'badgeFree')));
        badges.appendChild(
          el(
            'span',
            `badge ${res.dataUsage === 'low' ? 'badge-low' : 'badge-mod'}`,
            t(lang, `data_${res.dataUsage}`)
          )
        );
        card.appendChild(badges);
        card.appendChild(el('p', 'resource-why', localizeField(res.why, lang)));

        const actions = el('div', 'card-actions');
        const openLink = el('a', 'btn btn-secondary', t(lang, 'openResource'));
        openLink.href = res.url;
        openLink.target = '_blank';
        openLink.rel = 'noopener noreferrer';

        const removeBtn = el('button', 'btn btn-saved', t(lang, 'savedInPlan'));
        removeBtn.type = 'button';
        removeBtn.setAttribute('aria-pressed', 'true');
        removeBtn.addEventListener('click', () => {
          store.toggleSavedResource(res.id);
          showToast(t(lang, 'savedToast'));
        });

        actions.append(openLink, removeBtn);
        card.appendChild(actions);
        grid.appendChild(card);
      }

      resSec.appendChild(grid);
      container.appendChild(resSec);
    }
  }

  return {
    init: render,
    render
  };
}
