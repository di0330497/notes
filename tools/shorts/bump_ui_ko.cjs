const fs = require('fs');
const p = 'C:/Users/user/Downloads/japanese-pages/j/2b10e90aebe237af55/index.html';
let s = fs.readFileSync(p, 'utf8');
s = s.replace(/css\/styles\.css\?v=[^"']+/, 'css/styles.css?v=20261118-ko1');
s = s.replace(/js\/app\.js\?v=[^"']+/, 'js/app.js?v=20261118-ko1');
fs.writeFileSync(p, s, 'utf8');
console.log((s.match(/css\/styles\.css\?v=[^"']+/) || [''])[0]);
console.log((s.match(/js\/app\.js\?v=[^"']+/) || [''])[0]);
console.log('fffd', (s.match(/\uFFFD/g) || []).length);
