/* build_grammar_extra.cjs — 미배정 문법 20개를 5개 읽기 쇼츠로 */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const a = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-assignments.json'), 'utf8')).scenes;
const all = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-targets.json'), 'utf8')).targets;
const used = new Set(); for (const s of a) for (const t of s.targets) used.add(t.kind + ' · ' + t.key);
const un = all.filter(t => !used.has(t.kind + ' · ' + t.key));
const themes = [
  ['조건·필연', '조건이 반복되면 한이 없다는 뜻과, ~해야 비로소, ~해서야, ~하면 그만이다를 함께 쓴다.'],
  ['한계·전환', '무리·경계·직전·화제 전환을 나타내는 문형을 한 편에 묶는다.'],
  ['예외·시간', '~라면 몰라도, ~고 나서부터, ~하는 김에, ~없이는을 쓴다.'],
  ['정도·강조', '수단·한정·감정·제외를 나타내는 문형을 쓴다.'],
  ['격식·의지', '격식체 인사와 의지·당연을 나타내는 문형을 쓴다.']
];
const groups = [];
for (let i = 0; i < 5; i++) groups.push(un.slice(i * 4, i * 4 + 4));
const scenes = groups.map((ts, i) => ({
  id: 'x' + String(i + 1).padStart(3, '0'),
  scene: '문법 확장', title: '문법 확장 — ' + themes[i][0],
  level: 'N2', register: 'written', chars: ['jihu'],
  function: themes[i][1], tags: ['study'],
  targets: ts.map(t => ({ kind: t.kind, key: t.key, level: t.level, note: t.note }))
}));
fs.writeFileSync(path.join(OUT, 'grammar-extra-assignments.json'), JSON.stringify({ total: scenes.length, scenes }, null, 1), 'utf8');
console.log('unused', un.length, 'scenes', scenes.length, 'targets', scenes.reduce((x, s) => x + s.targets.length, 0));
