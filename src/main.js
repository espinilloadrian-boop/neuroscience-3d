import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import './style.css';
import { findStructureFact } from './structure-facts.js';
import { networks } from './networks.js';
import { tracts } from './tracts.js';
import { modalities } from './neuroimaging.js';
import { clinicalCases } from './clinical-cases.js';
import { clinicalCaseLinks } from './clinical-case-links.js';
import { correlations } from './clinical-correlation.js';
import { neuropsychTests } from './neuropsych-tests.js';
import { researchLab } from './research-lab.js';
import { microTopics } from './microanatomy.js';
import { cognitiveDomains } from './cognitive-domains.js';
import { neurochemicalSystems } from './neurochemistry.js';
import { physiologyTopics } from './neurophysiology.js';
import { simulationModels } from './simulations.js';
import { clinicalPharmacology } from './clinical-pharmacology.js';
import { validateMappedRows } from './research-validation.js';
import { summarizeNumeric, summarizeCategorical, summarizeByGroup, buildAnalysisPlan } from './research-statistics.js';
import { compareIndependentGroups, compareIndependentMultipleGroups, compareCategoricalGroups } from './research-inference.js';
import { parseCSV, normalizeResearchRows, summarizeResearch, pearson, pairwiseAuc, bootstrapAuc, standardizedMeanDifference, spearman, kruskalWallis, dunnPostHoc, researchFields } from './research-analysis.js';

const MODEL_URL='https://cdn.jsdelivr.net/gh/itayinbarr/brainproject@2929e94f521a8ddceab26bc100a98dc06b0da060/brain-atlas/models/brain.glb';
const MODEL_FALLBACK_URL='https://raw.githubusercontent.com/itayinbarr/brainproject/2929e94f521a8ddceab26bc100a98dc06b0da060/brain-atlas/models/brain.glb';
const MANIFEST_URL='https://raw.githubusercontent.com/itayinbarr/brainproject/2929e94f521a8ddceab26bc100a98dc06b0da060/brain-atlas/models/manifest.json';
const DRACO_URL='https://www.gstatic.com/draco/versioned/decoders/1.5.6/';
const sceneHost=document.querySelector('#scene');
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x0b1422,10,24);
const camera=new THREE.PerspectiveCamera(38,1,.01,200);
camera.position.set(0,1.1,8.5);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
renderer.localClippingEnabled=true;
sceneHost.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.065;
controls.minDistance=2.5;controls.maxDistance=16;
controls.target.set(0,0,0);controls.autoRotate=true;controls.autoRotateSpeed=.38;

scene.add(new THREE.HemisphereLight(0xc9dcff,0x172033,1.55));
const key=new THREE.DirectionalLight(0xd9e8ff,2.2);key.position.set(4,6,7);scene.add(key);
const rim=new THREE.DirectionalLight(0x6a9bdf,1.8);rim.position.set(-5,1,-5);scene.add(rim);
const fill=new THREE.PointLight(0x8c78d6,10,18);fill.position.set(0,-3,4);scene.add(fill);

const brain=new THREE.Group();scene.add(brain);
const sectionPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
const sectionGuide=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({color:0x8bb9e8,transparent:true,opacity:.10,side:THREE.DoubleSide,depthWrite:false}));
sectionGuide.visible=false;scene.add(sectionGuide);
const floorGrid=new THREE.GridHelper(12,24,0x2c4565,0x1a2c43);
floorGrid.position.y=-1.9;floorGrid.material.transparent=true;floorGrid.material.opacity=.2;scene.add(floorGrid);

const categoryNames={cortex:'Corteza cerebral',white_matter:'Sustancia blanca',deep_grey:'Núcleos grises profundos',diencephalon:'Diencéfalo',brainstem:'Tronco encefálico',cerebellum:'Cerebelo',ventricles:'Sistema ventricular',arteries:'Arterias',veins_sinuses:'Venas y senos venosos',cranial_nerves:'Nervios craneales',meninges_dura:'Meninges',tracts:'Tractos de sustancia blanca'};
const categoryColors={cortex:0xb5a4d8,white_matter:0xd6c6a4,deep_grey:0x9a83bd,diencephalon:0x7ea9c9,brainstem:0x9e9cae,cerebellum:0xc28fbd,ventricles:0x65b7c4,arteries:0xd77878,veins_sinuses:0x779ad1,cranial_nerves:0xd6b36f,meninges_dura:0x9a9b9e,tracts:0x75b6a5};
let manifestById=new Map();
const meshes=[];const structures=new Map();const layerEnabled=new Map();let selectedId=null;let isolateSelected=false;let labelsOn=true;let activePlane='none';let activeHemisphere='both';
const info=document.querySelector('#structure-info');
const loading=document.querySelector('#loading');
const credit=document.querySelector('#model-credit');
const buttons=[...document.querySelectorAll('[data-region]')];
const searchInput=document.querySelector('#structure-search');
const searchResults=document.querySelector('#search-results');

function normalise(s){return (s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function readExtras(o){const chain=[];let node=o;while(node){chain.unshift(node.userData||{});node=node.parent;}return Object.assign({},...chain);}
function buildFallbackBrain(){
 brain.clear();
 const makeHemisphere=(side)=>{
  const geometry=new THREE.SphereGeometry(1,96,72);
  const p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   const taper=1+0.035*Math.sin(18*y+5*z)*Math.sin(13*x+4*y)+0.018*Math.sin(31*z+8*x);
   p.setXYZ(i,x*taper,y*taper,z*taper);
  }
  geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({color:0xb8a5d2,roughness:.82,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(geometry,material);
  mesh.scale.set(1.02,1.23,1.48);
  mesh.position.set(side*.53,.12,0);
  mesh.scale.x*=.78;
  brain.add(mesh);
  const gyriMat=new THREE.MeshStandardMaterial({color:0xd0c0e1,roughness:.9});
  for(let j=0;j<22;j++){
   const a=(j/22)*Math.PI*2;
   const curve=[];
   for(let k=0;k<=32;k++){
    const t=k/32;
    const theta=a+t*1.1;
    const x=side*.53+side*.72*Math.cos(theta)*Math.sin(.25+Math.PI*t);
    const y=.12+.93*Math.sin(theta)*Math.sin(.25+Math.PI*t);
    const z=-1.18+2.36*t;
    curve.push(new THREE.Vector3(x,y,z));
   }
   const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve),48,.018,6,false),gyriMat);
   brain.add(tube);
  }
 };
 makeHemisphere(-1);makeHemisphere(1);
 const cerebellum=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),new THREE.MeshStandardMaterial({color:0xc08fae,roughness:.9}));
 cerebellum.scale.set(.68,.48,.62);cerebellum.position.set(0,-.92,-1.12);brain.add(cerebellum);
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.22,.34,.95,32),new THREE.MeshStandardMaterial({color:0xa5a2b6,roughness:.9}));
 stem.position.set(0,-1.12,-.45);stem.rotation.x=-.18;brain.add(stem);
 const box=new THREE.Box3().setFromObject(brain);
 const center=box.getCenter(new THREE.Vector3());brain.position.sub(center);
 controls.target.set(0,0,0);camera.position.set(0,1.1,8.5);controls.update();
 credit.textContent='MODELO DE CONTINGENCIA · REPRESENTACIÓN SIMPLIFICADA';
 loading.classList.add('hidden');
 info.innerHTML='<div class="region-kicker">VISUALIZACIÓN DE CONTINGENCIA</div><h2>Encéfalo 3D simplificado</h2><p class="muted">El servidor del modelo anatómico detallado no respondió. Se muestra una representación 3D local para mantener disponible la exploración visual; no permite seleccionar estructuras anatómicas individuales.</p>';
}
function showError(message){
 console.error(message);
 buildFallbackBrain();
}

function registerModel(gltf){
 const source=gltf.scene;
 source.traverse(o=>{
  if(!o.isMesh)return;
  const ex=readExtras(o);
  const id=ex.bx_id??ex.nodeId??null;
  const meta=id!==null?(manifestById.get(String(id))||{}):{};
  const cat=meta.category||ex.bx_cat||ex.cat||'other';
  const label=meta.label||ex.bx_label||ex.label||o.name||'Estructura anatómica';
  const side=meta.side||ex.bx_side||ex.side||'median';
  const region=meta.region||ex.bx_region||ex.region||'Sistema nervioso central';
  const ta2=meta.ta2||[];
  const color=new THREE.Color(categoryColors[cat]??0x9eacc1);
  const original=Array.isArray(o.material)?o.material[0]:o.material;
  const mat=new THREE.MeshStandardMaterial({color,roughness:(cat==='arteries'||cat==='veins_sinuses') ? 0.48 : 0.72,metalness:0,side:THREE.DoubleSide});
  mat.clippingPlanes=activePlane==='none'?[]:[sectionPlane];
  o.material=mat;
  o.userData={...ex,atlasId:id,atlasCategory:cat,atlasLabel:label,atlasSide:side,atlasRegion:region,baseColor:color.clone(),originalMaterial:original};
  meshes.push(o);
  const key=id!==null?String(id):label+'|'+side+'|'+cat;
  if(!structures.has(key))structures.set(key,{id:key,label,category:cat,side,region,ta2,mesh:o,meshes:[],source:meta.source||ex.bx_source||'Z-Anatomy / BodyParts3D'});
  structures.get(key).meshes.push(o);
 });
 const coreBox=new THREE.Box3();let hasCore=false;
 for(const m of meshes){const ex=readExtras(m);if(ex.bx_core===1||ex.bx_core===true){coreBox.expandByObject(m);hasCore=true;}}
 if(!hasCore)coreBox.setFromObject(source);
 const center=coreBox.getCenter(new THREE.Vector3());
 const radius=coreBox.getBoundingSphere(new THREE.Sphere()).radius||1;
 const fitScale=1.7/radius;
 // Box3 está expresado en coordenadas de mundo; la traslación debe escalarse
 // junto con la geometría para que el centro real del atlas quede en el origen.
 source.scale.setScalar(fitScale);
 source.rotation.y=Math.PI;
 // Compensar también la rotación de 180° aplicada al atlas.
 source.position.set(center.x*fitScale,-center.y*fitScale,center.z*fitScale);
 brain.add(source);
 const count=structures.size;
 loading.classList.add('hidden');
 credit.textContent='Z-ANATOMY / BODYPARTS3D · '+count+' ESTRUCTURAS NOMBRADAS';
 info.innerHTML='<div class="region-kicker">ATLAS ANATÓMICO · TA2</div><h2>Modelo anatómico cargado</h2><p class="muted">Se cargaron '+count+' estructuras identificables. Buscá por nombre o seleccioná directamente una región del modelo.</p><p class="muted" style="margin-top:12px">Las estructuras profundas y algunos tractos son aproximaciones registradas en espacio MNI (resolución aproximada de 7 mm); no tienen precisión clínica.</p>';
 renderSearch('');
 renderLayerControls();
 renderNetworkExplorer();
 renderTractExplorer();
 renderNeuroimagingExplorer();
 renderClinicalCaseExplorer();
 renderCorrelationExplorer();
 renderAssessmentExplorer();
 renderResearchProjects();
 renderResearchLab();
 renderResearchDataTool();
 renderMicroExplorer();
 renderCognitiveDomainExplorer();
 renderNeurochemistryExplorer();
 renderNeurophysiologyExplorer();
 renderSimulationExplorer();
 renderClinicalPharmacology();
}

function applyVisibility(mesh){const catOn=layerEnabled.get(mesh.userData.atlasCategory)!==false;const side=mesh.userData.atlasSide;const sideOn=activeHemisphere==='both'||side==='median'||side===activeHemisphere;const meshId=String(mesh.userData.atlasId??(mesh.userData.atlasLabel+'|'+mesh.userData.atlasSide+'|'+mesh.userData.atlasCategory));const selectionOn=!isolateSelected||!selectedId||meshId===selectedId;mesh.visible=catOn&&sideOn&&selectionOn;}
function focusStructure(s){
 const bounds=new THREE.Box3();
 s.meshes.forEach(mesh=>bounds.expandByObject(mesh));
 if(bounds.isEmpty())return;
 const center=bounds.getCenter(new THREE.Vector3());
 const sphere=bounds.getBoundingSphere(new THREE.Sphere());
 const direction=camera.position.clone().sub(controls.target);
 if(direction.lengthSq()<1e-8)direction.set(0,0,1);
 direction.normalize();
 const distance=THREE.MathUtils.clamp(sphere.radius*3.4,2.8,10);
 controls.target.copy(center);
 camera.position.copy(center).addScaledVector(direction,distance);
 camera.near=Math.max(.005,distance/1000);
 camera.far=Math.max(200,distance*30);
 camera.updateProjectionMatrix();
 controls.update();
}
function selectStructure(s){
 if(!s)return;
 if(layerEnabled.get(s.category)===false){layerEnabled.set(s.category,true);meshes.filter(m=>m.userData.atlasCategory===s.category).forEach(applyVisibility);renderLayerControls();}
 selectedId=s.id;
 if(isolateSelected)meshes.forEach(applyVisibility);
 focusStructure(s);
 meshes.forEach(m=>{
  const active=String(m.userData.atlasId??(m.userData.atlasLabel+'|'+m.userData.atlasSide+'|'+m.userData.atlasCategory))===s.id;
  m.material.emissive.setHex(active?0x344d69:0x000000);
  m.material.emissiveIntensity=active ? 0.55 : 0;
 });
 const side={left:'Izquierda',right:'Derecha',median:'Medial / no lateralizada'}[s.side]||s.side;
 const category=categoryNames[s.category]||s.category;
 const ta2Path=s.ta2.filter(x=>!['Bonus collection','Brain','Central nervous system','Head','Main divisions','Nervous system','Regions of human body','Scene Collection'].includes(x)).slice(-5).join(' › ');
 const fact=findStructureFact(s.label);
 const factHtml=fact ? '<div class="panel-divider"></div><p class="eyebrow">FICHA ANATÓMICA CURADA</p><h3>'+escapeHtml(fact.title)+'</h3>'+[['Ubicación',fact.location],['Límites y organización',fact.boundaries],['Brodmann',fact.brodmann],['Conectividad',fact.connections],['Funciones neurocognitivas',fact.functions],['Correlatos clínicos',fact.clinical],['Alcance de esta ficha',fact.limitation]].map(([title,value])=>'<section class="fact-section"><h4>'+title+'</h4><p class="muted">'+escapeHtml(value)+'</p></section>').join('')+'<section class="fact-section"><h4>Bibliografía y recursos</h4><ul class="fact-references">'+fact.references.map(ref=>'<li><a href="'+escapeHtml(ref.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(ref.label)+' ↗</a></li>').join('')+'</ul></section>' : '<div class="panel-divider"></div><p class="eyebrow">IDENTIFICACIÓN ANATÓMICA</p><p class="muted">Estructura individual del atlas, vinculada a su malla 3D y metadatos de origen. La ficha científica específica se incorporará cuando se haya verificado la correspondencia anatómica.</p>';
 info.innerHTML='<div class="region-kicker">'+category.toUpperCase()+'</div><h2>'+escapeHtml(s.label)+'</h2><p class="muted">'+escapeHtml(s.region)+' · '+side+'</p><div class="panel-divider"></div><p class="eyebrow">JERARQUÍA ANATÓMICA TA2</p><p class="muted">'+escapeHtml(ta2Path||s.region)+'</p>'+factHtml+'<div class="anatomy-note"><strong>Procedencia del modelo</strong><p>'+escapeHtml(s.source)+'. La resolución y el grado de detalle dependen de la categoría anatómica; consultar las limitaciones del modelo.</p></div>';
 buttons.forEach(b=>b.classList.toggle('selected',normalise(b.dataset.region)===normalise(s.category)||normalise(b.dataset.region)===normalise(s.region)));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderSearch(query){
 if(!searchResults)return;
 const q=normalise(query);
 const all=[...structures.values()];
 const matches=(q?all.filter(s=>normalise(s.label+' '+s.region+' '+s.category+' '+s.side+' '+s.ta2.join(' ')).includes(q)):all)
  .sort((a,b)=>a.label.localeCompare(b.label,'es')).slice(0,30);
 searchResults.innerHTML='';
 if(!matches.length){searchResults.innerHTML='<div class="search-empty">No se encontraron coincidencias.</div>';return;}
 matches.forEach(s=>{
  const b=document.createElement('button');b.className='search-result';b.type='button';
  b.innerHTML='<span>'+escapeHtml(s.label)+'</span><small>'+escapeHtml(s.side==='left'?'IZQ':s.side==='right'?'DER':'MED')+'</small>';
  b.addEventListener('click',()=>{controls.autoRotate=false;selectStructure(s);});
  searchResults.appendChild(b);
 });
}

function renderNetworkExplorer(){
 const host=document.querySelector('#network-list');
 const detail=document.querySelector('#network-detail');
 if(!host||!detail)return;
 host.innerHTML='';
 networks.forEach((network,index)=>{
  const button=document.createElement('button');
  button.type='button';button.className='network-choice'+(index===0?' active':'');button.dataset.networkId=network.id;
  button.innerHTML='<strong>'+escapeHtml(network.name)+'</strong><small>'+escapeHtml(network.tag)+'</small>';
  button.addEventListener('click',()=>showNetwork(network,button));
  host.appendChild(button);
 });
 showNetwork(networks[0],host.querySelector('button'));
 function showNetwork(network,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const refs=network.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  const nodes=network.nodes.map(node=>'<button type="button" class="network-node" data-node="'+escapeHtml(node)+'">'+escapeHtml(node)+'</button>').join('');
  detail.innerHTML='<p class="network-tag">'+escapeHtml(network.tag)+'</p><h4>'+escapeHtml(network.name)+'</h4><p class="muted">'+escapeHtml(network.summary)+'</p><section class="network-section"><h5>Recorrido esquemático</h5><p class="muted">'+escapeHtml(network.route)+'</p></section><section class="network-section"><h5>Estructuras relacionadas</h5><div class="network-nodes">'+nodes+'</div></section><section class="network-section"><h5>Funciones</h5><p class="muted">'+escapeHtml(network.function)+'</p></section><section class="network-section"><h5>Correlatos clínicos</h5><p class="muted">'+escapeHtml(network.clinical)+'</p></section><section class="network-section"><h5>Alcance y límites</h5><p class="muted">'+escapeHtml(network.caveat)+'</p></section><section class="network-section"><h5>Bibliografía</h5><ul class="fact-references">'+refs+'</ul></section>';
  detail.querySelectorAll('[data-node]').forEach(nodeButton=>nodeButton.addEventListener('click',()=>{
   const term=nodeButton.dataset.node;
   searchInput.value=term;renderSearch(term);
   const found=[...structures.values()].find(s=>normalise(s.label+' '+s.region+' '+s.category+' '+s.ta2.join(' ')).includes(normalise(term)));
   if(found){controls.autoRotate=false;selectStructure(found);}
  }));
 }
}


function renderTractExplorer(){
 const host=document.querySelector('#tract-list'),detail=document.querySelector('#tract-detail');
 if(!host||!detail)return;
 host.innerHTML='';
 tracts.forEach((tract,index)=>{
  const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');b.dataset.tractId=tract.id;
  b.innerHTML='<strong>'+escapeHtml(tract.name)+'</strong><small>'+escapeHtml(tract.type)+'</small>';
  b.addEventListener('click',()=>show(tract,b));host.appendChild(b);
 });
 function show(tract,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const refs=tract.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  detail.innerHTML='<p class="network-tag">'+escapeHtml(tract.type)+'</p><h4>'+escapeHtml(tract.name)+'</h4>'+[['Origen',tract.origin],['Trayecto anatómico',tract.course],['Terminaciones y conexiones',tract.termination],['Funciones asociadas',tract.function],['Relevancia clínica',tract.clinical],['Evaluación por neuroimagen',tract.imaging],['Límites de interpretación',tract.caveat]].map(([h,p])=>'<section class="network-section"><h5>'+h+'</h5><p class="muted">'+escapeHtml(p)+'</p></section>').join('')+'<section class="network-section"><h5>Bibliografía</h5><ul class="fact-references">'+refs+'</ul></section>';
 }
 show(tracts[0],host.querySelector('button'));
}

function renderNeuroimagingExplorer(){
 const host=document.querySelector('#modality-list'),detail=document.querySelector('#modality-detail');
 if(!host||!detail)return;
 host.innerHTML='';
 modalities.forEach((modality,index)=>{
  const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');
  b.innerHTML='<strong>'+escapeHtml(modality.name)+'</strong><small>'+escapeHtml(modality.group)+' · '+escapeHtml(modality.tag)+'</small>';
  b.addEventListener('click',()=>show(modality,b));host.appendChild(b);
 });
 function show(modality,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const refs=modality.links.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  detail.innerHTML='<p class="network-tag">'+escapeHtml(modality.group)+' · '+escapeHtml(modality.tag)+'</p><h4>'+escapeHtml(modality.name)+'</h4>'+[['Qué mide',modality.measures],['Principio de adquisición',modality.principle],['Aplicaciones',modality.uses],['Lectura clínica contextual',modality.clinical],['Límites y precauciones',modality.limits]].map(([h,p])=>'<section class="network-section"><h5>'+h+'</h5><p class="muted">'+escapeHtml(p)+'</p></section>').join('')+'<section class="network-section"><h5>Bibliografía y recursos</h5><ul class="fact-references">'+refs+'</ul></section>';
 }
 show(modalities[0],host.querySelector('button'));
}

function renderClinicalCaseExplorer(){
 const host=document.querySelector('#clinical-case-list'),detail=document.querySelector('#clinical-case-detail');
 if(!host||!detail)return;
 host.innerHTML='';
 clinicalCases.forEach((clinicalCase,index)=>{
  const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');
  b.innerHTML='<strong>'+escapeHtml(clinicalCase.name)+'</strong><small>'+escapeHtml(clinicalCase.domain)+'</small>';
  b.addEventListener('click',()=>show(clinicalCase,b));host.appendChild(b);
 });
 function show(clinicalCase,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const links=clinicalCaseLinks[clinicalCase.id]||{structures:[]};
  const refs=clinicalCase.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  const targets=links.structures.map((target,index)=>'<button type="button" class="clinical-target" data-target-index="'+index+'">'+escapeHtml(target.label)+'</button>').join('');
  detail.innerHTML='<p class="network-tag">'+escapeHtml(clinicalCase.domain)+'</p><h4>'+escapeHtml(clinicalCase.name)+'</h4><section class="network-section clinical-actions"><h5>Explorar en el atlas 3D</h5><p class="muted">Seleccioná una estructura para intentar localizar su malla en el atlas. La disponibilidad depende de las estructuras identificadas en el modelo.</p><div class="clinical-targets">'+targets+'</div><p class="clinical-focus-status muted" aria-live="polite">Las asociaciones son orientativas y no representan una lesión individual.</p></section>'+[['Pregunta clínica',clinicalCase.question],['Modalidades relevantes',clinicalCase.modalities],['Hallazgos de imagen posibles',clinicalCase.findings],['Anatomía y redes implicadas',clinicalCase.network],['Perfil cognitivo a explorar',clinicalCase.cognition],['Integración e interpretación',clinicalCase.interpretation],['Límites y precauciones',clinicalCase.caveat]].map(([h,p])=>'<section class="network-section"><h5>'+h+'</h5><p class="muted">'+escapeHtml(p)+'</p></section>').join('')+'<section class="network-section"><h5>Guías y bibliografía</h5><ul class="fact-references">'+refs+'</ul></section>';
  detail.querySelectorAll('[data-target-index]').forEach(targetButton=>targetButton.addEventListener('click',()=>{
   const target=links.structures[Number(targetButton.dataset.targetIndex)];
   const aliases=target.aliases.map(normalise);
   const found=[...structures.values()].find(item=>{
    const label=normalise(item.label),region=normalise(item.region),ta2=normalise(item.ta2.join(' '));
    return aliases.some(alias=>label.includes(alias)||region.includes(alias)||ta2.includes(alias));
   });
   const status=detail.querySelector('.clinical-focus-status');
   if(found){
    controls.autoRotate=false;selectStructure(found);searchInput.value=found.label;renderSearch(found.label);
    status.textContent='Atlas: se localizó "'+found.label+'". La selección muestra la malla disponible; no implica lesión ni diagnóstico.';
   }else{
    status.textContent='No se encontró una malla identificable para "'+target.label+'" en esta versión del atlas. La estructura se mantiene como referencia anatómica del escenario.';
   }
  }));
  const networkButton=links.networkId&&document.querySelector('[data-network-id="'+links.networkId+'"]');
  const tractButton=links.tractId&&document.querySelector('[data-tract-id="'+links.tractId+'"]');
  if(networkButton||tractButton){
   const nav=document.createElement('div');nav.className='clinical-related-links';
   if(networkButton){const b=document.createElement('button');b.type='button';b.className='clinical-related-button';b.textContent='Abrir red: '+networkButton.querySelector('strong').textContent;b.addEventListener('click',()=>networkButton.click());nav.appendChild(b);}
   if(tractButton){const b=document.createElement('button');b.type='button';b.className='clinical-related-button';b.textContent='Abrir tracto: '+tractButton.querySelector('strong').textContent;b.addEventListener('click',()=>tractButton.click());nav.appendChild(b);}
   detail.querySelector('.clinical-actions').appendChild(nav);
  }
 }
 show(clinicalCases[0],host.querySelector('button'));
}


function renderCorrelationExplorer(){
 const host=document.querySelector('#correlation-list'),detail=document.querySelector('#correlation-detail');
 if(!host||!detail)return;
 host.innerHTML='';
 correlations.forEach((item,index)=>{
  const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');
  b.innerHTML='<strong>'+escapeHtml(item.name)+'</strong><small>'+escapeHtml(item.domain)+'</small>';
  b.addEventListener('click',()=>show(item,b));host.appendChild(b);
 });
 function show(item,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const aliases=item.aliases.map(normalise);
  const found=[...structures.values()].find(s=>{
   const haystack=normalise(s.label+' '+s.region+' '+s.ta2.join(' '));
   return aliases.some(alias=>haystack.includes(alias));
  });
  const atlasAction=found
   ? '<button type="button" class="clinical-related-button" id="correlation-focus">Localizar en el atlas 3D: '+escapeHtml(found.label)+'</button>'
   : '<p class="muted correlation-note">Esta estructura no tiene una malla coincidente verificada en el atlas actual. La ficha se presenta como referencia científica y no se inventa una localización.</p>';
  const refs=item.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  detail.innerHTML='<p class="network-tag">'+escapeHtml(item.domain)+'</p><h4>'+escapeHtml(item.name)+'</h4><div class="clinical-actions">'+atlasAction+'</div>'+[['Funciones neurocognitivas',item.functions],['Manifestaciones clínicas posibles',item.signs],['Evaluación neuropsicológica',item.tests],['Neuroimagen pertinente',item.imaging],['Contextos clínicos',item.clinical],['Límites de interpretación',item.caveat]].map(([heading,value])=>'<section class="network-section"><h5>'+heading+'</h5><p class="muted">'+escapeHtml(value)+'</p></section>').join('')+'<section class="network-section"><h5>Fuentes y lecturas</h5><ul class="fact-references">'+refs+'</ul></section><p class="correlation-note muted">Las pruebas nombradas son ejemplos de instrumentos y dominios de evaluación. La selección, administración, corrección e interpretación requieren formación profesional, normas apropiadas y consideración de licencias. No se incluyen baremos ni puntos de corte.</p>';
  const focus=detail.querySelector('#correlation-focus');
  if(focus)focus.addEventListener('click',()=>{
   controls.autoRotate=false;selectStructure(found);searchInput.value=found.label;renderSearch(found.label);
   detail.querySelector('.correlation-note')?.scrollIntoView?.({block:'nearest'});
  });
 }
 show(correlations[0],host.querySelector('button'));
}


function renderAssessmentExplorer(){
 const host=document.querySelector('#assessment-list'),detail=document.querySelector('#assessment-detail'),search=document.querySelector('#assessment-search');
 if(!host||!detail)return;
 function renderList(query=''){
  const q=normalise(query);
  const filtered=neuropsychTests.filter(test=>normalise(test.name+' '+test.domain+' '+test.construct+' '+test.use).includes(q));
  host.innerHTML='';
  filtered.forEach((test,index)=>{
   const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');
   b.innerHTML='<strong>'+escapeHtml(test.name)+'</strong><small>'+escapeHtml(test.domain)+'</small>';
   b.addEventListener('click',()=>show(test,b));host.appendChild(b);
  });
  if(!filtered.length){detail.innerHTML='<p class="muted">No se encontraron instrumentos para esa búsqueda.</p>';return;}
  show(filtered[0],host.querySelector('button'));
 }
 function show(test,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const refs=test.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  detail.innerHTML='<p class="network-tag">'+escapeHtml(test.domain)+'</p><h4>'+escapeHtml(test.name)+'</h4>'+[['Constructos evaluados',test.construct],['Uso clínico',test.use],['Interpretación',test.interpretation],['Normas y adaptación',test.norms],['Tiempo orientativo',test.time],['Derechos y materiales',test.license]].map(([heading,value])=>'<section class="network-section"><h5>'+heading+'</h5><p class="muted">'+escapeHtml(value)+'</p></section>').join('')+'<section class="network-section"><h5>Fuentes y recursos</h5><ul class="fact-references">'+refs+'</ul></section>';
 }
 renderList('');
 search?.addEventListener('input',()=>renderList(search.value));
}


function renderResearchProjects(){
 const host=document.querySelector('#research-project-manager');if(!host)return;
 const key='neuroscience3d.researchProjects.v1';
 const seed={id:'semantic-fluency-alzheimer',title:researchLab.title||'Fluencia verbal semántica y enfermedad de Alzheimer',area:'Neuropsicología · Demencias',question:researchLab.question||'¿Qué diferencias en la organización léxico-semántica distinguen a controles, DCL y enfermedad de Alzheimer?',status:'En desarrollo',protocol:{},variables:[]};
 let projects=[seed],activeId=seed.id;
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(saved?.projects))projects=saved.projects;if(!projects.some(p=>p.id===seed.id))projects.unshift(seed);activeId=saved?.activeId||seed.id;}catch(error){}
 if(!projects.some(p=>p.id===activeId))activeId=seed.id;
 projects=projects.map(p=>({...p,protocol:p.protocol&&typeof p.protocol==='object'?p.protocol:{},variables:Array.isArray(p.variables)?p.variables:[]}));
 const list=host.querySelector('#research-project-list'),detail=host.querySelector('#research-project-detail'),form=host.querySelector('#research-project-form'),status=host.querySelector('#research-project-status');
 const fields=[['design','Diseño del estudio','Ej.: observacional, transversal, casos y controles'],['sample','Población y muestra','Población objetivo, tamaño previsto y estrategia de muestreo'],['criteria','Criterios de inclusión y exclusión','Definí criterios antes de analizar los datos'],['variables','Variables y definiciones operacionales','Variable primaria, secundarias, predictoras y covariables'],['procedure','Procedimiento e instrumentos','Tareas, instrumentos, duración y condiciones de administración'],['analysis','Plan de análisis','Descriptivos, contrastes, modelos, ajuste por multiplicidad y validación'],['ethics','Ética y gestión de datos','Aprobación, consentimiento, anonimización, acceso y conservación'],['references','Bibliografía y fuentes','DOI, PMID, guías y referencias verificables']];
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify({projects,activeId}));return true;}catch(error){status.textContent='No se pudo guardar: almacenamiento local lleno o bloqueado.';return false;}};
 const safeFileName=value=>String(value||'proyecto').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'proyecto';
 function downloadProject(p){
  const payload={format:'neuroscience3d-project',version:1,exportedAt:new Date().toISOString(),project:p};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=safeFileName(p.title)+'.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  status.textContent='Copia JSON exportada. Guardala en un lugar seguro.';
 }
 function render(){
  list.innerHTML=projects.map(p=>'<button type="button" class="research-project-card'+(p.id===activeId?' active':'')+'" data-project-id="'+escapeHtml(p.id)+'"><span class="research-project-card-top"><strong>'+escapeHtml(p.title)+'</strong><small>'+escapeHtml(p.status)+'</small></span><span class="research-project-area">'+escapeHtml(p.area)+'</span></button>').join('');
  list.querySelectorAll('[data-project-id]').forEach(b=>b.addEventListener('click',()=>{activeId=b.dataset.projectId;persist();render();}));
  const p=projects.find(x=>x.id===activeId)||seed,protocol=p.protocol||{},variables=p.variables||[];
  const inputs=fields.map(([name,label,placeholder])=>'<label class="research-protocol-field"><span>'+escapeHtml(label)+'</span><textarea name="'+name+'" rows="3" maxlength="5000" placeholder="'+escapeHtml(placeholder)+'">'+escapeHtml(protocol[name]||'')+'</textarea></label>').join('');
  const variableRows=variables.map((v,i)=>'<div class="research-variable-row"><div><strong>'+escapeHtml(v.name)+'</strong><small>'+escapeHtml(v.role)+' · '+escapeHtml(v.type)+'</small><p>'+escapeHtml(v.definition)+'</p><small>'+escapeHtml([v.unit,v.values].filter(Boolean).join(' · '))+'</small></div><button type="button" class="research-variable-delete" data-variable-delete="'+i+'" aria-label="Eliminar variable">Eliminar</button></div>').join('');
  detail.innerHTML='<p class="network-tag">PROYECTO ACTIVO · PROTOCOLO Y VARIABLES</p><h4>'+escapeHtml(p.title)+'</h4><p class="muted">'+escapeHtml(p.area)+'</p><section class="network-section"><h5>Pregunta de investigación</h5><p class="muted">'+escapeHtml(p.question||'Pendiente de definir.')+'</p></section><div class="research-project-actions"><button type="button" class="research-project-submit" id="research-export-project">Exportar proyecto JSON</button><label class="research-project-submit research-import-label">Importar proyecto JSON<input id="research-import-project" type="file" accept=".json,application/json" hidden></label></div><form id="research-protocol-form" class="research-protocol-form"><h5>Protocolo científico del proyecto</h5>'+inputs+'<button type="submit" class="research-project-submit">Guardar protocolo</button></form><section class="research-variable-dictionary"><h5>Diccionario de variables</h5><p class="muted">Definí cada variable antes de importar datos: rol analítico, tipo, definición operacional y codificación.</p><div class="research-variable-list">'+(variableRows||'<p class="research-project-footnote">Todavía no hay variables definidas en este proyecto.</p>')+'</div><form id="research-variable-form" class="research-variable-form"><label>Nombre / código<input name="name" maxlength="60" required placeholder="Ej.: mean_log_frequency"></label><label>Rol<select name="role"><option>Desenlace primario</option><option>Desenlace secundario</option><option>Predictora</option><option>Covariable</option><option>Descriptiva</option><option>Identificador</option></select></label><label>Tipo de dato<select name="type"><option>Numérica continua</option><option>Numérica discreta</option><option>Categórica nominal</option><option>Categórica ordinal</option><option>Fecha / tiempo</option><option>Texto</option></select></label><label>Definición operacional<textarea name="definition" rows="2" maxlength="700" required placeholder="Cómo se obtiene, calcula o codifica"></textarea></label><label>Unidad<input name="unit" maxlength="40" placeholder="Ej.: palabras, segundos, años"></label><label>Valores / códigos permitidos<input name="values" maxlength="180" placeholder="Ej.: 0=control; 1=DCL; 2=EA"></label><button type="submit" class="research-project-submit">＋ Agregar variable</button></form></section><p class="research-project-footnote">El protocolo y el diccionario se guardan por proyecto en este navegador. La exportación JSON permite respaldarlos o trasladarlos. No incluye bases de participantes. No guardes información identificable ni datos clínicos sensibles aquí.</p>';
  detail.querySelector('#research-export-project').addEventListener('click',()=>downloadProject(p));
  const csvSection=document.createElement('section');csvSection.className='research-variable-dictionary';
  csvSection.innerHTML='<h5>Importación y validación de datos · proyecto activo</h5><p class="muted">Seleccioná un CSV anonimizado y asociá sus columnas con el diccionario de este proyecto. El archivo se procesa en memoria en esta sesión; no se guarda ni se transmite.</p><label class="research-csv-project-upload">Seleccionar CSV<input id="research-project-csv" type="file" accept=".csv,text/csv"></label><div id="research-project-csv-map"></div><div id="research-project-csv-report" aria-live="polite"></div>';
  detail.querySelector('.research-variable-dictionary').after(csvSection);
  const projectCsv=csvSection.querySelector('#research-project-csv'),mapHost=csvSection.querySelector('#research-project-csv-map'),report=csvSection.querySelector('#research-project-csv-report');
  projectCsv.addEventListener('change',async event=>{
   const file=event.currentTarget.files?.[0];if(!file)return;mapHost.innerHTML='';report.innerHTML='';
   try{
    if(file.size>10*1024*1024)throw new Error('El archivo supera 10 MB.');
    const raw=parseCSV(await file.text());if(!raw.length)throw new Error('El CSV no contiene filas de datos.');
    const headers=Object.keys(raw[0]);if(!headers.length)throw new Error('No se detectaron encabezados.');
    if(!variables.length)throw new Error('Primero definí las variables del proyecto en el diccionario.');
    const options='<option value="">— Sin asociar —</option>'+headers.map(h=>'<option value="'+escapeHtml(h)+'">'+escapeHtml(h)+'</option>').join('');
    mapHost.innerHTML='<p class="muted">'+raw.length+' filas · '+headers.length+' columnas detectadas. Asociá las columnas y ejecutá la validación.</p><form id="research-project-map-form" class="research-variable-form">'+variables.map((v,i)=>'<label>'+escapeHtml(v.name)+' · '+escapeHtml(v.role)+'<select name="map-'+i+'">'+options+'</select></label>').join('')+'<button type="submit" class="research-project-submit">Validar estructura y calidad</button></form>';
    mapHost.querySelector('form').addEventListener('submit',submitEvent=>{
     submitEvent.preventDefault();const data=new FormData(submitEvent.currentTarget),mapping={};
     variables.forEach((v,i)=>{const h=String(data.get('map-'+i)||'');if(h)mapping[v.name]=h;});
     const mapped=Object.entries(mapping);if(!mapped.length){report.innerHTML='<p class="sim-caveat">Asociá al menos una columna antes de validar.</p>';return;}
     const validation=validateMappedRows(raw,variables,mapping);
     const perVariable=validation.perVariable;
     const completeness=Object.entries(perVariable).map(([name,v])=>'<tr><td>'+escapeHtml(name)+'</td><td>'+escapeHtml(v.header)+'</td><td>'+v.complete+'/'+raw.length+'</td><td>'+v.missing+'</td><td>'+v.invalidType+'</td><td>'+v.invalidAllowed+'</td></tr>').join('');
     const duplicateIdText=validation.hasIdentifier?validation.duplicateIds.length+' identificadores duplicados detectados.':'No se asoció una variable identificadora; no se pueden detectar duplicados de participantes.';
     const invalidDetails=Object.entries(perVariable).flatMap(([name,v])=>v.invalidSamples.map(x=>'<li>'+escapeHtml(name)+' · fila '+x.row+' · «'+escapeHtml(x.value)+'»: '+escapeHtml(x.reason)+'</li>'));
     const mappedRows=raw.slice(0,5).map(row=>'<tr>'+mapped.map(([name,header])=>'<td>'+escapeHtml(String(row[header]??''))+'</td>').join('')+'</tr>').join('');
     const quantitative=v=>['Numérica continua','Numérica discreta'].includes(v.type);
     const categorical=v=>['Categórica nominal','Categórica ordinal'].includes(v.type);
     const analysisVars=variables.filter(v=>mapping[v.name]&&(quantitative(v)||categorical(v)));
     const outcomeOptions=analysisVars.map(v=>'<option value="'+escapeHtml(v.name)+'">'+escapeHtml(v.name)+'</option>').join('');
     const groupVars=analysisVars.filter(categorical);
     const idVars=variables.filter(v=>mapping[v.name]&&(/identificador/i.test(v.role)||/^(id|participant_id|codigo|código)$/i.test(v.name)));
     const groupOptions='<option value="">Sin agrupación</option>'+groupVars.map(v=>'<option value="'+escapeHtml(v.name)+'">'+escapeHtml(v.name)+'</option>').join('');
     const idOptions='<option value="">Sin ID</option>'+idVars.map(v=>'<option value="'+escapeHtml(v.name)+'">'+escapeHtml(v.name)+'</option>').join('');
     report.innerHTML='<div class="research-csv-report"><h5>Informe de validación preliminar</h5><p class="muted">'+raw.length+' filas · '+mapped.length+' variables asociadas · '+validation.emptyCells+' celdas vacías · '+validation.invalidCells+' valores incompatibles con el diccionario · '+validation.duplicateRows+' filas repetidas en las variables asociadas.</p><div class="research-table-wrap"><table><thead><tr><th>Variable</th><th>Columna CSV</th><th>Completos</th><th>Vacíos</th><th>Tipo inválido</th><th>Código inválido</th></tr></thead><tbody>'+completeness+'</tbody></table></div><p class="sim-caveat">'+duplicateIdText+'</p>'+(invalidDetails.length?'<h5>Ejemplos de inconsistencias</h5><ul>'+invalidDetails.join('')+'</ul>':'<p class="muted">No se detectaron incompatibilidades de tipo ni de códigos permitidos en las variables asociadas.</p>')+'<h5>Vista previa · primeras cinco filas</h5><div class="research-table-wrap"><table><thead><tr>'+mapped.map(([name])=>'<th>'+escapeHtml(name)+'</th>').join('')+'</tr></thead><tbody>'+mappedRows+'</tbody></table></div><section class="network-section"><h5>Análisis descriptivo general</h5><p class="muted">Elegí un resultado y, si corresponde, una variable de agrupación. Los valores incompatibles detectados no se convierten ni se imputan.</p>'+(analysisVars.length?'<form id="research-descriptive-form" class="research-variable-form"><label>Variable de resultado<select name="outcome">'+outcomeOptions+'</select></label><label>Agrupar por<select name="group">'+groupOptions+'</select></label><label>Diseño<select name="design"><option value="cross-sectional">Transversal / corte único</option><option value="independent-groups">Grupos independientes</option><option value="paired">Pareado</option><option value="longitudinal">Longitudinal / medidas repetidas</option></select></label><label>Identificador de participante<select name="id">'+idOptions+'</select></label><button type="submit" class="research-project-submit">Calcular descriptivos</button></form><div id="research-descriptive-output" aria-live="polite"></div>':'<p class="sim-caveat">No hay variables cuantitativas o categóricas mapeadas aptas para estos descriptivos. Revisá el tipo declarado en el diccionario.</p>')+'</section><p class="sim-caveat">La validación es estructural. No corrige ni elimina datos, no imputa faltantes y no ejecuta pruebas inferenciales. Los resúmenes son descriptivos y no sustituyen la especificación del protocolo.</p></div>';
     const descriptiveForm=report.querySelector('#research-descriptive-form');
     if(descriptiveForm)descriptiveForm.addEventListener('submit',analysisEvent=>{
      analysisEvent.preventDefault();const cfg=new FormData(descriptiveForm),outcome=String(cfg.get('outcome')),group=String(cfg.get('group')||''),design=String(cfg.get('design')),id=String(cfg.get('id')||'');
      const variable=analysisVars.find(v=>v.name===outcome),type=quantitative(variable)?'continuous':'nominal';
      const analysisDictionary=variables.filter(v=>mapping[v.name]).map(v=>({name:v.name,type:quantitative(v)?(v.type==='Numérica discreta'?'discrete':'continuous'):(v.type==='Categórica ordinal'?'ordinal':categorical(v)?'nominal':'text')}));
      const plan=buildAnalysisPlan({variables:analysisDictionary,design,outcome,predictors:[],group:group||null,id:id||null});
      const output=report.querySelector('#research-descriptive-output');
      const selectedInvalid=[outcome,...(group?[group]:[])].filter(name=>perVariable[name]&&(perVariable[name].invalidType||perVariable[name].invalidAllowed));
      if(selectedInvalid.length){output.innerHTML='<p class="sim-caveat">No se calcularon descriptivos: hay valores incompatibles en '+selectedInvalid.map(escapeHtml).join(', ')+'. Revisá y resolvé las inconsistencias antes de analizar.</p>';return;}
      if(!plan.valid){output.innerHTML='<p class="sim-caveat">'+plan.errors.map(escapeHtml).join('<br>')+'</p>';return;}
      const values=raw.map(row=>{const value=String(row[mapping[outcome]]??'').trim();if(!value)return null;if(quantitative(variable)){const n=Number(value.replace(',','.'));return Number.isFinite(n)?n:null;}return value;});
      const summary=type==='continuous'?summarizeNumeric(values):summarizeCategorical(values);
      const fmt=x=>x===null||x===undefined?'—':Number(x).toFixed(3);
      let html='<h5>Resultado: '+escapeHtml(outcome)+'</h5><p class="muted">n válido: '+summary.n+' · faltantes/no válidos: '+summary.missing+'</p>';
      if(type==='continuous')html+='<div class="research-table-wrap"><table><tbody>'+[['Media',fmt(summary.mean)],['Desviación estándar',fmt(summary.sd)],['Mediana',fmt(summary.median)],['Q1',fmt(summary.q1)],['Q3',fmt(summary.q3)],['RIQ',fmt(summary.iqr)],['Mínimo',fmt(summary.min)],['Máximo',fmt(summary.max)]].map(([k,v])=>'<tr><th>'+k+'</th><td>'+v+'</td></tr>').join('')+'</tbody></table></div>';
      else html+='<div class="research-table-wrap"><table><thead><tr><th>Categoría</th><th>n</th><th>Proporción</th></tr></thead><tbody>'+summary.levels.map(x=>'<tr><td>'+escapeHtml(x.level)+'</td><td>'+x.count+'</td><td>'+fmt(x.proportion)+'</td></tr>').join('')+'</tbody></table></div>';
      if(group){const groupValues=raw.map(row=>String(row[mapping[group]]??'').trim()||null),rows=raw.map((row,i)=>({[group]:groupValues[i],[outcome]:values[i]})).filter(row=>row[group]!==null),byGroup=summarizeByGroup(rows,group,outcome,type);html+='<h5>Descriptivos por grupo: '+escapeHtml(group)+'</h5><div class="research-table-wrap"><table><thead><tr><th>Grupo</th><th>Filas</th><th>n válido</th><th>Faltantes</th><th>Resumen</th></tr></thead><tbody>'+byGroup.map(x=>'<tr><td>'+escapeHtml(x.group)+'</td><td>'+x.nRows+'</td><td>'+x.summary.n+'</td><td>'+x.summary.missing+'</td><td>'+(type==='continuous'?'Media '+fmt(x.summary.mean)+' ± '+fmt(x.summary.sd)+'; mediana '+fmt(x.summary.median)+'; RIQ '+fmt(x.summary.iqr):x.summary.levels.map(l=>escapeHtml(l.level)+': '+l.count+' ('+fmt(l.proportion)+')').join(' · '))+'</td></tr>').join('')+'</tbody></table></div>';}
      html+='<p class="sim-caveat">'+plan.warnings.map(escapeHtml).join(' ')+'</p>';output.innerHTML=html;
      if(design==='independent-groups'&&group&&type==='continuous'){
       const groupLevels=[...new Set(raw.map(row=>String(row[mapping[group]]??'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
       if(groupLevels.length===2){
        const choices=groupLevels.map(value=>'<option value="'+escapeHtml(value)+'">'+escapeHtml(value)+'</option>').join('');
        output.insertAdjacentHTML('beforeend','<section class="network-section"><h5>Contraste inferencial · dos grupos independientes</h5><p class="muted">Prueba t de Welch bilateral para un resultado cuantitativo. Seleccioná el orden de comparación; el efecto se expresa como Grupo B menos Grupo A.</p><form id="research-welch-form" class="research-variable-form"><label>Grupo A<select name="groupA">'+choices+'</select></label><label>Grupo B<select name="groupB">'+choices+'</select></label><button type="submit" class="research-project-submit">Ejecutar t de Welch</button></form><div id="research-welch-output" aria-live="polite"></div></section>');
        const welchForm=output.querySelector('#research-welch-form');
        const groupASelect=welchForm.querySelector('[name="groupA"]'),groupBSelect=welchForm.querySelector('[name="groupB"]');
        groupBSelect.selectedIndex=1;
        welchForm.addEventListener('submit',testEvent=>{
         testEvent.preventDefault();const a=groupASelect.value,b=groupBSelect.value,result=output.querySelector('#research-welch-output');
         if(a===b){result.innerHTML='<p class="sim-caveat">Elegí dos grupos diferentes.</p>';return;}
         const rows=raw.map(row=>{const rawValue=String(row[mapping[outcome]]??'').trim();const numeric=rawValue===''?null:Number(rawValue.replace(',','.'));return {[group]:String(row[mapping[group]]??'').trim(),[outcome]:Number.isFinite(numeric)?numeric:null};});
         const test=compareIndependentGroups(rows,{groupField:group,outcomeField:outcome,groupA:a,groupB:b});
         if(!test.valid){result.innerHTML='<p class="sim-caveat">'+escapeHtml(test.reason)+'</p>';return;}
         const number=x=>Number(x).toFixed(3),p=test.p<.001?'p &lt; .001':'p = '+number(test.p);
         result.innerHTML='<div class="research-table-wrap"><table><tbody>'+[['n Grupo A',test.n1],['n Grupo B',test.n2],['Media A ± DE',number(test.meanA)+' ± '+number(test.sdA)],['Media B ± DE',number(test.meanB)+' ± '+number(test.sdB)],['Diferencia de medias (B − A)',number(test.difference)],['IC 95% de la diferencia','['+number(test.ci95[0])+', '+number(test.ci95[1])+']'],['t de Welch',number(test.t)],['Grados de libertad',number(test.df)],['Valor p bilateral',p],['g de Hedges',test.hedgesG===null?'No estimable':number(test.hedgesG)],['IC 95% aproximado de g',test.hedgesGCi95?'['+number(test.hedgesGCi95[0])+', '+number(test.hedgesGCi95[1])+']':'No estimable'],['Faltantes/no válidos excluidos',test.excludedMissingOrInvalid]].map(([label,value])=>'<tr><th>'+label+'</th><td>'+value+'</td></tr>').join('')+'</tbody></table></div><p class="sim-caveat">Welch no asume varianzas iguales. La inferencia requiere independencia entre participantes, muestreo/diseño adecuados y revisión de valores extremos y distribución. El IC de g es aproximado; no se ajustaron covariables ni multiplicidad. No utilizar este contraste con medidas repetidas, datos pareados o conglomerados.</p>';
        });
       }else if(groupLevels.length>2){
        const rows=raw.map(row=>{const rawValue=String(row[mapping[outcome]]??'').trim();const numeric=rawValue===''?null:Number(rawValue.replace(',','.'));return {[group]:String(row[mapping[group]]??'').trim(),[outcome]:Number.isFinite(numeric)?numeric:null};});
        const result=compareIndependentMultipleGroups(rows,{groupField:group,outcomeField:outcome});
        if(!result.valid){output.insertAdjacentHTML('beforeend','<p class="sim-caveat">'+escapeHtml(result.reason)+'</p>');}
        else{
         const number=x=>Number(x).toFixed(3),pLabel=x=>x<.001?'p &lt; .001':'p = '+number(x);
         const groupRows=result.groups.map(g=>'<tr><td>'+escapeHtml(g.label)+'</td><td>'+g.n+'</td><td>'+number(g.mean)+'</td><td>'+number(Math.sqrt(g.variance))+'</td></tr>').join('');
         const pairRows=result.pairwise.map(x=>'<tr><td>'+escapeHtml(x.groupA)+' vs. '+escapeHtml(x.groupB)+'</td><td>'+number(x.difference)+'</td><td>['+number(x.ci95[0])+', '+number(x.ci95[1])+']</td><td>'+pLabel(x.p)+'</td><td>'+pLabel(x.pHolm)+'</td></tr>').join('');
         output.insertAdjacentHTML('beforeend','<section class="network-section"><h5>Contraste inferencial · más de dos grupos</h5><p class="muted">ANOVA de Welch para comparar medias sin asumir igualdad de varianzas. Comparaciones posteriores: pruebas t de Welch bilaterales con ajuste de Holm.</p><div class="research-table-wrap"><table><thead><tr><th>Grupo</th><th>n</th><th>Media</th><th>DE</th></tr></thead><tbody>'+groupRows+'</tbody></table></div><div class="research-table-wrap"><table><tbody>'+[['F de Welch',number(result.statistic)],['gl entre grupos',number(result.df1)],['gl aproximados dentro de grupos',number(result.df2)],['p global',pLabel(result.p)],['Observaciones faltantes/no válidas',result.excludedMissingOrInvalid]].map(([label,value])=>'<tr><th>'+label+'</th><td>'+value+'</td></tr>').join('')+'</tbody></table></div><h5>Comparaciones por pares · ajuste de Holm</h5><div class="research-table-wrap"><table><thead><tr><th>Comparación</th><th>Diferencia B − A</th><th>IC 95% sin ajuste</th><th>p sin ajustar</th><th>p ajustado Holm</th></tr></thead><tbody>'+pairRows+'</tbody></table></div><p class="sim-caveat">El valor p global corresponde a ANOVA de Welch. Los valores p por pares se ajustan con Holm para controlar el error familiar; los intervalos de confianza por pares son nominales, no ajustados por multiplicidad. Requiere independencia entre participantes y revisión de distribución y valores extremos. No usar con medidas repetidas, diseños pareados ni datos agrupados. No ajusta covariables.</p></section>');
        }
       }
      }else if(design==='independent-groups'&&(type==='nominal'||type==='ordinal')&&group){
       const rows=raw.map(row=>({[group]:String(row[mapping[group]]??'').trim(),[outcome]:String(row[mapping[outcome]]??'').trim()||null}));
       const result=compareCategoricalGroups(rows,{groupField:group,outcomeField:outcome});
       if(!result.valid){output.insertAdjacentHTML('beforeend','<p class="sim-caveat">'+escapeHtml(result.reason)+(result.minimumExpected!==undefined?' Frecuencia esperada mínima: '+Number(result.minimumExpected).toFixed(2)+'.':'')+'</p>');}
       else{
        const number=x=>Number(x).toFixed(3),pLabel=x=>x<.001?'p &lt; .001':'p = '+number(x);
        const tableHtml='<div class="research-table-wrap"><table><thead><tr><th>Grupo / categoría</th>'+result.categories.map(c=>'<th>'+escapeHtml(c)+'</th>').join('')+'<th>Total</th></tr></thead><tbody>'+result.table.map((row,i)=>'<tr><th>'+escapeHtml(result.groups[i])+'</th>'+row.map(v=>'<td>'+v+'</td>').join('')+'<td>'+result.rowTotals[i]+'</td></tr>').join('')+'<tr><th>Total</th>'+result.colTotals.map(v=>'<td>'+v+'</td>').join('')+'<td>'+result.n+'</td></tr></tbody></table></div>';
        const stats=result.method==='Prueba exacta de Fisher bilateral'?[['Método',result.method],['Valor p bilateral',pLabel(result.p)],['Frecuencia esperada mínima',number(result.minimumExpected)]]:[['Método',result.method],['Chi-cuadrado de Pearson',number(result.statistic)],['Grados de libertad',result.df],['Valor p',pLabel(result.p)],['Frecuencia esperada mínima',number(result.minimumExpected)]];
        output.insertAdjacentHTML('beforeend','<section class="network-section"><h5>Asociación entre variables categóricas</h5><p class="muted">Tabla de contingencia; filas = grupos y columnas = categorías del resultado.</p>'+tableHtml+'<div class="research-table-wrap"><table><tbody>'+stats.map(([label,value])=>'<tr><th>'+label+'</th><td>'+value+'</td></tr>').join('')+'<tr><th>Observaciones válidas</th><td>'+result.n+'</td></tr><tr><th>Filas excluidas por datos faltantes</th><td>'+result.excluded+'</td></tr></tbody></table></div><p class="sim-caveat">Chi-cuadrado de Pearson se utiliza aquí solo si todas las frecuencias esperadas son ≥ 5. En tablas 2×2 con alguna frecuencia esperada menor que 5 se utiliza Fisher bilateral. Para tablas mayores con celdas esperadas pequeñas, el programa no fuerza una aproximación: se requiere un método exacto o Monte Carlo RxC. La prueba evalúa asociación, no causalidad; requiere observaciones independientes y categorías mutuamente excluyentes.</p></section>');
       }
      }else if(design==='paired'||design==='longitudinal'){output.insertAdjacentHTML('beforeend','<p class="sim-caveat">No se ejecutan pruebas para grupos independientes en diseños pareados o longitudinales. Se necesita un análisis específico que modele el emparejamiento o la dependencia intraindividual.</p>');}
     });

    });
   }catch(error){report.innerHTML='<p class="sim-caveat">'+escapeHtml(error.message)+'</p>';}
   event.currentTarget.value='';
  });

  detail.querySelector('#research-import-project').addEventListener('change',async event=>{
   const file=event.currentTarget.files?.[0];if(!file)return;
   try{if(file.size>2_000_000)throw new Error('El archivo supera 2 MB.');const parsed=JSON.parse(await file.text()),incoming=parsed?.format==='neuroscience3d-project'?parsed.project:parsed;
    if(!incoming||typeof incoming!=='object'||typeof incoming.title!=='string'||!incoming.title.trim())throw new Error('El JSON no contiene un proyecto válido.');
    const imported={id:'project-import-'+Date.now().toString(36),title:incoming.title.slice(0,120),area:String(incoming.area||'Área por definir').slice(0,100),question:String(incoming.question||'').slice(0,500),status:String(incoming.status||'Importado').slice(0,40),protocol:incoming.protocol&&typeof incoming.protocol==='object'?incoming.protocol:{},variables:Array.isArray(incoming.variables)?incoming.variables.filter(v=>v&&typeof v.name==='string').slice(0,200):[]};
    projects.push(imported);activeId=imported.id;persist();render();status.textContent='Proyecto importado como copia independiente.';
   }catch(error){status.textContent='No se pudo importar: '+error.message;}event.currentTarget.value='';
  });
  detail.querySelector('#research-protocol-form').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);p.protocol={};for(const [name] of fields)p.protocol[name]=String(data.get(name)||'').trim();persist();status.textContent='Protocolo guardado para «'+p.title+'».';});
  detail.querySelector('#research-variable-form').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget),name=String(data.get('name')||'').trim();if(variables.some(v=>normalise(v.name)===normalise(name))){status.textContent='Ya existe una variable con ese nombre en este proyecto.';return;}variables.push({name,role:String(data.get('role')),type:String(data.get('type')),definition:String(data.get('definition')||'').trim(),unit:String(data.get('unit')||'').trim(),values:String(data.get('values')||'').trim()});p.variables=variables;persist();render();status.textContent='Variable agregada al diccionario del proyecto.';});
  detail.querySelectorAll('[data-variable-delete]').forEach(button=>button.addEventListener('click',()=>{p.variables.splice(Number(button.dataset.variableDelete),1);persist();render();status.textContent='Variable eliminada del diccionario.';}));
  status.textContent=projects.length+' proyecto'+(projects.length===1?'':'s')+' · guardado local en este navegador.';
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(form),title=String(data.get('title')||'').trim(),area=String(data.get('area')||'').trim(),question=String(data.get('question')||'').trim();
  if(!title){status.textContent='Ingresá un título para crear el proyecto.';return;}
  const id='project-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
  projects.push({id,title,area:area||'Área por definir',question,status:'Idea / planificación',protocol:{},variables:[]});activeId=id;persist();form.reset();render();
 });
 render();
}

function renderResearchLab(){
 const detail=document.querySelector('#research-lab-detail');if(!detail)return;
 const list=(items)=>'<ul class="research-list">'+items.map(item=>'<li>'+escapeHtml(item)+'</li>').join('')+'</ul>';
 const refs=researchLab.references.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
 const objectives=list(researchLab.objectives);
 const groups=list(researchLab.groups);
 const variables=researchLab.variables.map(v=>'<article class="research-item"><strong>'+escapeHtml(v.name)+'</strong><small>'+escapeHtml(v.role)+'</small><p class="muted">'+escapeHtml(v.definition)+'</p></article>').join('');
 const pipeline=researchLab.pipeline.map(v=>'<article class="research-item"><strong>'+escapeHtml(v.step)+'</strong><p class="muted">'+escapeHtml(v.detail)+'</p></article>').join('');
 const analysis=researchLab.analysis.map(v=>'<article class="research-item"><strong>'+escapeHtml(v.name)+'</strong><p class="muted">'+escapeHtml(v.detail)+'</p></article>').join('');
 detail.innerHTML='<p class="network-tag">PROTOCOLO · MARCO REPRODUCIBLE</p><h4>'+escapeHtml(researchLab.title)+'</h4><p class="muted">'+escapeHtml(researchLab.subtitle)+'</p><section class="network-section"><h5>Pregunta de investigación</h5><p class="muted">'+escapeHtml(researchLab.question)+'</p></section><section class="network-section"><h5>Diseño</h5><p class="muted">'+escapeHtml(researchLab.design)+'</p></section><section class="network-section"><h5>Grupos de comparación</h5>'+groups+'</section><section class="network-section"><h5>Objetivos</h5>'+objectives+'</section><section class="network-section"><h5>Variables y definiciones operacionales</h5>'+variables+'</section><section class="network-section"><h5>Pipeline de análisis</h5>'+pipeline+'</section><section class="network-section"><h5>Estrategia estadística</h5>'+analysis+'</section><section class="network-section"><h5>Precauciones metodológicas y éticas</h5>'+list(researchLab.safeguards)+'</section><section class="network-section"><h5>Referencias iniciales</h5><ul class="fact-references">'+refs+'</ul></section><p class="correlation-note muted">Antes del análisis confirmatorio: cerrar protocolo, definir variable primaria, cálculo muestral, criterios de exclusión, manejo de datos faltantes y plan de validación. No se han cargado resultados empíricos.</p>';
}


function renderResearchDataTool(){
 const fileInput=document.querySelector('#research-csv-file'),status=document.querySelector('#research-data-status'),results=document.querySelector('#research-data-results');
 if(!fileInput||!status||!results)return;
 fileInput.addEventListener('change',()=>{
  const file=fileInput.files?.[0];if(!file)return;
  if(file.size>10*1024*1024){status.textContent='El archivo supera 10 MB. Exportá una versión más pequeña.';return;}
  const reader=new FileReader();
  status.textContent='Leyendo archivo local…';results.innerHTML='';
  reader.onload=()=>{
   try{
    const raw=parseCSV(String(reader.result||''));
    const normalized=normalizeResearchRows(raw);
    if(normalized.missing.length){status.textContent='No se encontró la columna obligatoria group/grupo. Revisá los encabezados.';return;}
    const rows=normalized.rows;
    if(!rows.length){status.textContent='No hay filas válidas con grupo asignado.';return;}
    const {groups,summaries}=summarizeResearch(rows);
    const nMissing=raw.length-rows.length;
    const columns=researchFields.filter(([key])=>normalized.mapping[key]);
    const tableHead='<tr><th>Grupo</th><th>n</th>'+columns.map(([,label])=>'<th>'+escapeHtml(label)+'</th>').join('')+'</tr>';
    const tableBody=summaries.map(g=>'<tr><td>'+escapeHtml(g.group)+'</td><td>'+g.n+'</td>'+columns.map(([key])=>{const v=g.values.find(x=>x.key===key);return '<td>'+ (v?.mean===null||v?.mean===undefined?'—':v.mean.toFixed(2)+(v.sd===null?'':' ± '+v.sd.toFixed(2))+'<small> n='+v.n+'</small>')+'</td>';}).join('')+'</tr>').join('');
    const metrics=columns.filter(([key])=>!['age','education'].includes(key));
    let aucHtml='';
    if(groups.length===2&&metrics.length){
     const [a,b]=groups;
     aucHtml='<h5>Discriminación exploratoria (AUC)</h5><p class="muted">Grupo de referencia: '+escapeHtml(a)+'; grupo positivo: '+escapeHtml(b)+'. AUC por rangos con IC 95% bootstrap percentil (2.000 remuestreos estratificados); no equivale a validación externa. Valores cercanos a 0,5 indican discriminación limitada; la orientación depende del orden de los grupos.</p><div class="research-table-wrap"><table><thead><tr><th>Variable</th><th>AUC</th><th>IC 95% AUC (bootstrap)</th><th>Hedges g</th><th>IC 95% aprox.</th><th>n '+escapeHtml(a)+'</th><th>n '+escapeHtml(b)+'</th></tr></thead><tbody>'+metrics.map(([key,label])=>{const x=bootstrapAuc(rows,key,a,b),effect=standardizedMeanDifference(rows,key,a,b);return '<tr><td>'+escapeHtml(label)+'</td><td>'+(x.auc===null?'—':x.auc.toFixed(3))+'</td><td>'+(x.ci?x.ci[0].toFixed(3)+' a '+x.ci[1].toFixed(3):'—')+'</td><td>'+(effect.g===null?'—':effect.g.toFixed(2))+'</td><td>'+(effect.ci?effect.ci[0].toFixed(2)+' a '+effect.ci[1].toFixed(2):'—')+'</td><td>'+x.nA+'</td><td>'+x.nB+'</td></tr>';}).join('')+'</tbody></table></div>';
    }else if(groups.length>2){aucHtml='<p class="muted">Hay más de dos grupos: el cálculo ROC/AUC se reserva para comparaciones binarias preespecificadas. No se seleccionan automáticamente pares favorables.</p>';}
    const corrPairs=[['total_words','age','Producción total × edad'],['total_words','education','Producción total × educación'],['mean_log_frequency','education','Frecuencia léxica × educación'],['mean_semantic_similarity','education','Similitud semántica × educación'],['first_latency','total_words','Latencia inicial × producción']];
    const corrResults=corrPairs.filter(([a,b])=>normalized.mapping[a]&&normalized.mapping[b]).map(([a,b,label])=>{const x=pearson(rows.map(r=>r[a]),rows.map(r=>r[b]));return '<tr><td>'+label+'</td><td>'+(x.r===null?'—':x.r.toFixed(3))+'</td><td>'+x.n+'</td></tr>';}).join('');
    const correlationHtml=corrResults?'<h5>Correlaciones exploratorias</h5><p class="muted">Pearson (r) y Spearman (ρ), sin ajuste por covariables; no implican causalidad.</p><div class="research-table-wrap"><table><thead><tr><th>Variables</th><th>Pearson r</th><th>Spearman ρ</th><th>n</th></tr></thead><tbody>'+corrPairs.filter(([a,b])=>normalized.mapping[a]&&normalized.mapping[b]).map(([a,b,label])=>{const x=pearson(rows.map(r=>r[a]),rows.map(r=>r[b])),sp=spearman(rows.map(r=>r[a]),rows.map(r=>r[b]));return '<tr><td>'+label+'</td><td>'+(x.r===null?'—':x.r.toFixed(3))+'</td><td>'+(sp.rho===null?'—':sp.rho.toFixed(3))+'</td><td>'+x.n+'</td></tr>';}).join('')+'</tbody></table></div>':'';
    const kwFields=metrics.filter(([key])=>!['age','education'].includes(key));
    const kwRows=groups.length>2?kwFields.map(([key,label])=>{const k=kruskalWallis(rows,key);return '<tr><td>'+escapeHtml(label)+'</td><td>'+(k.H===null?'—':k.H.toFixed(3))+'</td><td>'+(k.p===null?'—':k.p.toFixed(4))+'</td><td>'+(k.epsilonSquared===null?'—':k.epsilonSquared.toFixed(3))+'</td><td>'+k.N+'</td></tr>';}).join(''):'';
    const kwPosthoc=groups.length>2?kwFields.map(([key,label])=>{const k=kruskalWallis(rows,key);if(k.p===null||k.p>=.05)return '';const pairs=dunnPostHoc(rows,key);if(!pairs.length)return '';return '<h5>Dunn post hoc · '+escapeHtml(label)+'</h5><div class="research-table-wrap"><table><thead><tr><th>Comparación</th><th>z</th><th>p sin ajustar</th><th>p Holm</th><th>n A / n B</th></tr></thead><tbody>'+pairs.map(p=>'<tr><td>'+escapeHtml(p.groupA)+' vs. '+escapeHtml(p.groupB)+'</td><td>'+p.z.toFixed(3)+'</td><td>'+p.p.toFixed(4)+'</td><td><strong>'+p.pHolm.toFixed(4)+'</strong></td><td>'+p.nA+' / '+p.nB+'</td></tr>').join('')+'</tbody></table></div>';}).join(''):'';
    const kwHtml=kwRows?'<h5>Comparación exploratoria entre grupos (Kruskal–Wallis)</h5><p class="muted">Prueba omnibus no paramétrica; H, p aproximado por χ² y ε². Cuando el omnibus es significativo (p &lt; 0,05), se muestran comparaciones post hoc de Dunn con corrección de Holm. El umbral es orientativo: debe definirse antes del análisis.</p><div class="research-table-wrap"><table><thead><tr><th>Variable</th><th>H</th><th>p</th><th>ε²</th><th>N</th></tr></thead><tbody>'+kwRows+'</tbody></table></div>'+kwPosthoc:'';
    const mappingHtml=Object.entries(normalized.mapping).map(([k,v])=>escapeHtml(k)+' ← '+escapeHtml(v)).join(' · ');
    const validationNotes=[];
    const invalidCount=Object.values(normalized.invalidNumeric||{}).reduce((a,b)=>a+b,0);
    if(invalidCount)validationNotes.push(invalidCount+' valores no numéricos se trataron como datos faltantes.');
    if(normalized.duplicateIds?.length)validationNotes.push(normalized.duplicateIds.length+' identificadores repetidos; revisar si son errores o mediciones longitudinales.');
    if(!normalized.mapping.participant_id)validationNotes.push('No se identificó ID de participante: no es posible comprobar duplicados.');
    if(nMissing)validationNotes.push(nMissing+' filas sin grupo fueron excluidas.');
    const validationHtml=validationNotes.length?'<p class="sim-caveat"><strong>Control de calidad:</strong> '+validationNotes.map(escapeHtml).join(' ')+' Si hay visitas repetidas, no deben analizarse como observaciones independientes; se necesita un modelo longitudinal.</p>':'';
    results.innerHTML='<div class="research-result-block"><h5>Resumen descriptivo por grupo</h5><p class="muted">Media ± desviación estándar; el n de cada variable puede variar por datos faltantes.</p><div class="research-table-wrap"><table><thead>'+tableHead+'</thead><tbody>'+tableBody+'</tbody></table></div>'+aucHtml+kwHtml+correlationHtml+validationHtml+'<p class="sim-caveat">Lectura responsable: resultados exploratorios, no inferenciales. No se calculan p-valores ni tamaños de efecto ajustados por covariables; el IC de Hedges g es aproximado y el AUC no incluye IC. No se estiman puntos de corte clínicos. Para análisis confirmatorios se requiere plan estadístico, control de supuestos, corrección por multiplicidad y validación.</p></div>';
    status.textContent='Archivo procesado localmente: '+rows.length+' participantes en '+groups.length+' grupos; '+nMissing+' filas sin grupo excluidas. Mapeo: '+mappingHtml+'.';
   }catch(error){console.error(error);status.textContent='No se pudo procesar el CSV. Verificá delimitador, comillas y encabezados.';}
  };
  reader.onerror=()=>{status.textContent='Error al leer el archivo local.';};
  reader.readAsText(file);
 });
}


function renderMicroExplorer(){
 const host=document.querySelector('#micro-list'),detail=document.querySelector('#micro-detail');
 if(!host||!detail)return;
 host.innerHTML='';
 microTopics.forEach((topic,index)=>{
  const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');
  b.innerHTML='<strong>'+escapeHtml(topic.name)+'</strong><small>'+escapeHtml(topic.group)+'</small>';
  b.addEventListener('click',()=>show(topic,b));host.appendChild(b);
 });
 function show(topic,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const refs=topic.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  detail.innerHTML='<p class="network-tag">'+escapeHtml(topic.group)+'</p><h4>'+escapeHtml(topic.name)+'</h4><p class="muted">'+escapeHtml(topic.summary)+'</p>'+[['Organización y mecanismo',topic.details],['Relevancia clínica',topic.clinical],['Límites de interpretación',topic.caveat]].map(([heading,value])=>'<section class="network-section"><h5>'+heading+'</h5><p class="muted">'+escapeHtml(value)+'</p></section>').join('')+'<section class="network-section"><h5>Fuentes y lecturas</h5><ul class="fact-references">'+refs+'</ul></section>';
 }
 show(microTopics[0],host.querySelector('button'));
}


function renderCognitiveDomainExplorer(){
 const host=document.querySelector('#cognitive-domain-list'),detail=document.querySelector('#cognitive-domain-detail');
 if(!host||!detail)return;
 host.innerHTML='';
 cognitiveDomains.forEach((domain,index)=>{
  const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');
  b.innerHTML='<strong>'+escapeHtml(domain.name)+'</strong><small>'+escapeHtml(domain.network)+'</small>';
  b.addEventListener('click',()=>show(domain,b));host.appendChild(b);
 });
 function show(domain,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const tests=domain.tests.map(id=>neuropsychTests.find(t=>t.id===id)).filter(Boolean);
  const testLinks=tests.map(t=>'<button type="button" class="clinical-related-button" data-test-id="'+escapeHtml(t.id)+'">'+escapeHtml(t.name)+'</button>').join('');
  const correlationsList=domain.correlations.map(id=>correlations.find(c=>c.id===id)).filter(Boolean);
  const correlationLinks=correlationsList.map(c=>'<button type="button" class="clinical-related-button" data-correlation-id="'+escapeHtml(c.id)+'">'+escapeHtml(c.name)+'</button>').join('');
  const refs=domain.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  detail.innerHTML='<p class="network-tag">DOMINIO COGNITIVO</p><h4>'+escapeHtml(domain.name)+'</h4><p class="muted">'+escapeHtml(domain.definition)+'</p>'+[['Componentes a explorar',domain.components],['Estructuras implicadas',domain.structures.join(' · ')],['Redes funcionales',domain.network],['Manifestaciones y contextos clínicos',domain.clinical],['Consideraciones para la interpretación',domain.interpretation]].map(([heading,value])=>'<section class="network-section"><h5>'+heading+'</h5><p class="muted">'+escapeHtml(value)+'</p></section>').join('')+'<section class="network-section"><h5>Instrumentos relacionados</h5><div class="clinical-actions">'+(testLinks||'<p class="muted">Sin instrumentos vinculados en este catálogo.</p>')+'</div></section><section class="network-section"><h5>Correlaciones anatomoclínicas</h5><div class="clinical-actions">'+(correlationLinks||'<p class="muted">Sin fichas anatómicas vinculadas.</p>')+'</div></section><section class="network-section"><h5>Fuentes y lecturas</h5><ul class="fact-references">'+refs+'</ul></section><p class="correlation-note muted">El dominio no se localiza en una única región. Las tareas reclutan componentes parcialmente superpuestos y su desempeño está modulado por edad, educación, idioma, estado clínico y condiciones sensoriales/motoras.</p>';
  detail.querySelectorAll('[data-test-id]').forEach(b=>b.addEventListener('click',()=>{
   const test=neuropsychTests.find(t=>t.id===b.dataset.testId);const input=document.querySelector('#assessment-search');
   if(input){input.value=test?.name||'';input.dispatchEvent(new Event('input',{bubbles:true}));}
   document.querySelector('#assessment-detail')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }));
  detail.querySelectorAll('[data-correlation-id]').forEach(b=>b.addEventListener('click',()=>{
   const item=correlations.find(c=>c.id===b.dataset.correlationId);
   const target=[...document.querySelectorAll('#correlation-list button')].find(el=>el.textContent.includes(item?.name||''));
   target?.click();document.querySelector('#correlation-detail')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }));
 }
 show(cognitiveDomains[0],host.querySelector('button'));
}


function renderNeurochemistryExplorer(){
 const host=document.querySelector('#neurochemistry-list'),detail=document.querySelector('#neurochemistry-detail');
 if(!host||!detail)return;
 host.innerHTML='';
 neurochemicalSystems.forEach((system,index)=>{
  const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');
  b.innerHTML='<strong>'+escapeHtml(system.name)+'</strong><small>'+escapeHtml(system.family)+'</small>';
  b.addEventListener('click',()=>show(system,b));host.appendChild(b);
 });
 function show(system,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const refs=system.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  const sections=[['Síntesis y almacenamiento',system.synthesis],['Terminación de señal',system.termination],['Receptores',system.receptors],['Vías anatómicas',system.pathways],['Fisiología',system.physiology],['Correlatos clínicos',system.clinical],['Farmacología',system.pharmacology],['Límites y precauciones',system.caveat]];
  detail.innerHTML='<p class="network-tag">'+escapeHtml(system.family)+'</p><h4>'+escapeHtml(system.name)+'</h4><p class="muted"><strong>Mensajero / principio:</strong> '+escapeHtml(system.transmitter)+'</p>'+sections.map(([heading,value])=>'<section class="network-section"><h5>'+heading+'</h5><p class="muted">'+escapeHtml(value)+'</p></section>').join('')+'<section class="network-section"><h5>Fuentes y lecturas</h5><ul class="fact-references">'+refs+'</ul></section><p class="correlation-note muted">Contenido educativo. No constituye indicación terapéutica ni permite inferir diagnóstico o tratamiento individual. Los efectos farmacológicos dependen de molécula, dosis, vía, comorbilidades e interacciones.</p>';
 }
 show(neurochemicalSystems[0],host.querySelector('button'));
}


function renderNeurophysiologyExplorer(){
 const host=document.querySelector('#neurophysiology-list'),detail=document.querySelector('#neurophysiology-detail');
 if(!host||!detail)return;
 host.innerHTML='';
 physiologyTopics.forEach((topic,index)=>{
  const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');
  b.innerHTML='<strong>'+escapeHtml(topic.name)+'</strong><small>'+escapeHtml(topic.group)+'</small>';
  b.addEventListener('click',()=>show(topic,b));host.appendChild(b);
 });
 function show(topic,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const refs=topic.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  detail.innerHTML='<p class="network-tag">'+escapeHtml(topic.group)+'</p><h4>'+escapeHtml(topic.name)+'</h4><p class="muted">'+escapeHtml(topic.summary)+'</p>'+[['Mecanismo fisiológico',topic.mechanism],['Relevancia clínica',topic.clinical],['Límites de interpretación',topic.limit]].map(([heading,value])=>'<section class="network-section"><h5>'+heading+'</h5><p class="muted">'+escapeHtml(value)+'</p></section>').join('')+'<section class="network-section"><h5>Fuentes y lecturas</h5><ul class="fact-references">'+refs+'</ul></section>';
 }
 show(physiologyTopics[0],host.querySelector('button'));
}


function renderSimulationExplorer(){
 const tabs=document.querySelector('#simulation-tabs'),detail=document.querySelector('#simulation-detail');if(!tabs||!detail)return;
 const labels={actionPotential:'Potencial de acción',receptor:'Receptores',plasticity:'Plasticidad'};
 let active='actionPotential';
 function draw(){
  const model=simulationModels[active];tabs.innerHTML='';
  Object.keys(simulationModels).forEach(key=>{const b=document.createElement('button');b.type='button';b.className='network-choice'+(key===active?' active':'');b.innerHTML='<strong>'+labels[key]+'</strong>';b.addEventListener('click',()=>{active=key;draw();});tabs.appendChild(b);});
  const controls=model.controls.map(c=>'<label class="sim-control"><span>'+c.label+' <b data-value="'+c.id+'">'+c.value.toFixed(c.step<1?2:0)+'</b> <small>'+c.unit+'</small></span><input type="range" data-param="'+c.id+'" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+c.value+'"></label>').join('');
  detail.innerHTML='<h4>'+model.title+'</h4><p class="muted">'+model.description+'</p><div class="sim-controls">'+controls+'</div><div id="simulation-visual" class="simulation-visual" role="img" aria-label="Gráfico esquemático del modelo"></div><div id="simulation-result" class="sim-result" aria-live="polite"></div><p class="sim-caveat">Modelo educativo simplificado. No sustituye registros electrofisiológicos, modelos computacionales validados ni evaluación clínica.</p>';
  detail.querySelectorAll('input[data-param]').forEach(input=>input.addEventListener('input',()=>{detail.querySelector('[data-value="'+input.dataset.param+'"]').textContent=Number(input.value).toFixed(Number(input.step)<1?2:0);update();}));
  update();
 }
 function svgGraph(points,yMin,yMax){
  const width=560,height=190,left=34,right=12,top=12,bottom=25;
  const xy=points.map((p,i)=>[(left+i*(width-left-right)/(points.length-1)).toFixed(1),(top+(yMax-p)*(height-top-bottom)/(yMax-yMin)).toFixed(1)]);
  const path=xy.map((p,i)=>(i?'L':'M')+p.join(',')).join(' ');
  return '<svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Curva del modelo"><path d="M'+left+' '+top+'V'+(height-bottom)+'H'+(width-right)+'" fill="none" stroke="#60758f" stroke-width="1"/><path d="'+path+'" fill="none" stroke="#69b9e8" stroke-width="2.5" stroke-linejoin="round"/><text x="'+left+'" y="'+(height-6)+'" fill="#91a4bc" font-size="10">Tiempo / parámetro</text><text x="4" y="13" fill="#91a4bc" font-size="9">Respuesta</text></svg>';
 }
 function update(){
  const val=id=>Number(detail.querySelector('[data-param="'+id+'"]').value);
  let points=[],result='';
  if(active==='actionPotential'){
   const current=val('current'),threshold=val('threshold'),refractory=val('refractory'),fires=current>=threshold?Math.max(1,Math.floor(18/refractory)):0;
   for(let t=0;t<=100;t++){let v=-70;if(fires){for(let k=0;k<fires;k++){const center=12+k*refractory*4;const d=Math.abs(t-center);if(d<2)v=-70+100*(1-d/2);else if(d<5)v=-70-12*(1-(d-2)/3);}}points.push(v);}
   result=current>=threshold?'La entrada supera el umbral del modelo: se generan '+fires+' eventos de disparo esquemáticos.':'La entrada no alcanza el umbral: no se genera un potencial de acción en este modelo.';
   detail.querySelector('#simulation-visual').innerHTML=svgGraph(points,-90,40);
  }else if(active==='receptor'){
   const c=val('concentration'),kd=val('kd'),eff=val('efficacy'),occupancy=c/(c+kd),response=occupancy*eff;
   for(let x=0;x<=10;x+=.1)points.push((x/(x+kd))*eff*100);
   result='Ocupación estimada: '+(occupancy*100).toFixed(1)+'% · Respuesta relativa del modelo: '+(response*100).toFixed(1)+'%. La ocupación depende de concentración y Kd; la respuesta incorpora la eficacia elegida.';
   detail.querySelector('#simulation-visual').innerHTML=svgGraph(points,0,100);
  }else{
   const ca=val('calcium'),duration=val('duration'),prior=val('prior'),signal=ca*Math.sqrt(duration)*(prior===0?.85:prior===2?1.15:1);
   for(let x=0;x<=10;x+=.1)points.push(Math.max(-100,Math.min(100,(x-5)*20)));
   let label=signal<9?'Tendencia esquemática hacia LTD':signal>20?'Tendencia esquemática hacia LTP':'Sin cambio persistente claro en la zona intermedia';
   result=label+'. Índice ilustrativo de señal integrada: '+signal.toFixed(1)+' u.a. No representa umbrales biológicos universales.';
   detail.querySelector('#simulation-visual').innerHTML=svgGraph(points,-100,100);
  }
  detail.querySelector('#simulation-result').textContent=result;
 }
 draw();
}


function renderClinicalPharmacology(){
 const host=document.querySelector('#clinical-pharmacology-list'),detail=document.querySelector('#clinical-pharmacology-detail');if(!host||!detail)return;
 host.innerHTML='';
 clinicalPharmacology.forEach((item,index)=>{
  const b=document.createElement('button');b.type='button';b.className='network-choice'+(index===0?' active':'');
  b.innerHTML='<strong>'+escapeHtml(item.name)+'</strong><small>'+escapeHtml(item.class)+'</small>';
  b.addEventListener('click',()=>show(item,b));host.appendChild(b);
 });
 function show(item,button){
  host.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));
  const refs=item.refs.map(([label,url])=>'<li><a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(label)+' ↗</a></li>').join('');
  const sections=[['Blancos moleculares',item.targets],['Mecanismo de acción',item.mechanism],['Usos clínicos generales',item.uses],['Circuitos y neuroanatomía',item.neuro],['Efectos adversos y riesgos',item.risks],['Precauciones y límites',item.caveat]];
  detail.innerHTML='<p class="network-tag">'+escapeHtml(item.class)+'</p><h4>'+escapeHtml(item.name)+'</h4>'+sections.map(([heading,value])=>'<section class="network-section"><h5>'+heading+'</h5><p class="muted">'+escapeHtml(value)+'</p></section>').join('')+'<section class="network-section"><h5>Guías y bibliografía</h5><ul class="fact-references">'+refs+'</ul></section><p class="sim-caveat">Ficha educativa, no prescriptiva. No contiene dosis ni recomendaciones individualizadas. La elección, combinación, monitorización y retirada de medicamentos requieren evaluación profesional y consulta de guías vigentes.</p>';
 }
 show(clinicalPharmacology[0],host.querySelector('button'));
}

function renderLayerControls(){
 const host=document.querySelector('#layer-controls');if(!host)return;
 const counts=new Map();structures.forEach(s=>counts.set(s.category,(counts.get(s.category)||0)+1));
 host.innerHTML='';
 [...counts.entries()].sort((a,b)=>(categoryNames[a[0]]||a[0]).localeCompare(categoryNames[b[0]]||b[0],'es')).forEach(([cat,count])=>{
  if(!layerEnabled.has(cat))layerEnabled.set(cat,true);
  const label=document.createElement('label');label.className='layer-toggle';
  const input=document.createElement('input');input.type='checkbox';input.checked=layerEnabled.get(cat);input.setAttribute('aria-label','Mostrar '+(categoryNames[cat]||cat));
  input.addEventListener('change',()=>{
   layerEnabled.set(cat,input.checked);
   meshes.filter(m=>m.userData.atlasCategory===cat).forEach(applyVisibility);
  });
  const name=document.createElement('span');name.textContent=categoryNames[cat]||cat;
  const n=document.createElement('small');n.className='layer-count';n.textContent=count;
  label.append(input,name,n);host.appendChild(label);
 });
}
function pickFromEvent(e){
 const rect=renderer.domElement.getBoundingClientRect();
 const pointer=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
 const raycaster=new THREE.Raycaster();raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(meshes,false)[0];
 if(!hit)return;
 const o=hit.object,ex=o.userData;
 const key=ex.atlasId!==null&&ex.atlasId!==undefined?String(ex.atlasId):ex.atlasLabel+'|'+ex.atlasSide+'|'+ex.atlasCategory;
 const s=structures.get(key);if(s){controls.autoRotate=false;selectStructure(s);}
}
let pointerStart=null;
renderer.domElement.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});
renderer.domElement.addEventListener('pointerup',e=>{if(!pointerStart)return;const moved=Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y);if(moved<5)pickFromEvent(e);pointerStart=null;});
buttons.forEach(b=>b.addEventListener('click',()=>{
 const term=normalise(b.dataset.region);
 const found=[...structures.values()].find(s=>normalise(s.category)===term||normalise(s.region).includes(term)||normalise(s.label).includes(term));
 if(found){controls.autoRotate=false;selectStructure(found);searchInput.value=found.label;renderSearch(found.label);}
}));
searchInput?.addEventListener('input',e=>renderSearch(e.target.value));
document.querySelector('#reset-view').addEventListener('click',()=>{isolateSelected=false;const isolateButton=document.querySelector('#isolate-structure');isolateButton?.classList.remove('active');isolateButton?.setAttribute('aria-pressed','false');meshes.forEach(applyVisibility);camera.position.set(0,1.1,8.5);controls.target.set(0,0,0);controls.autoRotate=true;controls.update();});
const isolateButton=document.querySelector('#isolate-structure');
isolateButton?.addEventListener('click',()=>{if(!selectedId)return;isolateSelected=!isolateSelected;isolateButton.classList.toggle('active',isolateSelected);isolateButton.setAttribute('aria-pressed',String(isolateSelected));meshes.forEach(applyVisibility);});
document.querySelector('#toggle-labels').addEventListener('click',e=>{labelsOn=!labelsOn;e.currentTarget.classList.toggle('active',labelsOn);floorGrid.visible=labelsOn;sectionGuide.visible=labelsOn&&activePlane!=='none';});
document.querySelector('#hemisphere-select')?.addEventListener('change',e=>{activeHemisphere=e.target.value;meshes.forEach(applyVisibility);});
const sectionButtons=[...document.querySelectorAll('[data-plane]')];
const sectionSlider=document.querySelector('#section-position');
function setSection(type,value=Number(sectionSlider.value)){
 activePlane=type;const axes={axial:new THREE.Vector3(0,1,0),coronal:new THREE.Vector3(0,0,1),sagittal:new THREE.Vector3(1,0,0)};
 const normal=axes[type];sectionButtons.forEach(b=>b.classList.toggle('active',b.dataset.plane===type));sectionSlider.disabled=!normal;
 if(!normal){meshes.forEach(m=>m.material.clippingPlanes=[]);sectionGuide.visible=false;return;}
 sectionPlane.normal.copy(normal);sectionPlane.constant=-value;meshes.forEach(m=>m.material.clippingPlanes=[sectionPlane]);
 sectionGuide.visible=labelsOn;sectionGuide.position.copy(normal).multiplyScalar(value);sectionGuide.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
}
sectionButtons.forEach(b=>b.addEventListener('click',()=>setSection(b.dataset.plane)));
sectionSlider.addEventListener('input',()=>{if(activePlane!=='none')setSection(activePlane,Number(sectionSlider.value));});
function resize(){const w=sceneHost.clientWidth,h=sceneHost.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
new ResizeObserver(resize).observe(sceneHost);resize();
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();

const draco=new DRACOLoader();draco.setDecoderPath(DRACO_URL);
const loader=new GLTFLoader();loader.setDRACOLoader(draco);
fetch(MANIFEST_URL).then(response=>{if(!response.ok)throw new Error('Manifest HTTP '+response.status);return response.json();}).then(manifest=>{manifestById=new Map((manifest.nodes||[]).map(node=>[String(node.id),node]));loading.textContent='Metadatos cargados. Descargando geometría 3D…';}).catch(err=>{console.warn('No se pudo cargar el manifiesto anatómico; se usarán metadatos glTF:',err);}).finally(()=>{
 let modelSettled=false;
 const timeout=setTimeout(()=>{if(modelSettled)return;modelSettled=true;console.warn('Tiempo de espera agotado para CDN primaria; se intenta fuente alternativa.');loading.textContent='La descarga tarda más de lo esperado; probando otra fuente…';loadFallback();},18000);
 const loadFallback=()=>{
  let fallbackSettled=false;
  const fallbackTimeout=setTimeout(()=>{if(fallbackSettled)return;fallbackSettled=true;showError('Las dos fuentes del modelo anatómico superaron el tiempo de espera. Se activó una representación 3D local simplificada.');},18000);
  loader.load(MODEL_FALLBACK_URL,gltf=>{if(fallbackSettled)return;fallbackSettled=true;clearTimeout(fallbackTimeout);if(modelSettled&&brain.children.length)return;modelSettled=true;clearTimeout(timeout);registerModel(gltf);},progress=>{if(progress.total)loading.textContent='Reintentando modelo anatómico… '+Math.round(progress.loaded/progress.total*100)+'%';},err=>{if(fallbackSettled)return;fallbackSettled=true;clearTimeout(fallbackTimeout);console.error('Fallaron las dos fuentes del modelo anatómico:',err);modelSettled=true;clearTimeout(timeout);showError('No fue posible descargar el modelo anatómico externo. Se activó una representación 3D local simplificada.');});
 };
 loader.load(MODEL_URL,gltf=>{if(modelSettled)return;modelSettled=true;clearTimeout(timeout);registerModel(gltf);},progress=>{if(progress.total)loading.textContent='Cargando modelo anatómico… '+Math.round(progress.loaded/progress.total*100)+'%';},err=>{if(modelSettled)return;modelSettled=true;clearTimeout(timeout);console.warn('Falló CDN primaria; se intenta fuente alternativa:',err);loading.textContent='Reintentando desde el repositorio de origen…';loadFallback();});
});
