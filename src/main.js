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

const MODEL_URL='https://raw.githubusercontent.com/itayinbarr/brainproject/2929e94f521a8ddceab26bc100a98dc06b0da060/brain-atlas/models/brain.glb';
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
const meshes=[];const structures=new Map();const layerEnabled=new Map();let selectedId=null;let labelsOn=true;let activePlane='none';let activeHemisphere='both';
const info=document.querySelector('#structure-info');
const loading=document.querySelector('#loading');
const credit=document.querySelector('#model-credit');
const buttons=[...document.querySelectorAll('[data-region]')];
const searchInput=document.querySelector('#structure-search');
const searchResults=document.querySelector('#search-results');

function normalise(s){return (s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function readExtras(o){const chain=[];let node=o;while(node){chain.unshift(node.userData||{});node=node.parent;}return Object.assign({},...chain);}
function showError(message){
 loading.classList.add('hidden');
 info.innerHTML='<div class="region-kicker">CARGA DEL MODELO</div><h2>No se pudo cargar el atlas</h2><p class="muted">'+message+'</p><p class="muted">La escena anatómica necesita conexión con el repositorio de origen y el decodificador Draco.</p>';
 credit.textContent='MODELO ANATÓMICO NO DISPONIBLE';
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
  const mat=new THREE.MeshStandardMaterial({color,roughness:(cat==='arteries'||cat==='veins_sinuses') ? 0.48 : 0.78,metalness:0,side:cat==='meninges_dura'?THREE.DoubleSide:THREE.FrontSide});
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
 source.position.sub(center);
 const radius=coreBox.getBoundingSphere(new THREE.Sphere()).radius||1;
 source.scale.setScalar(1.7/radius);
 source.rotation.y=Math.PI;
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
}

function applyVisibility(mesh){const catOn=layerEnabled.get(mesh.userData.atlasCategory)!==false;const side=mesh.userData.atlasSide;const sideOn=activeHemisphere==='both'||side==='median'||side===activeHemisphere;mesh.visible=catOn&&sideOn;}
function selectStructure(s){
 if(!s)return;
 if(layerEnabled.get(s.category)===false){layerEnabled.set(s.category,true);meshes.filter(m=>m.userData.atlasCategory===s.category).forEach(applyVisibility);renderLayerControls();}
 selectedId=s.id;
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
document.querySelector('#reset-view').addEventListener('click',()=>{camera.position.set(0,1.1,8.5);controls.target.set(0,0,0);controls.autoRotate=true;controls.update();});
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
 loader.load(MODEL_URL,registerModel,progress=>{if(progress.total)loading.textContent='Cargando modelo anatómico… '+Math.round(progress.loaded/progress.total*100)+'%';},err=>{console.error('No se pudo cargar el modelo anatómico:',err);showError('El servidor de origen o el decodificador no respondió. Volvé a cargar la página cuando haya conexión.');});
});
