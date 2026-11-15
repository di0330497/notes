const fs = require('fs'), vm = require('vm');
const ROOT = 'C:/Users/user/Downloads/japanese-pages';
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync(`${ROOT}/j/2b10e90aebe237af55/data/lessons.js`, 'utf8') + ';globalThis.L=LESSONS;', c);
const L = c.L;
const kanji = L.filter(l => l.track === 'kanji');
const rows = [];
let totalTargets = 0;
for (const l of kanji) {
  const flags = [];
  if (l.lines.length < 4 || l.lines.length > 7) flags.push('LINES ' + l.lines.length);
  if (!l.targets.length) flags.push('NO_TARGETS');
  const set = new Set();
  for (const t of l.targets) {
    totalTargets++;
    if (!String(t.key || '').trim()) flags.push('EMPTY_TARGET');
    if (set.has(t.key)) flags.push('DUP_TARGET ' + t.key);
    set.add(t.key);
    const line = l.lines[t.line];
    if (!line || !String(line.s).includes(String(t.key))) flags.push('TARGET_NOT_IN_LINE ' + t.key);
    if (!t.note) flags.push('NO_NOTE ' + t.key);
    if (t.note && !/음|훈/.test(t.note)) flags.push('NOTE_NO_READING ' + t.key);
  }
  l.lines.forEach((x, i) => {
    const s = String(x.s || '');
    if (!s.trim() || s.trim() === '。') flags.push('EMPTY_LINE ' + i);
    if (/[가-힣]/.test(s)) flags.push('JAPANESE_HAS_KOREAN ' + i);
    if (!String(x.ko || '').trim()) flags.push('NO_KO ' + i);
    if ((s.match(/\[/g) || []).length !== (s.match(/\]/g) || []).length) flags.push('BRACKET ' + i);
    if (/\[([^\]|]+)\|—?\]/.test(s)) flags.push('EMPTY_RUBY ' + i);
  });
  if (!/音読みは/.test(l.lines.map(x => x.s).join('\n'))) flags.push('NO_ON_LINE');
  if (!/訓読みは/.test(l.lines.map(x => x.s).join('\n'))) flags.push('NO_KUN_LINE');
  const text = l.lines.map(x => x.s).join('\n');
  if ((text.match(/—/g) || []).length) flags.push('DASH_READING');
  if (l.goal.includes('漢字') && !/常用|天気|魚|体|自然|食|仕事|学校|人|時間|旅|動物|心|動き|様子/.test(l.goal)) flags.push('GENERIC_TITLE');
  if (flags.length) rows.push({ id: l.id, title: l.goal, level: l.level, flags });
}
const byType = {};
for (const r of rows) for (const f of r.flags) { const t = f.split(' ')[0]; byType[t] = (byType[t] || 0) + 1; }
const themes = {};
for (const l of kanji) { const t = l.goal.split(' — ')[1].replace(/ \d+$/, ''); themes[t] = (themes[t] || 0) + 1; }
const out = ['# 한자 314편 검수', '', `- 한자 쇼츠: ${kanji.length}편`, `- 목표 한자: ${totalTargets}개`, '', '## 플래그', ''];
for (const [k,v] of Object.entries(byType).sort((a,b)=>b[1]-a[1])) out.push(`- ${k}: ${v}`);
out.push('', '## 테마', '');
for (const [k,v] of Object.entries(themes).sort((a,b)=>b[1]-a[1])) out.push(`- ${k}: ${v}`);
out.push('', '## 상세', '');
for (const r of rows.slice(0, 400)) out.push(`### ${r.id} | ${r.level} | ${r.title}`, '', ...r.flags.map(f=>'- '+f), '');
fs.writeFileSync(`${ROOT}/build/kanji-audit.md`, out.join('\n'), 'utf8');
console.log('kanji', kanji.length, 'targets', totalTargets, 'flagged', rows.length, byType);
console.log('themes', Object.keys(themes).length);
