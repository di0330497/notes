/* make_lessons.cjs — lesson-plan.json + 사전 데이터 → data/lessons.js
   - 각 레슨 목표에 뜻/설명 note 부여
   - 코어 3회 노출을 위해 뒤 레슨에 복습 카드 배치 (최대 4개/레슨) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const BUILD = path.join(ROOT, 'build', 'reconstruction');

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
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-final.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-n1.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'coverage-patch.js'), 'utf8')
  + ';globalThis.D=DIALOGS;', dctx);
const D = dctx.D;
const dctx2 = { console };
vm.createContext(dctx2);
vm.runInContext(['kanji-list.js', 'kanji-cards.js', 'grammar.js', 'patterns.js', 'expressions.js', 'conjugation.js',
  'pos-josa.js', 'pos-verb.js', 'pos-noun.js', 'pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js',
  'colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'slang-2026.js'].map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ';globalThis.X={STUDY_FULL,ALL,GRAMMAR,PATS,EXPR,CONJ,SPOKEN,POS_WORDS};', dctx2);
const { STUDY_FULL, ALL, GRAMMAR, PATS, EXPR, CONJ, SPOKEN, POS_WORDS } = dctx2.X;
const N = s => String(s || '').replace(/[〜～]/g, '～').replace(/[\s（）()「」]/g, '').toLowerCase();
const noteFor = (kind, key) => {
  const nk = N(key);
  if (kind === '한자') {
    const k = STUDY_FULL.find(x => x.k === key) || ALL.find(x => x[0] === key);
    if (!k) return '';
    return (k.hun ? k.hun + ' ' : '') + (k.on ? '음 ' + k.on : '') + (k.kun ? ' · 훈 ' + k.kun : '');
  }
  if (kind === '표현') {
    const e = EXPR.find(x => N(x.expr) === nk);
    return e ? (e.mean || '') : '';
  }
  if (kind === '구어체') {
    const s = SPOKEN.find(x => N(x.t) === nk);
    return s ? String(s.rule || '').split(/(?<=[.!?。！？])\s*/)[0] : '';
  }
  if (kind === '품사') {
    const w = POS_WORDS.find(x => N(x.w) === nk);
    return w ? (w.m || '') + (w.n ? ' — ' + w.n : '') : '';
  }
  if (kind === '활용표') {
    const c = CONJ.find(x => N(x.t) === nk);
    return c ? String(c.desc || '').split(/(?<=[.!?。！？])\s*/)[0] : '';
  }
  const g = GRAMMAR.find(x => N(x.t) === nk);
  if (g) return String(g.desc || '').replace('앞뒤 상황의 관계와 화자의 의도를 예문에서 함께 확인한다.', '').slice(0, 110);
  const p = PATS.find(x => N(x.pat) === nk);
  if (p) return (p.mean || '') + (p.ex ? '. 예: ' + p.ex[0].ko : '');
  return '';
};

const plan = JSON.parse(fs.readFileSync(path.join(BUILD, 'lesson-plan.json'), 'utf8'));
const lessons = plan.map(l => {
  const d = D.find(x => x.id === l.source);
  const targets = (l.targets || []).map(t => ({ ...t, note: noteFor(t.kind, t.key) })).slice(0, 5);
  return {
    id: l.id, src: l.source, part: l.part, from: l.lines[0], to: l.lines[1],
    level: l.level, scene: l.scene, goal: l.goal, targets, review: []
  };
});
/* 복습 카드: 코어 목표가 3회 미만이면 뒤 레슨에 배치 */
const core = JSON.parse(fs.readFileSync(path.join(BUILD, 'core-items.json'), 'utf8'));
const coreSet = new Set(core.map(x => x.kind + ' · ' + x.key));
const occur = new Map();
lessons.forEach((l, i) => l.targets.forEach(t => {
  const k = t.kind + ' · ' + t.key;
  if (!coreSet.has(k)) return;
  if (!occur.has(k)) occur.set(k, []);
  occur.get(k).push(i);
}));
for (const [k, idxs] of occur) {
  if (idxs.length >= 3) continue;
  const [kind, ...rest] = k.split(' · ');
  const key = rest.join(' · ');
  const intro = idxs[0];
  let next = intro + 7;
  while (idxs.length < 3 && next < lessons.length) {
    const l = lessons[next];
    if (l.review.length < 4 && !l.targets.some(t => t.kind === kind && t.key === key)) {
      const src = D.find(x => x.id === l.src);
      const line = src.lines.find(x => String(x.s).includes(key.split(' — ')[0].replace(/～/g, '')));
      l.review.push({ kind, key, from: lessons[intro].id, example: line ? line.s : '', ko: line ? line.ko : '', note: noteFor(kind, key) });
      idxs.push(next);
    }
    next += 7;
  }
}
const js = `/* lessons.js — 484레슨 코스. build/reconstruction/lesson-plan.json 기반. */
const LESSONS = ${JSON.stringify(lessons)};
`;
fs.writeFileSync(path.join(DATA, 'lessons.js'), js, 'utf8');
const withReview = lessons.filter(l => l.review.length).length;
console.log('lessons', lessons.length, 'with review', withReview, 'review cards', lessons.reduce((a, l) => a + l.review.length, 0));
