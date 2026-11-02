// Herramientas estadísticas exploratorias para CSV de fluencia verbal.
// Entrada esperada: una fila por participante; no se envían datos a servidores.
export function parseCSV(text){
 const firstLine=String(text).split(/\r?\n/,1)[0]||"";const delimiter=(firstLine.split(';').length>firstLine.split(',').length)?';':',';
 const rows=[];let row=[],field="",quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i],n=text[i+1];
  if(quoted){if(c==='"'&&n==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}
  else if(c==='"')quoted=true;
  else if(c===delimiter){row.push(field);field="";}
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
 let wins=0,ties=0;for(const x of a)for(const y of b){if(y>x)wins++;else if(x===y)ties++;}
 return {nA:a.length,nB:b.length,auc:(wins+.5*ties)/(a.length*b.length)};
}

export function standardizedMeanDifference(rows,field,groupA,groupB){
 const a=rows.filter(r=>r.group===groupA&&Number.isFinite(r[field])).map(r=>r[field]);
 const b=rows.filter(r=>r.group===groupB&&Number.isFinite(r[field])).map(r=>r[field]);
 const n1=a.length,n2=b.length;if(n1<2||n2<2)return {n1,n2,d:null,g:null,ci:null};
 const mean=x=>x.reduce((s,v)=>s+v,0)/x.length;
 const m1=mean(a),m2=mean(b),v1=a.reduce((s,x)=>s+(x-m1)**2,0)/(n1-1),v2=b.reduce((s,x)=>s+(x-m2)**2,0)/(n2-1);
 const pooled=Math.sqrt(((n1-1)*v1+(n2-1)*v2)/(n1+n2-2));if(!pooled)return {n1,n2,d:null,g:null,ci:null};
 const d=(m2-m1)/pooled,df=n1+n2-2,J=1-3/(4*df-1),g=J*d;
 const se=Math.sqrt((n1+n2)/(n1*n2)+d*d/(2*df));
 return {n1,n2,d,g,ci:[g-1.96*J*se,g+1.96*J*se]};
}

function ranked(values){
 const order=values.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v),out=Array(values.length);
 for(let i=0;i<order.length;){let j=i+1;while(j<order.length&&order[j].v===order[i].v)j++;const rank=(i+1+j)/2;for(let k=i;k<j;k++)out[order[k].i]=rank;i=j;}
 return out;
}
export function spearman(x,y){
 const pairs=x.map((v,i)=>[v,y[i]]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
 const n=pairs.length;if(n<3)return {n,rho:null};
 const rx=ranked(pairs.map(p=>p[0])),ry=ranked(pairs.map(p=>p[1]));
 const result=pearson(rx,ry);return {n,rho:result.r};
}
function gammaQ(a,x){
 if(x<0||a<=0)return NaN;if(x===0)return 1;
 const gln=Math.logGamma?Math.logGamma(a):logGamma(a);
 if(x<a+1){let ap=a,sum=1/a,del=sum;for(let n=1;n<=200;n++){ap++;del*=x/ap;sum+=del;if(Math.abs(del)<Math.abs(sum)*1e-14)break;}return Math.max(0,Math.min(1,1-sum*Math.exp(-x+a*Math.log(x)-gln)));}
 let b=x+1-a,c=1/1e-300,d=1/b,h=d;
 for(let i=1;i<=200;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-300)d=1e-300;c=b+an/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<1e-14)break;}
 return Math.max(0,Math.min(1,Math.exp(-x+a*Math.log(x)-gln)*h));
}
function logGamma(z){
 const p=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];
 if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);
 z-=1;let x=.99999999999980993;for(let i=0;i<p.length;i++)x+=p[i]/(z+i+1);
 const t=z+p.length-.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);
}
export function kruskalWallis(rows,field){
 const groups=[...new Set(rows.map(r=>r.group))].map(group=>({group,values:rows.filter(r=>r.group===group&&Number.isFinite(r[field])).map(r=>r[field])})).filter(g=>g.values.length);
 const all=groups.flatMap(g=>g.values),N=all.length,k=groups.length;
 if(k<2||N<=k)return {k,N,H:null,p:null,epsilonSquared:null};
 const order=ranked(all),offsets=[];let at=0;for(const g of groups){offsets.push({n:g.values.length,rankSum:order.slice(at,at+g.values.length).reduce((s,v)=>s+v,0)});at+=g.values.length;}
 let H=12/(N*(N+1))*offsets.reduce((s,g)=>s+g.rankSum*g.rankSum/g.n,0)-3*(N+1);
 const freq=new Map();all.forEach(v=>freq.set(v,(freq.get(v)||0)+1));
 const tie=1-[...freq.values()].reduce((s,t)=>s+(t**3-t),0)/(N**3-N);
 if(tie>0)H/=tie;else return {k,N,H:null,p:null,epsilonSquared:null};
 const df=k-1,p=gammaQ(df/2,H/2),epsilonSquared=Math.max(0,(H-k+1)/(N-k));
 return {k,N,H,p,df,epsilonSquared,groups:groups.map(g=>({group:g.group,n:g.values.length}))};
}
