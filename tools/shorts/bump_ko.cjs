const fs = require('fs');
const p = 'C:/Users/user/Downloads/japanese-pages/j/2b10e90aebe237af55/index.html';
let s = fs.readFileSync(p, 'utf8');
s = s.replace(/data\/lessons\.js\?v=[^"']+/, 'data/lessons.js?v=20261118-tracks2');
fs.writeFileSync(p, s, 'utf8');
console.log((s.match(/data\/lessons\.js\?v=[^"']+/) || [''])[0], 'fffd', (s.match(/\uFFFD/g) || []).length);
