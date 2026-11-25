import { CAREER_PATHS } from '../data/careerPaths.js';
import { t, localizeField } from './i18n.js';
import { fetchCareerGuidance, solveDoubtRequest, sendDoubtFeedback } from './qaService.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Mount and manage Career Roadmap & AI Doubt Solver inside Career Guide.
 * @param {{ container: HTMLElement, store: any, showToast: (msg: string) => void }} opts
 */
export function createGuidanceView({ container, store, showToast }) {
  let activeMode = 'roadmap'; // 'roadmap' | 'doubt'
  let currentResult = null;
  let currentDeliverySource = 'offline';
  let currentQuery = '';
  let currentPathId = 'tech-zero-cost';
  let requestCounter = 0;

  let doubtQuery = '';
  let deepCheck = false;
  let doubtResult = null;
  let doubtBusy = false;
  let feedbackSent = new Set();

  async function loadGuidance({ query = currentQuery, pathId = currentPathId } = {}) {
    currentQuery = query;
    currentPathId = pathId;
    const reqId = ++requestCounter;
    const state = store.getState();

    const { answer, deliverySource } = await fetchCareerGuidance(store, {
      query,
      pathId,
      lang: state.lang,
      stage: state.stage,
      weeklyHours: state.weeklyHours
    });

    if (reqId !== requestCounter) return;
    currentResult = answer;
    currentDeliverySource = deliverySource;
    const prevLast = state.lastQuery;
    if (!prevLast || prevLast.query !== query || prevLast.pathId !== answer.pathId) {
      store.update({ lastQuery: { query, pathId: answer.pathId } });
    } else {
      render();
    }
  }

  async function runDoubtSolve({ question, previousInteractionId = null, forceDeep = deepCheck } = {}) {
    const clean = String(question || '').trim();
    if (!clean || doubtBusy) return;
    const state = store.getState();
    doubtBusy = true;
    render();

    try {
      const res = await solveDoubtRequest(store, {
        question: clean,
        lang: state.lang,
        stage: state.stage,
        liteMode: state.liteMode,
        deepCheck: forceDeep,
        previousInteractionId
      });
      doubtResult = res;
    } catch (err) {
      showToast(err.message || 'Please wait before retrying.');
    } finally {
      doubtBusy = false;
      render();
    }
  }

  function renderContextBar(lang, state) {
    const contextBox = el('div', 'context-bar');
    contextBox.appendChild(el('p', 'section-mini-title', t(lang, 'contextTitle')));
    const contextGrid = el('div', 'context-grid');

    const stageGroup = el('div', 'context-field');
    const stageLbl = el('label', 'field-label-sm', t(lang, 'stageLabel'));
    stageLbl.setAttribute('for', 'ctx-stage');
    const stageSel = document.createElement('select');
    stageSel.id = 'ctx-stage';
    stageSel.className = 'select-input';
    for (const s of ['school', 'college', 'graduate', 'switcher']) {
      const opt = el('option', '', t(lang, `stage_${s}`));
      opt.value = s;
      opt.selected = state.stage === s;
      stageSel.appendChild(opt);
    }
    stageSel.addEventListener('change', () => {
      store.update({ stage: stageSel.value });
      if (activeMode === 'roadmap') {
        loadGuidance({ query: currentQuery, pathId: currentPathId || currentResult?.pathId });
      }
    });
    stageGroup.append(stageLbl, stageSel);

    const hoursGroup = el('div', 'context-field');
    const hoursLbl = el('label', 'field-label-sm', t(lang, 'hoursLabel'));
    hoursLbl.setAttribute('for', 'ctx-hours');
    const hoursSel = document.createElement('select');
    hoursSel.id = 'ctx-hours';
    hoursSel.className = 'select-input';
    for (const h of ['5', '10', '20']) {
      const opt = el('option', '', t(lang, `hours_${h}`));
      opt.value = h;
      opt.selected = String(state.weeklyHours) === h;
      hoursSel.appendChild(opt);
    }
    hoursSel.addEventListener('change', () => {
      store.update({ weeklyHours: hoursSel.value });
      if (activeMode === 'roadmap') {
        loadGuidance({ query: currentQuery, pathId: currentPathId || currentResult?.pathId });
      }
    });
    hoursGroup.append(hoursLbl, hoursSel);

    contextGrid.append(stageGroup, hoursGroup);
    contextBox.appendChild(contextGrid);
    return contextBox;
  }

  function renderRoadmapMode(lang, state) {
    const form = el('form', 'qa-form');
    const label = el('label', 'field-label', t(lang, 'askLabel'));
    label.setAttribute('for', 'qa-input');

    const inputRow = el('div', 'qa-input-row');
    const input = document.createElement('input');
    input.id = 'qa-input';
    input.type = 'search';
    input.className = 'text-input';
    input.value = currentQuery;
    input.placeholder = t(lang, 'askPlaceholder');
    input.addEventListener('input', () => {
      currentQuery = input.value;
    });

    const submitBtn = el('button', 'btn btn-primary', t(lang, 'askButton'));
    submitBtn.type = 'submit';
    inputRow.append(input, submitBtn);
    form.append(label, inputRow);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      loadGuidance({ query: q, pathId: q ? null : 'tech-zero-cost' });
    });

    const starterWrap = el('div', 'starter-wrap');
    starterWrap.appendChild(el('p', 'section-mini-title', t(lang, 'starterTitle')));
    const chipList = el('div', 'chip-list');

    for (const path of CAREER_PATHS) {
      const qText = localizeField(path.starterQuestion, lang);
      const chip = el('button', 'chip-btn', qText);
      chip.type = 'button';
      chip.setAttribute('aria-pressed', String(Boolean(currentResult && currentResult.pathId === path.id)));
      chip.addEventListener('click', () => {
        currentQuery = qText;
        loadGuidance({ query: qText, pathId: path.id });
      });
      chipList.appendChild(chip);
    }
    starterWrap.appendChild(chipList);

    container.append(form, renderContextBar(lang, state), starterWrap);

    if (!currentResult) return;

    const answerCard = el('article', 'qa-card');
    answerCard.setAttribute('aria-live', 'polite');

    const metaRow = el('div', 'qa-meta-row');
    const sourceKey =
      currentDeliverySource === 'cache'
        ? 'cacheSourceLocal'
        : currentDeliverySource === 'server'
          ? 'cacheSourceServer'
          : 'cacheSourceOffline';
    metaRow.appendChild(el('span', 'badge badge-low', t(lang, sourceKey)));
    metaRow.appendChild(
      el(
        'span',
        'badge badge-neutral',
        t(lang, 'estimatedDuration', {
          weeks: currentResult.estimatedWeeks,
          hours: currentResult.weeklyHours
        })
      )
    );

    const titleEl = el('h2', 'qa-title', currentResult.title);

    const sec1 = el('section', 'qa-section');
    sec1.append(
      el('h3', 'qa-section-title', t(lang, 'sectionOverview')),
      el('p', 'qa-overview-text', currentResult.overview)
    );

    const sec2 = el('section', 'qa-section');
    sec2.appendChild(el('h3', 'qa-section-title', t(lang, 'sectionSkills')));
    const skillsUl = el('ul', 'skills-list');
    for (const skill of currentResult.coreSkills) {
      skillsUl.appendChild(el('li', '', skill));
    }
    sec2.appendChild(skillsUl);

    const sec3 = el('section', 'qa-section');
    const doneSteps = currentResult.steps.filter(
      (s) => state.completedSteps[`${currentResult.pathId}::${s.id}`]
    ).length;

    const sec3Head = el('div', 'roadmap-head');
    sec3Head.append(
      el('h3', 'qa-section-title', t(lang, 'sectionRoadmap')),
      el(
        'span',
        'progress-pill',
        t(lang, 'progressLabel', { done: doneSteps, total: currentResult.steps.length })
      )
    );
    sec3.appendChild(sec3Head);

    const stepsList = el('ol', 'roadmap-list');
    currentResult.steps.forEach((step, idx) => {
      const li = el('li', 'roadmap-step');
      const isChecked = Boolean(state.completedSteps[`${currentResult.pathId}::${step.id}`]);
      if (isChecked) li.classList.add('is-done');

      const checkLabel = el('label', 'step-check-label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'step-checkbox';
      checkbox.dataset.stepFocus = step.id;
      checkbox.checked = isChecked;
      checkbox.addEventListener('change', () => {
        store.setStepCompleted(currentResult.pathId, step.id, checkbox.checked);
        showToast(t(lang, 'savedToast'));
      });

      const body = el('div', 'step-body');
      body.append(
        el('span', 'step-title', `${idx + 1}. ${step.title}`),
        el('p', 'step-detail', step.detail)
      );

      checkLabel.append(checkbox, body);
      li.appendChild(checkLabel);
      stepsList.appendChild(li);
    });
    sec3.appendChild(stepsList);

    const sec4 = el('section', 'qa-section');
    sec4.appendChild(el('h3', 'qa-section-title', t(lang, 'sectionResources')));
    const resGrid = el('div', 'mini-resource-list');

    for (const res of currentResult.resources) {
      const isSaved = state.savedResourceIds.includes(res.id);
      const item = el('div', 'mini-resource-card');

      const top = el('div', 'mini-resource-top');
      top.appendChild(el('strong', 'resource-title', res.title));
      const badges = el('div', 'badge-row');
      badges.appendChild(el('span', 'badge badge-free', t(lang, 'badgeFree')));
      badges.appendChild(
        el(
          'span',
          `badge ${res.dataUsage === 'low' ? 'badge-low' : 'badge-mod'}`,
          t(lang, `data_${res.dataUsage}`)
        )
      );
      top.appendChild(badges);

      const why = el('p', 'resource-why', `${t(lang, 'whyRecommended')} ${res.why}`);
      const actions = el('div', 'card-actions');

      const openLink = el('a', 'btn btn-secondary', t(lang, 'openResource'));
      openLink.href = res.url;
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
        store.toggleSavedResource(res.id);
        showToast(t(lang, 'savedToast'));
      });

      actions.append(openLink, saveBtn);
      item.append(top, why, actions);
      resGrid.appendChild(item);
    }
    sec4.appendChild(resGrid);

    const sec5 = el('section', 'qa-section next-action-box');
    sec5.append(
      el('h3', 'qa-section-title', t(lang, 'sectionNextAction')),
      el('p', 'next-action-text', currentResult.nextAction)
    );

    answerCard.append(metaRow, titleEl, sec1, sec2, sec3, sec4, sec5);
    container.appendChild(answerCard);
    return input;
  }

  function renderDoubtMode(lang, state) {
    const form = el('form', 'qa-form');
    const label = el('label', 'field-label', t(lang, 'doubtLabel'));
    label.setAttribute('for', 'doubt-input');

    const inputRow = el('div', 'qa-input-row');
    const input = document.createElement('input');
    input.id = 'doubt-input';
    input.type = 'search';
    input.className = 'text-input';
    input.value = doubtQuery;
    input.placeholder = t(lang, 'doubtPlaceholder');
    input.addEventListener('input', () => {
      doubtQuery = input.value;
    });

    const submitBtn = el(
      'button',
      'btn btn-primary',
      doubtBusy ? t(lang, 'loadingText') : t(lang, 'doubtSubmitBtn')
    );
    submitBtn.type = 'submit';
    submitBtn.disabled = doubtBusy;
    inputRow.append(input);

    const SpeechRec =
      typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRec) {
      const voiceBtn = el('button', 'btn btn-secondary', t(lang, 'voiceAskBtn'));
      voiceBtn.type = 'button';
      voiceBtn.addEventListener('click', () => {
        const rec = new SpeechRec();
        rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'bn' ? 'bn-IN' : 'en-IN';
        rec.onresult = (ev) => {
          const spoken = ev.results?.[0]?.[0]?.transcript || '';
          if (spoken) {
            doubtQuery = spoken;
            input.value = spoken;
            runDoubtSolve({ question: spoken });
          }
        };
        rec.start();
      });
      inputRow.appendChild(voiceBtn);
    }

    inputRow.appendChild(submitBtn);

    const deepLabel = el('label', 'check-row');
    const deepCb = document.createElement('input');
    deepCb.type = 'checkbox';
    deepCb.className = 'step-checkbox';
    deepCb.checked = deepCheck;
    deepCb.addEventListener('change', () => {
      deepCheck = deepCb.checked;
    });
    deepLabel.append(deepCb, el('span', '', t(lang, 'doubtDeepLabel')));

    form.append(label, inputRow, deepLabel);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      runDoubtSolve({ question: input.value });
    });

    const starterWrap = el('div', 'starter-wrap');
    starterWrap.appendChild(el('p', 'section-mini-title', t(lang, 'doubtStarterTitle')));
    const chipList = el('div', 'chip-list');
    for (const key of ['doubtChip1', 'doubtChip2', 'doubtChip3', 'doubtChip4']) {
      const text = t(lang, key);
      const chip = el('button', 'chip-btn', text);
      chip.type = 'button';
      chip.addEventListener('click', () => {
        doubtQuery = text;
        runDoubtSolve({ question: text });
      });
      chipList.appendChild(chip);
    }
    starterWrap.appendChild(chipList);

    container.append(form, renderContextBar(lang, state), starterWrap);

    if (!doubtResult) return input;

    const ans = doubtResult.answer;
    const card = el('article', 'qa-card');
    card.setAttribute('aria-live', 'polite');

    const metaRow = el('div', 'qa-meta-row');
    const modelLabel =
      doubtResult.modelUsed === 'offline-fallback'
        ? t(lang, 'doubtModelOffline')
        : doubtResult.modelUsed;
    metaRow.appendChild(el('span', 'badge badge-neutral', modelLabel));
    if (doubtResult.cached) {
      metaRow.appendChild(el('span', 'badge badge-low', t(lang, 'doubtCachedBadge')));
    }

    const secDirect = el('section', 'qa-section');
    secDirect.append(
      el('h3', 'qa-section-title', t(lang, 'doubtSecDirect')),
      el('p', 'qa-overview-text', ans.directAnswer)
    );

    const secSteps = el('section', 'qa-section');
    secSteps.appendChild(el('h3', 'qa-section-title', t(lang, 'doubtSecSteps')));
    const ol = el('ol', 'skills-list');
    for (const s of ans.stepByStep || []) {
      ol.appendChild(el('li', '', s));
    }
    secSteps.appendChild(ol);

    const secExample = el('section', 'qa-section');
    secExample.append(
      el('h3', 'qa-section-title', t(lang, 'doubtSecExample')),
      el('pre', 'code-box', ans.simpleExample || '')
    );

    const secMistake = el('section', 'qa-section');
    secMistake.append(
      el('h3', 'qa-section-title', t(lang, 'doubtSecMistake')),
      el('p', 'qa-overview-text', ans.commonMistake || '')
    );

    const secPractice = el('section', 'qa-section next-action-box');
    secPractice.append(
      el('h3', 'qa-section-title', t(lang, 'doubtSecPractice')),
      el('p', 'next-action-text', ans.nextPracticeStep || '')
    );

    // Multi-turn follow-up controls
    const followBox = el('div', 'followup-box');
    const followChips = el('div', 'chip-list');
    const simplerBtn = el('button', 'chip-btn', t(lang, 'explainSimplerBtn'));
    simplerBtn.type = 'button';
    simplerBtn.addEventListener('click', () => {
      runDoubtSolve({
        question: `Explain simpler with fewer technical words: ${doubtQuery}`,
        previousInteractionId: doubtResult.interactionId
      });
    });
    followChips.appendChild(simplerBtn);

    for (const sug of ans.followUpSuggestions || []) {
      const b = el('button', 'chip-btn', sug);
      b.type = 'button';
      b.addEventListener('click', () => {
        doubtQuery = sug;
        runDoubtSolve({ question: sug, previousInteractionId: doubtResult.interactionId });
      });
      followChips.appendChild(b);
    }

    const followForm = el('form', 'qa-input-row');
    const followInput = document.createElement('input');
    followInput.type = 'search';
    followInput.className = 'text-input';
    followInput.placeholder = t(lang, 'followUpPlaceholder');
    const followBtn = el('button', 'btn btn-outline', t(lang, 'followUpBtn'));
    followBtn.type = 'submit';
    followForm.append(followInput, followBtn);
    followForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = followInput.value.trim();
      if (!q) return;
      doubtQuery = q;
      runDoubtSolve({ question: q, previousInteractionId: doubtResult.interactionId });
    });
    followBox.append(followChips, followForm);

    // Feedback row
    const fbRow = el('div', 'feedback-row');
    if (feedbackSent.has(doubtResult.queryHash)) {
      fbRow.appendChild(el('span', 'muted', t(lang, 'feedbackThanks')));
    } else {
      fbRow.appendChild(el('span', 'muted', t(lang, 'helpfulPrompt')));
      const yesBtn = el('button', 'btn btn-secondary', t(lang, 'helpfulYes'));
      yesBtn.type = 'button';
      yesBtn.addEventListener('click', async () => {
        await sendDoubtFeedback({ queryHash: doubtResult.queryHash, helpful: true, lang });
        feedbackSent.add(doubtResult.queryHash);
        showToast(t(lang, 'feedbackThanks'));
        render();
      });
      const noBtn = el('button', 'btn btn-secondary', t(lang, 'helpfulNo'));
      noBtn.type = 'button';
      noBtn.addEventListener('click', async () => {
        await sendDoubtFeedback({ queryHash: doubtResult.queryHash, helpful: false, lang });
        feedbackSent.add(doubtResult.queryHash);
        showToast(t(lang, 'feedbackThanks'));
        render();
      });
      fbRow.append(yesBtn, noBtn);
    }

    card.append(metaRow, secDirect, secSteps, secExample, secMistake, secPractice, followBox, fbRow);
    container.appendChild(card);
    return input;
  }

  function render() {
    const state = store.getState();
    const lang = state.lang;
    const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
    const focusStepId =
      activeEl && container.contains(activeEl) ? activeEl.dataset?.stepFocus || null : null;
    const focusInputId =
      activeEl && (activeEl.id === 'qa-input' || activeEl.id === 'doubt-input')
        ? activeEl.id
        : null;
    const selPos = focusInputId ? activeEl.selectionStart : null;

    container.innerHTML = '';

    // Mode Switcher: Career Roadmap | Doubt Solver (AI)
    const modeSwitch = el('div', 'mode-switch');
    modeSwitch.setAttribute('role', 'group');

    const roadmapBtn = el(
      'button',
      `btn ${activeMode === 'roadmap' ? 'btn-primary' : 'btn-secondary'}`,
      t(lang, 'modeRoadmap')
    );
    roadmapBtn.type = 'button';
    roadmapBtn.setAttribute('aria-pressed', String(activeMode === 'roadmap'));
    roadmapBtn.addEventListener('click', () => {
      activeMode = 'roadmap';
      render();
    });

    const doubtBtn = el(
      'button',
      `btn ${activeMode === 'doubt' ? 'btn-primary' : 'btn-secondary'}`,
      t(lang, 'modeDoubt')
    );
    doubtBtn.type = 'button';
    doubtBtn.setAttribute('aria-pressed', String(activeMode === 'doubt'));
    doubtBtn.addEventListener('click', () => {
      activeMode = 'doubt';
      render();
    });

    modeSwitch.append(roadmapBtn, doubtBtn);
    container.appendChild(modeSwitch);

    if (activeMode === 'doubt') {
      renderDoubtMode(lang, state);
    } else {
      renderRoadmapMode(lang, state);
    }

    if (focusInputId) {
      const targetInput = document.getElementById(focusInputId);
      if (targetInput) {
        targetInput.focus();
        if (selPos !== null && typeof targetInput.setSelectionRange === 'function') {
          targetInput.setSelectionRange(selPos, selPos);
        }
      }
    } else if (focusStepId) {
      const targetCb = container.querySelector(`[data-step-focus="${focusStepId}"]`);
      if (targetCb) targetCb.focus();
    }
  }

  return {
    init() {
      const state = store.getState();
      const initialPath = state.lastQuery?.pathId || 'tech-zero-cost';
      const initialQ = state.lastQuery?.query || '';
      loadGuidance({ query: initialQ, pathId: initialPath });
    },
    openPath(pathId) {
      activeMode = 'roadmap';
      currentQuery = '';
      store.update({ activeTab: 'guidance' });
      loadGuidance({ query: '', pathId });
    },
    openDoubt(question) {
      activeMode = 'doubt';
      doubtQuery = question || '';
      store.update({ activeTab: 'guidance' });
      if (doubtQuery.trim()) {
        runDoubtSolve({ question: doubtQuery });
      } else {
        render();
      }
    },
    onStateChange(prevLang) {
      const state = store.getState();
      if (state.lang !== prevLang && activeMode === 'roadmap') {
        loadGuidance({ query: currentQuery, pathId: currentPathId || currentResult?.pathId });
      } else {
        render();
      }
    }
  };
}
