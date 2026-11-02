import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCSV,normalizeResearchRows,pearson,spearman,pairwiseAuc,kruskalWallis,dunnPostHoc} from '../src/research-analysis.js';

test('CSV parser preserves quoted commas and escaped quotes',()=>{
 const rows=parseCSV('group,participant_id,note\nControl,1,"animal, ""gato"""');
 assert.equal(rows[0].note,'animal, "gato"');
});
test('normalization flags invalid numerics and duplicate IDs',()=>{
 const n=normalizeResearchRows([{group:'A',participant_id:'1',total_words:'10'},{group:'A',participant_id:'1',total_words:'n/a'}]);
 assert.equal(n.invalidNumeric.total_words,1);assert.deepEqual(n.duplicateIds,['1']);assert.equal(n.rows[1].total_words,null);
});
test('Pearson and Spearman recover perfect monotonic association',()=>{
 assert.ok(Math.abs(pearson([1,2,3],[2,4,6]).r-1)<1e-12);
 assert.ok(Math.abs(spearman([1,2,3],[9,4,1]).rho+1)<1e-12);
});
test('AUC is oriented to the second group as positive',()=>{
 const rows=[{group:'A',v:1},{group:'A',v:2},{group:'B',v:3},{group:'B',v:4}];
 assert.equal(pairwiseAuc(rows,'v','A','B').auc,1);
 assert.equal(pairwiseAuc(rows,'v','B','A').auc,0);
});
test('Kruskal-Wallis and Dunn-Holm detect separated groups',()=>{
 const rows=[1,2,3,10,11,12,20,21,22].map((v,i)=>({group:['A','B','C'][Math.floor(i/3)],v}));
 const kw=kruskalWallis(rows,'v');assert.ok(kw.H>0);assert.ok(kw.p<.05);
 const post=dunnPostHoc(rows,'v');assert.equal(post.length,3);assert.ok(post.every(x=>x.pHolm>=x.p&&x.pHolm<=1));
});
