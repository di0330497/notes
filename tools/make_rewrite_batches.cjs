const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const ctx = { console };
vm.createContext(ctx);
const files = fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]));
vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + '\n' + fs.readFileSync(path.join(DATA, 'dialogue-daily.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'daily-overrides.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'scene-reskin.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'context-rewrite.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'coverage-patch.js'), 'utf8')
  + ';globalThis.D=DIALOGS;', ctx);
const ids = ['d33','d38','d40','d42','d43','d46','d47','d48','d49','d52','d54','d56','d57','d58','d59','d60','d61','d62','d63','d64'];
for (let i = 0; i < ids.length; i += 5) {
  const batch = ids.slice(i, i + 5).map(id => ctx.D.find(d => d.id === id));
  const file = path.join(ROOT, 'build', `rewrite-batch-${String.fromCharCode(97 + i / 5)}.json`);
  fs.writeFileSync(file, JSON.stringify(batch, null, 1), 'utf8');
  console.log(file, batch.length);
}
