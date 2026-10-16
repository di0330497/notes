/* missing_<종류>.txt 의 카테고리(2번째 필드) 분포를 뽑는다 */
const fs = require('fs');
const out = [];
['문형', '문법', '표현', '구어체', '활용표', '품사'].forEach(k => {
  const f = 'missing_' + k + '.txt';
  if (!fs.existsSync(f)) return;
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean);
  const cat = {};
  const ranges = [];
  lines.forEach((l, i) => {
    const key = l.split('\t')[0];
    const hint = (l.split('\t')[1] || '');
    let c = '';
    if (k === '표현') { const p = hint.split('  |  '); c = p[1] || ''; }
    else if (k === '문법') { c = hint.split('  |  ')[0] || ''; }
    else if (k === '구어체') { c = hint.split('  |  ')[0] || ''; }
    else if (k === '품사') { c = hint.split('  |  ')[0] || ''; }
    else if (k === '활용표') { c = hint.split('  |  ')[0] || ''; }
    else c = 'lv' + (hint.match(/^lv(\d)/) ? hint.match(/^lv(\d)/)[1] : '?');
    cat[c] = cat[c] || [];
    cat[c].push(i + 1);
  });
  out.push('══ ' + k + ' (' + lines.length + ')');
  Object.entries(cat).forEach(([c, idx]) => {
    const nums = idx.map(n => n); /* 줄 번호 */
    out.push('  ' + c + '  ×' + idx.length + '   (lines ' + nums[0] + '~' + nums[nums.length - 1] + ')');
  });
  out.push('');
});
fs.writeFileSync('missing_cats.txt', out.join('\n'), 'utf8');
console.log('ok');
