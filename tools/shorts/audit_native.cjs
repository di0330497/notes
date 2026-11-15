const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = 'C:/Users/user/Downloads/japanese-pages';
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(DATA, 'lessons.js'), 'utf8') + ';globalThis.L=LESSONS;', c);
const L = c.L.filter(l => l.track !== 'kanji'); // 대화 트랙만
const register = new Map();
const scenes = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'shorts', 'scenes.json'), 'utf8')).scenes;
for (const s of scenes) register.set(s.id, s.register);
const ga = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'shorts', 'grammar-assignments.json'), 'utf8')).scenes;
for (const s of ga) register.set(s.id, s.register);
const na = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'shorts', 'n1-assignments.json'), 'utf8')).scenes;
for (const s of na) register.set(s.id, s.register);

const polite = s => /(です|ます|ません|でした|ましょう|ください|ございます|でしょう|ませんか|いたします|いただ|くださ|おります|なさい|くださいませ)/.test(s);
const casual = s => /(だよ|だね|だな|だろ|じゃん|っす|かよ|ぞ|ぜ|わよ|わね|のよ|のね|もん|ちゃう|じゃう|とく|てる|てる？|ない？|る？|た？|い？|ね？|よ？|かな|かしら|だろう|みたい|っぽい|まじ|やば|すげ|うま|ほんと|そっか|なるほど|ありがと|ごめん|じゃあ|だ|た|る|い|ね|よ|な|か)$/u.test(s);
const staffPhrases = ['いらっしゃいませ', 'かしこまりました', '少々お待ちください', 'ご注文は', 'お会計は', 'レシートは', 'ただいま満席', 'ごゆっくりどうぞ', 'お待たせしました', 'お待たせいたしました', 'ご了承ください', 'ご確認ください', 'お会計', 'ご案内', 'お荷物', 'ご予約'];
const customerPhrases = ['お願いします', 'すみません', 'ありがとうございます', '大丈夫です', 'お会計をお願いします'];

const rows = [];
for (const l of L) {
  const reg = register.get(l.id) || (l.track === 'n1' ? 'written' : '');
  const flags = [];
  const by = new Map();
  l.lines.forEach((x, i) => {
    if (!by.has(x.who)) by.set(x.who, { p: 0, c: 0, lines: [] });
    const b = by.get(x.who);
    if (polite(x.s)) { b.p++; b.lines.push({ i, kind: 'P', s: x.s }); }
    else if (casual(x.s)) { b.c++; b.lines.push({ i, kind: 'C', s: x.s }); }
    const braces = (x.s.match(/\{/g) || []).length;
    if (braces > 1) flags.push(`MULTI_TARGET line ${i}`);
    if (braces && x.s.replace(/\{[^}]*\}/g, '').length < 8) flags.push(`SHORT_TARGET line ${i}: ${x.s}`);
    if (!x.ko || !String(x.ko).trim()) flags.push(`NO_KO line ${i}`);
    if (/[ぁ-んァ-ヶ一-龯]/.test(x.ko || '')) flags.push(`KO_HAS_JP line ${i}: ${x.ko}`);
    if (staffPhrases.some(p => x.s.includes(p)) && (x.who === 'jihu' || x.who === 'hana')) {
      // customer-ish characters; not definitive
      flags.push(`STAFF_PHRASE ${x.who} line ${i}: ${x.s.slice(0, 40)}`);
    }
  });
  for (const [who, b] of by) {
    if (b.p > 0 && b.c > 0) flags.push(`MIXED_REGISTER ${who} P${b.p}/C${b.c}`);
  }
  if (reg === 'polite' && [...by.values()].some(b => b.c > 0 && b.p > 0)) flags.push('POLITE_SCENE_MIXED');
  if (reg === 'casual' && [...by.values()].every(b => b.p > 0 && b.c === 0)) flags.push('CASUAL_SCENE_ALL_POLITE');
  for (let i = 1; i < l.lines.length; i++) {
    if (l.lines[i].who === l.lines[i - 1].who) flags.push(`SAME_SPEAKER ${l.lines[i].who} lines ${i - 1}-${i}`);
  }
  if (flags.length) rows.push({ id: l.id, level: l.level, track: l.track, goal: l.goal, reg, flags });
}
const byType = {};
for (const r of rows) for (const f of r.flags) { const t = f.split(' ')[0]; byType[t] = (byType[t] || 0) + 1; }
const out = [
  '# N5~N1 대화 원어민 관점 검수 플래그', '',
  `- 대상: 대화 트랙 ${L.length}편 (한자 읽기 제외)`, '',
  '## 플래그 종류', '',
  ...Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`- ${k}: ${v}`), '',
  '## 상세', ''
];
for (const r of rows) out.push(`### ${r.id} | ${r.level} | ${r.track} | ${r.goal}`, '', ...r.flags.map(f=>'- '+f), '');
fs.writeFileSync(path.join(ROOT, 'build', 'audit-native.md'), out.join('\n'), 'utf8');
console.log('dialogues', L.length, 'flagged', rows.length, byType);
