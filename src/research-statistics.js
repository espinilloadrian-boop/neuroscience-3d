// Estadística descriptiva y planificación analítica genérica.
// Funciones puras: no modifican filas ni imputan datos.
const isNumber = value => typeof value === 'number' && Number.isFinite(value);
const quantile = (sorted, p) => {
  if (!sorted.length) return null;
  const h = (sorted.length - 1) * p, lo = Math.floor(h), hi = Math.ceil(h);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo);
};
export function summarizeNumeric(values) {
  const valid = values.filter(isNumber).sort((a,b)=>a-b), n=valid.length;
  const missing = values.length - n;
  if (!n) return {n:0,missing,mean:null,sd:null,median:null,q1:null,q3:null,iqr:null,min:null,max:null};
  const mean=valid.reduce((s,x)=>s+x,0)/n;
  const sd=n>1?Math.sqrt(valid.reduce((s,x)=>s+(x-mean)**2,0)/(n-1)):null;
  const q1=quantile(valid,.25),median=quantile(valid,.5),q3=quantile(valid,.75);
  return {n,missing,mean,sd,median,q1,q3,iqr:q3-q1,min:valid[0],max:valid[n-1]};
}
export function summarizeCategorical(values) {
  const counts=new Map(); let missing=0;
  for (const value of values) {
    if (value===null || value===undefined || String(value).trim()==='') { missing++; continue; }
    const key=String(value); counts.set(key,(counts.get(key)||0)+1);
  }
  const n=[...counts.values()].reduce((a,b)=>a+b,0);
  return {n,missing,levels:[...counts].sort((a,b)=>a[0].localeCompare(b[0],'es')).map(([level,count])=>({level,count,proportion:n?count/n:null}))};
}
export function summarizeByGroup(rows, groupField, variable, type='continuous') {
  const groups=[...new Set(rows.map(r=>r[groupField]).filter(v=>v!==null&&v!==undefined&&String(v).trim()!==''))].sort((a,b)=>String(a).localeCompare(String(b),'es'));
  return groups.map(group=>{
    const subset=rows.filter(r=>r[groupField]===group), values=subset.map(r=>r[variable]);
    return {group,nRows:subset.length,summary:type==='categorical'?summarizeCategorical(values):summarizeNumeric(values)};
  });
}
const numericTypes=new Set(['continuous','discrete']);
const categoricalTypes=new Set(['nominal','ordinal']);
export function buildAnalysisPlan({variables=[],design='cross-sectional',outcome=null,predictors=[],covariates=[],group=null,id=null}={}) {
  const byName=new Map(variables.map(v=>[v.name,v]));
  const errors=[],warnings=[],recommendations=[];
  if (!outcome || !byName.has(outcome)) errors.push('Definí una variable de resultado existente en el diccionario.');
  if (outcome && byName.has(outcome) && !numericTypes.has(byName.get(outcome).type) && !categoricalTypes.has(byName.get(outcome).type)) errors.push('El resultado debe ser continuo, discreto, nominal u ordinal para los análisis iniciales.');
  for (const name of [...predictors,...covariates, ...(group?[group]:[]), ...(id?[id]:[])]) if (!byName.has(name)) errors.push('La variable '+name+' no existe en el diccionario.');
  if (outcome && predictors.includes(outcome)) warnings.push('El resultado también figura como predictor; revisá la especificación.');
  if (design==='longitudinal'||design==='repeated') {
    if (!id) errors.push('El diseño longitudinal/repetido requiere identificar al participante.');
    warnings.push('No se ofrecerán pruebas que asuman observaciones independientes; se requiere un modelo longitudinal específico.');
  }
  if (design==='paired' && !id) errors.push('El diseño pareado requiere una variable de identificación/emparejamiento.');
  if (design==='cross-sectional'||design==='independent-groups') recommendations.push('Describir primero la muestra total y por grupo, informando n válido y faltantes.');
  if (outcome && byName.has(outcome)) {
    const type=byName.get(outcome).type;
    recommendations.push(numericTypes.has(type)?'Resultado cuantitativo: resumen con media/DE y mediana/RIQ.':'Resultado categórico: frecuencias, proporciones y denominadores.');
  }
  if (!predictors.length && !group) warnings.push('No se definieron predictores ni variable de agrupación.');
  return {valid:errors.length===0,design,outcome,predictors,covariates,group,id,errors,warnings,recommendations};
}
