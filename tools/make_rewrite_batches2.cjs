const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const ids = process.argv.slice(2);
const ctx = { console };
vm.createContext(ctx);
const files = fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]));
vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + '\n' + fs.readFileSync(path.join(DATA, 'dialogue-daily.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'daily-overrides.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'scene-reskin.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'context-rewrite.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-20.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'coverage-patch.js'), 'utf8')
  + ';globalThis.D=DIALOGS;', ctx);
const missing = ids.filter(id => !ctx.D.find(d => d.id === id));
if (missing.length) console.error('missing', missing);
for (let i = 0; i < ids.length; i += 5) {
  const batch = ids.slice(i, i + 5).map(id => ctx.D.find(d => d.id === id));
  const tag = String.fromCharCode(101 + i / 5);
  const file = path.join(ROOT, 'build', `rewrite-batch-${tag}.json`);
  fs.writeFileSync(file, JSON.stringify(batch, null, 1), 'utf8');
  console.log(file, batch.length);
}
