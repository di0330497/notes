const fs = require('fs');
const s = fs.readFileSync('C:/Users/user/Downloads/japanese-pages/j/2b10e90aebe237af55/index.html', 'utf8');
let i = -1;
while ((i = s.indexOf('\uFFFD', i + 1)) !== -1) {
  console.log('---', i, JSON.stringify(s.slice(Math.max(0, i - 60), i + 60)));
}
