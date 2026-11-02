// Herramientas estadísticas exploratorias para CSV de fluencia verbal.
// Entrada esperada: una fila por participante; no se envían datos a servidores.
export function parseCSV(text){
 const rows=[];let row=[],field="",quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i],n=text[i+1];
  if(quoted){if(c==='"'&&n==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}
  else if(c==='"')quoted=true;
  else if(c===","){row.push(field);field="";}
  else if(c==="\n"){row.push(field);rows.push(row);row=[];field="";}
  else if(c!=="\r")field+=c;
 }
 if(field.length||row.length){row.push(field);rows.push(row);}
 const headers=(rows.shift()||[]).map(x=>x.trim().replace(/^\uFEFF/,""));
 return rows.filter(r=>r.some(v=>v.trim()!=="")).map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||"").trim()])));
}
const aliases={
 group:["group","grupo","diagnostico","diagnóstico"],
 participant_id:["participant_id","id","participante","codigo","código"],
 total_words:["total_words","produccion_total","producción_total","palabras","total"],
 mean_log_frequency:["mean_log_frequency","frecuencia_media","frecuencia_lexica","frecuencia_léxica","log_frecuencia"],
 mean_semantic_similarity:["mean_semantic_similarity","similitud_semantica","similitud_semántica","cosine_similarity","similitud"],
 clustering:["clustering","clusters","agrupamientos"],
 switching:["switching","cambios","switches"],
 first_latency:["first_latency","latencia_inicial","latencia","latency"],
 age:["age","edad"],
 education:["education","educacion","educación","years_education","años_educacion"]
};
export const researchFields=[
 ["total_words","Producción total"],["mean_log_frequency","Frecuencia léxica media"],["mean_semantic_similarity","Similitud semántica media"],["clustering","Clustering"],["switching","Switching"],["first_latency","Latencia inicial"],["age","Edad"],["education","Años de educación"]
];
export function normalizeResearchRows(rows){
 if(!rows.length)return {rows:[],missing:["group"],mapping:{}};
 const headers=Object.keys(rows[0]),lower=headers.map(h=>h.toLowerCase().trim());
 const mapping={};
 for(const [key,choices] of Object.entries(aliases)){const i=lower.findIndex(h=>choices.includes(h));if(i>=0)mapping[key]=headers[i];}
 const missing=["group"].filter(k=>!mapping[k]);
 const normalized=rows.map((r,i)=>{
  const out={_row:i+2};
  for(const [key,header] of Object.entries(mapping)){
   const raw=r[header];
   if(key==="group"||key==="participant_id")out[key]=raw;
   else {const n=Number(String(raw).replace(",","."));out[key]=raw===""||!Number.isFinite(n)?null:n;}
  }
  return out;
 }).filter(r=>r.group);
 return {rows:normalized,missing,mapping};
}
export function summarizeResearch(rows){
 const groups=[...new Set(rows.map(r=>r.group))].sort((a,b)=>a.localeCompare(b,"es"));
 const summaries=groups.map(group=>{
  const subset=rows.filter(r=>r.group===group);
  const values=researchFields.map(([key,label])=>{
   const v=subset.map(r=>r[key]).filter(Number.isFinite),n=v.length;
   if(!n)return {key,label,n:0,mean:null,sd:null};
   const mean=v.reduce((a,b)=>a+b,0)/n,sd=n>1?Math.sqrt(v.reduce((a,b)=>a+(b-mean)**2,0)/(n-1)):null;
   return {key,label,n,mean,sd};
  });
  return {group,n:subset.length,values};
 });
 return {groups,summaries};
}
export function pearson(x,y){
 const pairs=x.map((v,i)=>[v,y[i]]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
 const n=pairs.length;if(n<3)return {n,r:null};
 const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;
 const a=pairs.reduce((s,p)=>s+(p[0]-mx)**2,0),b=pairs.reduce((s,p)=>s+(p[1]-my)**2,0);
 if(!a||!b)return {n,r:null};
 const r=pairs.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0)/Math.sqrt(a*b);
 return {n,r};
}
export function pairwiseAuc(rows,field,groupA,groupB){
 const a=rows.filter(r=>r.group===groupA&&Number.isFinite(r[field])).map(r=>r[field]);
 const b=rows.filter(r=>r.group===groupB&&Number.isFinite(r[field])).map(r=>r[field]);
 if(!a.length||!b.length)return {nA:a.length,nB:b.length,auc:null};
 let wins=0,ties=0;for(const x of a)for(const y of b){if(x>y)wins++;else if(x===y)ties++;}
 return {nA:a.length,nB:b.length,auc:(wins+.5*ties)/(a.length*b.length)};
}
