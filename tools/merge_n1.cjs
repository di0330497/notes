const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(['rewrite-n1-a.js', 'rewrite-n1-b.js'].map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ';globalThis.R=Object.assign({},REWRITE_N1_A,REWRITE_N1_B);', ctx);
const R = ctx.R;
const js = `/* rewrite-n1.js — N1 9편을 일상/캠퍼스 장면으로 전환. tags·item·줄 수 보존. */
const REWRITE_N1 = ${JSON.stringify(R)};
(function(){
  if(typeof DIALOGS==="undefined")return;
  Object.keys(REWRITE_N1).forEach(function(id){
    for(var i=0;i<DIALOGS.length;i++){
      if(DIALOGS[i].id===id){DIALOGS[i]=REWRITE_N1[id];break;}
    }
  });
})();
`;
fs.writeFileSync(path.join(DATA, 'rewrite-n1.js'), js, 'utf8');
console.log('wrote rewrite-n1.js', Object.keys(R).length);
