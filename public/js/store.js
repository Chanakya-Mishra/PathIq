const STORAGE_KEY = 'pathiq_state_v1';
const MAX_QA_CACHE = 20;

export const DEFAULT_STATE = Object.freeze({
  lang: 'en',
  liteMode: false,
  stage: 'college',
  weeklyHours: '10',
  activeTab: 'dashboard',
  savedResourceIds: [],
  completedSteps: {},
  studyDays: {},
  qaCache: {},
  lastQuery: null
});

/**
 * Create an isolated or browser-backed state store.
 * @param {{ getItem(k: string): string | null, setItem(k: string, v: string): void } | null} [storage]
 */
export function createStore(storage = getDefaultStorage()) {
  let state = loadInitialState(storage);
  const listeners = new Set();

  function persist() {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota/storage errors in constrained environments
    }
  }

  function notify() {
    for (const listener of listeners) {
      listener(state);
    }
  }

  return {
    getState() {
      return state;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    update(patch) {
      state = { ...state, ...patch };
      persist();
      notify();
      return state;
    },

    toggleSavedResource(resourceId) {
      const exists = state.savedResourceIds.includes(resourceId);
      const next = exists
        ? state.savedResourceIds.filter((id) => id !== resourceId)
        : [...state.savedResourceIds, resourceId];
      return this.update({ savedResourceIds: next });
    },

    setStepCompleted(pathId, stepId, done) {
      const key = `${pathId}::${stepId}`;
      const nextSteps = { ...state.completedSteps };
      if (done) {
        nextSteps[key] = true;
      } else {
        delete nextSteps[key];
      }
      return this.update({ completedSteps: nextSteps });
    },

    toggleStudyDay(isoDate) {
      const nextDays = { ...state.studyDays };
      if (nextDays[isoDate]) {
        delete nextDays[isoDate];
      } else {
        nextDays[isoDate] = true;
      }
      return this.update({ studyDays: nextDays });
    },

    setCachedAnswer(cacheKey, answer) {
      const entries = Object.entries(state.qaCache).filter(([k]) => k !== cacheKey);
      entries.push([cacheKey, { answer, cachedAt: Date.now() }]);
      const trimmed = entries.slice(-MAX_QA_CACHE);
      return this.update({ qaCache: Object.fromEntries(trimmed) });
    },

    getCachedAnswer(cacheKey) {
      return state.qaCache[cacheKey]?.answer || null;
    },

    clearSavedPlan() {
      return this.update({
        savedResourceIds: [],
        completedSteps: {}
      });
    }
  };
}

function getDefaultStorage() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

function loadInitialState(storage) {
  if (!storage) return cloneDefault();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw);
    return {
      ...cloneDefault(),
      ...parsed,
      savedResourceIds: Array.isArray(parsed.savedResourceIds) ? parsed.savedResourceIds : [],
      completedSteps:
        parsed.completedSteps && typeof parsed.completedSteps === 'object'
          ? parsed.completedSteps
          : {},
      studyDays:
        parsed.studyDays && typeof parsed.studyDays === 'object' ? parsed.studyDays : {},
      qaCache: parsed.qaCache && typeof parsed.qaCache === 'object' ? parsed.qaCache : {}
    };
  } catch {
    return cloneDefault();
  }
}

function cloneDefault() {
  return {
    ...DEFAULT_STATE,
    savedResourceIds: [],
    completedSteps: {},
    studyDays: {},
    qaCache: {}
  };
}
