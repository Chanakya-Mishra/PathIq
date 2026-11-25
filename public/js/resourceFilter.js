/**
 * Shared pure resource filtering logic (zero DOM/Node dependencies).
 * Used by both frontend directoryView and backend fallback repository.
 */
export function filterResources(items, filters = {}, uiLang = 'en') {
  const search = String(filters.search || '').trim().toLowerCase();
  const domain = filters.domain || 'all';
  const format = filters.format || 'all';
  const language = filters.language || 'all';
  const dataUsage = filters.dataUsage || 'all';

  return items.filter((item) => {
    if (domain !== 'all' && item.domain !== domain) return false;
    if (format !== 'all' && item.format !== format) return false;
    if (language !== 'all' && !item.languages.includes(language)) return false;
    if (dataUsage !== 'all' && item.dataUsage !== dataUsage) return false;

    if (search) {
      const titleObj = item.title || {};
      const whyObj = item.why || {};
      const hay = [
        titleObj[uiLang] ?? titleObj.en ?? '',
        whyObj[uiLang] ?? whyObj.en ?? '',
        titleObj.en ?? '',
        whyObj.en ?? '',
        item.domain,
        item.format,
        item.url
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(search)) return false;
    }

    return true;
  });
}
