/* ─────────────────────────────────────────────────────────────
   커버리지 측정기 v2 — 예문 기준

   문법 항목의 제목은 "한국인이 자주 틀리는 발음 5가지"처럼 한국어라
   제목으로는 대화와 매칭할 수 없다. 그래서 **사전의 예문**이 대화에도
   나오는지를 센다. 이게 사용자가 원하는 지표다:
   "대화를 짜고, 거기에 맞는 예문을 각 항목에 넣는다"

   출력: coverage.json / coverage.txt
   ───────────────────────────────────────────────────────────── */
const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data';

const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-[\w-]*\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const g = {};
new Function(['dialogue-0.js', 'characters.js'].concat(dlgFiles)
  .map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + `
;globalThis.__D=DIALOGS;globalThis.__C=typeof CHARACTERS!=='undefined'?CHARACTERS:[];`)();
const DIALOGS = globalThis.__D;
const GW = {};
new Function(['pos-josa.js', 'pos-fukushi.js', 'pos-other.js', 'pos-verb.js', 'pos-noun.js', 'pos-words.js', 'pos-keiyou-2.js',
  'patterns.js', 'grammar.js', 'conjugation.js', 'expressions.js',
  'colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'kanji-list.js', 'kanji-cards.js']
  .map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + `
;globalThis.__G={PATS:typeof PATS!=='undefined'?PATS:[],
 GRAMMAR:typeof GRAMMAR!=='undefined'?GRAMMAR:[],
 CONJ:typeof CONJ!=='undefined'?CONJ:[],
 EXPR:typeof EXPR!=='undefined'?EXPR:[],
 SPOKEN:typeof SPOKEN!=='undefined'?SPOKEN:[],
 ALL:typeof ALL!=='undefined'?ALL:[],
 FOOD:typeof FOOD!=='undefined'?FOOD:[],
 WORDS:typeof POS_WORDS!=='undefined'?POS_WORDS:[],
 STUDY:typeof STUDY!=='undefined'?STUDY:[]};`)();
const G = globalThis.__G;
const CHARBY = {};
globalThis.__C.forEach(c => CHARBY[c.id] = c);

function strip(s) {
  return String(s == null ? '' : s)
    .replace(/\{|\}/g, '')
    .replace(/\[([^|\]\n]+)\|([^\]\n]+)\]/g, '$1$2')
    .replace(/\u301C/g, '\uFF5E').replace(/[\uFF1F\u003F]/g, '')
    .toLowerCase().replace(/\s+/g, '');
}
const stripK = s => String(s == null ? '' : s).replace(/\{|\}/g, '')
  .replace(/\[([^|\]\n]+)\|([^\]\n]+)\]/g, '$1');

const lines = [];
DIALOGS.forEach((d, di) => {
  (d.lines || []).forEach((l, li) => {
    lines.push({
      dlg: d.id, line: li, who: l.who, whoName: (CHARBY[l.who] || {}).name || l.who,
      scene: d.scene || '', place: d.place || '', lv: d.lv, chars: d.chars || [],
      text: l.s, ko: l.ko || '', plain: strip(l.s), kanjiOnly: stripK(l.s)
    });
  });
});
const plainIdx = lines.map(l => l.plain);
const kanjiIdx = lines.map(l => l.kanjiOnly);
const hay = plainIdx.join('\n') + '\n' + lines.map(l => l.ko).join('\n');

// 예문 목록에서 대화에 나온 줄을 찾는다. 문장 전체가 아니라
// 12자 이상의 핵심 덩어리가 겹치면 "나왔다" 로 본다.
function hitsFor(sentences) {
  const out = [];
  (sentences || []).forEach(s => {
    const t = strip(s);
    if (!t) return;
    /* 짧은 예문("そうなんほな。" 처럼 8자 미만)은 부분 일치로 세면
       「はい」「そう」 같은 조각이 아무 줄에나 걸려 과대 집계된다.
       그래서 8자 미만은 **줄 전체가 그 예문과 똑같을 때만** 센다.
       (전체 일치라 오탐이 생길 수 없다.) */
    const exact = t.length < 8;
    for (let i = 0; i < plainIdx.length; i++) {
      if (exact ? plainIdx[i] === t : (plainIdx[i].indexOf(t) >= 0 || t.indexOf(plainIdx[i]) >= 0)) out.push(lines[i]);
    }
  });
  // 중복 제거
  const seen = new Set();
  return out.filter(h => { const k = h.dlg + ':' + h.line; if (seen.has(k)) return false; seen.add(k); return true; });
}

const links = {};
function add(kind, key, hits, extra) {
  const id = kind + ':' + key;
  if (!links[id]) links[id] = { kind, key, hits: [] };
  links[id].hits = links[id].hits.concat(hits);
  if (extra) Object.assign(links[id], extra);
}
const exOf = x => ((x.ex || []).map(e => e.s)).concat((x.ex || []).map(e => e.ko || ''));

G.PATS.forEach(p => add('pat', p.pat, hitsFor(exOf(p)), { lv: p.lv, cat: p.cat, title: p.pat }));
G.GRAMMAR.forEach(x => add('gram', x.t, hitsFor(exOf(x)), { lv: x.lv, ch: x.ch, title: x.t }));
G.CONJ.forEach(c => add('conj', c.t, hitsFor(exOf(c)), { gn: c.gn, title: c.t }));
G.EXPR.forEach(x => add('expr', x.expr, hitsFor(exOf(x)), { cat: x.cat, title: x.expr }));
G.SPOKEN.forEach(x => add('spoken', x.t, hitsFor(exOf(x)), { sn: x.sn, title: x.t }));

const kanjiAll = G.ALL.concat(G.FOOD);
const kanjiSeen = new Set(kanjiIdx.join('').replace(/[^\u4E00-\u9FAF]/g, ''));
kanjiAll.forEach(k => {
  const hits = [];
  lines.forEach(l => { if (l.kanjiOnly.indexOf(k[0]) >= 0) hits.push(l); });
  add('kanji', k[0], hits, { grade: k[4], hun: k[1] || '', on: k[2] || '', title: k[0] });
});

const KANJI_OUT = new Set(kanjiAll.filter(k => ['0', '9', '10'].indexOf(String(k[4])) >= 0).map(k => k[0]));
const out = [];
const p = (...a) => out.push(a.join(' '));
function rate(kind, f, label) {
  const items = Object.values(links).filter(x => x.kind === kind);
  const ok = items.filter(x => f ? f(x) : x.hits.length > 0);
  p(label + ': ' + ok.length + '/' + items.length + ' = ' + (ok.length / items.length * 100).toFixed(1) + '%');
  return { ok: ok.length, tot: items.length, miss: items.length - ok.length };
}
p('=== 커버리지 (사전 예문이 대화에도 나오는 비율) ===');
p('대화 ' + DIALOGS.length + '편 / ' + lines.length + '줄 / 등장인물 ' + globalThis.__C.length + '명');
p('');
const R = {
  pat: rate('pat', null, '문형'),
  gram: rate('gram', null, '문법'),
  conj: rate('conj', null, '활용표'),
  expr: rate('expr', null, '표현'),
  spoken: rate('spoken', null, '구어체'),
  kanji: rate('kanji', null, '한자(전체)'),
  kanjiOK: (function () {
    const items = Object.values(links).filter(x => x.kind === 'kanji');
    const ok = items.filter(x => x.hits.length > 0 && !KANJI_OUT.has(x.key));
    const den = items.filter(x => !KANJI_OUT.has(x.key)).length;
    p('한자(인명용/표외 제외): ' + ok.length + '/' + den + ' = ' + (ok.length / den * 100).toFixed(1) + '%');
    return { ok: ok.length, tot: den, miss: den - ok.length };
  })(),
};
p('');
p('인명용·표외·추가 = ' + KANJI_OUT.size + '자 (대화에 의도적으로 안 넣음)');
p('');
p('=== 99% 목표까지 추가로 필요한 대사 줄 수 ===');
const needPat = R.pat.miss, needGram = R.gram.miss;
p('문형 ' + needPat + '개 + 문법 ' + needGram + '개 = ' + (needPat + needGram) + '항목');
p('줄당 2항목씩 소화하면 약 ' + Math.ceil((needPat + needGram) / 2) + '줄 = 대화 '
  + Math.ceil((needPat + needGram) / 2 / 10) + '편 더');
p('');
p('=== 현재 장르 분포 ===');
const genre = {};
DIALOGS.forEach(d => { const s = (d.scene || ''); genre[s] = (genre[s] || 0) + 1; });
p('서로 다른 scene: ' + Object.keys(genre).length + '개');
Object.entries(genre).sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([k, v]) => p('  ' + k + ' ' + v));
fs.writeFileSync('coverage.json',
  JSON.stringify({ R, kanjiOut: [...KANJI_OUT], lines, links }, null, 0), 'utf8');
fs.writeFileSync('coverage.txt', out.join('\n'), 'utf8');
console.log('done');