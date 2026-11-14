/* make_lessons.cjs — lesson-plan.json + 대화 원문 → data/lessons.js
   - 목표는 반드시 그 레슨 본문에 실제로 나오는 항목만 고른다.
   - 태그 → 줄별 item → 사전 직접 일치 → 본문 한자 순으로 채운다.
   - 복습 카드는 앞 레슨에서 배운 항목이 이 레슨 본문에 다시 나올 때만 붙인다.
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const BUILD = path.join(ROOT, 'build', 'reconstruction');

/* ── 대화 로드 ── */
const dctx = { console };
vm.createContext(dctx);
const dfiles = fs.readdirSync(DATA)
  .filter(f => /^dialogue-[0-9]+\.js$/.test(f))
  .sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]));
vm.runInContext(
  dfiles.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ['dialogue-daily.js', 'daily-overrides.js', 'scene-reskin.js', 'context-rewrite.js',
    'rewrite-20.js', 'rewrite-40.js', 'rewrite-60.js', 'rewrite-80.js', 'rewrite-final.js',
    'rewrite-n1.js', 'coverage-patch.js']
    .map(f => '\n' + fs.readFileSync(path.join(DATA, f), 'utf8')).join('')
  + ';globalThis.D=DIALOGS;',
  dctx);
const D = dctx.D;
const byId = new Map(D.map(d => [d.id, d]));

/* ── 사전 로드 ── */
const xctx = { console };
vm.createContext(xctx);
vm.runInContext(
  ['kanji-list.js', 'kanji-cards.js', 'grammar.js', 'patterns.js', 'expressions.js', 'conjugation.js',
    'pos-josa.js', 'pos-verb.js', 'pos-noun.js', 'pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js',
    'colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'slang-2026.js']
    .map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ';globalThis.X={STUDY_FULL,ALL,GRAMMAR,PATS,EXPR,CONJ,SPOKEN,POS_WORDS};',
  xctx);
const { STUDY_FULL, ALL, GRAMMAR, PATS, EXPR, CONJ, SPOKEN, POS_WORDS } = xctx.X;
const KANJI = new Map(STUDY_FULL.map(x => [x.k, x]));

/* ── 표기 정리 ── */
const strip = s => String(s || '')
  .replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1')
  .replace(/\{([^{}]+)\}/g, '$1')
  .replace(/\[([^\]]+)\]/g, '$1');
const N = s => String(s || '').replace(/[〜～]/g, '～').replace(/[\s（）()「」、。,.!?！？·・／/]/g, '').toLowerCase();

/* 목표 키에서 표시용/검색용 조각을 뽑는다 */
const GENERIC = new Set([
  'の', 'を', 'が', 'に', 'で', 'へ', 'と', 'も', 'は', 'か', 'や', 'ね', 'よ', 'な', 'だ',
  'です', 'ます', 'ました', 'ません', 'でした', 'だった', 'から', 'まで', 'より', 'ほど', 'くらい', 'ぐらい',
  'こと', 'もの', 'ところ', 'わけ', 'はず', 'つもり', 'よう', 'そう', 'らしい', 'みたい',
  'てく', 'でく', 'ちゃ', 'じゃ', 'たって', 'だって'
]);
function keyPieces(key) {
  let base = String(key || '').trim();
  base = base.split(/\s+—\s+/)[0];
  base = base.replace(/[（(].*$/, '').trim();
  return base.split(/\s*(?:→|\/|／)\s*/)
    .map(x => x.trim().replace(/\s+/g, ''))
    .filter(Boolean);
}
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function makeRe(key) {
  let pieces = keyPieces(key);
  /* 대안 표기(～てく / ～てくる)는 짧은 쪽이 다른 단어 속에 걸린다.
     여러 대안이면 3자 이상만 쓰고, 전부 짧으면 가장 긴 것만 쓴다. */
  if (pieces.length > 1) {
    const long = pieces.filter(p => p.replace(/[～〜]/g, '').length >= 3);
    if (long.length) pieces = long;
    else {
      const max = Math.max(...pieces.map(p => p.replace(/[～〜]/g, '').length));
      pieces = pieces.filter(p => p.replace(/[～〜]/g, '').length === max);
    }
  }
  const out = [];
  for (const piece of pieces) {
    const segs = piece.split(/[～〜]/).map(x => x.trim());
    if (segs.every(x => !x)) continue;
    let src;
    if (segs.length === 1) src = escRe(segs[0]);
    else src = segs.map((x, i) => {
      if (i === 0) return x ? escRe(x) : '';
      if (i === segs.length - 1) return x ? '.*?' + escRe(x) : '.*?';
      return '.*?' + escRe(x);
    }).join('');
    if (!src) continue;
    out.push(new RegExp(src));
  }
  return out;
}
function isSpecific(key) {
  const pieces = keyPieces(key);
  if (!pieces.length) return false;
  return pieces.some(p => {
    const bare = p.replace(/[～〜]/g, '');
    return bare.length >= 2 && !GENERIC.has(bare);
  });
}
function findLine(lines, key, re) {
  const rs = re || makeRe(key);
  if (!rs.length) return null;
  for (let i = 0; i < lines.length; i++) {
    const t = strip(lines[i].s);
    if (rs.some(r => r.test(t))) return i;
  }
  return null;
}

/* ── 목표 설명 ── */
function pick(arr, field, key) {
  const n = N(key);
  const bare = n.replace(/[（(].*$/, '');
  return arr.find(x => N(x[field]) === n)
    || arr.find(x => N(x[field]) === bare)
    || arr.find(x => N(x[field]).startsWith(bare) || bare.startsWith(N(x[field])));
}
function noteFor(kind, key) {
  if (kind === '한자') {
    const k = KANJI.get(key) || ALL.find(x => x[0] === key);
    if (!k) return '';
    if (k.hun) return k.hun + (k.on ? ' · 음 ' + k.on : '') + (k.kun ? ' · 훈 ' + k.kun : '');
    return [k[1], k[2], k[3]].filter(Boolean).join(' · ');
  }
  if (kind === '표현') {
    const e = pick(EXPR, 'expr', key);
    return e ? (e.mean || '') : '';
  }
  if (kind === '구어체') {
    const s = pick(SPOKEN, 't', key);
    return s ? String(s.rule || '').split(/(?<=[.!?。！？])\s*/)[0] : '';
  }
  if (kind === '품사') {
    const w = pick(POS_WORDS, 'w', key);
    return w ? (w.m || '') + (w.n ? ' — ' + w.n : '') : '';
  }
  if (kind === '활용표') {
    const c = pick(CONJ, 't', key);
    return c ? String(c.desc || '').split(/(?<=[.!?。！？])\s*/)[0] : '';
  }
  const g = pick(GRAMMAR, 't', key);
  if (g) return String(g.desc || '').replace('앞뒤 상황의 관계와 화자의 의도를 예문에서 함께 확인한다.', '').trim().slice(0, 120);
  const p = pick(PATS, 'pat', key);
  if (p) return (p.mean || '') + (p.ex && p.ex[0] ? '. 예: ' + p.ex[0].ko : '');
  return '';
}

/* ── 사전 직접 일치 후보 ──
   문법·문형은 짧은 조각이 본문 어디에나 걸려 문맥과 어긋난다.
   직접 훑기는 뜻이 분명한 표현만 허용하고, 문법·문형은 대화 태그로만 받는다. */
const DIRECT = [];
function addDirect(kind, key) {
  const re = makeRe(key);
  if (!re.length) return;
  if (!isSpecific(key)) return;
  /* 짧은 감탄사·접속사는 목표로 삼기에 약하다. 4자 이상 표현만 보탠다. */
  const longest = Math.max(...keyPieces(key).map(p => p.replace(/[～〜]/g, '').length));
  if (longest < 4) return;
  DIRECT.push({ kind, key, re, note: noteFor(kind, key) });
}
EXPR.forEach(e => addDirect('표현', e.expr));

const plan = JSON.parse(fs.readFileSync(path.join(BUILD, 'lesson-plan.json'), 'utf8'));
const usedTag = new Set();
const lessons = plan.map((l, li) => {
  const d = byId.get(l.source);
  if (!d) return null;
  const [from, to] = l.lines;
  const lines = d.lines.slice(from, to);
  const body = strip(lines.map(x => x.s).join('\n'));
  const targets = [];
  const seen = new Set();
  const push = (kind, key, line, source) => {
    const k = kind + ' · ' + key;
    if (seen.has(k) || targets.length >= 5) return;
    if (kind !== '한자' && !isSpecific(key)) return;
    seen.add(k);
    targets.push({ kind, key, line: line == null ? 0 : line, source, note: noteFor(kind, key) });
  };

  /* 1) 대화 태그 — 이 파트 본문에 실제로 나오는 것만, 대화별 1회 */
  for (const t of (d.tags || [])) {
    if (!Array.isArray(t)) continue;
    if (t[0] !== '한자' && !isSpecific(t[1])) continue;
    const tagKey = l.source + '|' + t[0] + '|' + t[1];
    if (usedTag.has(tagKey)) continue;
    const at = findLine(lines, t[1]);
    if (at == null) continue;
    usedTag.add(tagKey);
    push(t[0], t[1], at, 'tag');
  }

  /* 2) 줄별 item — 그 줄에 실제로 나오는 것만 */
  lines.forEach((ln, i) => {
    const m = String(ln.item || '').match(/^([^ ·]+)\s*·\s*(.+)$/);
    if (!m) return;
    if (findLine([ln], m[2]) == null) return;
    push(m[1], m[2], i, 'line');
  });

  /* 3) 사전 직접 일치 — 긴 키 우선 */
  if (targets.length < 5) {
    const hits = [];
    for (const c of DIRECT) {
      if (seen.has(c.kind + ' · ' + c.key)) continue;
      const at = findLine(lines, c.key, c.re);
      if (at == null) continue;
      hits.push({ c, at, len: keyPieces(c.key).join('').replace(/[～〜]/g, '').length });
    }
    hits.sort((a, b) => b.len - a.len);
    for (const h of hits) {
      if (targets.length >= 5) break;
      push(h.c.kind, h.c.key, h.at, 'dict');
    }
  }

  /* 4) 본문 한자 — 그래도 3개 미만이면 */
  if (targets.length < 3) {
    const freq = new Map();
    for (const ln of lines) {
      for (const ch of strip(ln.s)) {
        if (!/[\u4e00-\u9faf]/.test(ch)) continue;
        freq.set(ch, (freq.get(ch) || 0) + 1);
      }
    }
    const chars = [...freq.entries()]
      .filter(([ch]) => KANJI.has(ch))
      .sort((a, b) => b[1] - a[1]);
    for (const [ch] of chars) {
      if (targets.length >= 5) break;
      const at = findLine(lines, ch);
      push('한자', ch, at, 'kanji');
    }
  }

  return {
    id: l.id, src: l.source, part: l.part, from, to,
    level: l.level, scene: l.scene, goal: l.goal,
    targets, review: []
  };
}).filter(Boolean);

/* ── 복습: 앞 레슨에서 배운 항목이 이 본문에 다시 나올 때만 ── */
const taught = new Map();
lessons.forEach((l, li) => {
  const d = byId.get(l.src);
  const lines = d.lines.slice(l.from, l.to);
  const have = new Set(l.targets.map(t => t.kind + ' · ' + t.key));
  const cand = [...taught.values()]
    .filter(t => li - t.idx <= 60 && !have.has(t.kind + ' · ' + t.key))
    .sort((a, b) => (a.kind === '한자' ? 1 : 0) - (b.kind === '한자' ? 1 : 0) || b.idx - a.idx);
  for (const t of cand) {
    if (l.review.length >= 3) break;
    const at = findLine(lines, t.key, t.re);
    if (at == null) continue;
    l.review.push({
      kind: t.kind, key: t.key, from: t.firstId,
      example: lines[at].s, ko: lines[at].ko || '', note: t.note
    });
  }
  for (const t of l.targets) {
    const k = t.kind + ' · ' + t.key;
    if (!taught.has(k)) {
      taught.set(k, { kind: t.kind, key: t.key, note: t.note, firstId: l.id, idx: li, re: makeRe(t.key) });
    }
  }
});

const js = `/* lessons.js — 484레슨 코스. build/reconstruction/lesson-plan.json 기반.
   목표·복습은 모두 해당 레슨 본문에 실제로 나오는 항목만 담는다. */
const LESSONS = ${JSON.stringify(lessons)};
`;
fs.writeFileSync(path.join(DATA, 'lessons.js'), js, 'utf8');
console.log('lessons', lessons.length,
  'avg targets', (lessons.reduce((a, l) => a + l.targets.length, 0) / lessons.length).toFixed(1),
  'with review', lessons.filter(l => l.review.length).length,
  'review cards', lessons.reduce((a, l) => a + l.review.length, 0));
