// Enlaces explícitos entre escenarios clínicos, atlas, redes y tractos.
// Los alias se usan solo para localizar mallas ya presentes en el atlas.
// Si no existe coincidencia, la interfaz lo informa: no inventa una estructura.
export const clinicalCaseLinks = {
 ad: {
  structures: [
   {label:"Hipocampo", aliases:["hippocampus","hipocampo"]},
   {label:"Corteza entorrinal", aliases:["entorhinal","corteza entorrinal"]},
   {label:"Corteza parahipocampal", aliases:["parahippocampal","parahipocampal gyrus","parahipocampal cortex"]},
   {label:"Tálamo", aliases:["thalamus","tálamo"]}
  ],
  networkId:"medialtemporal",
  tractId:"fornix"
 },
 tle: {
  structures:[
   {label:"Hipocampo",aliases:["hippocampus","hipocampo"]},
   {label:"Amígdala",aliases:["amygdala","amígdala"]},
   {label:"Corteza entorrinal",aliases:["entorhinal","corteza entorrinal"]},
   {label:"Tálamo",aliases:["thalamus","tálamo"]}
  ],
  networkId:"limbic",
  tractId:"fornix"
 },
 stroke: {
  structures:[
   {label:"Cápsula interna",aliases:["internal capsule","cápsula interna"]},
   {label:"Tálamo",aliases:["thalamus","tálamo"]},
   {label:"Corteza prefrontal",aliases:["prefrontal cortex","corteza prefrontal"]},
   {label:"Cuerpo calloso",aliases:["corpus callosum","cuerpo calloso"]}
  ],
  networkId:"thalamocortical",
  tractId:"internal-capsule"
 },
 tbi: {
  structures:[
   {label:"Cuerpo calloso",aliases:["corpus callosum","cuerpo calloso"]},
   {label:"Cápsula interna",aliases:["internal capsule","cápsula interna"]},
   {label:"Hipocampo",aliases:["hippocampus","hipocampo"]}
  ],
  networkId:"thalamocortical",
  tractId:"cingulum"
 },
 ndd: {
  structures:[
   {label:"Corteza prefrontal",aliases:["prefrontal cortex","corteza prefrontal"]},
   {label:"Corteza somatosensorial",aliases:["postcentral gyrus","primary somatosensory","somatosensory cortex"]},
   {label:"Corteza temporal",aliases:["temporal lobe","temporal cortex","lóbulo temporal"]}
  ],
  networkId:"frontostriatal",
  tractId:"slf"
 }

,
 vci: {
  structures:[
   {label:"Cápsula interna",aliases:["internal capsule","cápsula interna"]},
   {label:"Tálamo",aliases:["thalamus","tálamo"]},
   {label:"Corteza prefrontal",aliases:["prefrontal cortex","corteza prefrontal"]},
   {label:"Cuerpo calloso",aliases:["corpus callosum","cuerpo calloso"]}
  ],
  networkId:"thalamocortical",
  tractId:"internal-capsule"
 },
 bvftd: {
  structures:[
   {label:"Corteza prefrontal",aliases:["prefrontal cortex","corteza prefrontal"]},
   {label:"Amígdala",aliases:["amygdala","amygdaloid complex","amígdala"]},
   {label:"Corteza temporal",aliases:["superior temporal gyrus","middle temporal gyrus","temporal cortex"]},
   {label:"Ínsula",aliases:["insula","ínsula"]}
  ],
  networkId:"salience",
  tractId:"uncinate"
 },
 "pd-cognition": {
  structures:[
   {label:"Núcleo caudado",aliases:["caudate nucleus","caudate"]},
   {label:"Putamen",aliases:["putamen"]},
   {label:"Globo pálido",aliases:["globus pallidus internal","globus pallidus external","globus pallidus"]},
   {label:"Tálamo",aliases:["thalamus","tálamo"]},
   {label:"Corteza prefrontal",aliases:["prefrontal cortex","middle frontal gyrus","superior frontal gyrus"]}
  ],
  networkId:"frontostriatal",
  tractId:"internal-capsule"
}
};
