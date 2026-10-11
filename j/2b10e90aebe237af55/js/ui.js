/* ══════════════════════════════════════════════════════════
   셸 동작 — 읽기 설정 · 모바일 목차 · 빵부스러기 · 단축키
   IT-eli5 학습자료의 index.html 말미 스크립트와 같은 규격이다.
   app.js(데이터 렌더링)와는 겹치지 않게 UI 껍데기만 다룬다.
   ══════════════════════════════════════════════════════════ */
(function(){
  var KEY='jpstudy';
  var root=document.documentElement;

  /* ── 읽기 설정: 글자 크기 · 줄 간격 · 고대비 ── */
  var RD={fs:'1',lh:'0',hc:'0'};
  try{ var sv=JSON.parse(localStorage.getItem(KEY+':read')||'{}'); for(var k in sv) if(k in RD) RD[k]=String(sv[k]); }catch(e){}
  function applyRD(){
    root.setAttribute('data-fs',RD.fs);
    root.setAttribute('data-lh',RD.lh);
    root.setAttribute('data-hc',RD.hc);
    [].slice.call(document.querySelectorAll('.seg')).forEach(function(seg){
      var key=seg.getAttribute('data-seg');
      [].slice.call(seg.children).forEach(function(b){
        b.setAttribute('aria-pressed', b.getAttribute('data-v')===RD[key] ? 'true':'false');
      });
    });
    try{localStorage.setItem(KEY+':read',JSON.stringify(RD));}catch(e){}
  }
  [].slice.call(document.querySelectorAll('.seg')).forEach(function(seg){
    seg.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      RD[seg.getAttribute('data-seg')]=b.getAttribute('data-v'); applyRD();
    });
  });
  applyRD();

  var rdbtn=document.getElementById('rdbtn'), rdpop=document.getElementById('rdpop');
  function rdOpen(on){ rdpop.hidden=!on; rdbtn.setAttribute('aria-expanded', on?'true':'false'); }
  rdbtn.addEventListener('click',function(e){ e.stopPropagation(); rdOpen(rdpop.hidden); });
  rdpop.addEventListener('click',function(e){ e.stopPropagation(); });
  document.addEventListener('click',function(){ rdOpen(false); });

  /* ── 화면 배율 — 기본 150%.
     <head> 인라인 스크립트가 이미 걸어 둔 값을 이어받아 버튼만 붙인다 ── */
  var ZS=window.__zoomSteps||[1,1.25,1.5,1.75], z=window.__zoom||1.5;
  var zb=document.getElementById('zoomBtn');
  function applyZoom(){
    root.style.setProperty('--zoom',z);
    if(zb) zb.textContent=Math.round(z*100)+'%';
    try{ localStorage.setItem(KEY+':zoom',z); }catch(e){}
    if(window.__brk) window.__brk();
  }
  if(zb) zb.addEventListener('click',function(){ z=ZS[(ZS.indexOf(z)+1)%ZS.length]; applyZoom(); });
  addEventListener('resize',function(){ if(window.__brk) window.__brk(); });
  applyZoom();

  /* ── ふりがな 상태도 기억한다. 켜고 끄는 빈도가 높은 설정이다 ── */
  try{
    if(localStorage.getItem(KEY+':nofuri')==='1'){
      var fb=document.querySelector('[data-furi]');
      if(fb) fb.click();   // app.js 의 토글을 그대로 태워 버튼 표시까지 맞춘다
    }
  }catch(e){}
  [].slice.call(document.querySelectorAll('[data-furi]')).forEach(function(b){
    b.addEventListener('click',function(){
      try{localStorage.setItem(KEY+':nofuri',document.body.classList.contains('noFuri')?'1':'0');}catch(e){}
    });
  });

  /* ── 빵부스러기: 지금 보고 있는 학습 모드를 위에 적는다 ── */
  var crumb=document.getElementById('crumb');
  var LABEL={study:'학습 카드',pat:'문형 사전',gram:'문법',conj:'활용표',
             pos:'품사 사전',spoken:'구어체',expr:'표현·관용구',talk:'대화'};
  var ORDER=['talk','study','pat','gram','conj','pos','spoken','expr'];
  function paintCrumb(){
    var on=document.querySelector('.tab.on');
    var cover=document.querySelector('.page.on#page-cover');
    var v=cover?'cover':(on?on.getAttribute('data-v'):'study');
    var t=v==='cover'?'':LABEL[v];
    crumb.innerHTML='<b>빈도순 일본어</b>'+(t?' · '+t:'');
    document.title=(t?t+' · ':'')+'빈도순 일본어';
  }
  [].slice.call(document.querySelectorAll('.tab')).forEach(function(t){
    t.addEventListener('click',function(){ paintCrumb(); closeNav(); });
  });

  /* ── 표지로 돌아가기 ── */
  var navCover=document.getElementById('navCover');
  if(navCover) navCover.addEventListener('click',function(e){
    e.preventDefault();
    if(typeof showPage==='function') showPage('page-cover');
    [].slice.call(document.querySelectorAll('.tab')).forEach(function(t){t.classList.remove('on');t.setAttribute('aria-pressed','false');});
    paintCrumb(); closeNav();
  });

  /* ── 해시 주소 ── (#cover / #study / #pat …) ── */
  function fromHash(){
    var h=(location.hash||'').replace('#','');
    if(h==='cover'){ if(navCover) navCover.click(); return true; }
    if(ORDER.indexOf(h)<0) return false;
    if(typeof switchView==='function') switchView(h);
    paintCrumb();
    return true;
  }
  addEventListener('hashchange',fromHash);

  paintCrumb();

  /* ── 모바일 목차(사이드바 서랍) ── */
  var side=document.getElementById('side'), scrim=document.getElementById('scrim');
  function closeNav(){
    if(side) side.classList.remove('open');
    if(scrim) scrim.classList.remove('on');
  }
  function openNav(){
    if(side) side.classList.add('open');
    if(scrim) scrim.classList.add('on');
  }
  ['navbtn','burger'].forEach(function(id){
    var b=document.getElementById(id);
    if(b) b.addEventListener('click',function(e){ e.stopPropagation(); side&&side.classList.contains('open')?closeNav():openNav(); });
  });
  if(scrim) scrim.addEventListener('click',closeNav);

  /* 해시가 처음부터 있으면 그 화면으로 바로 연다 */
  fromHash();

  /* ── 단축키 ──
     /      지금 보이는 검색창으로
     Ctrl+K 통합 검색
     1~7    학습 모드 전환 (사이드바 순서 그대로)
     Esc    포커스 해제 · 서랍/팝오버 닫기                              */
  function activeSearch(){
    var tb=document.querySelector('.toolbar:not(.hidden)');
    return tb?tb.querySelector('input'):null;
  }
  addEventListener('keydown',function(e){
    var typing=/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName||''));
    /* Ctrl+K — 통합 검색으로. 브라우저 기본 동작(주소창 검색)을 가로챈다 */
    if((e.ctrlKey||e.metaKey)&&!e.altKey&&(e.key==='k'||e.key==='K')){
      var ga=document.getElementById('qAll');
      if(ga){e.preventDefault();closeNav();ga.focus();ga.select();}
      return;
    }
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    if(e.key==='/'&&!typing){
      var el=activeSearch();
      if(el){e.preventDefault();closeNav();el.focus();el.select();}
      return;
    }
    if(!typing&&/^[1-8]$/.test(e.key)){
      var v=ORDER[parseInt(e.key,10)-1];
      if(v&&typeof switchView==='function'){
        e.preventDefault(); switchView(v); paintCrumb(); closeNav();
      }
      return;
    }
    if(e.key==='Escape'){
      if(document.activeElement&&document.activeElement.blur) document.activeElement.blur();
      closeNav();
      rdOpen(false);
    }
  });
})();
