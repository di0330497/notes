const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(['rewrite-e.js', 'rewrite-f.js', 'rewrite-g.js', 'rewrite-h.js']
  .map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ';globalThis.R=Object.assign({},REWRITE_E,REWRITE_F,REWRITE_G,REWRITE_H);', ctx);
const R = ctx.R;
const js = `/* rewrite-40.js — 20편 추가 전면 재작성 (rewrite-e~h). tags·item 보존. */
const REWRITE_40 = ${JSON.stringify(R, null, 0)};
(function(){
  if(typeof DIALOGS==="undefined")return;
  Object.keys(REWRITE_40).forEach(function(id){
    for(var i=0;i<DIALOGS.length;i++){
      if(DIALOGS[i].id===id){DIALOGS[i]=REWRITE_40[id];break;}
    }
  });
})();
`;
fs.writeFileSync(path.join(DATA, 'rewrite-40.js'), js, 'utf8');
console.log('wrote rewrite-40.js', Object.keys(R).length);
