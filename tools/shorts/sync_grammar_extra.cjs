const fs = require('fs');
const path = require('path');
const OUT = 'C:/Users/user/Downloads/japanese-pages/build/shorts';
const manual = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-extra-manual.json'), 'utf8'));
const all = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-targets.json'), 'utf8')).targets;
const by = new Map(all.map(t => [t.kind + ' · ' + t.key, t]));
const scenes = manual.map(d => ({
  id: d.id, scene: d.scene, title: d.title, level: d.level, register: d.register,
  chars: ['jihu'], function: d.title.replace('문법 확장 — ', ''), tags: ['study'],
  targets: d.targets.map(t => {
    const x = by.get(t.kind + ' · ' + t.key) || {};
    return { kind: t.kind, key: t.key, level: x.level || d.level, note: x.note || '' };
  })
}));
fs.writeFileSync(path.join(OUT, 'grammar-extra-assignments.json'), JSON.stringify({ total: scenes.length, scenes }, null, 1), 'utf8');
console.log('updated', scenes.length, scenes.reduce((a, s) => a + s.targets.length, 0));
