const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
/* 기존 대화(타깃 포함) 로드 */
const dctx = { console };
vm.createContext(dctx);
const dfiles = fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]));
vm.runInContext(dfiles.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + '\n' + fs.readFileSync(path.join(DATA, 'dialogue-daily.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'daily-overrides.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'scene-reskin.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'context-rewrite.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-20.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-40.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-60.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-80.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'targets-auto.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'coverage-patch.js'), 'utf8')
  + ';globalThis.D=DIALOGS;', dctx);
const D = dctx.D;
const files = fs.readdirSync(DATA).filter(f => /^final-\d+\.js$/.test(f)).sort();
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ';globalThis.R=Object.assign({},' + files.map(f => 'FINAL_' + f.match(/\d+/)[0]).join(',') + ');', ctx);
const R = ctx.R;
let t = 0;
for (const id of Object.keys(R)) {
  const old = D.find(d => d.id === id);
  if (!old) continue;
  if (!R[id].targets && old.targets) { R[id].targets = old.targets; t++; }
  if (!R[id].points && old.points) R[id].points = old.points;
}
const js = `/* rewrite-final.js — 남은 247편 전면 재작성. tags·item·줄 수·targets 보존. */
const REWRITE_FINAL = ${JSON.stringify(R)};
(function(){
  if(typeof DIALOGS==="undefined")return;
  Object.keys(REWRITE_FINAL).forEach(function(id){
    for(var i=0;i<DIALOGS.length;i++){
      if(DIALOGS[i].id===id){DIALOGS[i]=REWRITE_FINAL[id];break;}
    }
  });
})();
`;
fs.writeFileSync(path.join(DATA, 'rewrite-final.js'), js, 'utf8');
console.log('wrote rewrite-final.js', Object.keys(R).length, 'targets copied', t, (js.length / 1024 / 1024).toFixed(2) + 'MB');
