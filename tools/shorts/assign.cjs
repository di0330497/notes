/* assign.cjs — 코어 506개를 150 장면에 3~4개씩 배정
   - 장면마다 한자 1, 표현 0~1, 문법/문형/구어체 1~2, 품사 0~1
   - 태그·레벨 적합도 우선, 수용량 4
*/
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const core = JSON.parse(fs.readFileSync(path.join(OUT, 'core-targets.json'), 'utf8')).targets;
const sceneData = JSON.parse(fs.readFileSync(path.join(OUT, 'scenes.json'), 'utf8')).scenes;

const scenes = sceneData.map(s => ({ ...s, targets: [], kinds: {} }));
const rank = { 'N5': 5, 'N4': 4, 'N3': 3, 'N2': 2, 'N1': 1, '': 3 };
function levelScore(a, b) {
  const x = rank[a] || 3, y = rank[b] || 3;
  const d = Math.abs(x - y);
  return d === 0 ? 4 : d === 1 ? 2 : 0;
}
function score(item, scene) {
  const hits = (item.scenes || []).filter(t => scene.tags.includes(t)).length;
  return hits * 12 + levelScore(item.level, scene.level);
}
function canTake(scene, item) {
  if (scene.targets.length >= 4) return false;
  const n = scene.kinds[item.kind] || 0;
  if (item.kind === '한자') return n < 1;
  if (item.kind === '표현') return n < 1;
  if (item.kind === '품사') return n < 1;
  return n < 2; // 문법/문형/구어체
}
function place(item) {
  let best = null, bestScore = -1;
  for (const s of scenes) {
    if (!canTake(s, item)) continue;
    const sc = score(item, s);
    if (sc > bestScore) { best = s; bestScore = sc; }
  }
  if (!best) {
    // 수용량 완화: 4개까지, 종류 제한만 유지
    for (const s of scenes) {
      if (s.targets.length >= 5) continue;
      const n = s.kinds[item.kind] || 0;
      const ok = item.kind === '한자' ? n < 1 : item.kind === '표현' ? n < 1 : item.kind === '품사' ? n < 1 : n < 3;
      if (!ok) continue;
      const sc = score(item, s);
      if (sc > bestScore) { best = s; bestScore = sc; }
    }
  }
  if (best) {
    best.targets.push(item);
    best.kinds[item.kind] = (best.kinds[item.kind] || 0) + 1;
  }
  return !!best;
}

const byKind = { '한자': [], '표현': [], '품사': [], '문법/문형': [] };
for (const x of core) {
  if (x.kind === '한자' || x.kind === '표현' || x.kind === '품사') byKind[x.kind].push(x);
  else byKind['문법/문형'].push(x);
}
const order = ['한자', '표현', '문법/문형', '품사'];
const failed = [];
for (const kind of order) {
  const pool = byKind[kind].sort((a, b) => {
    const ca = scenes.filter(s => canTake(s, a)).length;
    const cb = scenes.filter(s => canTake(s, b)).length;
    return ca - cb;
  });
  for (const item of pool) if (!place(item)) failed.push(item);
}
/* 3개 미만 장면 보정: 4개 장면에서 옮긴다 */
for (let pass = 0; pass < 5; pass++) {
  const low = scenes.filter(s => s.targets.length < 3);
  if (!low.length) break;
  for (const s of low) {
    const donors = scenes.filter(d => d.targets.length === 4 && d.targets.some(t => score(t, s) > 0));
    if (!donors.length) continue;
    const d = donors[0];
    const idx = d.targets.findIndex(t => score(t, s) > 0);
    if (idx < 0) continue;
    const [t] = d.targets.splice(idx, 1);
    d.kinds[t.kind]--;
    s.targets.push(t); s.kinds[t.kind] = (s.kinds[t.kind] || 0) + 1;
  }
}

const result = scenes.map(s => ({
  id: s.id, scene: s.scene, title: s.title, level: s.level, register: s.register,
  chars: s.chars, function: s.function, tags: s.tags,
  targets: s.targets.map(t => ({ kind: t.kind, key: t.key, level: t.level, note: t.note, examples: t.examples, scenes: t.scenes }))
}));
fs.writeFileSync(path.join(OUT, 'assignments.json'), JSON.stringify({ total: result.length, scenes: result }, null, 1), 'utf8');
const counts = result.map(s => s.targets.length);
const hist = {}; for (const n of counts) hist[n] = (hist[n] || 0) + 1;
const assigned = result.reduce((a, s) => a + s.targets.length, 0);
console.log('scenes', result.length, 'assigned', assigned, 'failed', failed.length, 'target hist', hist);
console.log('failed', failed.slice(0, 20).map(x => x.kind + ' ' + x.key));
