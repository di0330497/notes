const { execSync } = require('child_process');
const fs = require('fs');
const ROOT = 'C:/Users/user/Downloads/japanese-pages';
const commits = ['96481f0', '93771d6', '2781e78', 'c12da27', '2efa837', '79e9601', '90edd8d'];
for (const c of commits) {
  try {
    const s = execSync(`git show ${c}:j/2b10e90aebe237af55/index.html`, { cwd: ROOT, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const bad = (s.match(/\uFFFD/g) || []).length;
    const title = (s.match(/<title>[\s\S]*?<\/title>/) || [''])[0];
    console.log(c, 'len', s.length, 'FFFD', bad, 'titleOK', /<\/title>/.test(title), '|', title.slice(0, 80));
  } catch (e) { console.log(c, 'ERR', e.message.slice(0, 80)); }
}
