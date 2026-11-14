/* build_core_targets.cjs — 코어 700 중 대화에 넣을 수 있는 항목만 추린다
   - 문법은 ～ 패턴만, 구어체는 ～ 패턴만, 활용표는 참고로 제외
   - inventory.json 의 예문·장면 태그를 붙인다
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const BUILD = path.join(ROOT, 'build');
const OUT = path.join(BUILD, 'shorts');
fs.mkdirSync(OUT, { recursive: true });

const core = JSON.parse(fs.readFileSync(path.join(BUILD, 'reconstruction', 'core-items.json'), 'utf8'));
const inv = JSON.parse(fs.readFileSync(path.join(OUT, 'inventory.json'), 'utf8'));
const norm = s => String(s || '').replace(/[〜～]/g, '～').replace(/[\s（）()「」、。,.!?！？·・／/]/g, '').toLowerCase();
const byKey = new Map();
for (const x of inv.items) {
  const k = x.kind + '|' + norm(x.key);
  if (!byKey.has(k)) byKey.set(k, x);
}

const targets = [];
for (const x of core) {
  if (x.kind === '활용표') continue;
  if (x.kind === '문법' && !/[～〜]/.test(x.key)) continue;
  if (x.kind === '구어체' && !/[～〜]/.test(x.key)) continue;
  const hit = byKey.get(x.kind + '|' + norm(x.key));
  targets.push({
    id: x.kind + ' · ' + x.key,
    kind: x.kind,
    key: x.key,
    level: x.level || (hit && hit.level) || '',
    note: (hit && hit.note) || '',
    examples: (hit && hit.examples) || [],
    scenes: (hit && hit.scenes) || []
  });
}
fs.writeFileSync(path.join(OUT, 'core-targets.json'), JSON.stringify({ total: targets.length, targets }, null, 1), 'utf8');
const byKind = {};
for (const t of targets) byKind[t.kind] = (byKind[t.kind] || 0) + 1;
console.log('core targets', targets.length, byKind);
console.log('no scene tags', targets.filter(t => !t.scenes.length).length);
console.log('no note', targets.filter(t => !t.note).length);
