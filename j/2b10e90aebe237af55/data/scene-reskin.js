/* scene-reskin.js — 문법 보강 대화의 '직장 껍데기'를 캠퍼스·생활 장면으로 바꾼다.
   본문 줄 수·item·tags 는 그대로 두고, 장면·제목·회사 어휘만 치환한다.
   그래서 커버리지가 깨지지 않는다. */
const SCENE_RESKIN = {
  d284: {
    title: "레포트 제출 — まで · より",
    scene: "학교·대학가",
    place: "도쿄 · 대학 세미나실",
    rep: [
      ["[会議|かいぎ]", "[授業|じゅぎょう]"], ["[資料|しりょう]", "[課題|かだい]"], ["[資|し]料", "[課題|かだい]"],
      ["회의", "수업"], ["자료", "과제"]
    ]
  },
  d241: {
    title: "수업 전 확인 — 정중체와 말끝",
    scene: "학교·대학가",
    place: "도쿄 · 대학 세미나실",
    rep: [
      ["[会議室|かいぎしつ]", "[教室|きょうしつ]"], ["[会議|かいぎ]", "[授業|じゅぎょう]"],
      ["[資料|しりょう]", "[課題|かだい]"], ["[課長|かちょう]", "[先輩|せんぱい]"],
      ["회의실", "강의실"], ["회의", "수업"], ["자료", "과제"], ["과장", "선배"]
    ]
  },
  d274: {
    title: "수업 발표 조정 — 쿠션어",
    scene: "학교·대학가",
    place: "도쿄 · 대학 세미나실",
    rep: [
      ["[資料|しりょう]", "[課題|かだい]"], ["[会場|かいじょう]", "[教室|きょうしつ]"],
      ["[先方|せんぽう]", "[相手|あいて]"],
      ["자료", "과제"], ["회장", "강의실"], ["상대 측", "상대 팀"]
    ]
  },
  d289: {
    title: "통학길 — 이유와 역접",
    scene: "전철·교통",
    place: "도쿄 · 통학 전철",
    rep: [
      ["[機材|きざい]", "[教材|きょうざい]"],
      ["장비", "교재"], ["기재", "교재"]
    ]
  },
  d304: {
    title: "선배와의 대화 — 문말을 정하는 부사 2",
    scene: "학교·대학가",
    place: "도쿄 · 대학 세미나실",
    rep: [
      ["[資料|しりょう]", "[課題|かだい]"], ["[会議|かいぎ]", "[授業|じゅぎょう]"],
      ["자료", "과제"], ["회의", "수업"]
    ]
  }
};
(function () {
  if (typeof DIALOGS === "undefined" || typeof SCENE_RESKIN === "undefined") return;
  DIALOGS.forEach(function (d) {
    const r = SCENE_RESKIN[d.id];
    if (!r) return;
    if (r.title) d.title = r.title;
    if (r.scene) d.scene = r.scene;
    if (r.place) d.place = r.place;
    const rep = function (s) {
      let x = String(s == null ? "" : s);
      (r.rep || []).forEach(function (p) { x = x.split(p[0]).join(p[1]); });
      return x;
    };
    (d.lines || []).forEach(function (l) { l.s = rep(l.s); l.ko = rep(l.ko); });
    (d.points || []).forEach(function (p) { p.t = rep(p.t); p.d = rep(p.d); });
  });
})();
