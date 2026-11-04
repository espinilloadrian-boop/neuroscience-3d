// Correspondencias explícitas entre nombres funcionales y etiquetas reales del manifiesto anatómico.
// No se infieren regiones ausentes ni se usan coincidencias por subcadena arbitraria.
const normalizeNetworkLabel=value=>String(value||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\\s+/g,' ').trim();
export const networkNodeAliases={
 "corteza prefrontal":["middle frontal gyrus","superior frontal gyrus","orbital part of inferior frontal gyrus","opercular part of inferior frontal gyrus","triangular part of inferior frontal gyrus"],
 "corteza prefrontal medial":["medial frontal gyrus","anterior cingulate gyrus","cingulate gyrus and sulcus (middle anterior part)"],
 "corteza prefrontal dorsolateral":["middle frontal gyrus","superior frontal gyrus"],
 "corteza prefrontal lateral":["middle frontal gyrus","superior frontal gyrus","inferior frontal gyrus"],
 "corteza frontal":["middle frontal gyrus","superior frontal gyrus","precentral gyrus"],
 "corteza motora":["precentral gyrus","primary motor cortex"],
 "corteza motora primaria":["precentral gyrus","primary motor cortex"],
 "globo pálido":["globus pallidus internal","globus pallidus external"],
 "fascículo arqueado":["arcuate fasciculus"],
 "fascículo longitudinal superior":["superior longitudinal fascicle"],
 "corteza premotora":["precentral gyrus","middle frontal gyrus","superior frontal gyrus"],
 "sustancia negra":["substantia nigra"],
 "estriado ventral":["nucleus accumbens","ventral striatum"],
 "corteza parietal posterior":["superior parietal lobule","inferior parietal lobule","precuneus"],
 "corteza parietal superior":["superior parietal lobule"],
 "corteza parietal inferior":["inferior parietal lobule","angular gyrus","supramarginal gyrus"],
 "surco intraparietal":["intraparietal sulcus"],
 "cíngulo anterior":["cingulate gyrus and sulcus (middle anterior part)","anterior cingulate"],
 "cíngulo anterior dorsal":["cingulate gyrus and sulcus (middle anterior part)"],
 "cíngulo posterior":["cingulate gyrus and sulcus (posterior dorsal part)","cingulate gyrus (posteroventral part)"],
 "ínsula anterior":["insula (subcentral gyrus and ant. and post. sulci)","insula"],
 "ínsula":["insula (subcentral gyrus and ant. and post. sulci)","insula"],
 "precúneo":["precuneus"],
 "hipocampo":["hippocampus","hippocampus proper"],
 "corteza entorrinal":["entorhinal cortex","entorhinal"],
 "giro dentado":["dentate gyrus"],
 "subículo":["subiculum"],
 "amígdala":["amygdala","amygdaloid complex","amygdaloid body"],
 "globo pálido":["globus pallidus internal","globus pallidus external","globus pallidus"],
 "estriado":["caudate nucleus","putamen","striatum"],
 "núcleo caudado":["caudate nucleus","caudate"],
 "putamen":["putamen"],
 "tálamo":["anterior nuclei of thalamus","lateral geniculate body","medial geniculate body"],
 "hipotálamo":["hypothalamus","anterior hypothalamus","lateral hypothalamus","posterior hypothalamus","tuberal hypothalamus"],
 "cerebelo":["cerebellum"],
 "corteza somatosensorial":["postcentral gyrus","primary somatosensory cortex"],
 "corteza visual":["calcarine sulcus","cuneus","lateral occipital gyrus"],
 "corteza occipital":["calcarine sulcus","cuneus","lateral occipital gyrus"],
 "corteza temporal":["superior temporal gyrus","middle temporal gyrus","inferior temporal gyrus"],
 "corteza auditiva":["transverse temporal gyri","superior temporal gyrus (lateral part)"],
 "campos oculares frontales":["frontal eye field"],
 "corteza parahipocampal":["medial occipitotemporal gyrus (parahippocampal)","parahippocampal gyrus"],
 "cuerpo calloso":["corpus callosum"],
 "cápsula interna":["internal capsule"],
 "tronco encefálico":["brainstem","mesencephalon","pons","medulla oblongata"]
};
export function resolveNetworkStructures(term, structures){
 const key=normalizeNetworkLabel(term);
 const entry=Object.entries(networkNodeAliases).find(([name])=>normalizeNetworkLabel(name)===key);
 const aliases=(entry?entry[1]:[term]).map(normalizeNetworkLabel).filter(Boolean);
 const matches=[...structures.values()].filter(structure=>{
  const label=normalizeNetworkLabel(structure.label);
  return aliases.some(alias=>label===alias||(' '+label+' ').includes(' '+alias+' '));
 });
 return [...new Map(matches.map(structure=>[structure.id,structure])).values()];
}
