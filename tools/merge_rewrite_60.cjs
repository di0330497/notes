const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(['rewrite-i.js', 'rewrite-j.js', 'rewrite-k.js', 'rewrite-l.js']
  .map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ';globalThis.R=Object.assign({},REWRITE_I,REWRITE_J,REWRITE_K,REWRITE_L);', ctx);
const R = ctx.R;
const js = `/* rewrite-60.js — 20편 추가 전면 재작성 (rewrite-i~l). tags·item 보존. */
const REWRITE_60 = ${JSON.stringify(R, null, 0)};
(function(){
  if(typeof DIALOGS==="undefined")return;
  Object.keys(REWRITE_60).forEach(function(id){
    for(var i=0;i<DIALOGS.length;i++){
      if(DIALOGS[i].id===id){DIALOGS[i]=REWRITE_60[id];break;}
    }
  });
})();
`;
fs.writeFileSync(path.join(DATA, 'rewrite-60.js'), js, 'utf8');
console.log('wrote rewrite-60.js', Object.keys(R).length);
