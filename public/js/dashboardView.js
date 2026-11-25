import { CAREER_PATHS } from '../data/careerPaths.js';
import { RESOURCES } from '../data/resources.js';
import { t, localizeField } from './i18n.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const TRACK_COLORS = ['#0f5c52', '#2c6aa0', '#b4690e'];

/**
 * Compute student learning stats for dashboard cards, donut chart, and progress bars.
 * Prioritizes active paths with checked steps, falling back to top 3 starter paths.
 * @param {Record<string, boolean>} completedSteps
 * @param {string[]} savedResourceIds
 */
export function computeLearningStats(completedSteps = {}, savedResourceIds = []) {
  const pathStats = CAREER_PATHS.map((path) => {
    const totalSteps = path.steps.length;
    const doneSteps = path.steps.filter((s) => Boolean(completedSteps[`${path.id}::${s.id}`])).length;
    const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
    return {
      id: path.id,
      domain: path.domain,
      path,
      doneSteps,
      totalSteps,
      pct
    };
  });

  const started = pathStats.filter((p) => p.doneSteps > 0);
  const featured = started.length >= 3
    ? started.slice(0, 3)
    : [...started, ...pathStats.filter((p) => p.doneSteps === 0)].slice(0, 3);

  const totalChecked = pathStats.reduce((sum, p) => sum + p.doneSteps, 0);
  const trackedDenominator = (started.length > 0 ? started : featured).reduce(
    (sum, p) => sum + p.totalSteps,
    0
  );
  const overallPct =
    trackedDenominator > 0 ? Math.min(100, Math.round((totalChecked / trackedDenominator) * 100)) : 0;

  return {
    featured: featured.map((item, idx) => ({ ...item, color: TRACK_COLORS[idx % TRACK_COLORS.length] })),
    overallPct,
    totalChecked,
    savedCount: Array.isArray(savedResourceIds) ? savedResourceIds.length : 0
  };
}

/**
 * Build a lightweight 7-column month calendar matrix for the Study Schedule widget.
 * @param {Date} [referenceDate]
 */
export function buildMonthCalendar(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const todayIso = toIsoDate(referenceDate);
  const cells = [];

  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({ day, inMonth: false, iso: null, isToday: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    const iso = toIsoDate(dt);
    cells.push({
      day: d,
      inMonth: true,
      iso,
      isToday: iso === todayIso
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, inMonth: false, iso: null, isToday: false });
  }

  return {
    year,
    month,
    monthLabel: referenceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    todayIso,
    cells
  };
}

function toIsoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Mount and manage the Student Dashboard view inspired by Doubttify + EduGate layout.
 */
export function createDashboardView({ container, store, onOpenPath, onQuickDoubt, showToast }) {
  let calendarRefDate = new Date();

  function render() {
    const state = store.getState();
    const lang = state.lang;
    const stats = computeLearningStats(state.completedSteps, state.savedResourceIds);
    const cal = buildMonthCalendar(calendarRefDate);

    container.innerHTML = '';

    const grid = el('div', 'dash-layout');
    const mainCol = el('div', 'dash-main-col');
    const sideCol = el('aside', 'dash-rail-col');

    // 1. Welcome & Weekly Goal Banner + Quick Doubt Launchpad
    const heroCard = el('section', 'dash-hero-card');
    const heroText = el('div', 'dash-hero-body');
    heroText.append(
      el('h2', 'dash-hero-title', t(lang, 'dashWelcomeTitle')),
      el('p', 'dash-hero-sub', t(lang, 'dashWelcomeSub', { pct: stats.overallPct }))
    );

    const quickForm = el('form', 'qa-input-row dash-quick-form');
    const quickInput = document.createElement('input');
    quickInput.type = 'search';
    quickInput.className = 'text-input';
    quickInput.placeholder = t(lang, 'dashQuickDoubtPlaceholder');
    quickInput.setAttribute('aria-label', t(lang, 'dashQuickDoubtPlaceholder'));
    const quickBtn = el('button', 'btn btn-primary', t(lang, 'dashQuickDoubtBtn'));
    quickBtn.type = 'submit';
    quickForm.append(quickInput, quickBtn);
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = quickInput.value.trim();
      if (onQuickDoubt) onQuickDoubt(q);
    });

    heroText.appendChild(quickForm);
    heroCard.appendChild(heroText);
    mainCol.appendChild(heroCard);

    // 2. Your Active Learning Paths (3 scannable cards)
    const pathsSec = el('section', 'dash-section');
    const pathsHead = el('div', 'dash-sec-head');
    pathsHead.appendChild(el('h3', 'dash-sec-title', t(lang, 'dashYourPaths')));
    const viewAllBtn = el('button', 'link-btn', t(lang, 'dashViewAll'));
    viewAllBtn.type = 'button';
    viewAllBtn.addEventListener('click', () => store.update({ activeTab: 'guidance' }));
    pathsHead.appendChild(viewAllBtn);
    pathsSec.appendChild(pathsHead);

    const coursesRow = el('div', 'dash-courses-grid');
    for (const item of stats.featured) {
      const card = el('article', 'dash-course-card');
      card.style.setProperty('--track-color', item.color);

      const title = el('h4', 'dash-course-title', localizeField(item.path.title, lang));
      const meta = el(
        'p',
        'dash-course-meta',
        `${t(lang, `domain_${item.domain}`)} · ${t(lang, 'dashStepsRatio', {
          done: item.doneSteps,
          total: item.totalSteps
        })}`
      );
      const openBtn = el('button', 'btn btn-outline dash-open-btn', `${t(lang, 'dashOpenPath')} →`);
      openBtn.type = 'button';
      openBtn.addEventListener('click', () => {
        if (onOpenPath) onOpenPath(item.id);
      });

      card.append(title, meta, openBtn);
      coursesRow.appendChild(card);
    }
    pathsSec.appendChild(coursesRow);
    mainCol.appendChild(pathsSec);

    // 3. Bottom 2-Card Row: Progress Statistic Donut + Learning Progress Bars
    const statsRow = el('div', 'dash-stats-grid');

    // Card A: Pure CSS Conic-Gradient Donut (0 KB overhead!)
    const donutCard = el('section', 'panel-card dash-stat-card');
    donutCard.appendChild(el('h3', 'dash-sec-title', t(lang, 'dashProgressStat')));

    const [c1, c2, c3] = stats.featured;
    const p1 = Math.max(8, c1?.pct || 0);
    const p2 = Math.max(8, c2?.pct || 0);
    const p3 = Math.max(8, c3?.pct || 0);
    const totalSlice = p1 + p2 + p3;
    const stop1 = Math.round((p1 / totalSlice) * stats.overallPct);
    const stop2 = stop1 + Math.round((p2 / totalSlice) * stats.overallPct);

    const donutWrap = el('div', 'dash-donut-wrap');
    const donutRing = el('div', 'dash-donut-ring');
    donutRing.style.background =
      stats.overallPct > 0
        ? `conic-gradient(${c1.color} 0% ${stop1}%, ${c2.color} ${stop1}% ${stop2}%, ${c3.color} ${stop2}% ${stats.overallPct}%, var(--surface-alt) ${stats.overallPct}% 100%)`
        : `conic-gradient(var(--surface-alt) 0% 100%)`;

    const donutHole = el('div', 'dash-donut-hole');
    donutHole.append(
      el('strong', 'dash-donut-pct', `${stats.overallPct}%`),
      el('span', 'dash-donut-lbl', t(lang, 'dashOverallDone'))
    );
    donutRing.appendChild(donutHole);

    const legend = el('ul', 'dash-legend');
    for (const item of stats.featured) {
      const li = el('li', 'dash-legend-item');
      const dot = el('span', 'dash-legend-dot');
      dot.style.background = item.color;
      li.append(dot, el('span', '', `${t(lang, `domain_${item.domain}`)} (${item.pct}%)`));
      legend.appendChild(li);
    }

    donutWrap.append(donutRing, legend);
    donutCard.appendChild(donutWrap);

    // Card B: Horizontal Learning Progress Bars
    const progCard = el('section', 'panel-card dash-prog-card');
    progCard.appendChild(el('h3', 'dash-sec-title', t(lang, 'dashLearningProgress')));

    const barsList = el('div', 'dash-bars-list');
    for (const item of stats.featured) {
      const row = el('div', 'dash-bar-row');
      const labelRow = el('div', 'dash-bar-labels');
      labelRow.append(
        el('span', 'dash-bar-name', localizeField(item.path.title, lang)),
        el('strong', 'dash-bar-pct', `${item.pct}%`)
      );
      const track = el('div', 'dash-bar-track');
      const fill = el('div', 'dash-bar-fill');
      fill.style.width = `${item.pct}%`;
      fill.style.background = item.color;
      track.appendChild(fill);
      row.append(labelRow, track);
      barsList.appendChild(row);
    }
    progCard.appendChild(barsList);

    statsRow.append(donutCard, progCard);
    mainCol.appendChild(statsRow);

    // 4. Right Utility Rail: Study Schedule Calendar + Portals + Share Card
    const calCard = el('section', 'panel-card dash-cal-card');
    const calHeader = el('div', 'dash-cal-header');
    calHeader.appendChild(el('h3', 'dash-sec-title', t(lang, 'dashStudySchedule')));

    const calNav = el('div', 'dash-cal-nav');
    const prevBtn = el('button', 'cal-nav-btn', '‹');
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Previous month');
    prevBtn.addEventListener('click', () => {
      calendarRefDate = new Date(calendarRefDate.getFullYear(), calendarRefDate.getMonth() - 1, 1);
      render();
    });

    const nextBtn = el('button', 'cal-nav-btn', '›');
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Next month');
    nextBtn.addEventListener('click', () => {
      calendarRefDate = new Date(calendarRefDate.getFullYear(), calendarRefDate.getMonth() + 1, 1);
      render();
    });

    calNav.append(prevBtn, el('span', 'cal-month-name', cal.monthLabel), nextBtn);
    calCard.append(calHeader, calNav);

    const calGrid = el('div', 'dash-cal-grid');
    for (const wd of t(lang, 'dashWeekdays').split(',')) {
      calGrid.appendChild(el('span', 'cal-weekday', wd));
    }
    for (const cell of cal.cells) {
      if (!cell.inMonth) {
        calGrid.appendChild(el('span', 'cal-day is-muted', String(cell.day)));
      } else {
        const isMarked = Boolean(state.studyDays?.[cell.iso]);
        const btn = el(
          'button',
          `cal-day ${cell.isToday ? 'is-today' : ''} ${isMarked ? 'is-marked' : ''}`,
          String(cell.day)
        );
        btn.type = 'button';
        btn.setAttribute('aria-pressed', String(isMarked));
        btn.addEventListener('click', () => {
          store.toggleStudyDay(cell.iso);
          showToast(t(lang, 'savedToast'));
        });
        calGrid.appendChild(btn);
      }
    }
    calCard.append(calGrid, el('p', 'dash-cal-hint', t(lang, 'dashScheduleHint')));
    sideCol.appendChild(calCard);

    // Upcoming Free Portals card
    const portalCard = el('section', 'panel-card dash-portal-card');
    portalCard.appendChild(el('h3', 'dash-sec-title', t(lang, 'dashUpcomingResources')));
    const featuredIds = ['res-swayam-nptel', 'res-nsp-india', 'res-freecodecamp'];
    for (const fid of featuredIds) {
      const r = RESOURCES.find((item) => item.id === fid);
      if (!r) continue;
      const link = el('a', 'dash-portal-link', `${localizeField(r.title, lang)} →`);
      link.href = r.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      portalCard.appendChild(link);
    }
    sideCol.appendChild(portalCard);

    // Share Anywhere Card
    const shareCard = el('section', 'panel-card dash-share-card');
    shareCard.append(
      el('h3', 'dash-sec-title', t(lang, 'dashShareCardTitle')),
      el('p', 'muted', t(lang, 'dashShareCardSub'))
    );
    const shareBtn = el('button', 'btn btn-primary dash-full-btn', t(lang, 'dashOpenSaved'));
    shareBtn.type = 'button';
    shareBtn.addEventListener('click', () => store.update({ activeTab: 'saved' }));
    shareCard.appendChild(shareBtn);
    sideCol.appendChild(shareCard);

    grid.append(mainCol, sideCol);
    container.appendChild(grid);
  }

  return {
    init: render,
    render
  };
}
