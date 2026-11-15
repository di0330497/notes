const fs = require('fs'), path = require('path');
const DIR = 'C:/Users/user/Downloads/japanese-pages/build/shorts/rewrite';
for (const f of fs.readdirSync(DIR).filter(f => /^scene-\d+\.json$/.test(f))) {
  const p = path.join(DIR, f);
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  let h = false;
  for (const d of a) {
    if (d.id === 'sh118') {
      d.lines.forEach(l => { if (l.who === 'j') l.who = 'jihu'; else if (l.who === 't') l.who = 'tanaka'; else if (l.who === 'a') l.who = 'aki'; });
      h = true;
    }
  }
  if (h) fs.writeFileSync(p, JSON.stringify(a, null, 1), 'utf8');
}
for (const f of fs.readdirSync(DIR).filter(f => /^grammar-\d+\.json$/.test(f))) {
  const p = path.join(DIR, f);
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  let h = false;
  for (const d of a) {
    if (d.id === 'g076') {
      d.lines[4] = { who: 'jihu', s: 'じゃあ、[一緒|いっしょ]に[探|さが]してもらえますか。', ko: '그럼 같이 찾아 주실 수 있나요?' };
      d.lines[5] = { who: 'sato', s: 'もちろんです。[閉館|へいかん]までに[返|かえ]さないといけないので、[急|いそ]ぎましょうか。', ko: '물론입니다. 폐관 전에 반납해야 하니 서두를까요?' };
      h = true;
    }
  }
  if (h) fs.writeFileSync(p, JSON.stringify(a, null, 1), 'utf8');
}
const ap = 'C:/Users/user/Downloads/japanese-pages/build/shorts/assignments.json';
const as = JSON.parse(fs.readFileSync(ap, 'utf8'));
const s = as.scenes.find(x => x.id === 'sh118');
if (s && !s.chars.includes('aki')) s.chars.push('aki');
fs.writeFileSync(ap, JSON.stringify(as, null, 1), 'utf8');
console.log('ok');
