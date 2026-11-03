// Validación estructural de datos según el diccionario definido por el investigador.
// No corrige, elimina, imputa ni transforma valores.
const numericPattern=/^[+-]?(?:\\d+(?:[.,]\\d*)?|[.,]\\d+)(?:[eE][+-]?\\d+)?$/;
function allowedTokens(raw){
 return String(raw||'').split(';').map(x=>x.trim()).filter(Boolean).flatMap(item=>{
  const i=item.indexOf('=');
  return i<0?[item]:[item.slice(0,i).trim(),item.slice(i+1).trim()].filter(Boolean);
 });
}
function isValidDate(value){
 const s=String(value).trim();
 if(/^\\d{4}-\\d{2}-\\d{2}$/.test(s)){
  const [y,m,d]=s.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d));
  return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;
 }
 return /^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}(?::\\d{2}(?:\\.\\d+)?)?(?:Z|[+-]\\d{2}:?\\d{2})?$/.test(s)&&Number.isFinite(Date.parse(s));
}
function validByType(value,type){
 if(type==='Numérica continua')return numericPattern.test(value);
 if(type==='Numérica discreta')return numericPattern.test(value)&&Number.isInteger(Number(value.replace(',','.')));
 if(type==='Fecha / tiempo')return isValidDate(value);
 return true;
}
export function validateMappedRows(rows,variables,mapping){
 const perVariable={},mapped=variables.filter(v=>mapping[v.name]);
 let emptyCells=0,invalidCells=0;
 for(const variable of mapped){
  const header=mapping[variable.name],allowed=allowedTokens(variable.values),invalidSamples=[];
  let missing=0,invalidType=0,invalidAllowed=0;
  for(let i=0;i<rows.length;i++){
   const value=String(rows[i][header]??'').trim();
   if(!value){missing++;emptyCells++;continue;}
   if(!validByType(value,variable.type)){invalidType++;if(invalidSamples.length<5)invalidSamples.push({row:i+2,value,reason:'Tipo de dato incompatible'});continue;}
   if(allowed.length&&!allowed.includes(value)){invalidAllowed++;if(invalidSamples.length<5)invalidSamples.push({row:i+2,value,reason:'Valor fuera de los códigos permitidos'});}
  }
  invalidCells+=invalidType+invalidAllowed;
  perVariable[variable.name]={header,missing,complete:rows.length-missing,invalidType,invalidAllowed,invalidSamples};
 }
 const idVariable=mapped.find(v=>/identificador/i.test(v.role)||/^(id|participant_id|codigo|código)$/i.test(v.name));
 const idHeader=idVariable?mapping[idVariable.name]:null,idCounts=new Map();
 if(idHeader)for(const row of rows){const id=String(row[idHeader]??'').trim();if(id)idCounts.set(id,(idCounts.get(id)||0)+1);}
 const duplicateIds=idHeader?[...idCounts].filter(([,n])=>n>1).map(([id,count])=>({id,count})):[];
 const signatures=new Map();
 for(const row of rows){
  const signature=mapped.map(v=>String(row[mapping[v.name]]??'').trim()).join('\\u001f');
  if(signature)signatures.set(signature,(signatures.get(signature)||0)+1);
 }
 const duplicateRows=[...signatures.values()].reduce((n,count)=>n+(count>1?count-1:0),0);
 return {rowCount:rows.length,mappedCount:mapped.length,perVariable,emptyCells,invalidCells,duplicateIds,duplicateRows,hasIdentifier:Boolean(idHeader)};
}
