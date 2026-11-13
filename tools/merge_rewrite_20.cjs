const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(['rewrite-a.js', 'rewrite-b.js', 'rewrite-c.js', 'rewrite-d.js']
  .map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ';globalThis.R=Object.assign({},REWRITE_A,REWRITE_B,REWRITE_C,REWRITE_D);', ctx);
const R = ctx.R;
const js = `/* rewrite-20.js — 20편 전면 재작성 (d33~d64 중 20편). tags·item 보존.
   tools/make_rewrite_batches.cjs + rewrite-a~d.js 로 생성. */
const REWRITE_20 = ${JSON.stringify(R, null, 0)};
(function(){
  if(typeof DIALOGS==="undefined")return;
  Object.keys(REWRITE_20).forEach(function(id){
    for(var i=0;i<DIALOGS.length;i++){
      if(DIALOGS[i].id===id){DIALOGS[i]=REWRITE_20[id];break;}
    }
  });
})();
`;
fs.writeFileSync(path.join(DATA, 'rewrite-20.js'), js, 'utf8');
console.log('wrote rewrite-20.js', Object.keys(R).length, 'dialogues');
