// Resolución determinista de etiquetas clínicas contra las estructuras realmente cargadas.
// Prioriza coincidencias en el nombre de la malla sobre región y jerarquía TA2.
export function normalizeAnatomyLabel(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\\s+/g, ' ');
}

export function resolveAnatomyTarget(items, aliases = []) {
  const terms = [...new Set(aliases.map(normalizeAnatomyLabel).filter(term => term.length >= 4))];
  if (!terms.length) return null;
  const ranked = [];
  for (const item of items ?? []) {
    const label = normalizeAnatomyLabel(item.label);
    const region = normalizeAnatomyLabel(item.region);
    const hierarchy = normalizeAnatomyLabel(Array.isArray(item.ta2) ? item.ta2.join(' ') : item.ta2);
    let score = Infinity;
    for (const term of terms) {
      if (label === term) score = Math.min(score, 0);
      else if (label.includes(term)) score = Math.min(score, 10 + term.length * -0.01);
      if (region === term) score = Math.min(score, 20);
      else if (region.includes(term)) score = Math.min(score, 30 + term.length * -0.01);
      if (hierarchy === term) score = Math.min(score, 40);
      else if (hierarchy.includes(term)) score = Math.min(score, 50 + term.length * -0.01);
    }
    if (Number.isFinite(score)) ranked.push({ item, score });
  }
  ranked.sort((a, b) => a.score - b.score || Number(a.item.side !== 'left') - Number(b.item.side !== 'left'));
  return ranked[0]?.item ?? null;
}
