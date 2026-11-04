// Enlaces explícitos entre escenarios clínicos, atlas, redes y tractos.
// Los alias se usan solo para localizar mallas ya presentes en el atlas.
// Si no existe coincidencia, la interfaz lo informa: no inventa una estructura.
export const clinicalCaseLinks = {
 ad: {
  structures: [
   {label:"Hipocampo", aliases:["hippocampus","hipocampo"]},
   {label:"Corteza entorrinal (no segmentada en este modelo)", aliases:["entorhinal cortex"]},
   {label:"Corteza parahipocampal", aliases:["parahippocampal","parahipocampal gyrus","parahipocampal cortex"]},
   {label:"Núcleos anteriores del tálamo", aliases:["anterior nuclei of thalamus"]}
  ],
  networkId:"medialtemporal",
  tractId:"fornix"
 },
 tle: {
  structures:[
   {label:"Hipocampo",aliases:["hippocampus","hipocampo"]},
   {label:"Complejo basolateral amigdalino",aliases:["basolateral complex"]},
   {label:"Corteza entorrinal (no segmentada en este modelo)",aliases:["entorhinal cortex"]},
   {label:"Núcleos anteriores del tálamo",aliases:["anterior nuclei of thalamus"]}
  ],
  networkId:"limbic",
  tractId:"fornix"
 },
 stroke: {
  structures:[
   {label:"Cápsula interna (no segmentada en este modelo)",aliases:["internal capsule"]},
   {label:"Núcleos anteriores del tálamo",aliases:["anterior nuclei of thalamus"]},
   {label:"Giro frontal medio (referencia prefrontal)",aliases:["middle frontal gyrus"]},
   {label:"Cuerpo calloso",aliases:["corpus callosum","cuerpo calloso"]}
  ],
  networkId:"thalamocortical",
  tractId:"internal-capsule"
 },
 tbi: {
  structures:[
   {label:"Cuerpo calloso",aliases:["corpus callosum","cuerpo calloso"]},
   {label:"Cápsula interna (no segmentada en este modelo)",aliases:["internal capsule"]},
   {label:"Hipocampo",aliases:["hippocampus","hipocampo"]}
  ],
  networkId:"thalamocortical",
  tractId:"cingulum"
 },
 ndd: {
  structures:[
   {label:"Giro frontal medio (referencia prefrontal)",aliases:["middle frontal gyrus"]},
   {label:"Corteza somatosensorial",aliases:["postcentral gyrus","primary somatosensory","somatosensory cortex"]},
   {label:"Giro temporal medio/superior",aliases:["middle temporal gyrus","superior temporal gyrus"]}
  ],
  networkId:"frontostriatal",
  tractId:"slf"
 }

,
 vci: {
  structures:[
   {label:"Cápsula interna (no segmentada en este modelo)",aliases:["internal capsule"]},
   {label:"Núcleos anteriores del tálamo",aliases:["anterior nuclei of thalamus"]},
   {label:"Giro frontal medio (referencia prefrontal)",aliases:["middle frontal gyrus"]},
   {label:"Cuerpo calloso",aliases:["corpus callosum","cuerpo calloso"]}
  ],
  networkId:"thalamocortical",
  tractId:"internal-capsule"
 },
 bvftd: {
  structures:[
   {label:"Giro frontal medio (referencia prefrontal)",aliases:["middle frontal gyrus"]},
   {label:"Complejo basolateral amigdalino",aliases:["basolateral complex"]},
   {label:"Giro temporal medio/superior",aliases:["middle temporal gyrus","superior temporal gyrus"]},
   {label:"Ínsula",aliases:["insula","ínsula"]}
  ],
  networkId:"salience",
  tractId:"uncinate"
 },
 "pd-cognition": {
  structures:[
   {label:"Núcleo caudado",aliases:["caudate nucleus"]},
   {label:"Putamen",aliases:["putamen"]},
   {label:"Globo pálido interno (GPi)",aliases:["globus pallidus internal"]},
   {label:"Núcleos anteriores del tálamo",aliases:["anterior nuclei of thalamus"]},
   {label:"Giro frontal medio (referencia prefrontal)",aliases:["middle frontal gyrus"]}
  ],
  networkId:"frontostriatal",
  tractId:"internal-capsule"
}
};
