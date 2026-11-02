import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import './style.css';

const MODEL_URL='https://raw.githubusercontent.com/itayinbarr/brainproject/2929e94f521a8ddceab26bc100a98dc06b0da060/brain-atlas/models/brain.glb';
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
  const cat=ex.bx_cat||ex.cat||'other';
  const label=ex.bx_label||ex.label||o.name||'Estructura anatómica';
  const side=ex.bx_side||ex.side||'median';
  const region=ex.bx_region||ex.region||'Sistema nervioso central';
  const color=new THREE.Color(categoryColors[cat]??0x9eacc1);
  const original=Array.isArray(o.material)?o.material[0]:o.material;
  const mat=new THREE.MeshStandardMaterial({color,roughness:(cat==='arteries'||cat==='veins_sinuses') ? 0.48 : 0.78,metalness:0,side:cat==='meninges_dura'?THREE.DoubleSide:THREE.FrontSide});
  mat.clippingPlanes=activePlane==='none'?[]:[sectionPlane];
  o.material=mat;
  o.userData={...ex,atlasId:id,atlasCategory:cat,atlasLabel:label,atlasSide:side,atlasRegion:region,baseColor:color.clone(),originalMaterial:original};
  meshes.push(o);
  const key=id!==null?String(id):label+'|'+side+'|'+cat;
  if(!structures.has(key))structures.set(key,{id:key,label,category:cat,side,region,mesh:o,meshes:[],source:ex.bx_source||'Z-Anatomy / BodyParts3D'});
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
 info.innerHTML='<div class="region-kicker">'+category.toUpperCase()+'</div><h2>'+escapeHtml(s.label)+'</h2><p class="muted">'+escapeHtml(s.region)+' · '+side+'</p><div class="panel-divider"></div><p class="eyebrow">IDENTIFICACIÓN ANATÓMICA</p><p class="muted">Estructura individual del atlas TA2, vinculada a su malla 3D y metadatos de origen. La descripción funcional detallada se incorporará en la siguiente etapa con referencias bibliográficas verificadas.</p><div class="anatomy-note"><strong>Procedencia</strong><p>'+escapeHtml(s.source)+'. La resolución y el grado de detalle dependen de la categoría anatómica; consultar las limitaciones del modelo.</p></div>';
 buttons.forEach(b=>b.classList.toggle('selected',normalise(b.dataset.region)===normalise(s.category)||normalise(b.dataset.region)===normalise(s.region)));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderSearch(query){
 if(!searchResults)return;
 const q=normalise(query);
 const all=[...structures.values()];
 const matches=(q?all.filter(s=>normalise(s.label+' '+s.region+' '+s.category+' '+s.side).includes(q)):all)
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
loader.load(MODEL_URL,registerModel,progress=>{
 if(progress.total)loading.textContent='Cargando modelo anatómico… '+Math.round(progress.loaded/progress.total*100)+'%';
},err=>{console.error('No se pudo cargar el modelo anatómico:',err);showError('El servidor de origen o el decodificador no respondió. Volvé a cargar la página cuando haya conexión.');});
