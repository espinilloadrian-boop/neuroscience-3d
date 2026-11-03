import test from 'node:test';
import assert from 'node:assert/strict';
import {welchTTest,compareIndependentGroups} from '../src/research-inference.js';
test('Welch detects a clear difference and reports CI and effect size',()=>{const r=welchTTest([1,2,3,4,5],[8,9,10,11,12]);assert.equal(r.valid,true);assert.ok(r.p<.001);assert.ok(r.ci95[0]>0);assert.ok(r.hedgesG>0);assert.ok(r.df>0);});
test('Welch handles unequal variances without pooled variance in its test',()=>{const r=welchTTest([1,2,3,4],[2,4,8,16]);assert.equal(r.valid,true);assert.ok(r.se>0);assert.ok(r.df>0);});
test('insufficient and zero-variance samples are guarded',()=>{assert.equal(welchTTest([1],[2,3]).valid,false);assert.equal(welchTTest([2,2,2],[2,2,2]).valid,false);});
test('group comparison excludes missing values and keeps group labels',()=>{const rows=[{g:'A',y:1},{g:'A',y:2},{g:'A',y:null},{g:'B',y:8},{g:'B',y:9}];const r=compareIndependentGroups(rows,{groupField:'g',outcomeField:'y',groupA:'A',groupB:'B'});assert.equal(r.n1,2);assert.equal(r.n2,2);assert.equal(r.excludedMissingOrInvalid,1);assert.equal(r.groupA,'A');});
