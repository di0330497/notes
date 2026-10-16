const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data/';

const load = (files, name) => {
  new Function(files.map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')();
  return globalThis.__X;
};
const PATS = load(['patterns.js'], 'PATS');
const GRAMMAR = load(['grammar.js'], 'GRAMMAR');
const EXPR = load(['expressions.js'], 'EXPR');
const SPOKEN = load(['colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js'], 'SPOKEN');
const CONJ = load(['conjugation.js'], 'CONJ');
const POS = load(['pos-josa.js', 'pos-fukushi.js', 'pos-other.js', 'pos-verb.js', 'pos-noun.js', 'pos-words.js', 'pos-keiyou-2.js'],
  '[].concat(typeof POS_JOSA!=="undefined"?POS_JOSA:[],typeof POS_ADV!=="undefined"?POS_ADV:[],typeof POS_OTHER!=="undefined"?POS_OTHER:[],typeof POS_VERB!=="undefined"?POS_VERB:[],typeof POS_NOUN!=="undefined"?POS_NOUN:[])');
const JUKU_WORDS = load(['pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js'], '(typeof POS_WORDS!=="undefined"?POS_WORDS:[]).filter(w=>/^jk_/.test(w.c))');
const KANJI_DATA = load(['kanji-list.js', 'kanji-cards.js'], '{ALL, FOOD, STUDY, STUDY_FULL}');

// Load story dialogues d01~d60
const storyFiles = fs.readdirSync(D).filter(f => /^dialogue-\d+\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const STORY_DLGS = load(['dialogue-0.js'].concat(storyFiles), 'DIALOGS');

function strip(s) {
  return String(s == null ? '' : s)
    .replace(/\{|\}/g, '')
    .replace(/\[([^|\]\n]+)\|([^\]\n]+)\]/g, '$1$2')
    .replace(/\u301C/g, '\uFF5E').replace(/[\uFF1F\u003F]/g, '')
    .toLowerCase().replace(/\s+/g, '');
}
const stripK = s => String(s == null ? '' : s)
  .replace(/\{|\}/g, '')
  .replace(/\[([^|\]\n]+)\|([^\]\n]+)\]/g, '$1');

/* ——— 장르 테이블 ——————————————————————— */
const GENRE = {
  basic:    { id:'news', name:'뉴스 브리핑', place:'NHK 보도국 편집실', chars:['tanaka','sato'] },
  josa:     { id:'news', name:'뉴스 브리핑', place:'NHK 보도국 편집실', chars:['tanaka','sato'] },
  topic:    { id:'news', name:'뉴스 브리핑', place:'NHK 보도국 편집실', chars:['tanaka','sato'] },
  quote:    { id:'news', name:'뉴스 브리핑', place:'NHK 보도국 편집실', chars:['tanaka','sato'] },
  lit:      { id:'official', name:'공문서·고지문', place:'구청 민원 창구', chars:['tanaka','sato'] },
  keigo:    { id:'biz', name:'비즈니스', place:'본사 회의실', chars:['tanaka','hana'] },
  duty:     { id:'law', name:'법률 상담', place:'법률 사무소 상담실', chars:['jihu','tanaka'] },
  neg:      { id:'law', name:'법률 상담', place:'법률 사무소 상담실', chars:['jihu','tanaka'] },
  cond:     { id:'law', name:'법률 상담', place:'법률 사무소 상담실', chars:['jihu','tanaka'] },
  reason:   { id:'clinic', name:'진료실', place:'이비인후과 진료실', chars:['jihu','hana'] },
  guess:    { id:'clinic', name:'진료실', place:'이비인후과 진료실', chars:['jihu','hana'] },
  final:    { id:'clinic', name:'진료실', place:'이비인후과 진료실', chars:['jihu','hana'] },
  time:     { id:'travel', name:'여행', place:'게이한신 급행 역', chars:['jihu','ken'] },
  purpose:  { id:'travel', name:'여행', place:'게이한신 급행 역', chars:['jihu','ken'] },
  change:   { id:'travel', name:'여행', place:'게이한신 급행 역', chars:['jihu','ken'] },
  degree:   { id:'shop', name:'쇼핑', place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
  state:    { id:'shop', name:'쇼핑', place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
  adv:      { id:'shop', name:'쇼핑', place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
  contrast: { id:'sports', name:'스포츠 중계', place:'고시엔 구장 해설석', chars:['ken','tanaka'] },
  conj:     { id:'sports', name:'스포츠 중계', place:'고시엔 구장 해설석', chars:['ken','tanaka'] },
  te:       { id:'cook', name:'요리 수업', place:'문화센터 조리실', chars:['hana','aki'] },
  expr:     { id:'cook', name:'요리 수업', place:'문화센터 조리실', chars:['hana','aki'] },
  give:     { id:'gift', name:'선물·부탁', place:'백화점 지하 식품장', chars:['jihu','hana'] },
  nom:      { id:'research', name:'연구 발표', place:'대학 강의실', chars:['ken','jihu'] },
  link:     { id:'research', name:'연구 발표', place:'대학 강의실', chars:['ken','jihu'] },
};
const CH_GENRE = {
  A: { id:'calli',  name:'서도 수업',      place:'문화센터 서도실',   chars:['hana','jihu'] },
  B: { id:'calli',  name:'서도 수업',      place:'문화센터 서도실',   chars:['hana','jihu'] },
  Z: { id:'think',  name:'일본어 사고법',  place:'어학원 교실',       chars:['jihu','ken'] },
  C: { id:'shop',   name:'쇼핑',          place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
  D: { id:'sports', name:'스포츠 중계',    place:'고시엔 구장 해설석', chars:['ken','tanaka'] },
  E: { id:'shop',   name:'쇼핑',          place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
  F: { id:'shop',   name:'쇼핑',          place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
  G1:{ id:'cook',   name:'요리 수업',      place:'문화센터 조리실',   chars:['hana','aki'] },
  G2:{ id:'cook',   name:'요리 수업',      place:'문화센터 조리실',   chars:['hana','aki'] },
  H: { id:'travel', name:'여행',           place:'게이한신 급행 역',  chars:['jihu','ken'] },
  I: { id:'clinic', name:'진료실',        place:'이비인후과 진료실', chars:['jihu','hana'] },
  J: { id:'gift',   name:'선물·부탁',      place:'백화점 지하 식품장', chars:['jihu','hana'] },
  K: { id:'biz',    name:'비즈니스',      place:'본사 회의실',       chars:['tanaka','hana'] },
  L: { id:'biz',    name:'비즈니스',      place:'본사 회의실',       chars:['tanaka','hana'] },
  M1:{ id:'research', name:'연구 발표',    place:'대학 강의실',       chars:['ken','jihu'] },
  M2:{ id:'research', name:'연구 발표',    place:'대학 강의실',       chars:['ken','jihu'] },
  M3:{ id:'research', name:'연구 발표',    place:'대학 강의실',       chars:['ken','jihu'] },
};
const EX_GENRE = {
  aizuchi: { id:'izakaya', name:'술자리',      place:'신바시 이자카야',   chars:['jihu','ken'] },
  kimari:  { id:'official', name:'공문서·고지문', place:'구청 민원 창구',   chars:['tanaka','sato'] },
  spoken:  { id:'izakaya', name:'술자리',      place:'신바시 이자카야',   chars:['jihu','ken'] },
  kanyou:  { id:'teatime', name:'다회·방송',  place:'NHK 라디오 스튜디오', chars:['tanaka','hana'] },
};
const SP_GENRE = {
  slang:    { id:'slang',  name:'은어·비속어', place:'하라주쿠 뒷골목',   chars:['aki','jihu'] },
  contract: { id:'friend', name:'친구 반말',   place:'히로오지 츠케멘 집',  chars:['ken','jihu'] },
  sfp:      { id:'friend', name:'친구 반말',   place:'히로오지 츠케멘 집',  chars:['ken','jihu'] },
  level:    { id:'friend', name:'친구 반말',   place:'히로오지 츠케멘 집',  chars:['ken','jihu'] },
  particle: { id:'friend', name:'친구 반말',   place:'히로오지 츠케멘 집',  chars:['ken','jihu'] },
  filler:   { id:'friend', name:'친구 반말',   place:'히로오지 츠케멘 집',  chars:['ken','jihu'] },
  gender:   { id:'friend', name:'친구 반말',   place:'히로오지 츠케멘 집',  chars:['ken','jihu'] },
  young:    { id:'young',  name:'10대 유행어', place:'하라주쿠 거리',      chars:['aki','jihu'] },
  rough:    { id:'young',  name:'10대 유행어', place:'하라주쿠 거리',      chars:['aki','jihu'] },
  style:    { id:'friend', name:'친구 반말',   place:'히로오지 츠케멘 집',  chars:['ken','jihu'] },
  scene:    { id:'friend', name:'친구 반말',   place:'히로오지 츠케멘 집',  chars:['ken','jihu'] },
  sound:    { id:'sound',  name:'발음·억양',   place:'어학원 교실',        chars:['ken','jihu'] },
  kansai:   { id:'kansai', name:'칸사이벤',    place:'오사카 닛폰바시',    chars:['aki','jihu'] },
  dialect:  { id:'dialect', name:'방언',        place:'아사쿠사 상점가',   chars:['sato','tanaka'] },
};
const DIALECT_GENRE = {
  '関東': { id:'kanto',   name:'関東 사투리', place:'아사쿠사 상점가',     chars:['sato','tanaka'] },
  '関西': { id:'kansai',  name:'칸사이벤',    place:'오사카 닛폰바시',     chars:['aki','jihu'] },
};
const CJ_GENRE = {
  verb:  { id:'cook',     name:'요리 수업',  place:'문화센터 조리실', chars:['hana','aki'] },
  adj:   { id:'calli',    name:'서도 수업',  place:'문화센터 서도실', chars:['hana','jihu'] },
  cond:  { id:'law',      name:'법률 상담',  place:'법률 사무소 상담실', chars:['jihu','tanaka'] },
  keigo: { id:'biz',      name:'비즈니스',  place:'본사 회의실', chars:['tanaka','hana'] },
  conn:  { id:'research', name:'연구 발표', place:'대학 강의실', chars:['ken','jihu'] },
  aux:   { id:'grammar',  name:'문법 강의', place:'어학원 교실', chars:['ken','jihu'] },
  word:  { id:'shop',     name:'쇼핑',     place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
};

/* ——— 항목 수집 ——————————————————————————— */
const items = [];
PATS.forEach(p => { const ex = (p.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'pat', title: p.pat, cat: p.cat, lv: String(p.lv || '0'), ex, sub: p.clu || p.mean || '' }); });
GRAMMAR.forEach(x => { const ex = (x.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'gram', title: x.t, cat: x.ch, lv: String(x.lv || '0'), ex, sub: x.cn || '' }); });
EXPR.forEach(x => { const ex = (x.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'expr', title: x.expr, cat: x.cat, lv: String(x.lv || '4'), ex, sub: x.mean || '' }); });
SPOKEN.forEach(x => { const ex = (x.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'spoken', title: x.t, cat: x.sec, lv: String(x.lv || '3'), ex, sub: x.sn || '', sn: x.sn || '' }); });
CONJ.forEach(x => { const ex = (x.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'conj', title: x.t, cat: x.g, lv: String(x.lv || '3'), ex, sub: x.gn || '' }); });
POS.forEach(x => { const ex = (x.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'pos', title: x.t, tag: x.t, cat: 'pos', lv: String(x.lv || '4'), ex, sub: x.gn || x.pn || '' }); });
JUKU_WORDS.forEach(w => { const ex = (w.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'pos', title: w.w + ' (' + w.m.replace('[숙자훈·아테지] ', '') + ')', tag: w.w, cat: 'pos', lv: String(w.lv || '3'), ex, sub: '숙자훈·아테지 150' }); });

const POS_GENRE = { id:'grammar', name:'문법 강의', place:'어학원 교실', chars:['ken','jihu'] };

const byGenre = {};
items.forEach(it => {
  const gen = it.kind === 'pat' ? GENRE[it.cat]
    : it.kind === 'gram' ? CH_GENRE[it.cat]
    : it.kind === 'expr' ? EX_GENRE[it.cat]
    : it.kind === 'spoken' ? ((it.cat === 'dialect') ? (DIALECT_GENRE[(it.sn || '').slice(0, 2)] || SP_GENRE.dialect) : SP_GENRE[it.cat])
    : it.kind === 'pos' ? POS_GENRE
    : CJ_GENRE[it.cat];
  if (!gen) return;
  (byGenre[gen.id] = byGenre[gen.id] || { gen, items: [] }).items.push(it);
});

const KIND_LABEL = { pat: '문형', gram: '문법', expr: '표현', spoken: '구어체', conj: '활용표', pos: '품사', kanji: '한자' };
const TAG_KIND = { pat: '문형', gram: '문법', expr: '표현', spoken: '구어체', conj: 'conj', pos: '품사', kanji: '한자' };

const PER = 16;
const out = [];
let n = 0;
const leftovers = [];

Object.keys(byGenre).forEach(gid => {
  const { gen, items: its } = byGenre[gid];
  its.sort((a, b) => (a.kind + a.lv).localeCompare(b.kind + b.lv));
  for (let i = 0; i < its.length; i += PER) {
    const chunk = its.slice(i, i + PER);
    if (chunk.length < 4) { leftovers.push.apply(leftovers, chunk); continue; }
    const lines = [];
    chunk.forEach((it, k) => {
      const e = it.ex[k % it.ex.length];
      lines.push({ who: gen.chars[k % gen.chars.length], item: KIND_LABEL[it.kind] + ' · ' + it.title, s: e.s, ko: e.ko });
    });
    const tags = chunk.map(it => [TAG_KIND[it.kind], it.tag || it.title]);
    const lv = [...new Set(chunk.map(c => c.lv))].sort()[0] || '4';
    out.push({
      id: 'p' + String(++n).padStart(3, '0'),
      title: gen.name + ' · ' + chunk.map(c => KIND_LABEL[c.kind]).filter((v, i, a) => a.indexOf(v) === i).join('·') + ' 연습',
      scene: '연습 · ' + gen.name,
      place: gen.place,
      lv: lv,
      chars: [...new Set(lines.map(l => l.who))],
      lines,
      points: [{ t: '이 대화의 문형·문법·표현', d: chunk.map(c => KIND_LABEL[c.kind] + ' ' + c.title + (c.sub ? ' — ' + c.sub : '')).slice(0, 10).join(' / ') }],
      tags
    });
  }
});

if (leftovers.length) {
  const mixed = { id: 'mix', name: '종합 연습', place: '어학원 자습실', chars: ['jihu', 'hana', 'ken', 'aki'] };
  for (let i = 0; i < leftovers.length; i += PER) {
    const chunk = leftovers.slice(i, i + PER);
    if (!chunk.length) continue;
    const lines = [];
    chunk.forEach((it, k) => {
      const e = it.ex[k % it.ex.length];
      lines.push({ who: mixed.chars[k % mixed.chars.length], item: KIND_LABEL[it.kind] + ' · ' + it.title, s: e.s, ko: e.ko });
    });
    out.push({
      id: 'p' + String(++n).padStart(3, '0'),
      title: '종합 연습 · 문형·문법·표현',
      scene: '연습 · 종합',
      place: mixed.place,
      lv: [...new Set(chunk.map(c => c.lv))].sort()[0] || '4',
      chars: [...new Set(lines.map(l => l.who))],
      lines,
      points: [{ t: '이 대화의 문형·문법·표현', d: chunk.map(c => KIND_LABEL[c.kind] + ' ' + c.title).join(' / ') }],
      tags: chunk.map(it => [TAG_KIND[it.kind], it.tag || it.title])
    });
  }
}

/* ——— 상용한자 2,136자 + 식재료 47자 (2,183자) 100% 달성 ——— */
const kanjiAll = KANJI_DATA.ALL.concat(KANJI_DATA.FOOD || []);
const targetKanjiSet = new Set(
  kanjiAll.filter(k => ['0', '9', '10'].indexOf(String(k[4])) < 0).map(k => k[0])
);

const coveredKanji = new Set();
STORY_DLGS.concat(out).forEach(d => {
  (d.lines || []).forEach(l => {
    const ko = stripK(l.s || '');
    for (const ch of ko) if (targetKanjiSet.has(ch)) coveredKanji.add(ch);
  });
});

const missingKanji = new Set([...targetKanjiSet].filter(ch => !coveredKanji.has(ch)));
console.log('상용+식재료 목표 한자:', targetKanjiSet.size, '기존 대화 커버:', coveredKanji.size, '추가 필요:', missingKanji.size);

// Greedy set cover from STUDY + STUDY_FULL
const cands = [];
for (const entry of (KANJI_DATA.STUDY || []).concat(KANJI_DATA.STUDY_FULL || [])) {
  for (const ex of (entry.ex || [])) {
    if (!ex || !ex.s || !ex.ko) continue;
    const plainK = stripK(ex.s);
    const ks = new Set();
    for (const ch of plainK) if (missingKanji.has(ch)) ks.add(ch);
    if (ks.size > 0) cands.push({ k: entry.k, hun: entry.hun, s: ex.s, ko: ex.ko, ks });
  }
}

const pickedKanjiLines = [];
const rem = new Set(missingKanji);
while (rem.size > 0) {
  let best = null, bestGain = 0;
  for (const c of cands) {
    let gain = 0;
    for (const ch of c.ks) if (rem.has(ch)) gain++;
    if (gain > bestGain) { bestGain = gain; best = c; }
  }
  if (!best || bestGain === 0) break;
  const newlyCovered = [...best.ks].filter(ch => rem.has(ch));
  pickedKanjiLines.push({ ...best, newlyCovered });
  for (const ch of newlyCovered) rem.delete(ch);
}

// 식재료 한자(FOOD) 23자까지 한 줄도 빠짐없이 커버하는 스시·이자카야 메뉴 대사
const FOOD_LINES = [
  { k: '鮨', hun: '초밥 지', s: '[老舗|しにせ]の{[鮨|すし]}[屋|や]で{[鮪|まぐろ]}と{[鰤|ぶり]}と{[鮃|ひらめ]}を[頼|たの]んだ。', ko: '오래된 초밥집에서 참치와 방어와 넙치를 시켰다.' },
  { k: '鰻', hun: '장어 만', s: '{[鰻|うなぎ]}の[蒲焼|かばや]きと{[鰊|にしん]}{[蕎麦|そば]}も[人気|にんき]メニューです。', ko: '장어 구이와 청어 메밀국수도 인기 메뉴입니다.' },
  { k: '鱸', hun: '농어 로', s: '[今日|きょう]の[魚市場|うおいちば]には{[鱸|すずき]}や{[鱚|きす]}、{[鰡|ぼら]}、{[鯒|こち]}が[並|なら]んでいる。', ko: '오늘 어시장에는 농어와 보리멸, 숭어, 양태가 진열되어 있다.' },
  { k: '鰰', hun: '도루묵', s: '[秋田|あきた]の{[鰰|はたはた]}とフグの{[鰭|ひれ]}[酒|ざけ]、{[蛸|たこ]}の[酢|す]の[物|もの]を[味|あじ]わう。', ko: '아키타의 도루묵과 복어 히레자케, 문어 초무침을 맛본다.' },
  { k: '蛤', hun: '대합 합', s: '{[蛤|はまぐり]}のお[吸|す]い[物|もの]にするか、{[蜆|しじみ]}と{[浅蜊|あさり]}の[味噌汁|みそしる]にするか[迷|まよ]う。', ko: '대합 맑은국으로 할지, 재첩과 바지락 된장국으로 할지 망설인다.' },
  { k: '鶉', hun: '메추라기 순', s: '{[鶉|うずら]}の[卵|たまご]に{[葱|ねぎ]}・{[蒜|にんにく]}・{[茸|きのこ]}、{[筍|たけのこ]}と{[蕪|かぶ]}と{[蕗|ふき]}を[添|そ]え、{[橙|だいだい]}を[絞|しぼ]る。', ko: '메추리알에 파·마늘·버섯, 죽순과 순무와 머위를 곁들이고 유자를 짠다.' },
];
for (const fl of FOOD_LINES) {
  const plainK = stripK(fl.s);
  const newlyCovered = [...plainK].filter(ch => rem.has(ch));
  if (newlyCovered.length > 0) {
    pickedKanjiLines.push({ ...fl, newlyCovered });
    newlyCovered.forEach(ch => rem.delete(ch));
  }
}
console.log('상용한자 100%를 위해 추가된 예문 수:', pickedKanjiLines.length, '남은 미커버:', rem.size);

const KANJI_SCENES = [
  { scene: '연습 · 상용한자 마스터', place: '도서관 스터디룸', chars: ['jihu', 'hana', 'ken', 'aki'] },
];
let kn = 0;
for (let i = 0; i < pickedKanjiLines.length; i += PER) {
  const chunk = pickedKanjiLines.slice(i, i + PER);
  const g = KANJI_SCENES[0];
  const lines = chunk.map((it, k) => ({
    who: g.chars[k % g.chars.length],
    item: '한자 · ' + it.k + ' (' + it.hun + ')',
    s: it.s,
    ko: it.ko
  }));
  const coveredList = [];
  chunk.forEach(it => it.newlyCovered.forEach(ch => { if (!coveredList.includes(ch)) coveredList.push(ch); }));
  out.push({
    id: 'p' + String(++n).padStart(3, '0'),
    title: '상용한자 실전 대사 #' + (++kn) + ' (' + coveredList.slice(0, 6).join('·') + ' 등)',
    scene: g.scene,
    place: g.place,
    lv: kn <= 15 ? '4' : kn <= 32 ? '3' : '2',
    chars: [...new Set(lines.map(l => l.who))],
    lines,
    points: [{
      t: '이 대화로 익히는 상용한자 (' + coveredList.length + '자)',
      d: chunk.map(it => it.k + '(' + it.hun + ')').slice(0, 12).join(' · ')
    }],
    tags: coveredList.slice(0, 10).map(ch => ['한자', ch])
  });
}

const buf = [];
buf.push('/* ==========================================================================');
buf.push('   dialogue-practice.js - 사전 예문 + 상용한자 100% 대사 (generator.practice.cjs 생성)');
buf.push('   ========================================================================== */');
buf.push('DIALOGS.push(');
out.forEach((d, i) => {
  buf.push(JSON.stringify(d, null, 1).replace(/\n {2}/g, '\n  ') + (i < out.length - 1 ? ',' : ''));
});
buf.push(');');
fs.writeFileSync(D + 'dialogue-practice.js', buf.join('\n'), 'utf8');

console.log('총 생성 대화:', out.length, '편 / 줄:', out.reduce((a, d) => a + d.lines.length, 0));
