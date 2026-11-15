/* integrate_grammar_rewrite.cjs — 재작성 150편 + 확장 5편을 정본에 반영 */
const fs = require('fs'), path = require('path');
const OUT = 'C:/Users/user/Downloads/japanese-pages/build/shorts';
const RW = path.join(OUT, 'rewrite');

/* 1. 재작성 150편 수집 */
const rw = [];
for (const f of fs.readdirSync(RW).filter(f => /^grammar-\d+\.json$/.test(f)).sort()) {
  rw.push(...JSON.parse(fs.readFileSync(path.join(RW, f), 'utf8')).filter(d => /^g\d+$/.test(d.id)));
}
if (rw.length !== 150) throw new Error('rewrite count ' + rw.length);

/* 2. 기존 배치의 순서/메타 */
const old = [];
for (let i = 1; i <= 10; i++) {
  old.push(...JSON.parse(fs.readFileSync(path.join(OUT, `grammar-${String(i).padStart(2, '0')}.json`), 'utf8')));
}
const oldById = new Map(old.map(d => [d.id, d]));
const assign = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-assignments.json'), 'utf8'));
const aById = new Map(assign.scenes.map(s => [s.id, s]));

/* 3. 배치 파일 다시 쓰기 (15편씩) */
for (let b = 0; b < 10; b++) {
  const chunk = rw.slice(b * 15, b * 15 + 15).map(d => {
    const o = oldById.get(d.id);
    return {
      id: d.id,
      scene: d.scene || o.scene,
      title: d.title || o.title,
      level: d.level || o.level,
      register: d.register || o.register,
      lines: d.lines.map(x => ({ who: x.who, s: x.s, ko: x.ko })),
      targets: d.targets.map(t => ({ kind: t.kind, key: t.key, line: t.line }))
    };
  });
  fs.writeFileSync(path.join(OUT, `grammar-${String(b + 1).padStart(2, '0')}.json`), JSON.stringify(chunk, null, 1), 'utf8');
  for (const d of chunk) {
    const a = aById.get(d.id);
    if (!a) continue;
    a.scene = d.scene; a.title = d.title; a.level = d.level; a.register = d.register;
    const oldT = new Map(a.targets.map(t => [t.kind + ' · ' + t.key, t]));
    a.targets = d.targets.map(t => {
      const prev = oldT.get(t.kind + ' · ' + t.key) || {};
      return {
        kind: t.kind, key: t.key, level: prev.level || a.level,
        note: prev.note || '', examples: prev.examples || []
      };
    });
  }
}

/* 4. 확장 5편 대화로 재작성 */
const extras = {
  x001: {
    register: 'polite',
    lines: [
      { who: 'sato', s: '値上げの話、店としてどう受け止めていますか。', ko: '가격 인상 이야기를 가게 입장에서 어떻게 보고 있나요?' },
      { who: 'jihu', s: '正直、文句を言えば{きりがない}んですが…。', ko: '솔직히 불평하자면 끝이 없지만요…' },
      { who: 'sato', s: 'ええ。でも、まずは自分たちの店をよくする{てこそ}、地域の信頼は得られますよ。', ko: '그래요. 그래도 먼저 우리 가게를 좋게 만들어야 비로소 지역의 신뢰를 얻을 수 있어요.' },
      { who: 'jihu', s: 'そうですね。では、接客の見直しから始めましょう。', ko: '그렇네요. 그럼 접객부터 다시 살펴보죠.' },
      { who: 'sato', s: 'まずは客の声を聞くところからだね。', ko: '우선 손님의 목소리를 듣는 것부터지.' },
      { who: 'jihu', s: 'はい。明日からアンケートを配ってみます。', ko: '네. 내일부터 설문지를 돌려 볼게요.' }
    ],
    targets: [
      { kind: '문법', key: '～ばきりがない', line: 1 },
      { kind: '문법', key: '～てこそ', line: 2 }
    ]
  },
  x002: {
    register: 'polite',
    lines: [
      { who: 'jihu', s: 'この計画、予算の面に{無理がある}と思います。', ko: '이 계획은 예산 면에 무리가 있다고 생각합니다.' },
      { who: 'sato', s: 'そうですね。去年{を境に}、客足も少しずつ減っています。', ko: '그렇네요. 작년을 기점으로 발길도 조금씩 줄고 있어요.' },
      { who: 'jihu', s: '閉店を前にして、何か手を打たないといけませんね。', ko: '폐점을 앞두고 뭔가 대책을 세워야겠네요.' },
      { who: 'sato', s: '売上は前年の八割まで落ち込みました。', ko: '매출은 전년의 8할까지 떨어졌습니다.' },
      { who: 'jihu', s: 'それでも、常連のお客さんは毎日来てくれています。', ko: '그래도 단골손님은 매일 와 주고 계세요.' },
      { who: 'sato', s: '数字だけでは測れない価値があります。そこを大事にしたいですね。', ko: '숫자만으로는 잴 수 없는 가치가 있어요. 그걸 소중히 하고 싶네요.' }
    ],
    targets: [
      { kind: '문법', key: '～に（は）無理がある', line: 0 },
      { kind: '문법', key: '～を境に', line: 1 }
    ]
  },
  x003: {
    register: 'polite',
    lines: [
      { who: 'jihu', s: '雨{ならともかく}、晴れた日に中止するのはもったいないですよ。', ko: '비라면 몰라도, 맑은 날 중지하는 건 아깝습니다.' },
      { who: 'sato', s: 'そうですね。この店ができ{てからというもの}、駅前は明るくなりました。', ko: '그렇네요. 이 가게가 생긴 뒤로 역 앞이 밝아졌어요.' },
      { who: 'jihu', s: '買い物がてら、近所の公園にも寄ってみましょうか。', ko: '장 보는 김에 근처 공원에도 들러 볼까요?' },
      { who: 'sato', s: 'ええ。人とのつながりなくして、街の再生はあり得ませんからね。', ko: '네. 사람과의 연결 없이는 거리 재생은 있을 수 없으니까요.' },
      { who: 'jihu', s: '小さな店が一つ増えるだけでも、風景は変わります。', ko: '작은 가게가 하나 늘어나는 것만으로도 풍경은 달라집니다.' },
      { who: 'sato', s: 'では、今日の帰りにでも下見に行ってみましょう。', ko: '그럼 오늘 돌아가는 길에 답사해 보러 가죠.' }
    ],
    targets: [
      { kind: '문법', key: '～ならともかく', line: 0 },
      { kind: '문형', key: '～てからというもの（심화）', line: 1 }
    ]
  },
  x004: {
    register: 'polite',
    lines: [
      { who: 'jihu', s: '店を畳むと聞いて、寂しく{てならない}んです。', ko: '가게를 접는다고 해서 참 쓸쓸하네요.' },
      { who: 'sato', s: 'わかります。細かい条件{はさておき}、まず基本方針を決めましょう。', ko: '알아요. 세부 조건은 차치하고 우선 기본 방침을 정하죠.' },
      { who: 'jihu', s: '感謝の気持ちは、言葉をもって伝えたいですね。', ko: '감사한 마음은 말로 전하고 싶네요.' },
      { who: 'sato', s: 'ええ。互いの立場を理解することが、何より大切です。', ko: '네. 서로의 입장을 이해하는 게 무엇보다 중요해요.' },
      { who: 'jihu', s: '今日の話し合いが、その第一歩になりますね。', ko: '오늘 대화가 그 첫걸음이 되겠네요.' },
      { who: 'sato', s: 'では、来週までに案をまとめておきます。', ko: '그럼 다음 주까지 안을 정리해 둘게요.' }
    ],
    targets: [
      { kind: '문형', key: '～てならない（심화）', line: 0 },
      { kind: '문형', key: '～はさておき（심화）', line: 1 }
    ]
  },
  x005: {
    register: 'polite',
    lines: [
      { who: 'jihu', s: '本日はお忙しいところ、ご出席いただき、心よりお礼を申し上げます。', ko: '바쁘신 가운데 참석해 주셔서 진심으로 감사드립니다.' },
      { who: 'sato', s: 'こちらこそ。地域の声を聞く{べく}、現場に足を運んでいるところです。', ko: '저야말로요. 지역의 목소리를 듣고자 현장을 찾고 있습니다.' },
      { who: 'jihu', s: '完全にとは言わ{ないまでも}、現状より良い方向へ進みたいですね。', ko: '완전히는 아니더라도 현상보다 나은 방향으로 나아가고 싶네요.' },
      { who: 'sato', s: 'ええ。この機会に、新しい仕組みを始めましょう。', ko: '네. 이 기회에 새로운 체계를 시작하죠.' },
      { who: 'jihu', s: '細かい事情はともかく、まずは方針を確認したいと思います。', ko: '세부 사정은 제쳐 두고 우선 방침을 확인하고 싶습니다.' },
      { who: 'sato', s: 'では、以上をもちまして、本日の会議を終えましょう。', ko: '그럼 이상으로 오늘 회의를 마치겠습니다.' }
    ],
    targets: [
      { kind: '문형', key: '～べく（심화）', line: 1 },
      { kind: '문형', key: '～ないまでも（심화）', line: 2 }
    ]
  }
};
const oldExtra = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-extra-manual.json'), 'utf8'));
const exAssign = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-extra-assignments.json'), 'utf8'));
for (const d of oldExtra) {
  const e = extras[d.id];
  if (!e) continue;
  d.register = e.register;
  d.lines = e.lines;
  d.targets = e.targets;
  d.chars = d.chars || ['jihu', 'sato'];
  const a = exAssign.scenes.find(s => s.id === d.id);
  if (a) {
    a.register = e.register;
    a.chars = ['jihu', 'sato'];
    const keep = new Map(a.targets.map(t => [t.kind + ' · ' + t.key, t]));
    a.targets = e.targets.map(t => {
      const prev = keep.get(t.kind + ' · ' + t.key) || {};
      return { kind: t.kind, key: t.key, level: prev.level || d.level, note: prev.note || '', examples: prev.examples || [] };
    });
  }
}
fs.writeFileSync(path.join(OUT, 'grammar-extra-manual.json'), JSON.stringify(oldExtra, null, 1), 'utf8');
fs.writeFileSync(path.join(OUT, 'grammar-extra-assignments.json'), JSON.stringify(exAssign, null, 1), 'utf8');
fs.writeFileSync(path.join(OUT, 'grammar-assignments.json'), JSON.stringify(assign, null, 1), 'utf8');
console.log('grammar integrated: 150 + 5');
