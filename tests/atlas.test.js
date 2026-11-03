import test from 'node:test';
import assert from 'node:assert/strict';
import { clinicalCases } from '../src/clinical-cases.js';
import { neuropsychTests } from '../src/neuropsych-tests.js';
import { tracts } from '../src/tracts.js';
import { findAnatomyIntegration } from '../src/anatomy-integration.js';
import { researchLab } from '../src/research-lab.js';
import { parseCSV, normalizeResearchRows, summarizeResearch, pearson, pairwiseAuc } from '../src/research-analysis.js';

test('el catálogo clínico incluye los escenarios neurológicos prioritarios', () => {
  const ids = clinicalCases.map(item => item.id);
  for (const id of ['ad', 'tle', 'stroke', 'tbi', 'ndd', 'vci', 'bvftd', 'pd-cognition']) {
    assert.ok(ids.includes(id), `Falta escenario clínico: ${id}`);
  }
  assert.equal(new Set(ids).size, ids.length, 'Los identificadores clínicos deben ser únicos');
  for (const item of clinicalCases) {
    assert.ok(item.name && item.question && item.cognition && item.caveat, `Ficha incompleta: ${item.id}`);
    assert.ok(item.refs.every(([label, url]) => label && url.startsWith('https://')), `Referencia inválida: ${item.id}`);
  }
});

test('el catálogo neuropsicológico contiene instrumentos sin material protegido', () => {
  const ids = neuropsychTests.map(item => item.id);
  for (const id of ['ace3', 'moca', 'mmse', 'ravlt', 'tmt', 'fab', 'fluency', 'npi', 'faq', 'sdmt', 'cdr']) {
    assert.ok(ids.includes(id), `Falta instrumento: ${id}`);
  }
  assert.equal(new Set(ids).size, ids.length, 'Los identificadores de instrumentos deben ser únicos');
  for (const item of neuropsychTests) {
    assert.ok(item.name && item.construct && item.interpretation && item.license, `Ficha incompleta: ${item.id}`);
  }
});

test('el catálogo de tractos mantiene identificadores únicos y descripciones clínicas', () => {
  assert.equal(tracts.length, 10);
  assert.equal(new Set(tracts.map(item => item.id)).size, tracts.length);
  for (const item of tracts) assert.ok(item.course && item.function && item.caveat);
});

test('la integración anatomo-funcional resuelve estructuras frecuentes', () => {
  for (const label of ['left hippocampus', 'amygdala', 'thalamus', 'prefrontal cortex', 'cerebellum']) {
    const result = findAnatomyIntegration(label);
    assert.ok(result, `No se resolvió ${label}`);
    assert.ok(result.physiology && result.cognition && result.networks && result.clinical);
  }
  assert.equal(findAnatomyIntegration('estructura inventada'), null);
});

test('el proyecto de fluencia semántica conserva objetivos, pipeline y salvaguardas', () => {
  assert.ok(researchLab.objectives.length >= 5);
  assert.ok(researchLab.pipeline.length >= 8);
  assert.ok(researchLab.safeguards.length >= 4);
  assert.ok(researchLab.variables.some(v => /frecuencia/i.test(v.name)));
  assert.ok(researchLab.variables.some(v => /latencia/i.test(v.name)));
});

test('el lector CSV respeta campos entrecomillados y normaliza variables', () => {
  const csv = 'group,participant_id,total_words,education\nControl,P01,18,12\n"DCL, amnésico",P02,12,8\n';
  const rows = parseCSV(csv);
  assert.equal(rows.length, 2);
  assert.equal(rows[1].group, 'DCL, amnésico');
  const normalized = normalizeResearchRows(rows);
  assert.deepEqual(normalized.missing, []);
  assert.equal(normalized.rows.length, 2);
  assert.equal(normalized.rows[1].total_words, 12);
  assert.equal(normalized.rows[1].education, 8);
});

test('los descriptivos por grupo y métricas básicas producen resultados coherentes', () => {
  const rows = [
    { group: 'Control', total_words: 20 },
    { group: 'Control', total_words: 22 },
    { group: 'DCL', total_words: 14 },
    { group: 'DCL', total_words: 16 }
  ];
  const summary = summarizeResearch(rows);
  assert.deepEqual(summary.groups, ['Control', 'DCL']);
  assert.equal(summary.summaries.find(x => x.group === 'Control').values[0].mean, 21);
  assert.equal(pearson([1, 2, 3], [2, 4, 6]).r, 1);
  assert.equal(pairwiseAuc([
    { group: 'Control', score: 1 }, { group: 'Control', score: 2 },
    { group: 'EA', score: 3 }, { group: 'EA', score: 4 }
  ], 'score', 'Control', 'EA').auc, 1);
});
