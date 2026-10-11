const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data/';

const load = (files, name) => { const g = {}; new Function(files.map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };
const PATS = load(['patterns.js'], 'PATS');
const GRAMMAR = load(['grammar.js'], 'GRAMMAR');
const EXPR = load(['expressions.js'], 'EXPR');
const SPOKEN = load(['colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js'], 'SPOKEN');
const CONJ = load(['conjugation.js'], 'CONJ');

/* ——— 장르 테이블 ——————————————————————— */
const GENRE = {
  basic:    { id:'news', name:'뉴스 브리핑', place:'NHK 보도국 편집실', chars:['tanaka','sato'] },
  josa:     { id:'news', name:'뉴스 브리핑', place:'NHK 보도국 편집실', chars:['tanaka','sato'] },
  topic:    { id:'news', name:'뉴스 브리핑', place:'NHK 보도국 편집실', chars:['tanaka','sato'] },
  quote:    { id:'news', name:'뉴스 브리핑', place:'NHK 보도국 편집실', chars:['tanaka','sato'] },
  lit:      { id:'official', name:'공문서·고지문', place:'구청 민원 창구', chars:['tanaka','sato'] },
  keigo:    { id:'biz', name:'비즈니스', place:'본사 회의실', chars:['tanaka','hana'] },
  duty:     { id:'law', name:'법률 상담', place:'법률 사무소 상담실', chars:['jihu','tanaka'] },
  neg:       { id:'law', name:'법률 상담', place:'법률 사무소 상담실', chars:['jihu','tanaka'] },
  cond:      { id:'law', name:'법률 상담', place:'법률 사무소 상담실', chars:['jihu','tanaka'] },
  reason:   { id:'clinic', name:'진료실', place:'이비인후과 진료실', chars:['jihu','hana'] },
  guess:    { id:'clinic', name:'진료실', place:'이비인후과 진료실', chars:['jihu','hana'] },
  final:    { id:'clinic', name:'진료실', place:'이비인후과 진료실', chars:['jihu','hana'] },
  time:      { id:'travel', name:'여행', place:'게이한신 급행 역', chars:['jihu','ken'] },
  purpose:  { id:'travel', name:'여행', place:'게이한신 급행 역', chars:['jihu','ken'] },
  change:  { id:'travel', name:'여행', place:'게이한신 급행 역', chars:['jihu','ken'] },
  degree:  { id:'shop', name:'쇼핑', place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
  state:   { id:'shop', name:'쇼핑', place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
  adv:     { id:'shop', name:'쇼핑', place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
  contrast:{ id:'sports', name:'스포츠 중계', place:'고시엔 구장 해설석', chars:['ken','tanaka'] },
  conj:    { id:'sports', name:'스포츠 중계', place:'고시엔 구장 해설석', chars:['ken','tanaka'] },
  te:       { id:'cook', name:'요리 수업', place:'문화센터 조리실', chars:['hana','aki'] },
  expr:    { id:'cook', name:'요리 수업', place:'문화센터 조리실', chars:['hana','aki'] },
  give:    { id:'gift', name:'선물·부탁', place:'백화점 지하 식품장', chars:['jihu','hana'] },
  nom:     { id:'research', name:'연구 발표', place:'대학 강의실', chars:['ken','jihu'] },
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
/* 표현 분류 -> 장르 */
const EX_GENRE = {
  aizuchi: { id:'izakaya', name:'술자리',      place:'신바시 이자카야',   chars:['jihu','ken'] },
  kimari:  { id:'official', name:'공문서·고지문', place:'구청 민원 창구',   chars:['tanaka','sato'] },
  spoken:  { id:'izakaya', name:'술자리',      place:'신바시 이자카야',   chars:['jihu','ken'] },
  kanyou:  { id:'teatime', name:'다회·방송',  place:'NHK 라디오 스튜디오', chars:['tanaka','hana'] },
};
/* 구어체 sec -> 장르
   dialect 는 한 sec 안에 関東·関西 가 섞여 있어 sn 으로 갈라 낸다. */
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
  scene:     { id:'friend', name:'친구 반말',   place:'히로오지 츠케멘 집',  chars:['ken','jihu'] },
  sound:    { id:'sound',  name:'발음·억양',   place:'어학원 교실',        chars:['ken','jihu'] },
  kansai:   { id:'kansai', name:'칸사이벤',    place:'오사카 닛폰바시',    chars:['aki','jihu'] },
  dialect:  { id:'dialect', name:'방언',        place:'아사쿠사 상점가',   chars:['sato','tanaka'] },
};
/* dialect 은 sn 으로 関東/関西 를 갈라 별도 장르로 보낸다 */
const DIALECT_GENRE = {
  '関東': { id:'kanto',   name:'関東 사투리', place:'아사쿠사 상점가',     chars:['sato','tanaka'] },
  '関西': { id:'kansai',  name:'칸사이벤',    place:'오사카 닛폰바시',     chars:['aki','jihu'] },
};
/* 활용표 그룹 -> 장르 */
const CJ_GENRE = {
  verb:  { id:'cook',  name:'요리 수업',  place:'문화센터 조리실', chars:['hana','aki'] },
  adj:   { id:'calli', name:'서도 수업',  place:'문화센터 서도실', chars:['hana','jihu'] },
  cond:  { id:'law',   name:'법률 상담',  place:'법률 사무소 상담실', chars:['jihu','tanaka'] },
  keigo: { id:'biz',   name:'비즈니스',  place:'본사 회의실', chars:['tanaka','hana'] },
  conn:   { id:'research', name:'연구 발표', place:'대학 강의실', chars:['ken','jihu'] },
  aux:    { id:'grammar',  name:'문법 강의', place:'어학원 교실', chars:['ken','jihu'] },
  word:   { id:'shop',     name:'쇼핑',     place:'시모키타자와 의류 가게', chars:['jihu','aki'] },
};

/* ——— 항목 수집 ——————————————————————————— */
const items = [];
PATS.forEach(p => { const ex = (p.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'pat', title: p.pat, cat: p.cat, lv: String(p.lv || '0'), ex, sub: p.clu || p.mean || '' }); });
GRAMMAR.forEach(x => { const ex = (x.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'gram', title: x.t, cat: x.ch, lv: String(x.lv || '0'), ex, sub: x.cn || '' }); });
EXPR.forEach(x => { const ex = (x.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'expr', title: x.expr, cat: x.cat, lv: String(x.lv || '4'), ex, sub: x.mean || '' }); });
SPOKEN.forEach(x => { const ex = (x.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'spoken', title: x.t, cat: x.sec, lv: String(x.lv || '3'), ex, sub: x.sn || '', sn: x.sn || '' }); });
CONJ.forEach(x => { const ex = (x.ex || []).filter(e => e && e.s && e.ko); if (ex.length) items.push({ kind: 'conj', title: x.t, cat: x.g, lv: String(x.lv || '3'), ex, sub: x.gn || '' }); });

const byGenre = {};
items.forEach(it => {
  const gen = it.kind === 'pat' ? GENRE[it.cat]
    : it.kind === 'gram' ? CH_GENRE[it.cat]
    : it.kind === 'expr' ? EX_GENRE[it.cat]
    : it.kind === 'spoken' ? ((it.cat === 'dialect') ? (DIALECT_GENRE[(it.sn || '').slice(0, 2)] || SP_GENRE.dialect) : SP_GENRE[it.cat])
    : CJ_GENRE[it.cat];
  if (!gen) return;
  (byGenre[gen.id] = byGenre[gen.id] || { gen, items: [] }).items.push(it);
});

const KIND_LABEL = { pat: '문형', gram: '문법', expr: '표현', spoken: '구어체', conj: '활용표' };
const TAG_KIND = { pat: '문형', gram: '문법', expr: '표현', spoken: '구어체', conj: 'conj' };

const PER = 8;
const out = [];
let n = 0, skipped = 0;
Object.keys(byGenre).forEach(gid => {
  const { gen, items: its } = byGenre[gid];
  its.sort((a, b) => (a.kind + a.lv).localeCompare(b.kind + b.lv));
  for (let i = 0; i < its.length; i += PER) {
    const chunk = its.slice(i, i + PER);
    if (chunk.length < 4) { skipped += chunk.length; continue; }
    const lines = [];
    chunk.forEach((it, k) => {
      const e = it.ex[k % it.ex.length];
      lines.push({ who: gen.chars[k % gen.chars.length], s: e.s, ko: e.ko });
    });
    const tags = chunk.map(it => [TAG_KIND[it.kind], it.title]);
    const lv = [...new Set(chunk.map(c => c.lv))].sort()[0] || '4';
    out.push({
      id: 'p' + String(++n).padStart(3, '0'),
      title: gen.name + ' · ' + chunk.map(c => KIND_LABEL[c.kind]).filter((v, i, a) => a.indexOf(v) === i).join('·') + ' 연습',
      scene: '연습 · ' + gen.name,
      place: gen.place,
      lv: lv,
      chars: [...new Set(lines.map(l => l.who))],
      lines,
      points: [{ t: '이 대화의 문형·문법·표현', d: chunk.map(c => KIND_LABEL[c.kind] + ' ' + c.title + (c.sub ? ' — ' + c.sub : '')).slice(0, 8).join(' / ') }],
      tags
    });
  }
});

const buf = [];
buf.push('/* ==========================================================================');
buf.push('   dialogue-practice.js - 사전 예문을 대사로 감싼 대화 (generator.practice.cjs 가 생성)');
buf.push('');
buf.push('   이 파일은 손으로 쓴 대화가 아니다. 대화 각 줄은 patterns.js · grammar.js ·');
buf.push('   expressions.js · colloquial*.js · conjugation.js 의 예문을 그대로 가져왔으므로');
buf.push('   사전과 대화의 예문이 어긋나지 않는다.');
buf.push('   즉, 커버리지 99%를 "자동으로" 달성하는 대신 손으로 쓴 60편 같은 서사는 없다.');
buf.push('');
buf.push('   id 는 p001 부터. scene 은 「연습 · 장르」 로 시작해 d01~d60 과 구분된다.');
buf.push('   ========================================================================== */');
buf.push('DIALOGS.push(');
out.forEach((d, i) => {
  buf.push(JSON.stringify(d, null, 1).replace(/\n {2}/g, '\n  ') + (i < out.length - 1 ? ',' : ''));
});
buf.push(');');
fs.writeFileSync(D + 'dialogue-practice.js', buf.join('\n'), 'utf8');

const byKind = {};
items.forEach(it => byKind[it.kind] = (byKind[it.kind] || 0) + 1);
console.log('항목별:', JSON.stringify(byKind));
console.log('장르:', Object.keys(byGenre).join(', '));
console.log('대화', out.length, '편 / 줄', out.reduce((a, d) => a + d.lines.length, 0), '줄 (4개 미만으로 버림', skipped, '개)');