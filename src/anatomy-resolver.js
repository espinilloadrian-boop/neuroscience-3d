// Resolución determinista de etiquetas clínicas contra las estructuras realmente cargadas.
// Solo utiliza nombre de malla y región; evita tratar la jerarquía TA2 como si fuera una malla.
export function normalizeAnatomyLabel(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\\s+/g, ' ');
}

function hasWholePhrase(field, term) {
  return field === term || (field.length > term.length && ((' ' + field + ' ').includes(' ' + term + ' ')));
}

export function resolveAnatomyTarget(items, aliases = []) {
  const terms = [...new Set(aliases.map(normalizeAnatomyLabel).filter(term => term.length >= 4))];
  if (!terms.length) return null;
  const ranked = [];
  for (const item of items ?? []) {
    const label = normalizeAnatomyLabel(item.label);
    const region = normalizeAnatomyLabel(item.region);
    let score = Infinity;
    for (const term of terms) {
      if (label === term) score = Math.min(score, 0);
      else if (hasWholePhrase(label, term)) score = Math.min(score, 10 + term.length * -0.01);
      if (region === term) score = Math.min(score, 20);
      else if (hasWholePhrase(region, term)) score = Math.min(score, 30 + term.length * -0.01);
    }
    if (Number.isFinite(score)) ranked.push({ item, score });
  }
  ranked.sort((a, b) => a.score - b.score || Number(a.item.side !== 'left') - Number(b.item.side !== 'left'));
  return ranked[0]?.item ?? null;
}
