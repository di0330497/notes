/* assign_grammar.cjs — 문법·문형·구어체 745개 + 활용표 25개를 150 장면에 */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const scenes = JSON.parse(fs.readFileSync(path.join(OUT, 'scenes.json'), 'utf8')).scenes.map(s => ({ ...s, targets: [] }));
const all = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-targets.json'), 'utf8')).targets;

const rank = { N5: 5, N4: 4, N3: 3, N2: 2, N1: 1 };
function family(key) {
  const b = String(key).replace(/[〜～]/g, '').split(/[（(]/)[0].trim();
  if (/^(て|で)/.test(b)) return 'te';
  if (/^(ない|なか|ず|まい)/.test(b)) return 'nai';
  if (/^(ば|たら|なら|と$)/.test(b)) return 'cond';
  if (/^(ても|でも)/.test(b)) return 'concession';
  if (/^(ように|ために|には|のに)/.test(b)) return 'purpose';
  if (/^(そう|ようだ|らしい|みたい|かもしれない|でしょう|だろう)/.test(b)) return 'conjecture';
  if (/^(くれる|もらう|あげる|いただく|くださる|やる)/.test(b)) return 'giving';
  if (/^(お|ご)/.test(b)) return 'honorific';
  if (/^(れる|られる|させる|させられる|せる)/.test(b)) return 'voice';
  if (/^(から|ので|ため|おかげ|せい)/.test(b)) return 'cause';
  if (/^(のに|けれど|けど|が$|くせに|ものの)/.test(b)) return 'concession';
  if (/^(まで|だけ|しか|ばかり|ほど|くらい|ぐらい|など|なんか)/.test(b)) return 'limit';
  if (/^(より|ほう|に比べ|ほど)/.test(b)) return 'compare';
  if (/^(とき|前|後|ながら|うちに|てから|たび|あいだ|間)/.test(b)) return 'time';
  if (/^(という|って|と$|との|とか)/.test(b)) return 'quote';
  if (/^(ある|いる|なる|する|できる)/.test(b)) return 'basic';
  return 'misc';
}
const conj = all.filter(t => t.kind === '활용표');
const grammar = all.filter(t => t.kind !== '활용표');
for (const t of grammar) t.family = family(t.key);

/* 가족·레벨 묶음 */
const groups = new Map();
for (const t of grammar) {
  const k = t.family + '|' + t.level;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(t);
}
const keys = [...groups.keys()].sort((a, b) => (groups.get(b).length - groups.get(a).length));

function pickGrammar(scene, n) {
  const out = [];
  const want = scene.level;
  /* 같은 가족·레벨 우선 */
  for (const k of keys) {
    if (out.length >= n) break;
    const [fam, lv] = k.split('|');
    if (lv !== want) continue;
    for (const t of groups.get(k)) {
      if (out.length >= n) break;
      if (!t.used) { t.used = true; out.push(t); }
    }
  }
  /* 같은 레벨 */
  if (out.length < n) {
    for (const t of grammar) {
      if (out.length >= n) break;
      if (!t.used && t.level === want) { t.used = true; out.push(t); }
    }
  }
  /* 아무거나 */
  if (out.length < n) {
    for (const t of grammar) {
      if (out.length >= n) break;
      if (!t.used) { t.used = true; out.push(t); }
    }
  }
  return out;
}

let ci = 0;
scenes.forEach((s, i) => {
  const useConj = (i % 6 === 0) && ci < conj.length;
  const need = useConj ? 4 : 5;
  const gt = pickGrammar(s, need);
  s.targets.push(...gt);
  if (useConj) s.targets.push(conj[ci++]);
  s.targets = s.targets.slice(0, 5);
});

const result = scenes.map(s => ({
  id: 'g' + s.id.slice(2),
  scene: s.scene, title: s.scene + ' — ' + s.function + ' 문법', level: s.level, register: s.register,
  chars: s.chars, function: s.function, tags: s.tags,
  targets: s.targets.map(t => ({ kind: t.kind, key: t.key, level: t.level, note: t.note, family: t.family || 'misc' }))
}));
fs.writeFileSync(path.join(OUT, 'grammar-assignments.json'), JSON.stringify({ total: result.length, scenes: result }, null, 1), 'utf8');
const assigned = result.reduce((a, s) => a + s.targets.length, 0);
const hist = {}; result.forEach(s => hist[s.targets.length] = (hist[s.targets.length] || 0) + 1);
console.log('scenes', result.length, 'assigned', assigned, 'unused grammar', grammar.filter(t => !t.used).length, 'conj used', ci, 'hist', hist);
