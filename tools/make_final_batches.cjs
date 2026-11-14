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
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-20.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-40.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-60.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-80.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'coverage-patch.js'), 'utf8')
  + ';globalThis.D=DIALOGS;', ctx);
const D = ctx.D;
const tracks = fs.readFileSync(path.join(DATA, 'tracks.js'), 'utf8');
const m = JSON.parse(tracks.match(/const DLG_TRACK = (\{.*?\});/s)[1]);
const done = new Set(['d284', 'd238', 'd241', 'd347', 'd304']);
for (const [file, name] of [['rewrite-20.js', 'REWRITE_20'], ['rewrite-40.js', 'REWRITE_40'], ['rewrite-60.js', 'REWRITE_60'], ['rewrite-80.js', 'REWRITE_80']]) {
  const r = { console };
  vm.createContext(r);
  vm.runInContext(fs.readFileSync(path.join(DATA, file), 'utf8') + `;globalThis.R=${name};`, r);
  Object.keys(r.R).forEach(id => done.add(id));
}
const rest = D.filter(d => !done.has(d.id));
console.log('remaining', rest.length, 'done', done.size);
const chunks = [];
for (let i = 0; i < rest.length; i += 20) chunks.push(rest.slice(i, i + 20));
chunks.forEach((batch, i) => {
  const n = String(i + 1).padStart(2, '0');
  const file = path.join(ROOT, 'build', `final-${n}.json`);
  fs.writeFileSync(file, JSON.stringify(batch, null, 1), 'utf8');
  console.log(file, batch.length, batch.map(d => d.id).join(','));
});
console.log('chunks', chunks.length);
