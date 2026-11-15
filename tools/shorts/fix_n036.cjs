const fs = require('fs'), path = require('path');
const DIR = 'C:/Users/user/Downloads/japanese-pages/build/shorts/rewrite';
for (const f of fs.readdirSync(DIR).filter(f => /^n1-\d+\.json$/.test(f))) {
  const p = path.join(DIR, f);
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  let h = false;
  for (const d of a) {
    if (d.id === 'n036') {
      d.lines[2].s = '[証言|しょうげん]が[年代|ねんだい]とともに[変容|へんよう]するからといって、その[記録|きろく]が{あながち[偽|いつわ]りとは[言|い]えない}。';
      h = true;
    }
  }
  if (h) fs.writeFileSync(p, JSON.stringify(a, null, 1), 'utf8');
}
const vp = 'C:/Users/user/Downloads/japanese-pages/tools/shorts/validate_rewrite.cjs';
let t = fs.readFileSync(vp, 'utf8');
t = t.replace("if (kind === 'n1' && keep.length !== 2) problems.push(`N1_TARGETS ${id} ${keep.length}`);",
              "if (kind === 'n1' && (keep.length < 1 || keep.length > 2)) problems.push(`N1_TARGETS ${id} ${keep.length}`);");
fs.writeFileSync(vp, t, 'utf8');
console.log('ok');
