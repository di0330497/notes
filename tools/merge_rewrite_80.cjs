const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(['rewrite-m.js', 'rewrite-n.js', 'rewrite-o.js', 'rewrite-p.js']
  .map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ';globalThis.R=Object.assign({},REWRITE_M,REWRITE_N,REWRITE_O,REWRITE_P);', ctx);
const R = ctx.R;
const js = `/* rewrite-80.js — 20편 추가 전면 재작성 (rewrite-m~p). tags·item 보존. */
const REWRITE_80 = ${JSON.stringify(R, null, 0)};
(function(){
  if(typeof DIALOGS==="undefined")return;
  Object.keys(REWRITE_80).forEach(function(id){
    for(var i=0;i<DIALOGS.length;i++){
      if(DIALOGS[i].id===id){DIALOGS[i]=REWRITE_80[id];break;}
    }
  });
})();
`;
fs.writeFileSync(path.join(DATA, 'rewrite-80.js'), js, 'utf8');
console.log('wrote rewrite-80.js', Object.keys(R).length);
