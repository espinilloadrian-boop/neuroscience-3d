// Fichas anatómicas curadas. Contenido resumido y vinculado a fuentes consultables.
// Las relaciones funcionales se presentan como asociaciones de redes, no como causalidad exclusiva.
export const structureFacts = [
  {
    match: ["hippocampus", "hippocampus proper", "hipocampo"],
    title: "Formación hipocampal",
    location: "Lóbulo temporal medial, en el piso del asta temporal del ventrículo lateral; se extiende desde la región amigdalar hacia el esplenio del cuerpo calloso.",
    boundaries: "Incluye hipocampo propio (campos CA), giro dentado y subículo. Se continúa con la corteza entorrinal y la región parahipocampal.",
    brodmann: "No corresponde asignar un área de Brodmann única al hipocampo; es allocorteza/arquicorteza.",
    connections: "Entrada cortical principal desde la corteza entorrinal por la vía perforante hacia el giro dentado y CA; circuito trisimpático giro dentado → CA3 → CA1 → subículo. La salida principal se organiza a través del fórnix.",
    functions: "Participa en la codificación y consolidación de memoria episódica/declarativa, asociación relacional y navegación espacial. Su contribución depende de interacciones con corteza entorrinal, parahipocampal y redes distribuidas.",
    clinical: "La esclerosis/atrofia hipocampal puede asociarse a epilepsia temporal mesial. La afectación temprana de circuitos temporomediales es frecuente en enfermedad de Alzheimer, pero la imagen aislada no establece diagnóstico ni etiología.",
    limitation: "La ficha describe organización general; no sustituye la segmentación de subcampos CA1–CA4, giro dentado y subículo ni una evaluación individual.",
    references: [
      { label: "Fogwe et al. — Neuroanatomy, Hippocampus (StatPearls, 2023)", url: "https://www.ncbi.nlm.nih.gov/books/NBK482171/" },
      { label: "Chauhan et al. — The Anatomy of the Hippocampus (2021)", url: "https://doi.org/10.36255/exonpublications.cerebralischemia.2021.hippocampus" }
    ]
  },
  {
    match: ["thalamus", "tálamo", "talamo"],
    title: "Tálamo",
    location: "Diencéfalo, a ambos lados del tercer ventrículo, superior al mesencéfalo y medial a la cápsula interna.",
    boundaries: "Conjunto bilateral de núcleos separados parcialmente por láminas medulares. Se reconocen grupos anterior, medial, lateral, intralaminar, de línea media y reticular; la organización funcional depende del núcleo.",
    brodmann: "No corresponde: es una estructura subcortical y no una región cortical de Brodmann.",
    connections: "La mayoría de los núcleos mantienen circuitos recíprocos tálamo-corticales. VPL/VPM proyectan a corteza somatosensorial; geniculado lateral a corteza visual; geniculado medial a corteza auditiva; núcleos anteriores participan en circuitos límbicos; núcleos mediodorsales se conectan con corteza prefrontal.",
    functions: "Integra y modula el flujo sensorial (excepto la vía olfatoria primaria), motor, límbico y asociativo. También participa en atención, alerta, sueño-vigilia y nivel de conciencia; no es un simple relevo pasivo.",
    clinical: "Lesiones talámicas pueden producir síndromes sensitivos, alteraciones motoras, dolor central, trastornos de memoria o de conciencia, según territorio y lateralidad. La clínica depende del núcleo y de las conexiones comprometidas.",
    limitation: "No inferir un síndrome a partir de la etiqueta global 'tálamo': es imprescindible identificar el núcleo, territorio vascular, extensión y correlato clínico.",
    references: [
      { label: "Torrico & Munakomi — Neuroanatomy, Thalamus (StatPearls, 2023)", url: "https://www.ncbi.nlm.nih.gov/books/NBK549908/" },
      { label: "Sheridan & Tadi — Neuroanatomy, Thalamic Nuclei (StatPearls)", url: "https://www.ncbi.nlm.nih.gov/books/NBK549908/" },
      { label: "The thalamus: Structure, function, and neurotherapeutics (2025)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12014413/" }
    ]
  }
];

export function findStructureFact(label) {
  const value = String(label || "").normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
  return structureFacts.find(f => f.match.some(alias => value.includes(alias.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase()))) || null;
}
