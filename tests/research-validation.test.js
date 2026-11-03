import test from 'node:test';
import assert from 'node:assert/strict';
import {validateMappedRows} from '../src/research-validation.js';

const variables=[
 {name:'age',role:'Covariable',type:'Numérica discreta',values:'',},
 {name:'group',role:'Predictora',type:'Categórica nominal',values:'0=Control; 1=DCL; 2=EA'},
 {name:'visit_date',role:'Descriptiva',type:'Fecha / tiempo',values:''},
 {name:'participant_id',role:'Identificador',type:'Texto',values:''}
];
const mapping={age:'Age',group:'Group',visit_date:'Date',participant_id:'ID'};

test('validates numeric types, allowed category codes and dates',()=>{
 const rows=[
  {Age:'45',Group:'0',Date:'2026-02-28',ID:'P1'},
  {Age:'45.5',Group:'1',Date:'2026-02-30',ID:'P2'},
  {Age:'n/a',Group:'9',Date:'2026-03-01',ID:'P2'}
 ];
 const result=validateMappedRows(rows,variables,mapping);
 assert.equal(result.perVariable.age.invalidType,2);
 assert.equal(result.perVariable.group.invalidAllowed,1);
 assert.equal(result.perVariable.visit_date.invalidType,1);
 assert.deepEqual(result.duplicateIds,[{id:'P2',count:2}]);
});

test('counts missing cells and identical mapped rows without modifying input',()=>{
 const rows=[
  {Age:'40',Group:'0',Date:'2026-01-01',ID:'A'},
  {Age:'40',Group:'0',Date:'2026-01-01',ID:'A'},
  {Age:'',Group:'1',Date:'2026-01-02',ID:'B'}
 ];
 const before=JSON.stringify(rows);
 const result=validateMappedRows(rows,variables,mapping);
 assert.equal(result.emptyCells,1);
 assert.equal(result.duplicateRows,1);
 assert.equal(result.duplicateIds.length,1);
 assert.equal(JSON.stringify(rows),before);
});

test('does not impose allowed values when dictionary field is blank',()=>{
 const unrestricted=variables.map(v=>v.name==='group'?{...v,values:''}:v);
 const result=validateMappedRows([{Age:'21',Group:'Otro',Date:'2026-01-01',ID:'X'}],unrestricted,mapping);
 assert.equal(result.perVariable.group.invalidAllowed,0);
});
