import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const sceneHost = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b1422, 10, 24);
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 1.1, 10.8);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.localClippingEnabled = true;
sceneHost.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .06;
controls.minDistance = 5.4;
controls.maxDistance = 16;
controls.target.set(0, 0, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = .55;

scene.add(new THREE.HemisphereLight(0xc9dcff, 0x172033, 2.1));
const key = new THREE.DirectionalLight(0xd9e8ff, 3.2); key.position.set(4, 6, 7); scene.add(key);
const rim = new THREE.DirectionalLight(0x6a9bdf, 2.4); rim.position.set(-5, 1, -5); scene.add(rim);
const fill = new THREE.PointLight(0x8c78d6, 16, 18); fill.position.set(0, -3, 4); scene.add(fill);

const brain = new THREE.Group(); scene.add(brain);
const sectionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const pickables = [];
const palette = { frontal:0xd18d83, parietal:0xd9b77f, temporal:0x8e9fc5, occipital:0x8cb9ae, cerebellum:0xb58fc5, brainstem:0x9b9ba9 };
const data = {
 frontal:{name:'Lóbulo frontal',system:'TELENCÉFALO · NEOCORTEZA',description:'Región anterior de los hemisferios cerebrales. Participa en el control ejecutivo, la planificación, la memoria de trabajo, la regulación de la conducta y la producción motora.',functions:['Control ejecutivo y planificación','Memoria de trabajo','Control inhibitorio y flexibilidad','Programación motora y lenguaje expresivo'],note:'La corteza prefrontal, premotora y motora primaria presentan organización y conectividad diferenciadas. No deben tratarse como una unidad funcional homogénea.'},
 parietal:{name:'Lóbulo parietal',system:'TELENCÉFALO · NEOCORTEZA',description:'Región cortical posterior al surco central. Integra información somatosensorial y contribuye a la atención espacial, la representación corporal y diversas operaciones visuoespaciales.',functions:['Procesamiento somatosensorial','Integración multisensorial','Atención y orientación espacial','Praxias y cálculo'],note:'La organización funcional difiere entre regiones parietales superiores e inferiores y entre hemisferios.'},
 temporal:{name:'Lóbulo temporal',system:'TELENCÉFALO · NEOCORTEZA Y ALOCORTEZA',description:'Región lateral e inferior del hemisferio. Interviene en el procesamiento auditivo, el lenguaje, la memoria y el reconocimiento de estímulos complejos.',functions:['Procesamiento auditivo','Memoria episódica y aprendizaje','Acceso léxico-semántico','Reconocimiento de objetos y caras'],note:'El lóbulo temporal incluye neocorteza lateral y estructuras mediales, como la formación hipocampal, con circuitos diferenciados.'},
 occipital:{name:'Lóbulo occipital',system:'TELENCÉFALO · NEOCORTEZA',description:'Polo posterior de los hemisferios cerebrales, fundamental para el procesamiento cortical de la información visual.',functions:['Procesamiento visual primario','Análisis de forma y orientación','Procesamiento de movimiento y color','Integración en vías visuales'],note:'La corteza visual primaria (V1) se localiza alrededor de la cisura calcarina; las áreas visuales asociativas se extienden más allá del polo occipital.'},
 cerebellum:{name:'Cerebelo',system:'METENCÉFALO · ROMBENCÉFALO',description:'Estructura de la fosa posterior conectada con el tronco encefálico mediante pedúnculos cerebelosos. Participa en coordinación, temporización, aprendizaje y ajuste de acciones.',functions:['Coordinación y precisión motora','Equilibrio y control postural','Aprendizaje motor','Contribuciones cognitivas y afectivas'],note:'Su organización incluye corteza cerebelosa, sustancia blanca y núcleos profundos. La geometría actual no representa folias ni núcleos.'},
 brainstem:{name:'Tronco encefálico',system:'MESENCÉFALO · PUENTE · BULBO',description:'Eje de conexión entre diencéfalo, cerebelo y médula espinal. Contiene vías ascendentes y descendentes, núcleos de nervios craneales y sistemas moduladores.',functions:['Regulación cardiorrespiratoria','Vigilia y nivel de alerta','Reflejos y funciones oculomotoras','Tránsito de vías motoras y sensitivas'],note:'Comprende mesencéfalo, puente y bulbo raquídeo; cada nivel contiene núcleos y circuitos específicos.'}
};

function material(color){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.04});}
function makeRegion(id, position, scale, detail=36){
 const geo=new THREE.SphereGeometry(1,detail,detail);
 const pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){
   const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
   const wave=Math.sin(x*17+y*8)*Math.cos(z*13-y*11);
   const ripple=Math.sin(y*24+z*7)*.012;
   const factor=1 + wave*.012 + ripple;
   pos.setXYZ(i,x*factor,y*factor,z*factor);
 }
 geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,material(palette[id]));
 mesh.position.set(...position); mesh.scale.set(...scale); mesh.userData.region=id;
 brain.add(mesh); pickables.push(mesh); return mesh;
}
// Esquema bilateral: masas lobares separadas para facilitar la exploración inicial.
for(const side of [-1,1]){
 const s=side;
 makeRegion('frontal',[s*1.02,.38,.46],[1.12,.91,1.12]);
 makeRegion('parietal',[s*.96,1.02,-.42],[1.02,.68,.92]);
 makeRegion('temporal',[s*1.05,-.52,-.18],[1.05,.66,1.05]);
 makeRegion('occipital',[s*.72,.27,-1.42],[.72,.78,.58]);
}
// Cerebelo y tronco, en posición inferior y posterior.
makeRegion('cerebellum',[0,-1.22,-1.42],[.92,.62,.66],40);
makeRegion('brainstem',[0,-.82,-.62],[.34,.88,.38],32);
pickables.forEach(mesh => { mesh.material.clippingPlanes = [sectionPlane]; });

const sectionGuide = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 5.5), new THREE.MeshBasicMaterial({color:0x8bb9e8, transparent:true, opacity:.10, side:THREE.DoubleSide, depthWrite:false}));
sectionGuide.visible = false; scene.add(sectionGuide);

// Línea media sutil y referencia de orientación.
const midline = new THREE.Mesh(new THREE.BoxGeometry(.018,1.35,2.25),new THREE.MeshBasicMaterial({color:0x90a9ca,transparent:true,opacity:.17}));
midline.position.set(0,.2,-.1); brain.add(midline);
const floorGrid=new THREE.GridHelper(12,24,0x2c4565,0x1a2c43); floorGrid.position.y=-2.15; floorGrid.material.transparent=true; floorGrid.material.opacity=.24; scene.add(floorGrid);

const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2();
let selected=null; let labelsOn=true;
const info=document.querySelector('#structure-info');
const buttons=[...document.querySelectorAll('[data-region]')];
function selectRegion(id){
 const d=data[id]; if(!d)return;
 selected=id;
 pickables.forEach(m=>{const active=m.userData.region===id;m.material.emissive.setHex(active?0x263d58:0x000000);m.material.emissiveIntensity=active ? 0.7 : 0;});
 buttons.forEach(b=>b.classList.toggle('selected',b.dataset.region===id));
 info.innerHTML=`<div class="region-kicker">${d.system}</div><h2>${d.name}</h2><p class="muted">${d.description}</p><div class="panel-divider"></div><p class="eyebrow">FUNCIONES RELACIONADAS</p><ul class="function-list">${d.functions.map(x=>`<li>${x}</li>`).join('')}</ul><div class="anatomy-note"><strong>Organización y límites</strong><p>${d.note}</p></div>`;
}
buttons.forEach(b=>b.addEventListener('click',()=>{controls.autoRotate=false;selectRegion(b.dataset.region);}));
renderer.domElement.addEventListener('pointerdown',e=>{const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(pickables)[0];if(hit){controls.autoRotate=false;selectRegion(hit.object.userData.region);}});
document.querySelector('#reset-view').addEventListener('click',()=>{camera.position.set(0,1.1,10.8);controls.target.set(0,0,0);controls.autoRotate=true;controls.update();});
document.querySelector('#toggle-labels').addEventListener('click',e=>{labelsOn=!labelsOn;e.currentTarget.classList.toggle('active',labelsOn);floorGrid.visible=labelsOn;midline.visible=labelsOn;});
const sectionButtons=[...document.querySelectorAll('[data-plane]')];
const sectionSlider=document.querySelector('#section-position');
let activePlane='none';
function setSection(type,value=Number(sectionSlider.value)){
 activePlane=type;
 const axes={axial:new THREE.Vector3(0,1,0),coronal:new THREE.Vector3(0,0,1),sagittal:new THREE.Vector3(1,0,0)};
 const normal=axes[type];
 sectionButtons.forEach(button=>button.classList.toggle('active',button.dataset.plane===type));
 sectionSlider.disabled=!normal;
 if(!normal){
   pickables.forEach(mesh=>mesh.material.clippingPlanes=[]);
   sectionGuide.visible=false;
   return;
 }
 sectionPlane.normal.copy(normal);
 sectionPlane.constant=-value;
 pickables.forEach(mesh=>mesh.material.clippingPlanes=[sectionPlane]);
 sectionGuide.visible=true;
 sectionGuide.position.copy(normal).multiplyScalar(value);
 sectionGuide.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
}
sectionButtons.forEach(button=>button.addEventListener('click',()=>setSection(button.dataset.plane)));
sectionSlider.addEventListener('input',()=>{if(activePlane!=='none')setSection(activePlane,Number(sectionSlider.value));});

function resize(){const w=sceneHost.clientWidth,h=sceneHost.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
new ResizeObserver(resize).observe(sceneHost);resize();
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}
animate();
document.querySelector('#loading').classList.add('hidden');
