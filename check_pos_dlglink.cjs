const { chromium } = require('C:/Users/user/.claude/skills/promptfilm/scripts/node_modules/playwright-core');
const URL = 'http://127.0.0.1:8901/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const p = await b.newPage({ viewport: { width: 1500, height: 1100 } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(URL + '?t=' + Date.now(), { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => {
    const out = {};
    /* 품사 탭 열기 */
    const navs = [...document.querySelectorAll('button,a')];
    const posBtn = navs.find(x => /품사/.test(x.textContent) && x.offsetParent);
    if (posBtn) posBtn.click();
    return !!posBtn;
  });
  await p.waitForTimeout(700);
  await p.evaluate(() => { const c = document.querySelector('#posView .chip[data-m="word"]'); if (c) c.click(); });
  await p.waitForTimeout(900);
  const res = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('#view-pos .uCard')];
    let withBtn = 0; const samples = [];
    cards.forEach(c => {
      const b = c.querySelector('.dlgLinkBadge');
      if (b) { withBtn++; if (samples.length < 8) samples.push((c.getAttribute('data-w') || '?') + ' → ' + b.getAttribute('data-goto-dlg') + '#' + b.getAttribute('data-goto-line')); }
    });
    return { posBtnFound: true, total: cards.length, withBtn, samples };
  });
  console.log(JSON.stringify({ ...info, ...res, errs }, null, 1));
  await b.close();
})();
