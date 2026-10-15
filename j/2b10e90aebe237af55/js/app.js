/* ══════════════════════════════════════════════════════════
   데이터 렌더링 — 학습 카드 · 문형 · 문법 · 활용표 · 품사 · 구어체 · 표현
   UI 껍데기(읽기 설정·서랍·단축키)는 ui.js 가 맡는다.

   ── 일곱 화면이 같은 부품을 쓴다 ──
   예문 블록(exBlock) · 뜻 상자(meanBox) · 메모 상자(tipBox/warnBox) ·
   카드 셸(.uCard) · 카드 머리(uTop) · 섹션 헤딩(secHd) ·
   개수 줄(setCount) · 빈 화면(emptyNote) · 검색 색인(hay).
   화면이 달라도 같은 것은 같은 모양으로 보여야 한다.
   ══════════════════════════════════════════════════════════ */
if(typeof FOOD!=="undefined")FOOD.forEach(function(f){ALL.push(f);});
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const CATNAME={"basic":"기본 문형·명사문","josa":"조사","conj":"동사 활용·의지·명령","expr":"능력·희망·경험","give":"수수 표현","te":"て형 확장","time":"시간·타이밍","reason":"이유·원인·근거","contrast":"역접·양보","cond":"조건·가정·한정","guess":"추측·판단·확신","quote":"전문·인용","topic":"화제·대상·입장","degree":"정도·비교·강조","state":"상태·경향·모습","change":"변화·결정·습관","purpose":"목적·수단·기준","duty":"의무·허가·충고","final":"문말 표현 (감정·평가)","neg":"부정·이중부정","nom":"형식명사 (こと・もの・わけ)","link":"접속·나열·전개","lit":"문어체·격식","keigo":"경어","adv":"부사 호응"};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function setChips(sel,el){$$(sel+" .chip").forEach(function(x){var on=x===el;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on);});}

/* 루비 표기를 바로잡는다. 데이터에 네 꼴이 섞여 들어와 있다 —
     [漢字|よみ]   루비
     [かな]        가나 표제어 밑줄
     {표제어}      표제어 밑줄
     {漢字|よみ}   표제어 밑줄 + 루비
   그리고 짝이 어긋난 것도 있다 ({漢字|よみ] · [漢字|よみ}).
   fmt() 는 넷 다 같은 뜻으로 읽고, 검색·발음도 이 규칙 하나만 쓴다 */
const fixM=s=>String(s==null?"":s)
  .replace(/\{([^|{}\[\]]+)\|([^}{\[\]]+)\]/g,'{$1|$2}')
  .replace(/\[([^|{}\[\]]+)\|([^}{\[\]]+)\}/g,'[$1|$2]');

/* [漢字|よみ] → ruby, [かな]·{…} → 표제어 밑줄, 대상 한자 → 형광 */
function fmt(s,target){
  s=esc(fixM(s));
  /* 한자와 읽기가 같으면 루비를 만들지 않는다 — 「[ぜ|ぜ]」는 「ぜ」로.
     중괄호였다면 표제어 밑줄은 남긴다 */
  s=s.replace(/([\[{])([^|{}\[\]]+)\|\2([\]}])/g,function(m,o,w){return o==="{"?"{"+w+"}":w;});
  /* {漢字|よみ} → {[漢字|よみ]}. 아래 두 규칙이 차례로 밑줄과 루비를 붙인다 */
  s=s.replace(/\{([^|{}\[\]]+)\|([^}{\[\]]+)\}/g,'{[$1|$2]}');
  s=s.replace(/\{([^}]*)\}/g,'<em class="g">$1</em>');
  if(target)s=s.split(target).join('<span class="tg">'+target+'</span>');
  s=s.replace(/\[([^|\]]+)\|([^\]]+)\]/g,'<ruby>$1<rt>$2</rt></ruby>');
  /* [でも]·[えっと]·[うん] 처럼 가나만 든 대괄호는 표제어 밑줄이다.
     루비를 만들 수 없는 말이라 저자가 강조 표시로 쓴 것 — {…} 와 같은 뜻으로 읽는다 */
  s=s.replace(/\[([\u3040-\u30FF\u30FC]{1,14})\]/g,'<em class="g">$1</em>');
  return s;
}
/* 검색용 민무늬 문자열. 색인은 어느 화면에서든 이 규칙 하나만 쓴다 —
   「日課」로 쳐도 [日課|にっか] 가 걸리고, {…} 표시는 무시된다 */
const dup=(m,a,b)=>a===b?a:a+b;
const stripM=s=>fixM(s)
  .replace(/\{([^|{}\[\]]+)\|([^}{\[\]]+)\}/g,function(m,a,b){return "{"+dup(m,a,b)+"}"})
  .replace(/\{|\}/g,"")
  .replace(/\[([^|\]]+)\|([^\]]+)\]/g,dup)
  .replace(/\[([\u3040-\u30FF\u30FC]{1,14})\]/g,"$1")
  /* ～(전각) / 〜(파입) 물결을 하나로 모은다.
     patterns.js 는 전각 663개를 쓰고, 대화 태그는 파입을 써서
     같은 문형을 두 글자로 만들어 검색이 0건이 났다 */
  .replace(/\u301C/g,"\uFF5E")
  .replace(/[\uFF1F\u003F]/g,"");
/* 루비를 한자만 남기고 편다. 「[頑張|がんば]る」→「頑張る」 */
const stripK=s=>fixM(s)
  .replace(/\{([^|{}\[\]]+)\|([^}{\[\]]+)\}/g,"{$1}")
  .replace(/\{|\}/g,"")
  .replace(/\[([^|\]]+)\|([^\]]+)\]/g,"$1")
  .replace(/\[([\u3040-\u30FF\u30FC]{1,14})\]/g,"$1");
/* 색인은 두 꼴을 함께 담는다 — 한자+읽기(日課にっか)와 한자만(頑張る).
   오쿠리가나가 붙는 동사·형용사는 뒤쪽 꼴로만 걸린다 */
const hay=(...xs)=>{
  const raw=xs.flat(9).filter(x=>x!=null&&x!=="").join(" ");
  return (stripM(raw)+" \u0000 "+stripK(raw)).toLowerCase();
};
const num=n=>n.toLocaleString("ko-KR");
/* 받침 유무로 조사를 고른다. "문형이 / 활용표가" 처럼 안내문이 어색해지지 않게 */
function josa(w,withFinal,withoutFinal){
  const s=String(w),c=s.charCodeAt(s.length-1);
  if(c<0xac00||c>0xd7a3)return withoutFinal;
  return (c-0xac00)%28?withFinal:withoutFinal;
}

const PATMAP={};PATS.forEach(p=>{if(!PATMAP[p.pat])PATMAP[p.pat]=p});
const hasCONJ=typeof CONJ!=="undefined", hasSPOKEN=typeof SPOKEN!=="undefined";
/* 품사 사전 — 파일이 다섯으로 나뉘어 있어 여기서 한 배열로 합친다 */
const POS=[].concat(
  typeof POS_JOSA!=="undefined"?POS_JOSA:[],
  typeof POS_ADV!=="undefined"?POS_ADV:[],
  typeof POS_OTHER!=="undefined"?POS_OTHER:[],
  typeof POS_VERB!=="undefined"?POS_VERB:[],
  typeof POS_NOUN!=="undefined"?POS_NOUN:[]);
const hasPOS=POS.length>0;
/* 품사 사전은 두 층이다 — 묶음 표(POS)와 낱말(POS_WORDS). 품사 칩은 두 층에 함께 걸린다 */
const WORDS=typeof POS_WORDS!=="undefined"?POS_WORDS:[];
const hasWORDS=WORDS.length>0;
const WCAT=typeof POS_WCAT!=="undefined"?POS_WCAT:{};
const PNAME={};POS.forEach(x=>{if(!PNAME[x.p])PNAME[x.p]=x.pn;});
const PORDER=Object.keys(PNAME);

/* 학습 모드 이름 — 탭·개수 줄·빈 화면·통합 검색이 같은 말을 쓴다 */
const QSEL={study:"#qStudy",pat:"#qPat",gram:"#qGram",conj:"#qConj",
  pos:"#qPos",spoken:"#qSpoken",expr:"#qExpr",talk:"#qTalk"};
const MODE={study:"학습 카드",pat:"문형",gram:"문법",conj:"활용표",
            pos:"품사",spoken:"구어체",expr:"표현·관용구",talk:"대화"};

/* ══════════ 공통 부품 ══════════ */

/* 예문 블록 — 학습 카드가 기준이다. 일곱 화면이 이 함수 하나를 쓴다.
   배지 한 줄 → 큰 세리프 예문 → 번역. 화면이 달라도 예문 표현은 하나로 둔다 */
function exBlock(s,ko,o){
  o=o||{};
  const b=o.badge||"例";
  const cls=b==="音"?"on":b==="訓"?"kn":"ex";
  return '<div class="exBlock">'
    +'<div class="exHead"><span class="rBadge '+cls+'">'+esc(b)+'</span></div>'
    +'<div class="sent">'+fmt(s,o.target)+'</div>'
    +'<div class="trans">'+esc(ko||"")+'</div>'
    +(o.cue||"")+'</div>';
}
const exList=(arr,o)=>(arr||[]).map(x=>exBlock(x.s,x.ko,o)).join("");
/* 라벨 붙은 상자 — 뜻·요령·주의가 모두 같은 모양을 쓴다 */
function labelBox(cls,label,html){
  return '<div class="'+cls+'"><span class="uLabel">'+esc(label)+'</span><span>'+html+'</span></div>';
}
const meanBox=t=>labelBox("uMean","의미·용법",esc(t));
const tipBox=h=>labelBox("uTip","외우는 요령",h);
const warnBox=h=>labelBox("uTip warn","주의",h);
/* 카드 머리 — 레벨 배지 → 표제어 → 오른쪽 메타. 여섯 화면이 같은 줄을 쓴다 */
function uTop(badge,title,meta,jp){
  return '<div class="uTop">'+(badge||"")
    +'<span class="uT'+(jp?" jp":"")+'">'+title+'</span>'
    +(meta?'<span class="uMeta">'+esc(meta)+'</span>':"")+'</div>';
}
/* 섹션 헤딩 — 코드 배지 → 이름 → 오른쪽 개수. 레일 색은 화면(#view-*)이 정한다 */
function secHd(code,name,meta){
  return '<div class="secHd"><span class="pn">'+esc(code)+'</span>'+esc(name)
    +(meta?'<span class="pn2">'+esc(meta)+'</span>':"")+'</div>';
}
/* 카드 안에 접개로 넣는 형태 — 카드가 너무 길어지지 않게 */

/* 개수 줄 — "모드명 N단위 · 부가정보" 한 형식으로 통일한다 */
function setCount(){
  const txt=[].slice.call(arguments).filter(Boolean).join(" · ");
  $$(".page.on .count").forEach(el=>{el.textContent=txt;});
}
/* 빈 화면 — 어느 탭에서든 같은 문장, 같은 다음 행동 안내 */
function emptyNote(mode){
  const n=MODE[mode]||"항목";
  const el=$(QSEL[mode]),q=el?el.value.trim().toLowerCase():"";
  return '<div class="note emptyNote">조건에 맞는 '+n+josa(n,"이","가")
    +' 없어요. 검색어나 필터를 바꿔 보세요.'
    +elsewhere(mode,q)+'</div>';
}
/* 이 화면엔 없지만 다른 데는 있는 경우를 짚어 준다.
   품사 사전은 한 탭에 묶음 표와 낱말 두 층이 있으므로 그쪽을 먼저 본다 */
function elsewhere(mode,q){
  if(!q)return "";
  let h="";
  if(mode==="pos"&&hasWORDS){
    const other=posMode==="group"?"word":"group";
    const hit=other==="word"
      ? WORDS.filter(x=>hay(x.w,x.r,x.m,x.ex.map(e=>[e.s,e.ko]),x.n).includes(q)).length
      : POS.filter(x=>hay(x.t,x.w,x.mean,x.desc,x.tip,x.head,x.rows,x.ex.map(e=>[e.s,e.ko])).includes(q)).length;
    if(hit)h+='<button class="elseBtn" data-pos="'+other+'">'
      +(other==="word"?"낱말 보기":"묶음 보기")+'에 '+num(hit)+'건 있어요 →</button>';
  }
  if(!GS_INDEX)GS_INDEX=buildGsIndex();
  const cnt={};
  for(const it of GS_INDEX)if(it.hay.includes(q))cnt[it.k]=(cnt[it.k]||0)+1;
  GS_ORDER.forEach(k=>{
    if(k===mode||!cnt[k])return;
    h+='<button class="elseBtn" data-go="'+k+'" data-q="'+esc(q)+'">'
      +esc(MODE[k])+' '+num(cnt[k])+'건 →</button>';
  });
  return h?'<div class="elseWhere"><span class="elseLead">「'+esc(q)+'」가 있는 곳</span>'+h+'</div>':"";
}
/* 버튼은 화면을 다시 그릴 때마다 새로 생기므로 문서 한 곳에서 받는다 */
document.addEventListener("click",e=>{
  const b=e.target.closest(".elseBtn");if(!b)return;
  if(b.dataset.pos){
    posMode=b.dataset.pos;
    const c=$('#posView .chip[data-m="'+posMode+'"]');
    if(c)setChips("#posView",c);
    renderPos();scrollTop();
    return;
  }
  if(b.dataset.go)gsToTab(b.dataset.go,b.dataset.q||"");
});
function loadFail(mode){
  return '<div class="note emptyNote">'+(MODE[mode]||"항목")+' 데이터를 불러오지 못했습니다.</div>';
}

/* 레벨 배지 */
function lvBadge(lv){
  const n=(lv==="0"||lv===0)?"0":String(lv);
  return '<span class="lvdot n'+n+'">'+(n==="0"?"기초":"N"+n)+'</span>';
}
/* 한자 학년(grade) → JLPT N레벨 매핑 */
function gradeToLv(g){
  if(g===1||g===2)return "5";
  if(g===3||g===4)return "4";
  if(g===5||g===6)return "3";
  if(g===8)return "2";
  return "1"; // 9,10(인명용), 0(표외), 20(식재료)
}
function gradeBadge(g){
  if(g>=1&&g<=6)return '<span class="gradeBadge gd-e">'+g+'학년</span>';
  if(g===8)return '<span class="gradeBadge gd-m">중·고</span>';
  if(g===9||g===10)return '<span class="gradeBadge gd-j">인명용</span>';
  if(g===0)return '<span class="gradeBadge gd-x">표외</span>';
  if(g===20)return '<span class="gradeBadge gd-food">식재료</span>';
  return '';
}

/* ══════════ 북마크 — 학습 카드에 별 표시 ══════════
   renderStudy() 보다 앞에 둔다. cardHTML 이 이 Set 을 바로 읽기 때문에
   뒤에 두면 TDZ(초기화 전 접근) 오류로 렌더가 통째로 죽는다. */
let bookmarks=new Set(JSON.parse(localStorage.getItem("jpstudy:bookmarks")||"[]"));
function saveBookmarks(){
  localStorage.setItem("jpstudy:bookmarks",JSON.stringify([...bookmarks]));
}
function toggleBookmark(rank){
  if(bookmarks.has(rank)){
    bookmarks.delete(rank);
    toast("북마크를 지웠어요");
  }else{
    bookmarks.add(rank);
    toast("\u2605 북마크에 저장했어요");
  }
  saveBookmarks();
  renderBookmarks();
}
function renderBookmarks(){
  document.querySelectorAll(".bookmark-btn").forEach(btn=>{
    const r=parseInt(btn.dataset.r,10);
    btn.classList.toggle("active",bookmarks.has(r));
  });
  const cnt=$("#bmCount");
  if(cnt)cnt.textContent=bookmarks.size;
}
document.addEventListener("click",e=>{
  const b=e.target.closest(".bookmark-btn");
  if(b){toggleBookmark(parseInt(b.dataset.r,10));return;}
});

/* ══════════ 학습 카드 ══════════ */
let fLv="all";
/* 常用漢字 2,136자 경계. 데이터의 등급값이 곧 그 경계다 —
   등급 1~6(교육한자 1,026) + 등급 8(중학 이후 1,110) = 2,136.
   등급 0(인명용) · 9(표외) · 10(추가) · 20(식재료) 511자가 범위 밖. */
let fJoyo="all";
const isJoyo=g=>(g>=1&&g<=6)||g===8;
function cardHTML(e,rank,rankLabel){
  const kor=e.kor?'<div class="korSnd">한국음 '+esc(e.kor)+'</div>':'';
  /* 「문장 속 표현」은 예문에 {…} 로 표시해 둔 낱말이다. 데이터에 따로 싣지 않고 여기서 꺼낸다 */
  const blocks=e.ex.map(x=>{
    const m=x.s.match(/\{([^}]*)\}/);
    return exBlock(x.s,x.ko,{
      badge:x.t, target:e.k,
      cue:'<div class="uCue"><span class="uLabel">한자 뜻</span>'
         +'<span><b>'+esc(e.k)+' · '+esc(e.hun)+'</b>'
         +(m?' — 문장 속 표현 '+fmt(m[1]):"")+'</span></div>'
    });
  }).join("");
  return '<div class="card" data-r="'+rank+'">'
    +'<button class="bookmark-btn'+(bookmarks.has(rank)?' active':'')+'" data-r="'+rank+'" aria-label="북마크"></button>'
    +'<div class="kanjiCol">'
    +'<span class="rank">'+(rankLabel||('#'+rank))+'</span><div class="bigK">'+esc(e.k)+'</div>'
    +'<div class="hun">'+esc(e.hun)+'</div>'+kor+'</div>'
    +'<div class="exCol"><div class="readRow">'
    +'<span class="rBadge on">音</span><span class="readTx">'+esc(e.on)+'</span>'
    +'<span class="rBadge kn">訓</span><span class="readTx">'+esc(e.kun)+'</span>'
    +'</div>'+blocks+'</div></div>';
}
const STUDYBYK={};
if(typeof STUDY_FULL!=='undefined')STUDY_FULL.forEach(e=>{STUDYBYK[e.k]=e;});
STUDY.forEach(e=>{STUDYBYK[e.k]=e;});
function basicCardHTML(r,rank,rankLabel){
  const kor=r[3]?'<div class="korSnd">한국음 '+esc(r[3])+'</div>':'';
  return '<div class="card basic" data-r="'+rank+'"><div class="kanjiCol">'
    +'<span class="rank">'+(rankLabel||('#'+rank))+'</span><div class="bigK">'+esc(r[0])+'</div>'+kor+'</div>'
    +'<div class="exCol"><div class="readRow">'
    +'<span class="rBadge on">音</span><span class="readTx">'+esc(r[1]||"—")+'</span>'
    +'<span class="rBadge kn">訓</span><span class="readTx">'+esc(r[2]||"—")+'</span></div>'
    +'<div class="basicMean"><span class="en">'+esc(r[5]||"")+'</span></div>'
    +'<div class="basicMeta">'+gradeBadge(r[4])+'</div></div></div>';
}
let studyItems=[],studyPage=0;const PAGE=100;
function renderStudy(){
  const q=$("#qStudy").value.trim().toLowerCase().replace(/\u301C/g,"\uFF5E").replace(/[\uFF1F\u003F]/g,"");
  const filtered=fLv!=="all";
  studyItems=[];let exShown=0;
  ALL.forEach((r,i)=>{
    const rank=i+1, e=STUDYBYK[r[0]];
    const rankLabel=r[4]===20?'🍽 식재료':('#'+rank);
    if(filtered&&gradeToLv(r[4])!==fLv)return;
    if(fJoyo==="joyo"&&!isJoyo(r[4]))return;   /* 상용한자 2,136 안 */
    if(fJoyo==="out"&&isJoyo(r[4]))return;     /* 그 밖(인명용·표외·추가·식재료) */
    if(e){
      if(q&&!hay(e.k,e.hun,e.on,e.kun,e.kor,e.ex.map(x=>[x.s,x.ko])).includes(q))return;
      exShown+=e.ex.length;
      studyItems.push({rank:rank,html:cardHTML(e,rank,rankLabel)});
    }else{
      if(filtered)return;
      if(q&&!hay(r[0],r[1],r[2],r[3],r[5]).includes(q))return;
      studyItems.push({rank:rank,html:basicCardHTML(r,rank,rankLabel)});
    }
  });
  studyPage=0;
  paintStudy(false);
  const bits=[];
  if(fJoyo==="joyo")bits.push("상용한자 2,136 안");
  if(fJoyo==="out")bits.push("상용한자 밖 511");
  if(filtered)bits.push("예문 "+num(exShown)+"개");
  setCount(MODE.study+" "+num(studyItems.length)+"자", bits.join(" · "));
}
function paintStudy(scroll){
  if(!studyItems.length){
    $("#view-study").innerHTML=emptyNote("study");
    setPager();return;
  }
  if(studyPage>studyItems.length-1)studyPage=Math.floor((studyItems.length-1)/PAGE)*PAGE;
  if(studyPage<0)studyPage=0;
  const end=Math.min(studyPage+PAGE,studyItems.length);
  $("#view-study").innerHTML=studyItems.slice(studyPage,end).map(x=>x.html).join("");
  setPager(end);
  updateProgress();
  if(scroll)scrollTop();
}
function setPager(end){
  const n=studyItems.length;
  end=end||Math.min(studyPage+PAGE,n);
  const info=n?((studyPage+1)+"–"+end+" / "+num(n)+"자 · 순위 "+studyItems[studyPage].rank+"~"+studyItems[end-1].rank):"0자";
  $$(".pgInfo").forEach(el=>el.textContent=info);
  $$(".pager").forEach(p=>p.classList.toggle("hidden",n<=PAGE));
  $$('.pgBtn[data-a="prev"]').forEach(b=>b.disabled=studyPage<=0);
  $$('.pgBtn[data-a="next"]').forEach(b=>b.disabled=end>=n);
}
function studyPager(a,val){
  if(a==="prev")studyPage=Math.max(0,studyPage-PAGE);
  else if(a==="next"){if(studyPage+PAGE<studyItems.length)studyPage+=PAGE;}
  else if(a==="go"){const n=parseInt(val,10);if(!n)return;
    let idx=studyItems.findIndex(x=>x.rank>=n);if(idx<0)idx=studyItems.length-1;
    studyPage=Math.floor(idx/PAGE)*PAGE;}
  paintStudy(true);
}
document.addEventListener("click",e=>{const b=e.target.closest(".pager .pgBtn");if(!b)return;
  const inp=b.closest(".pager").querySelector(".pgRank");studyPager(b.dataset.a,inp?inp.value:null);});
document.addEventListener("keydown",e=>{if(e.key!=="Enter")return;const inp=e.target.closest(".pgRank");if(inp)studyPager("go",inp.value);});
function syncSideRail(){
  const pager=$("#pagerTop"),slot=$("#sidePagerSlot"),study=$("#view-study"),main=$("#main");
  if(!pager||!slot||!study||!main)return;
  if(window.matchMedia("(min-width:1000px)").matches){
    if(pager.parentElement!==slot)slot.appendChild(pager);
  }else if(pager.parentElement!==main){
    main.insertBefore(pager,study);
  }
}
window.addEventListener("resize",syncSideRail);
window.addEventListener("load",syncSideRail);

/* ══════════ 화면 사이 건너뛰기 — 배지·강조를 한 규칙으로 ══════════ */
function relBadges(list){
  const rels=(list||[]).filter(p=>PATMAP[p]);
  if(!rels.length)return "";
  return '<span class="uFootLabel">관련 문형</span>'+rels.map(p=>'<span class="patBadge pB'+PATMAP[p].lv
    +'" data-p="'+esc(p)+'"><span class="pj">'+esc(p)+'</span></span>').join(" ");
}
function bindJumps(sel){
  $$(sel+" .patBadge").forEach(b=>b.onclick=()=>gotoPat(b.dataset.p));
  $$(sel+" .jumpBadge[data-cj]").forEach(b=>b.onclick=()=>gotoConj(b.dataset.cj));
  $$(sel+" .jumpBadge[data-ps]").forEach(b=>b.onclick=()=>gotoPos(b.dataset.ps));
}
/* 건너뛴 뒤 그 카드를 짚어 준다. 네 화면이 같은 강조(.hl)와 같은 스크롤을 쓴다 */
function focusCard(sel){
  const el=$(sel);if(!el)return;
  setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),60);
}

/* ══════════ 문형 사전 — 의미 분류 → 클러스터 2단 묶음 ══════════ */
let pLv="all";
function renderPat(hlPat){
  const q=$("#qPat").value.trim().toLowerCase().replace(/\u301C/g,"\uFF5E").replace(/[\uFF1F\u003F]/g,""),cat=$("#patCat").value;
  /* 원본 순서를 유지하면서 cat → clu 두 단계로 버킷에 담는다.
     정렬하지 않고 "처음 나온 순서"를 쓰므로 레벨 흐름이 흐트러지지 않는다 */
  const order=[],bucket={};
  let n=0;
  PATS.forEach(p=>{
    if(pLv!=="all"&&p.lv!==pLv)return;
    if(cat!=="all"&&p.cat!==cat)return;
    if(q&&!hay(p.pat,p.mean,p.clu,p.ex.map(x=>[x.s,x.ko])).includes(q))return;
    n++;
    if(!bucket[p.cat]){bucket[p.cat]={order:[],clu:{}};order.push(p.cat);}
    const b=bucket[p.cat];
    const key=p.clu||"—";
    if(!b.clu[key]){b.clu[key]=[];b.order.push(key);}
    b.clu[key].push(p);
  });
  let h="";
  order.forEach(c=>{
    const b=bucket[c],cnt=b.order.reduce((a,k)=>a+b.clu[k].length,0);
    h+=secHd(c,CATNAME[c]||c,cnt+"개 · "+b.order.length+"묶음");
    b.order.forEach(k=>{
      const list=b.clu[k];
      h+='<div class="cluHd">'+esc(k)+'<em>'+list.length+'</em></div>';
      list.forEach(p=>{
        h+='<div class="uCard'+(hlPat===p.pat?" hl":"")+'" data-p="'+esc(p.pat)+'">'
          +uTop(lvBadge(p.lv),fmt(p.pat),CATNAME[p.cat]||p.cat,true)
          +meanBox(p.mean)
          +exList(p.ex)
          +'</div>';
      });
    });
  });
  $("#view-pat").innerHTML=h||emptyNote("pat");
  setCount(MODE.pat+" "+num(n)+"개","의미 분류 "+order.length+"갈래");
  if(hlPat)focusCard("#view-pat .uCard.hl");
}
function gotoPat(p){
  switchView("pat");
  $("#qPat").value=p;pLv="all";
  chipAll("#patLv","l");
  $("#patCat").value="all";
  renderPat(p);
}

/* ══════════ 문법 ══════════ */
const GRAM_CH=[["A","발음 팁"],["B","품사"],["C","명사·지시·수"],["D","동사총론"],["E","동사활용"],["F","형용사"],["G1","조사①"],["G2","조사②"],["H","조동사"],["I","상·보조"],["J","수수"],["K","경어"],["L","문장"],["M3","N3 고급"],["M2","N2 고급"],["M1","N1 고급"],["Z","일본식 사고"]];
const GRAM_BY_CH={"A":"발음","B":"품사","C":"명사","D":"동사","E":"동사 활용","F":"형용사","G1":"조사","G2":"조사","H":"조동사","I":"상·보조","J":"수수","K":"경어","L":"문장","M3":"고급","M2":"고급","M1":"고급","Z":"사고"};
/* 문법 항목 → 활용표 항목 연결. 위에서부터 먼저 걸리는 것을 쓴다 */
const GRAM2CONJ=[
  [/3그룹|그룹 구별|동사의 특징과 활용|그룹 분류/,"v-grp"],
  [/て형 만들기|음편/,"v-onbin"],
  [/자동사|타동사/,"v-jita"],
  [/보조동사|ている|てある|ておく|てしまう|ていく|てくる|てみる/,"v-hojo"],
  [/보통형/,"a-futsu"],
  [/조건형 ば|たら 조건|なら 조건|と 조건|条件|조건/,"c-cond"],
  [/れる・られる|せる・させる/,"x-aux"],
  [/사전형|ます형|た형|ない형|가능형|의지형|명령형|금지형|受身|수동형|使役|사역|なさい|ず\/ぬ/,"v-g1"],
  [/い형용사/,"a-i"],
  [/な형용사|형용동사/,"a-na"],
  [/수수|あげる|くれる|もらう/,"c-juju"],
  [/경어|존경|겸양|정중어|お·ご|バイト/,"k-tbl"],
  [/지시|こそあど|코소아도/,"w-kosoado"],
  [/조수사|수량|수사|숫자|조수/,"w-counter"],
  [/날짜|시각|時刻/,"w-date"],
  [/의문/,"w-q"],
  [/부사/,"w-adv"],
  [/そうだ|ようだ|らしい|はず|べき|みたい|조동사/,"x-aux"]
];
/* 문법 항목 → 품사 사전 연결 (조사·부사·수사·형용사 장) */
const GRAM2POS=[
  [/형식명사|形式名詞|名詞化/,"nn-keishiki"],
  [/동사 3그룹|그룹 구별|동사의 특징|3グループ/,"vb-g1"],
  [/자동사|타동사/,"vb-pair"],
  [/수수|あげる|くれる|もらう/,"vb-kihon"],
  [/^は[\s(（]|は와 が|「は」と「が」/,"js-wa"],
  [/^が[\s(（]/,"js-ga"],[/^を[\s(（]/,"js-wo"],[/^に[\s(（]/,"js-ni"],
  [/^へ[\s(（]/,"js-he"],[/^で[\s(（]/,"js-de"],[/^と[\s(（]/,"js-to"],
  [/から·まで|から・まで/,"js-kara"],[/^より/,"js-yori"],[/^も[\s(（]/,"js-mo"],
  [/しか|^だけ|ばかり|のみ/,"js-dake"],
  [/くらい|ぐらい|^ほど|など|なんか/,"js-kurai"],
  [/さえ|こそ/,"js-sae"],
  [/명사 수식 の/,"js-no"],
  [/접속조사 て|ので|のに|理由・原因/,"js-kara-node"],
  [/접속조사 が|けれど|逆接/,"js-ga-kedo"],
  [/ながら|たり/,"js-nagara"],
  [/条件形|조건 4형/,"js-cond"],
  [/종조사|終助詞/,"js-shuu"],
  [/引用|인용/,"js-heiritsu"],
  [/助詞|어순·조사/,"js-ga"],
  [/지시어|こそあど/,"su-kihon"],
  [/의문사/,"su-kihon"],
  [/수사와 읽기|数詞/,"su-kihon"],
  [/조수사|助数詞/,"su-josuu"],
  [/い형용사|な형용사|형용동사|形容詞/,"ke-i-pair"],
  [/부사|副詞/,"fk-teido"],
  [/感動詞|감탄사/,"kd-odoroki"],
  [/接続詞|접속사/,"sz-all"],
  [/10품사|品詞/,"js-ga"]
];
const CONJBYID={};if(hasCONJ)CONJ.forEach(c=>CONJBYID[c.id]=c);
function conjLinkFor(title){
  if(!hasCONJ)return "";
  for(const [re,id] of GRAM2CONJ){ if(re.test(title)&&CONJBYID[id])return id; }
  return "";
}
const POSBYID={};POS.forEach(x=>POSBYID[x.id]=x);
function posLinkFor(title){
  if(!hasPOS)return "";
  for(const [re,id] of GRAM2POS){ if(re.test(title)&&POSBYID[id])return id; }
  return "";
}
let gCh="all",gLv="all";
(function(){var h='<button class="chip on" data-c="all">전체</button>';
  GRAM_CH.forEach(function(c){h+='<button class="chip" data-c="'+c[0]+'">'+c[1]+'</button>';});
  var el=$("#gramCh"); if(el)el.innerHTML=h;})();
function grammarMeaningHint(g){
  const desc=(g.desc||"").replace(/\s+/g," ").trim();
  if(!desc)return g.t;
  const sentences=desc.match(/[^.!?。！？]+[.!?。！？]?/g)||[desc];
  let hint=sentences[0].trim();
  const fs=sentences.slice(1).find(s=>/(뜻|의미|나타내|표현|쓰|사용|기능|조건|이유|강조|정중|부정|과거|진행|상태|준비|완료|추측|희망|수동|사역|존경|겸양)/.test(s));
  if(fs&&fs.trim()!==hint)hint+=' '+fs.trim();
  return hint.length>150?hint.slice(0,147)+'…':hint;
}
function renderGrammar(){
  if(typeof GRAMMAR==="undefined"){$("#view-gram").innerHTML=loadFail("gram");return;}
  const q=$("#qGram").value.trim().toLowerCase().replace(/\u301C/g,"\uFF5E").replace(/[\uFF1F\u003F]/g,"");
  /* 장 헤딩에 그 장의 개수를 적으려면 먼저 걸러 놓고 세어야 한다 */
  const keep=GRAMMAR.filter(g=>{
    if(gCh!=="all"&&g.ch!==gCh)return false;
    if(gLv!=="all"&&g.lv!==gLv)return false;
    return !q||hay(g.t,g.desc,g.cn,g.ex.map(x=>[x.s,x.ko])).includes(q);
  });
  const perCh={};keep.forEach(g=>{perCh[g.ch]=(perCh[g.ch]||0)+1;});
  let h="",curCh="";
  keep.forEach(g=>{
    if(g.ch!==curCh){curCh=g.ch;h+=secHd(g.ch,g.cn,perCh[g.ch]+"항목");}
    const cid=conjLinkFor(g.t), pid=posLinkFor(g.t);
    const foot=[
      cid?'<span class="jumpBadge" data-cj="'+cid+'">🧮 '+fmt(CONJBYID[cid].t)+'</span>':"",
      pid?'<span class="jumpBadge jbPos" data-ps="'+pid+'">🧩 '+fmt(POSBYID[pid].t)+'</span>':"",
      relBadges(g.rel)
    ].filter(Boolean).join(" ");
    h+='<div class="uCard">'
      +uTop(lvBadge(g.lv),fmt(g.t),g.cn)
      +'<div class="uDesc">'+fmt(g.desc)+'</div>'
      +meanBox(grammarMeaningHint(g))
      +exList(g.ex)
      +(foot?'<div class="uFoot">'+foot+'</div>':"")
      +'</div>';
  });
  $("#view-gram").innerHTML=h||emptyNote("gram");
  setCount(MODE.gram+" "+num(keep.length)+"항목",Object.keys(perCh).length+"장");
  bindJumps("#view-gram");
}
$("#gramCh").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  gCh=c.dataset.c;setChips("#gramCh",c);renderGrammar();});
$("#gramLv").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  gLv=c.dataset.l;setChips("#gramLv",c);renderGrammar();});
$("#qGram").addEventListener("input",()=>renderGrammar());

/* ══════════ 활용표 ══════════ */
let cjG="all";
(function(){
  if(!hasCONJ)return;
  const seen=[],name={};
  CONJ.forEach(c=>{if(!name[c.g]){name[c.g]=c.gn;seen.push(c.g);}});
  let h='<button class="chip on" data-g="all">전체</button>';
  seen.forEach(g=>{h+='<button class="chip" data-g="'+g+'">'+esc(name[g])+'</button>';});
  const el=$("#conjG");if(el)el.innerHTML=h;
})();
function tableHTML(head,rows){
  return '<div class="tableWrap"><table><thead><tr>'
    +head.map(x=>'<th>'+fmt(x)+'</th>').join("")
    +'</tr></thead><tbody>'
    +rows.map(r=>'<tr>'+r.map(c=>'<td class="cellJP">'+fmt(c)+'</td>').join("")+'</tr>').join("")
    +'</tbody></table></div>';
}
function renderConj(hlId){
  if(!hasCONJ){$("#view-conj").innerHTML=loadFail("conj");return;}
  const q=$("#qConj").value.trim().toLowerCase().replace(/\u301C/g,"\uFF5E").replace(/[\uFF1F\u003F]/g,"");
  const keep=CONJ.filter(c=>{
    if(cjG!=="all"&&c.g!==cjG)return false;
    return !q||hay(c.t,c.desc,c.tip,c.head,c.rows,c.ex.map(x=>[x.s,x.ko])).includes(q);
  });
  const perG={};keep.forEach(c=>{perG[c.g]=(perG[c.g]||0)+1;});
  let h="",curG="",rows=0;
  keep.forEach(c=>{
    rows+=c.rows.length;
    if(c.g!==curG){curG=c.g;h+=secHd(c.g,c.gn,perG[c.g]+"표");}
    h+='<div class="uCard'+(hlId===c.id?" hl":"")+'" id="cj-'+esc(c.id)+'">'
      +uTop(lvBadge(c.lv),fmt(c.t),c.id)
      +'<div class="uDesc">'+fmt(c.desc)+'</div>'
      +tableHTML(c.head,c.rows)
      +(c.tip?tipBox(fmt(c.tip)):"")
      +exList(c.ex)
      +'</div>';
  });
  $("#view-conj").innerHTML=h||emptyNote("conj");
  setCount(MODE.conj+" "+num(keep.length)+"표","표 "+num(rows)+"행");
  if(hlId)focusCard("#cj-"+hlId);
}
function gotoConj(id){
  switchView("conj");
  $("#qConj").value="";cjG="all";
  chipAll("#conjG","g");
  renderConj(id);
}
if($("#conjG"))$("#conjG").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  cjG=c.dataset.g;setChips("#conjG",c);renderConj();});
if($("#qConj"))$("#qConj").addEventListener("input",()=>renderConj());

/* ══════════════════════════════════════════════════════════
   대화 모드 — "교과서"가 아니라 "장면에 들어가는" 화면
   ──────────────────────────────────────────────────────────
   다른 여섯 모드가 "사전"이라면 여기는 "회화"다.
   조회창이 아니라 장면이 먼저이고, 설명은 말 뒤에 붙는다.
   1. 처음엔 일본어만 보인다 (본문.noKo)
   2. 번역을 누르면 그때 한국어가 붙는다
   3. ▶ 를 누르면 그 한 줄만 읽어 준다 (Web Speech, 나fallback 없음)
   4. 태그를 누르면 그 표현이 있는 모드로 건너뛴다
   ══════════════════════════════════════════════════════════ */
const hasTALK=(typeof DIALOGS!=="undefined")&&DIALOGS.length>0;
const CHARS=(typeof CHARACTERS!=="undefined")?CHARACTERS:[];
const CHARBY={};CHARS.forEach(c=>CHARBY[c.id]=c);
/* 이름 → 첫 글자(두 글자까지). 아바타용 */
function initial(n){return n?String(n).slice(0,1):"?";}

let tkScene="all", tkWho="all", tkLv="all", tkKo=false, tkKind="all";

function whoList(){
  if(!$("#talkWho"))return;
  const used={};DIALOGS.forEach(d=>(d.chars||[]).forEach(w=>used[w]=1));
  const list=CHARS.filter(c=>used[c.id]);
  let h='<button class="chip on" data-w="all">전체 화자</button>';
  list.forEach(c=>{h+='<button class="chip" data-w="'+c.id+'" data-rail="'+c.color+'">'
    +'<span class="av" style="display:inline-grid;place-items:center;width:16px;height:16px;'
    +'border-radius:50%;background:'+c.color+';color:#fff;font-size:9px;font-weight:700;'
    +'vertical-align:-3px;margin-right:5px">'+esc(initial(c.name))+'</span>'+esc(c.name)+'</button>';});
  $("#talkWho").innerHTML=h;
  /* 출연진 카드 — 60편을 관통하는 다섯 사람 */
  const row=$("#talkWhoRow");
  if(row)row.innerHTML=list.map(c=>
     '<span class="who"><span class="wd" style="background:'+c.color+'"></span>'
    +'<b>'+esc(c.name)+'</b><span>'+esc(c.role)+'</span></span>').join("");
}
function sceneList(){
  if(!$("#talkScene"))return;
  const seen=[];DIALOGS.forEach(d=>{if(d.scene&&seen.indexOf(d.scene)<0)seen.push(d.scene);});
  let h='<button class="chip on" data-sc="all">전체 장면</button>';
  seen.forEach(s=>{const n=DIALOGS.filter(d=>d.scene===s).length;
    h+='<button class="chip" data-sc="'+esc(s)+'">'+esc(s)+' <span class="chipN">'+n+'</span></button>';});
  $("#talkScene").innerHTML=h;
}
/* 서사 대화(d01~) 와 연습 대화(p001~) 를 가르는 기준.
   연습 대화는 id 가 p 로 시작하고 scene 이 「연습 · 」으로 시작한다. */
const isPractice = d => /^p\d+$/.test(String(d.id || '')) || /^연습[ ·]/.test(String(d.scene || ''));
function talkMatch(d){
  if(tkLv!=="all"&&d.lv!==tkLv)return false;
  if(tkScene!=="all"&&d.scene!==tkScene)return false;
  if(tkWho!=="all"&&(d.chars||[]).indexOf(tkWho)<0)return false;
  if(tkKind==="story"&&isPractice(d))return false;
  if(tkKind==="prac"&&!isPractice(d))return false;
  return true;
}
/* 한 줄 — 화자 · 일본어 · ▶ */
function lineHTML(d,l,i){
  const c=CHARBY[l.who]||{name:l.who,color:"#667085"};
  return '<div class="line" data-l="'+i+'" data-who="'+esc(l.who)+'">'
    +'<span class="av" style="background:'+c.color+'">'+esc(initial(c.name))+'</span>'
    +'<span class="lb"><span class="whoName" style="color:'+c.color+'">'+esc(c.name)+'</span>'
    +'<span class="jp" data-say="'+esc(l.s)+'">'+fmt(l.s)+'</span>'
    +(l.ko?'<span class="ko">'+esc(l.ko)+'</span>':"")+'</span>'
    +'<button class="speak" title="이 줄 읽어주기">▶</button></div>';
}
function pointsHTML(p){
  if(!p||!p.length)return "";
  return '<div class="dlgPoints"><span class="uLabel">이 장면의 포인트</span><ol>'
    +p.map(x=>'<li><b>'+fmt(x.t)+'</b>'+fmt(x.d)+'</li>').join("")+'</ol></div>';
}
function tagsHTML(t){
  if(!t||!t.length)return "";
  const CLS={"문형":"patBadge","문법":"patBadge","한자":"jumpBadge","구어체":"jumpBadge","표현":"jumpBadge"};
  /* 배지 글자 — 〜だ|だ 처럼 표준형|구어형을 파이프로 적은 데이터가 있어 ／ 로 보여 준다.
     검색어(data-q)는 원문 그대로 둔다 */
  const tagText=v=>fmt(v).replace(/\|/g,"／");
  return '<div class="dlgTags"><span class="uFootLabel">등장 표현</span>'
    +t.map(x=>{
        const kind=x[0],val=x[1];
        const go=kind==="문형"?"pat":kind==="문법"?"gram":kind==="한자"?"study"
                :kind==="구어체"?"spoken":kind==="conj"?"conj"
                :kind==="표현"?"expr":"expr";
        return '<span class="dlgTag '+(CLS[kind]||"")+'" data-go="'+go+'" data-q="'+esc(val)+'">'
          +'<i>'+esc(kind)+'</i>'+tagText(val)+'</span>';
      }).join(" ")+'</div>';
}
function renderTalk(){
  const view=$("#view-talk");
  if(!view)return;
  if(!hasTALK){view.innerHTML=emptyNote("talk");setCount("대화 — 데이터 없음");return;}
  const q=($("#qTalk")?$("#qTalk").value:"").trim().toLowerCase();
  const keep=DIALOGS.filter(d=>{
    if(!talkMatch(d))return false;
    if(!q)return true;
    return hay(d.title,d.scene,d.place,(d.lines||[]).map(l=>[l.s,l.ko]),
               (d.points||[]).map(p=>[p.t,p.d]),(d.tags||[]).map(t=>[t[0],t[1]])).includes(q);
  });
  /* 장면별로 모아서 보여 준다 — 같은 장소의 대화가 붙어 있어야 "현장"이 된다 */
  const order=[];DIALOGS.forEach(d=>{if(keep.indexOf(d)>=0&&order.indexOf(d.scene)<0)order.push(d.scene);});
  let h="",lines=0;
  order.forEach(sc=>{
    const ds=keep.filter(d=>d.scene===sc);
    h+=secHd(String(order.indexOf(sc)+1).padStart(2,"0"),sc,ds.length+"대화");
    ds.forEach((d,i)=>{
      const n=(d.lines||[]).length;lines+=n;
      h+='<div class="uCard dlg">'
        +'<div class="dlgHead"><span class="dlgScene">'+(d.id||"")+'</span>'
        +'<span class="dlgTitle">'+fmt(d.title)+'</span>'
        +lvBadge(d.lv)
        +'<span class="dlgMeta">'+(d.place||"")+'</span></div>'
        +'<div class="dlgLines">'+d.lines.map((l,j)=>lineHTML(d,l,j)).join("")+'</div>'
        +pointsHTML(d.points)
        +tagsHTML(d.tags)
        +'</div>';
    });
  });
  view.innerHTML=h||emptyNote("talk");
  setCount("대화 "+num(keep.length)+"편",num(lines)+"줄");
  bindTalk();
  applyKo();
}

/* ── 한국어 숨김/보임 ── */
function applyKo(){
  document.body.classList.toggle("noKo",!tkKo);
  const b=$("#talkKo");if(b){b.classList.toggle("on",tkKo);b.setAttribute("aria-pressed",String(tkKo));}
}

/* ── 따라읽기 — Web Speech API ──
   일본어 TTS 는 브라우저·OS 마다 voices 가 비어 있다. 없으면 조용히 넘긴다 */
function speak(text){
  try{
    if(!window.speechSynthesis)return false;
    window.speechSynthesis.cancel();
    /* 읽기가 아니라 본문을 읽는다 — {漢字|よみ} 도 한자만 남는다 */
    const u=new SpeechSynthesisUtterance(stripK(text));
    u.lang="ja-JP";u.rate=0.92;
    const vs=window.speechSynthesis.getVoices()||[];
    const v=vs.find(x=>/ja/i.test(x.lang));
    if(v)u.voice=v;
    window.speechSynthesis.speak(u);
    return true;
  }catch(e){return false;}
}
function bindTalk(){
  $$("#view-talk .speak").forEach(b=>b.onclick=()=>{
    const ln=b.closest(".line");
    $$("#view-talk .line").forEach(x=>x.classList.remove("playing"));
    ln.classList.add("playing");
    speak(ln.querySelector(".jp").getAttribute("data-say"));
    setTimeout(()=>ln.classList.remove("playing"),2200);
  });
  /* 문장 자체를 눌러도 읽어 준다 — 배지를 찾느라 헤매지 않게 */
  $$("#view-talk .jp").forEach(j=>j.onclick=()=>{
    $$("#view-talk .jp").forEach(x=>x.classList.remove("on"));
    j.classList.add("on");
    speak(j.getAttribute("data-say"));
  });
  /* 태그 → 해당 모드로 검색어를 넘겨 건너뛴다.
     대화 태그는 사전 표제어와 한 끗 차이가 난다.
     예) 「〜なりに／〜なりの」「〜じゃない？」「尊敬語」
     한 가지 후보만 던지면 걸리는 것이 걸리지 않는다.
     후보를 여러 개 만들어 순서대로 시도하고, 처음 걸리는 것을 쓴다. */
  const TILDE_A = "\u301C", TILDE_B = "\uFF5E";   /* 〜 / ～ */
  function normTilde(t){
    return String(t).replace(/\u301C/g,"\uFF5E");
  }
  /* 후보 목록을 만든다.
     「〜なりに／〜なりの」 -> [〜なりに, なりに, 〜なりの, なり]
     조사 제거는 맨 마지막에만 한다. 「〜なりに」에서 に 를 빼면
     「〜なり」이 되어 오히려 안 걸린다. */
  function tagCandidates(q){
    const raw = String(q || "").replace(/[\uFF1F\u003F\uFF01\u0021]/g, "");
    const segs = raw.split("\uFF0F").concat(raw.split("/"));
    const out = [];
    segs.forEach(function (s) {
      s = s.trim();
      if (!s) return;
      const t = normTilde(s);
      [t, t.replace(/\uFF5E/g, "")].forEach(function (v) {
        if (v && v.length >= 2 && out.indexOf(v) < 0) out.push(v);
      });
    });
    /* 마지막 수단: 조사를 뺀 형태 */
    const last = normTilde(segs[0] || "").replace(/[\u3092\u306B\u3067\u306F\u3068\u304C\u3082]/g, "");
    if (last && last.length >= 2 && out.indexOf(last) < 0) out.push(last);
    /* 마지막 수단 2: 표기 기호를 벗긴 형태.
       태그 값이 [お前|おまえ]·{おあずかり} 처럼 사전 표기를 그대로 담고 있어도 걸린다.
       앞의 후보가 이미 걸렸으면 쓰이지 않으므로 결과가 달라지지 않는다 */
    [stripK(raw), stripM(raw)].forEach(function (v) {
      v = normTilde(v);
      if (v && v.length >= 2 && out.indexOf(v) < 0) out.push(v);
    });
    return out;
  }
  function runTagQuery(k, q){
    const gs = GS_TAB[k]; if (!gs) return false;
    switchView(k);
    const el = $(gs[0]); if (!el) return false;
    const cands = tagCandidates(q);
    for (let i = 0; i < cands.length; i++) {
      el.value = cands[i];
      gs[1]();
      const hit = $$("#view-" + k + " .uCard, #view-" + k + " .card").length;
      if (hit) return true;
    }
    return false;
  }
  $$("#view-talk .dlgTag").forEach(t=>t.onclick=()=>{
    runTagQuery(t.dataset.go,t.dataset.q);
    scrollTop();
  });
}

/* ── 배선 ── */
if(hasTALK){sceneList();whoList();}
if($("#talkKind"))$("#talkKind").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  tkKind=c.dataset.k;setChips("#talkKind",c);renderTalk();});
else {
  /* talkKind 칩이 없으면(구 index.html) p 태그만 검색에서 제외한다 */
}
if($("#qTalk"))$("#qTalk").addEventListener("input",()=>renderTalk());
if($("#talkScene"))$("#talkScene").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  tkScene=c.dataset.sc;setChips("#talkScene",c);renderTalk();});
if($("#talkWho"))$("#talkWho").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  tkWho=c.dataset.w;setChips("#talkWho",c);renderTalk();});
if($("#talkLv"))$("#talkLv").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  tkLv=c.dataset.l;setChips("#talkLv",c);renderTalk();});
if($("#talkKo"))$("#talkKo").onclick=()=>{tkKo=!tkKo;applyKo();
  toast(tkKo?"한국어 번역을 켰어요":"한국어 번역을 껐어요 — 일본어만");};
if($("#talkStop"))$("#talkStop").onclick=()=>{try{window.speechSynthesis.cancel();}catch(e){}
  $$("#view-talk .line").forEach(x=>x.classList.remove("playing"));toast("읽기를 멈췄어요");};
/* ══════════ 구어체 ══════════ */
let spSec="all";
/* 묶음 기준은 sec 가 아니라 sn 이다.
   dialect.js 는 sec 하나("dialect")에 関東·関西·語尾·音変化·語彙 다섯 묶음을
   sn 으로 갈라 넣었다. sec 로 묶으면 48개가 「関東弁 — 語尾」 하나에 통째로 사라진다.
   기존 파일은 sec 와 sn 이 1:1 이었으므로 sn 으로 바꿔도 결과가 같다 */
const SPKEY=x=>x.sn||x.sec;
if(hasSPOKEN){(function(){
  const order=[];SPOKEN.forEach(x=>{const k=SPKEY(x);if(order.indexOf(k)<0)order.push(k);});
  SPOKEN.sort((a,b)=>order.indexOf(SPKEY(a))-order.indexOf(SPKEY(b)));
})();}
(function(){
  if(!hasSPOKEN)return;
  const seen=[],name={};
  SPOKEN.forEach(x=>{const k=SPKEY(x);if(!name[k]){name[k]=k;seen.push(k);}});
  let h='<button class="chip on" data-s="all">전체</button>';
  seen.forEach(s=>{h+='<button class="chip" data-s="'+esc(s)+'">'+esc(s)+'</button>';});
  const el=$("#spokenSec");if(el)el.innerHTML=h;
})();
function renderSpoken(){
  if(!hasSPOKEN){$("#view-spoken").innerHTML=loadFail("spoken");return;}
  const q=$("#qSpoken").value.trim().toLowerCase().replace(/\u301C/g,"\uFF5E").replace(/[\uFF1F\u003F]/g,"");
  const keep=SPOKEN.filter(x=>{
    if(spSec!=="all"&&SPKEY(x)!==spSec)return false;
    return !q||hay(x.t,x.rule,x.warn,x.forms,x.ex.map(e=>[e.s,e.ko])).includes(q);
  });
  const perSec={};keep.forEach(x=>{const k=SPKEY(x);perSec[k]=(perSec[k]||0)+1;});
  /* 묶음 순서 = 화면에 뜨는 순서. 머리에 붙이는 번호도 이 순서를 따른다 */
  const gorder=[];keep.forEach(x=>{const k=SPKEY(x);if(gorder.indexOf(k)<0)gorder.push(k);});
  let h="",curSec="",pairs=0;
  keep.forEach(x=>{
    pairs+=x.forms.length;
    const k=SPKEY(x);
    if(k!==curSec){
      curSec=k;
      h+=secHd(String(gorder.indexOf(k)+1).padStart(2,"0"),k,perSec[k]+"항목");
    }
    const rel=relBadges(x.rel);
    h+='<div class="uCard">'
      +uTop(lvBadge(x.lv),fmt(x.t),x.sn,true)
      +'<div class="uDesc">'+fmt(x.rule)+'</div>'
      +tableHTML(["정식·원형","구어형","메모"],x.forms)
      +(x.warn?warnBox(fmt(x.warn)):"")
      +exList(x.ex)
      +(rel?'<div class="uFoot">'+rel+'</div>':"")
      +'</div>';
  });
  $("#view-spoken").innerHTML=h||emptyNote("spoken");
  setCount(MODE.spoken+" "+num(keep.length)+"항목","변환 "+num(pairs)+"쌍");
  bindJumps("#view-spoken");
}
if($("#spokenSec"))$("#spokenSec").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  spSec=c.dataset.s;setChips("#spokenSec",c);renderSpoken();});
if($("#qSpoken"))$("#qSpoken").addEventListener("input",()=>renderSpoken());

/* ══════════ 품사 사전 — 묶음 표 + 낱말, 두 층 ══════════ */
let posP="all",posMode="group";
(function(){
  if(!hasPOS)return;
  let h='<button class="chip on" data-p="all">전체</button>';
  PORDER.forEach(k=>{h+='<button class="chip" data-p="'+k+'">'+esc(PNAME[k])+'</button>';});
  const el=$("#posP");if(el)el.innerHTML=h;
  const v=$("#posView");
  if(v&&!hasWORDS){v.classList.add("hidden");return;}
  /* 두 보기에 각각 몇 개가 들어 있는지 칩에 적는다.
     낱말 층이 있는 줄 모르고 "그 낱말 없더라" 하는 일이 없게 */
  if(v){
    const c=v.querySelectorAll(".chip");
    if(c[0])c[0].innerHTML='묶음 보기 <span class="chipN">'+num(POS.length)+'</span>';
    if(c[1])c[1].innerHTML='낱말 보기 <span class="chipN">'+num(WORDS.length)+'</span>';
  }
})();
/* 묶음 보기 — "함께 외워야 하는 것"을 표로 세운다 */
function renderPosGroup(hlId){
  const q=$("#qPos").value.trim().toLowerCase().replace(/\u301C/g,"\uFF5E").replace(/[\uFF1F\u003F]/g,"");
  const keep=POS.filter(x=>{
    if(posP!=="all"&&x.p!==posP)return false;
    return !q||hay(x.t,x.w,x.mean,x.desc,x.tip,x.head,x.rows,x.ex.map(e=>[e.s,e.ko])).includes(q);
  });
  const perG={};keep.forEach(x=>{perG[x.g]=(perG[x.g]||0)+1;});
  let h="",curG="",rows=0;
  keep.forEach(x=>{
    rows+=x.rows.length;
    if(x.gn!==curG){curG=x.gn;h+=secHd(x.g,x.gn,perG[x.g]+"항목");}
    /* 표제어가 있는 항목은 낱말을 앞세우고, 묶음 항목은 제목만 세운다 */
    const title=x.w
      ? '<span class="posW">'+fmt(x.w)+'</span>'+fmt(x.t.replace(/^.*?—\s*/,""))
      : fmt(x.t);
    h+='<div class="uCard'+(hlId===x.id?" hl":"")+'" id="ps-'+esc(x.id)+'">'
      +uTop(lvBadge(x.lv),title,x.pn)   /* 낱말은 .posW 가 세리프를 쓰고, 뒤따르는 설명은 UI 서체다 */
      +(x.mean?meanBox(x.mean):"")
      +'<div class="uDesc">'+fmt(x.desc)+'</div>'
      +tableHTML(x.head,x.rows)
      +(x.tip?tipBox(fmt(x.tip)):"")
      +exList(x.ex)
      +'</div>';
  });
  $("#view-pos").innerHTML=h||emptyNote("pos");
  setCount(MODE.pos+" "+num(keep.length)+"항목","표 "+num(rows)+"행");
  if(hlId)focusCard("#ps-"+hlId);
}
/* 낱말 보기 — 낱말 하나에 카드 하나. 다른 화면과 같은 예문 블록을 쓴다 */
function wordCard(x){
  const r=stripM(x.w)===x.r?"":x.r;          /* 가나 낱말은 읽기를 겹쳐 적지 않는다 */
  return '<div class="uCard" data-w="'+esc(stripM(x.w))+'">'
    +uTop(lvBadge(x.lv),'<span class="posW">'+fmt(x.w)+'</span>',r)
    +meanBox(x.m)
    +exList(x.ex)
    +(x.n?labelBox("uTip","쓰임",fmt(x.n)):"")
    +'</div>';
}
function renderPosWord(){
  const q=$("#qPos").value.trim().toLowerCase().replace(/\u301C/g,"\uFF5E").replace(/[\uFF1F\u003F]/g,"");
  const keep=WORDS.filter(x=>{
    if(posP!=="all"&&x.g!==posP)return false;
    return !q||hay(x.w,x.r,x.m,x.ex.map(e=>[e.s,e.ko]),x.n).includes(q);
  });
  /* 품사 칩 순서 → 분류 첫 등장 순서로 두 단계 묶는다 */
  const order=[],bucket={};
  keep.forEach(x=>{
    const k=x.g+"\u0001"+x.c;
    if(!bucket[k]){bucket[k]=[];order.push(k);}
    bucket[k].push(x);
  });
  order.sort((a,b)=>PORDER.indexOf(a.split("\u0001")[0])-PORDER.indexOf(b.split("\u0001")[0]));
  let h="";
  order.forEach(k=>{
    const [g,c]=k.split("\u0001");
    h+=secHd(c,(PNAME[g]||g)+" · "+(WCAT[c]||c),bucket[k].length+"낱말");
    h+=bucket[k].map(wordCard).join("");
  });
  $("#view-pos").innerHTML=h||emptyNote("pos");
  setCount(MODE.pos+" 낱말 "+num(keep.length)+"개","분류 "+order.length+"갈래");
}
function renderPos(hlId){
  if(!hasPOS){$("#view-pos").innerHTML=loadFail("pos");return;}
  if(posMode==="word"&&hasWORDS)renderPosWord(); else renderPosGroup(hlId);
}
/* 문법에서 건너뛸 때는 묶음 표가 목적지다 */
function gotoPos(id){
  switchView("pos");
  $("#qPos").value="";posP="all";posMode="group";
  chipAll("#posP","p");chipAll("#posView","m");
  renderPos(id);
}
if($("#posP"))$("#posP").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  posP=c.dataset.p;setChips("#posP",c);renderPos();});
if($("#posView"))$("#posView").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  posMode=c.dataset.m;setChips("#posView",c);renderPos();window.scrollTo({top:0});});
if($("#qPos"))$("#qPos").addEventListener("input",()=>renderPos());

/* ══════════ 표현·관용구 ══════════ */
const EXPR_CATNAME={"aizuchi":"아이즈치(相槌)","kimari":"상용구·정형구(決まり文句)","spoken":"구어 표현(口語表現)","kanyou":"관용구·숙어(慣用句)"};
let exCat="all";
function renderExpr(){
  if(typeof EXPR==="undefined"){$("#view-expr").innerHTML=loadFail("expr");return;}
  const q=$("#qExpr").value.trim().toLowerCase().replace(/\u301C/g,"\uFF5E").replace(/[\uFF1F\u003F]/g,"");
  const keep=EXPR.filter(x=>{
    if(exCat!=="all"&&x.cat!==exCat)return false;
    return !q||hay(x.expr,x.reading,x.mean,x.ex.map(e=>[e.s,e.ko])).includes(q);
  });
  const perCat={};keep.forEach(x=>{perCat[x.cat]=(perCat[x.cat]||0)+1;});
  let h="",curCat="";
  keep.forEach(x=>{
    if(x.cat!==curCat){curCat=x.cat;
      h+=secHd(x.cat,EXPR_CATNAME[x.cat]||x.cat,perCat[x.cat]+"개");}
    h+='<div class="uCard" data-c="'+esc(x.cat)+'">'
      +uTop("",fmt(x.expr),x.reading||"",true)
      +meanBox(x.mean)
      +exList(x.ex)
      +'</div>';
  });
  $("#view-expr").innerHTML=h||emptyNote("expr");
  setCount(MODE.expr+" "+num(keep.length)+"개",Object.keys(perCat).length+"분류");
}
$("#exprCat").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  exCat=c.dataset.c;setChips("#exprCat",c);renderExpr();});
$("#qExpr").addEventListener("input",()=>renderExpr());

/* ══════════ 통합 검색 — 일곱 모드를 한 번에 훑는다 ══════════ */
const GS_ORDER=["talk","study","pat","gram","conj","pos","spoken","expr"];
let GS_INDEX=null,GS_FLAT=[],gsCursor=-1;
function chipAll(sel,attr){const c=$(sel+' .chip[data-'+attr+'="all"]');if(c)setChips(sel,c);}
/* 인덱스는 처음 검색할 때 한 번만 만든다. 한자 2,647자의 예문까지 실으므로
   페이지 로드 시점에 만들면 첫 화면이 늦어진다.
   색인 문자열은 탭 검색과 똑같은 hay() 규칙을 쓴다 */
function buildGsIndex(){
  const I=[];
  if(typeof DIALOGS!=="undefined")DIALOGS.forEach(d=>{
    I.push({k:"talk",label:d.title,sub:(d.scene||"")+" · "+(d.place||""),
      hay:hay(d.title,d.scene,d.place,(d.lines||[]).map(l=>[l.s,l.ko]),
              (d.points||[]).map(p=>[p.t,p.d]),(d.tags||[]).map(t=>[t[0],t[1]])),
      go:()=>{switchView("talk");$("#qTalk").value="";tkScene="all";tkWho="all";
        chipAll("#talkScene","sc");chipAll("#talkWho","w");renderTalk();
        const card=$('#view-talk .dlg');if(card)card.scrollIntoView({block:"start"});}});
  });
  ALL.forEach((r,i)=>{const e=STUDYBYK[r[0]],rank=i+1;
    const sub=(e?e.hun+" · ":"")+(r[1]||"—")+" / "+(r[2]||"—")+(r[5]?" · "+r[5]:"");
    I.push({k:"study",label:r[0],sub,
      key:hay(r[0],e?[e.hun,e.on,e.kun,e.kor]:[r[1],r[2],r[3]],r[5]),
      hay:e?hay(r[0],e.hun,e.on,e.kun,e.kor,e.ex.map(x=>[x.s,x.ko]))
           :hay(r[0],r[1],r[2],r[3],r[5]),
      go:()=>{
        switchView("study");$("#qStudy").value="";fLv="all";chipAll("#lvChips","l");
        fJoyo="all";chipAll("#joyoChips","j");renderStudy();
        studyPager("go",rank);
        focusCard('.card[data-r="'+rank+'"]');
      }});
  });
  PATS.forEach(p=>I.push({k:"pat",label:p.pat,sub:"N"+p.lv+" · "+p.mean,
    hay:hay(p.pat,p.mean,p.clu,p.ex.map(x=>[x.s,x.ko])),go:()=>gotoPat(p.pat)}));
  if(typeof GRAMMAR!=="undefined")GRAMMAR.forEach(g=>I.push({k:"gram",label:g.t,sub:g.cn+(g.lv!=="0"?" · N"+g.lv:""),
    hay:hay(g.t,g.desc,g.cn,g.ex.map(x=>[x.s,x.ko])),
    go:()=>{switchView("gram");gCh="all";gLv="all";chipAll("#gramCh","c");chipAll("#gramLv","l");
      $("#qGram").value=stripM(g.t);renderGrammar();}}));
  if(hasCONJ)CONJ.forEach(c=>I.push({k:"conj",label:c.t,sub:c.gn,
    hay:hay(c.t,c.desc,c.tip,c.head,c.rows,c.ex.map(x=>[x.s,x.ko])),
    go:()=>gotoConj(c.id)}));
  POS.forEach(x=>I.push({k:"pos",label:x.w||x.t,sub:(x.w?x.t.replace(/^.*?—\s*/,"")+" · ":"")+x.pn+" · "+x.gn,
    hay:hay(x.t,x.w,x.mean,x.desc,x.tip,x.rows,x.ex.map(e=>[e.s,e.ko])),
    go:()=>gotoPos(x.id)}));
  WORDS.forEach(x=>I.push({k:"pos",label:x.w,sub:(PNAME[x.g]||x.g)+" · "+(WCAT[x.c]||x.c)+" · "+x.m,
    hay:hay(x.w,x.r,x.m,x.ex.map(e=>[e.s,e.ko]),x.n),
    go:()=>{switchView("pos");posP="all";posMode="word";
      chipAll("#posP","p");chipAll("#posView","m");
      $("#qPos").value=stripM(x.w);renderPos();}}));
  if(hasSPOKEN)SPOKEN.forEach(x=>I.push({k:"spoken",label:x.t,sub:x.sn,
    hay:hay(x.t,x.rule,x.warn,x.forms,x.ex.map(e=>[e.s,e.ko])),
    go:()=>{switchView("spoken");spSec="all";chipAll("#spokenSec","s");$("#qSpoken").value=stripM(x.t);renderSpoken();}}));
  if(typeof EXPR!=="undefined")EXPR.forEach(x=>I.push({k:"expr",label:x.expr,sub:(EXPR_CATNAME[x.cat]||x.cat)+" · "+x.mean,
    hay:hay(x.expr,x.reading,x.mean,x.ex.map(e=>[e.s,e.ko])),
    go:()=>{switchView("expr");exCat="all";chipAll("#exprCat","c");$("#qExpr").value=x.expr;renderExpr();}}));
  return I;
}
/* 표제어 안에서 맞은 글자만 밑줄로 표시한다. 루비 마크업이 있으면 건드리지 않는다 */
function gsMark(label,q){
  if(/[\[{]/.test(label))return fmt(label);
  const i=label.toLowerCase().indexOf(q);
  if(i<0)return esc(label);
  return esc(label.slice(0,i))+"<mark>"+esc(label.slice(i,i+q.length))+"</mark>"+esc(label.slice(i+q.length));
}
function gsRender(){
  const panel=$("#gsPanel"),inp=$("#qAll");if(!panel||!inp)return;
  const q=inp.value.trim().toLowerCase();
  GS_FLAT=[];gsCursor=-1;
  if(!q){panel.hidden=true;panel.innerHTML="";return;}
  if(!GS_INDEX)GS_INDEX=buildGsIndex();
  const groups={};let total=0;
  for(const it of GS_INDEX){
    if(!it.hay.includes(q))continue;
    /* 「[仕方|しかた]ない」는 루비를 펴면 "仕方しかたない" 라 「仕方ない」로 쳐도 맨 앞에 안 온다.
       그래서 한자만 남긴 꼴로도 점수를 매기고 둘 중 잘 맞은 쪽을 쓴다 */
    const rank=lab=>lab===q?0:lab.startsWith(q)?1:lab.includes(q)?2:4;
    const score=Math.min(rank(stripM(it.label).toLowerCase()),rank(stripK(it.label).toLowerCase()),
                         (it.key&&it.key.includes(q))?3:4);
    (groups[it.k]=groups[it.k]||[]).push([score,it]);total++;
  }
  /* 묶음 순서도 "가장 잘 맞은 항목"이 앞에 오게 한다. ながら를 치면 예문에 ながら가
     들어간 한자 35자보다 문형 ～ながら 가 먼저 보여야 한다 */
  const MAX=6;let h="";
  const ks=GS_ORDER.filter(k=>groups[k]).map(k=>{groups[k].sort((a,b)=>a[0]-b[0]);return [groups[k][0][0],GS_ORDER.indexOf(k),k];})
    .sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(x=>x[2]);
  ks.forEach(k=>{const g=groups[k];
    h+='<div class="gsGroup" style="--rail:var(--c-'+k+')"><div class="gsHd"><span class="pn">'+MODE[k]+'</span>'
      +'<span class="pn2">'+num(g.length)+'</span></div>';
    g.slice(0,MAX).forEach(([sc,it])=>{const idx=GS_FLAT.push(it)-1;
      h+='<button class="gsRow" role="option" data-i="'+idx+'"><span class="gsLabel">'+gsMark(it.label,q)+'</span>'
        +'<span class="gsSub">'+esc(stripM(it.sub))+'</span></button>';});
    if(g.length>MAX)h+='<button class="gsMore" data-k="'+k+'">외 '+num(g.length-MAX)+'개 — '+MODE[k]+' 탭에서 「'+esc(q)+'」로 검색 →</button>';
    h+='</div>';
  });
  if(!h)h='<div class="gsEmpty">「'+esc(q)+'」에 맞는 항목이 없어요. 한자·읽기·뜻·예문 어느 쪽으로든 찾습니다.</div>';
  else h+='<div class="gsFoot">'+num(total)+'건 · <kbd>↑</kbd><kbd>↓</kbd> 이동 <kbd>Enter</kbd> 열기 <kbd>Esc</kbd> 닫기</div>';
  panel.innerHTML=h;panel.hidden=false;
}
/* 탭별 검색창·렌더러 대응. "외 N개" 와 검색어 넘기기에 쓴다 */
const GS_TAB={talk:["#qTalk",()=>{tkScene="all";chipAll("#talkScene","sc");tkWho="all";chipAll("#talkWho","w");renderTalk();}],
  study:["#qStudy",()=>{fLv="all";chipAll("#lvChips","l");fJoyo="all";chipAll("#joyoChips","j");renderStudy();}],
  pat:["#qPat",()=>{pLv="all";chipAll("#patLv","l");$("#patCat").value="all";renderPat();}],
  gram:["#qGram",()=>{gCh="all";gLv="all";chipAll("#gramCh","c");chipAll("#gramLv","l");renderGrammar();}],
  conj:["#qConj",()=>{cjG="all";chipAll("#conjG","g");renderConj();}],
  pos:["#qPos",()=>{posP="all";chipAll("#posP","p");chipAll("#posView","m");posMode="group";renderPos();}],
  spoken:["#qSpoken",()=>{spSec="all";chipAll("#spokenSec","s");renderSpoken();}],
  expr:["#qExpr",()=>{exCat="all";chipAll("#exprCat","c");renderExpr();}]};
function gsToTab(k,q){const t=GS_TAB[k];if(!t)return;gsClose();$("#qAll").blur();switchView(k);$(t[0]).value=q;t[1]();}
function gsClose(){const p=$("#gsPanel");if(p){p.hidden=true;}gsCursor=-1;}
function gsPick(i){const it=GS_FLAT[i];if(!it)return;gsClose();$("#qAll").blur();it.go();}
function gsMove(d){
  const rows=$$("#gsPanel .gsRow");if(!rows.length)return;
  gsCursor=(gsCursor+d+rows.length)%rows.length;
  rows.forEach((r,i)=>r.classList.toggle("on",i===gsCursor));
  rows[gsCursor].scrollIntoView({block:"nearest"});
}
(function(){
  const inp=$("#qAll"),panel=$("#gsPanel");if(!inp||!panel)return;
  let t=null;
  inp.addEventListener("input",()=>{clearTimeout(t);t=setTimeout(gsRender,90);});
  inp.addEventListener("focus",()=>{if(inp.value.trim())gsRender();});
  inp.addEventListener("keydown",e=>{
    if(e.key==="ArrowDown"){e.preventDefault();gsMove(1);}
    else if(e.key==="ArrowUp"){e.preventDefault();gsMove(-1);}
    else if(e.key==="Enter"){e.preventDefault();gsPick(gsCursor<0?0:gsCursor);}
    else if(e.key==="Escape"){gsClose();inp.blur();}
  });
  panel.addEventListener("click",e=>{
    const b=e.target.closest(".gsRow");if(b){gsPick(+b.dataset.i);return;}
    const m=e.target.closest(".gsMore");if(m)gsToTab(m.dataset.k,inp.value.trim());
  });
  panel.addEventListener("mousedown",e=>e.preventDefault()); // 클릭해도 입력창 포커스가 안 빠지게
  document.addEventListener("click",e=>{if(!e.target.closest(".gs"))gsClose();});
})();

/* ── 통합 검색 — 명령 팔레트로 ─────────────────────────────
   /it 규격: 상단 [검색 ⌘K] 버튼을 누르면 .pal-backdrop + .pal 이 뜨고,
   입력하면 전 모드 색인에서 찾는다. 결과는 .pal-list 안에 나열한다. */
(function(){
  var box=$("#palbox"), lid=$("#gsPanel"), input=$("#qAll"), btn=$("#searchBtn"), back=$("#palBackdrop");
  if(!box||!lid||!input||!btn||!back)return;

  function open(){
    box.classList.add("on"); back.classList.add("on");
    document.body.classList.add("palOpen");
    input.focus(); input.select();
  }
  function close(){
    box.classList.remove("on"); back.classList.remove("on");
    document.body.classList.remove("palOpen");
  }
  function isOn(){ return box.classList.contains("on"); }

  btn.addEventListener("click",open);
  back.addEventListener("click",close);
  input.addEventListener("keydown",function(e){
    if(e.key==="Escape"){close();btn.focus();}
    else if(e.key==="Enter"){e.preventDefault();
      var first=lid.querySelector(".gsRow,[data-i]");
      if(first)first.click();
    }
  });
  return {open:open,close:close,isOn:isOn};
})();

/* ── 사이드바 필터 — 학습 모드를 글자로 좁힌다 ── */
(function(){
  var f=$("#navFilter");
  if(!f)return;
  f.addEventListener("input",function(){
    var q=f.value.trim().toLowerCase();
    $$(".nav-item").forEach(function(n){
      var on=!q||n.textContent.toLowerCase().indexOf(q)>-1;
      n.classList.toggle("hide",!on);
    });
    $$(".nav-stage").forEach(function(st){
      var any=st.querySelectorAll(".nav-item:not(.hide)").length;
      st.classList.toggle("hide",any===0);
    });
  });
})();
/* ══════════ 탭/툴바 ══════════ */
const VIEWS=GS_ORDER;
const TBID={talk:"tbTalk",study:"tbStudy",pat:"tbPat",gram:"tbGram",conj:"tbConj",pos:"tbPos",spoken:"tbSpoken",expr:"tbExpr"};
const NOTEID={talk:"noteTalk",study:"noteStudy",pat:"notePat",gram:"noteGram",conj:"noteConj",pos:"notePos",spoken:"noteSpoken",expr:"noteExpr"};
const RENDER={study:renderStudy,pat:renderPat,gram:renderGrammar,conj:renderConj,
              pos:renderPos,spoken:renderSpoken,expr:renderExpr,talk:renderTalk};
/* 스크롤 컨테이너 — 셸이 .scroll 을 엔진으로 쓰므로 창이 아니라 그쪽을 되감는다 */
const SCROLL=function(){return document.getElementById("main")||document.scrollingElement;};
function scrollTop(){const s=SCROLL();if(s&&s.scrollTo)s.scrollTo({top:0});else window.scrollTo({top:0});}
function showPage(id){
  $$(".page").forEach(p=>p.classList.toggle("on",p.id===id));
  const nav=$("#navCover");if(nav)nav.classList.toggle("on",id==="page-cover");
  if(window.paintModebar)paintModebar(id==="page-cover"?"cover":id.replace("page-",""));
}
/* 표지로 돌아가기 — 탭과 사이드바에서 같이 쓴다 */
function showCover(){
  showPage("page-cover");
  $$(".tab").forEach(t=>{t.classList.remove("on");t.setAttribute("aria-pressed","false");});
  setCrumb("cover");
  scrollTop();
}

/* ══════════ 모드 탭 스트립 ══════════
   사이드바가 접히는 좁은 화면에서도 모드를 하나 고를 수 있게
   상단바 아래에 같은 목록을 가로 탭으로 세운다.
   사이드바 버튼과 양방향 동기화한다. */
(function(){
  var bar=$("#modebar");
  if(!bar)return;
  var ICON={talk:"\uD83D\uDCAC",study:"\uD83D\uDCDA",pat:"\uD83D\uDCD6",gram:"\uD83D\uDD20",
            conj:"\uD83E\uDDEE",pos:"\uD83E\uDDE9",spoken:"\uD83D\uDE3B",expr:"\uD83D\uDCAC"};
  var LABEL={talk:"대화",study:"학습 카드",pat:"문형 사전",gram:"문법",conj:"활용표",
             pos:"품사 사전",spoken:"구어체",expr:"표현·관용구"};
  var items=[{v:"cover",t:"표지",ic:"\u2302"}].concat(
    (typeof VIEWS!=="undefined"?VIEWS:[]).map(function(v){
      return {v:v,t:LABEL[v]||v,ic:ICON[v]||""};
    }));
  bar.innerHTML=items.map(function(it){
    return '<button type="button" data-v="'+it.v+'"><span class="mi">'+it.ic+'</span>'
      +'<span>'+it.t+'</span><span class="mc" data-for="'+it.v+'"></span></button>';
  }).join("");
  bar.addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b)return;
    var v=b.dataset.v;
    if(v==="cover"){showCover();return;}
    switchView(v);
    var on=bar.querySelector('button[data-v="'+v+'"]');
    if(on)on.scrollIntoView({block:"nearest",inline:"nearest"});
  });
  window.paintModebar=function(v){
    $$("#modebar button").forEach(function(b){
      b.classList.toggle("on",b.dataset.v===v);
      b.setAttribute("aria-pressed",String(b.dataset.v===v));
    });
  };
  paintModebar("cover");
})();

function switchView(v){
  if(VIEWS.indexOf(v)<0)v="study";
  $$(".tab").forEach(t=>{var on=t.dataset.v===v;t.classList.toggle("on",on);t.setAttribute("aria-pressed",on);});
  showPage("page-"+v);
  VIEWS.forEach(x=>{
    $("#view-"+x).classList.toggle("hidden",x!==v);
    const tb=$("#"+TBID[x]);if(tb)tb.classList.toggle("hidden",x!==v);
    const nt=$("#"+NOTEID[x]);if(nt)nt.classList.toggle("hidden",x!==v);
  });
  $$(".pager").forEach(p=>{if(v!=="study")p.classList.add("hidden");});
  RENDER[v]();
  updateProgress();
  setCrumb(v);
  scrollTop();
}
/* 상단바 빵부스러기 — 통합 검색으로 튀어 들어올 때도 같이 따라간다 */
function setCrumb(v){
  const el=$("#crumb");if(!el)return;
  const FULL={study:"학습 카드",pat:"문형 사전",gram:"문법",conj:"활용표",
              pos:"품사 사전",spoken:"구어체",expr:"표현·관용구",talk:"대화",cover:""};
  const label=FULL[v]||"";
  el.innerHTML="<b>빈도순 일본어</b>"+(label?" · "+label:"");
  document.title=(label?label+" · ":"")+"빈도순 일본어";
}
$$(".tab").forEach(t=>t.onclick=()=>switchView(t.dataset.v));

/* 표지 카드 — 누르면 해당 모드로 바로 들어간다 */
$$("#stageGrid .st-card").forEach(a=>a.addEventListener("click",e=>{
  e.preventDefault();switchView(a.dataset.v);
}));

$("#lvChips").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  fLv=c.dataset.l;setChips("#lvChips",c);renderStudy();});
if($("#joyoChips"))$("#joyoChips").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  fJoyo=c.dataset.j;setChips("#joyoChips",c);renderStudy();});
$("#patLv").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;
  pLv=c.dataset.l;setChips("#patLv",c);renderPat();});
$("#qStudy").addEventListener("input",()=>renderStudy());
$("#qPat").addEventListener("input",()=>renderPat());
$("#patCat").addEventListener("change",()=>renderPat());

(function(){
  const btn=$("#fltToggle"); if(!btn) return;
  document.body.classList.add("fltCollapsed");
  btn.onclick=()=>{
    const col=document.body.classList.toggle("fltCollapsed");
    btn.textContent=col?"☰ 필터":"✕ 닫기";
    btn.setAttribute("aria-expanded",String(!col));
  };
})();

/* 맨 위로 */
(function(){var b=$("#toTop");if(!b)return;
  var s=SCROLL();
  if(s)s.addEventListener("scroll",function(){b.classList.toggle("show",s.scrollTop>420);},{passive:true});
  b.onclick=function(){if(s&&s.scrollTo)s.scrollTo({top:0,behavior:"smooth"});else scrollTop();};})();

/* ふりがな 토글 */
function toggleFurigana(){
  document.body.classList.toggle("noFuri");
  const off=document.body.classList.contains("noFuri");
  $$('[data-furi]').forEach(btn=>{
    btn.textContent="ふりがな "+(off?"OFF":"ON");
    btn.classList.toggle("off",off);
    btn.setAttribute("aria-pressed",String(!off));
  });
}
$$('[data-furi]').forEach(btn=>btn.onclick=toggleFurigana);

/* 문형 의미 분류 셀렉트 */
(function(){const seen=new Set();PATS.forEach(p=>{if(seen.has(p.cat))return;seen.add(p.cat);
  const o=document.createElement("option");o.value=p.cat;o.textContent=CATNAME[p.cat]||p.cat;$("#patCat").appendChild(o);});})();

/* 순위 이동 입력칸의 상한은 실제 한자 수에 맞춘다 */
$$(".pgRank").forEach(el=>el.setAttribute("max",String(ALL.length)));

/* ══════════ 사이드바 개수 · 표지 속성 ══════════ */
(function(){
  const kanji=ALL.length, pats=PATS.length,
        gram=(typeof GRAMMAR!=="undefined")?GRAMMAR.length:0,
        expr=(typeof EXPR!=="undefined")?EXPR.length:0,
        conj=hasCONJ?CONJ.length:0, spoken=hasSPOKEN?SPOKEN.length:0,
        pos=hasPOS?POS.length:0;
  const talk=(typeof DIALOGS!=="undefined")?DIALOGS.length:0;
  const talkLines=(typeof DIALOGS!=="undefined")?DIALOGS.reduce((a,d)=>a+(d.lines||[]).length,0):0;
  const set=(id,v)=>{const el=$("#"+id);if(el)el.textContent=num(v);};
  set("cntStudy",kanji);set("cntPat",pats);set("cntGram",gram);
  set("cntConj",conj);set("cntPos",pos+WORDS.length);set("cntSpoken",spoken);set("cntExpr",expr);
  /* 상단 탭 스트립에도 같은 개수를 둔다 */
  const COPY={talk:talk,study:kanji,pat:pats,gram:gram,conj:conj,
              pos:pos+WORDS.length,spoken:spoken,expr:expr};
  $$("#modebar .mc").forEach(function(el){
    const v=el.dataset.for;
    if(COPY[v]!=null){el.textContent=num(COPY[v]);el.style.display="";}
  });
  set("cntTalk",talk);
  set("stnTalk",talk);set("stnStudy",kanji);set("stnPat",pats);set("stnGram",gram);
  set("stnConj",conj);set("stnPos",pos+WORDS.length);set("stnSpoken",spoken);set("stnExpr",expr);
  const conjRows=hasCONJ?CONJ.reduce((a,c)=>a+c.rows.length,0):0;
  const posRows=hasPOS?POS.reduce((a,x)=>a+x.rows.length,0):0;
  const spRows=hasSPOKEN?SPOKEN.reduce((a,x)=>a+x.forms.length,0):0;
  const gramCh=(typeof GRAMMAR!=="undefined")?new Set(GRAMMAR.map(g=>g.ch)).size:0;
  const exprCat=(typeof EXPR!=="undefined")?new Set(EXPR.map(x=>x.cat)).size:0;
  const props=[
    ["대화",num(talk)+"편","장면 "+num(new Set(DIALOGS.map(d=>d.scene)).size)+" · "+num(talkLines)+"줄"],
    ["학습 카드",num(kanji)+"자","상용 2,136 · 상용 외 464 · 식재료 47"],
    ["문형 사전",num(pats)+"개","N5~N1 · 의미 분류 "+new Set(PATS.map(p=>p.cat)).size+"갈래"],
    ["문법",num(gram)+"항목",gramCh+"장"],
    ["활용표",num(conj)+"표","표 "+num(conjRows)+"행"],
    ["품사 사전",num(pos+WORDS.length)+"항목","묶음 "+num(pos)+" · 표 "+num(posRows)+"행 · 낱말 "+num(WORDS.length)],
    ["구어체",num(spoken)+"항목","변환 "+num(spRows)+"쌍"],
    ["표현·관용구",num(expr)+"개",exprCat+"분류"]
  ];
  const el=$("#props");
  if(el)el.innerHTML=props.map(p=>'<div class="prop"><span class="prop-k">'+p[0]+'</span>'
    +'<b>'+p[1]+'</b><span class="prop-v">'+p[2]+'</span></div>').join("");
})();

/* ══════════ 접근성(ARIA) ══════════ */
(function(){
  var tl=$(".tabs"); if(tl){tl.setAttribute("role","group");tl.setAttribute("aria-label","보기 전환");}
  $$(".tab").forEach(function(t){t.setAttribute("aria-pressed",t.classList.contains("on"));});
  var glab={lvChips:"JLPT 레벨 필터",patLv:"JLPT 레벨 필터",gramLv:"JLPT 레벨 필터",gramCh:"문법 장 필터",
            conjG:"활용표 묶음 필터",posP:"품사 필터",posView:"품사 사전 보기 전환",
            spokenSec:"구어체 분류 필터",exprCat:"표현 분류 필터"};
  Object.keys(glab).forEach(function(id){var el=$("#"+id);if(el){el.setAttribute("role","group");el.setAttribute("aria-label",glab[id]);}});
  $$(".chip").forEach(function(c){c.setAttribute("aria-pressed",c.classList.contains("on"));});
  [["qStudy","한자·뜻·읽기·예문 검색"],["qPat","문형·의미 검색"],["qGram","문법 검색"],
   ["qConj","활용표 검색"],["qPos","품사 사전 검색"],["qSpoken","구어체 검색"],["qExpr","표현·관용구 검색"]].forEach(function(a){
    var el=$("#"+a[0]);if(el)el.setAttribute("aria-label",a[1]);});
  var pcs=$("#patCat"); if(pcs)pcs.setAttribute("aria-label","문형 의미 분류 필터");
  $$(".pgRank").forEach(function(el){el.setAttribute("aria-label","순위로 이동 (숫자 입력)");});
  var cnt=$("#cnt"); if(cnt){cnt.setAttribute("role","status");cnt.setAttribute("aria-live","polite");}
  var ft=$("#fltToggle"); if(ft){ft.setAttribute("aria-controls","tbStudy");ft.setAttribute("aria-expanded","false");}
  $$('[data-furi]').forEach(function(fb){fb.setAttribute("aria-pressed","true");});
})();

renderStudy();


/* ── 테마 — /it(it-2026-09-05) 와 같은 규격 ──
   밝음/어둠 둘 다 같은 셸이다. 값은 localStorage 에 기억하고,
   아무 것도 없으면 OS 설정을 따른다(prefers-color-scheme). */
(function(){
  var KEY='jpstudy:theme', root=document.documentElement;
  var saved=null;
  try{ saved=localStorage.getItem(KEY); }catch(e){}
  if(saved!=="light"&&saved!=="dark"){
    saved=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches)?"light":"dark";
  }
  root.setAttribute("data-theme",saved);
  var btn=$("#themeToggle");
  function paint(){
    var dark=root.getAttribute("data-theme")==="dark";
    if(btn){
      btn.textContent=dark?"☾":"☀";
      btn.title=dark?"밝은 테마로 전환":"어두운 테마로 전환";
      btn.setAttribute("aria-pressed",String(dark));
    }
    var tc=document.querySelector('meta[name="theme-color"]');
    if(tc)tc.setAttribute("content",dark?"#0d1117":"#ffffff");
  }
  if(btn)btn.addEventListener("click",function(){
    var next=root.getAttribute("data-theme")==="dark"?"light":"dark";
    root.setAttribute("data-theme",next);
    try{localStorage.setItem(KEY,next);}catch(e){}
    paint();
  });
  paint();
})();

/* 진행률 바 — 학습 카드에서 "전체 한자 중 몇 번째까지 왔는지"를 보여 준다.
   스크롤이 아니라 페이징 기준이라 렌더링·이동 시점에만 갱신하면 된다 */
function updateProgress(){
  const wrap=$("#progressWrap"),bar=$("#progressBar");
  if(!wrap||!bar)return;
  const view=$("#view-study");
  const isStudy=view&&!view.classList.contains("hidden");
  if(!isStudy||!studyItems.length){wrap.style.display="none";return;}
  wrap.style.display="block";
  const end=Math.min(studyPage+PAGE,studyItems.length);
  const lastRank=studyItems[end-1].rank;
  const pct=Math.min(100,(lastRank/ALL.length)*100);
  bar.style.width=pct.toFixed(1)+"%";
  const rail=$("#topProg");
  if(rail)rail.style.width=pct.toFixed(1)+"%";
  bar.title=num(lastRank)+" / "+num(ALL.length)+"자 ("+pct.toFixed(0)+"%)";
}

/* 토스트 알림 */
let toastTimer=null;
function toast(msg){
  const el=$("#toast");
  if(!el)return;
  el.textContent=msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove("show"),2000);
}


/* 학습 통계 대시보드 */
(function(){
  const view=$("#main")||$("#scroll");
  if(!view)return;
  const stats=document.createElement("div");
  stats.className="stats-bar";
  stats.innerHTML='<span class="stat-item"><span class="stat-ic">\ud83d\udcda</span> 한자 <b id="statKanji">\u2014</b></span>'
    +'<span class="stat-item"><span class="stat-ic">\ud83d\udcd6</span> 문형 <b id="statPat">\u2014</b></span>'
    +'<span class="stat-item"><span class="stat-ic">\ud83d\udcd0</span> 문법 <b id="statGram">\u2014</b></span>'
    +'<span class="stat-item"><span class="stat-ic">\u2605</span> 북마크 <b id="bmCount">0</b></span>';
  view.insertBefore(stats,view.firstChild);
  $("#statKanji").textContent=num(ALL.length);
  $("#statPat").textContent=num(typeof PATS!=="undefined"?PATS.length:0);
  $("#statGram").textContent=num(typeof GRAMMAR!=="undefined"?GRAMMAR.length:0);
  renderBookmarks();
})();
