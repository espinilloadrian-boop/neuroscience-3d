import test from 'node:test';
import assert from 'node:assert/strict';
import {welchTTest,compareIndependentGroups} from '../src/research-inference.js';
test('Welch detects a clear difference and reports CI and effect size',()=>{const r=welchTTest([1,2,3,4,5],[8,9,10,11,12]);assert.equal(r.valid,true);assert.ok(r.p<.001);assert.ok(r.ci95[0]>0);assert.ok(r.hedgesG>0);assert.ok(r.df>0);});
test('Welch handles unequal variances without pooled variance in its test',()=>{const r=welchTTest([1,2,3,4],[2,4,8,16]);assert.equal(r.valid,true);assert.ok(r.se>0);assert.ok(r.df>0);});
test('insufficient and zero-variance samples are guarded',()=>{assert.equal(welchTTest([1],[2,3]).valid,false);assert.equal(welchTTest([2,2,2],[2,2,2]).valid,false);});
test('group comparison excludes missing values and keeps group labels',()=>{const rows=[{g:'A',y:1},{g:'A',y:2},{g:'A',y:null},{g:'B',y:8},{g:'B',y:9}];const r=compareIndependentGroups(rows,{groupField:'g',outcomeField:'y',groupA:'A',groupB:'B'});assert.equal(r.n1,2);assert.equal(r.n2,2);assert.equal(r.excludedMissingOrInvalid,1);assert.equal(r.groupA,'A');});

import {welchAnova,compareIndependentMultipleGroups} from '../src/research-inference.js';
test('Welch ANOVA compares three independent groups and applies Holm adjustment',()=>{
 const r=welchAnova([{label:'Control',values:[1,2,3,4,5]},{label:'DCL',values:[4,5,6,7,8]},{label:'EA',values:[9,10,11,12,13]}]);
 assert.equal(r.valid,true);assert.equal(r.k,3);assert.ok(r.p<.001);assert.equal(r.pairwise.length,3);
 const sorted=[...r.pairwise].sort((a,b)=>a.p-b.p);assert.ok(sorted[0].pHolm<=sorted[1].pHolm);assert.ok(sorted[1].pHolm<=sorted[2].pHolm);
});
test('Welch ANOVA rejects too few groups and zero variance groups',()=>{
 assert.equal(welchAnova([{label:'A',values:[1,2]},{label:'B',values:[2,3]}]).valid,false);
 assert.equal(welchAnova([{label:'A',values:[1,1,1]},{label:'B',values:[2,3,4]},{label:'C',values:[4,5,6]}]).valid,false);
});
test('multiple-group row adapter counts missing values',()=>{
 const rows=[{g:'A',y:1},{g:'A',y:2},{g:'A',y:null},{g:'B',y:4},{g:'B',y:5},{g:'C',y:7},{g:'C',y:8}];
 const r=compareIndependentMultipleGroups(rows,{groupField:'g',outcomeField:'y'});
 assert.equal(r.valid,true);assert.equal(r.k,3);assert.equal(r.excludedMissingOrInvalid,1);
});

import {compareCategoricalGroups} from '../src/research-inference.js';
test('Pearson chi-square evaluates a sufficiently populated 2x2 table',()=>{
 const rows=[...Array(40)].map((_,i)=>({g:i<20?'Control':'EA',y:i%20<15?'No':'Sí'}));
 const r=compareCategoricalGroups(rows,{groupField:'g',outcomeField:'y'});
 assert.equal(r.valid,true);assert.equal(r.method,'Chi-cuadrado de Pearson');assert.equal(r.df,1);assert.ok(r.p>=0&&r.p<=1);
});
test('Fisher exact is selected for sparse 2x2 tables',()=>{
 const rows=[{g:'A',y:'Sí'},{g:'A',y:'No'},{g:'B',y:'Sí'},{g:'B',y:'Sí'}];
 const r=compareCategoricalGroups(rows,{groupField:'g',outcomeField:'y'});
 assert.equal(r.valid,true);assert.equal(r.method,'Prueba exacta de Fisher bilateral');assert.ok(r.p>=0&&r.p<=1);
});
test('sparse RxC table is not forced into an invalid chi-square approximation',()=>{
 const rows=[{g:'A',y:'x'},{g:'A',y:'x'},{g:'B',y:'y'},{g:'C',y:'z'}];
 const r=compareCategoricalGroups(rows,{groupField:'g',outcomeField:'y'});
 assert.equal(r.valid,false);assert.match(r.reason,/frecuencias esperadas/);
});
