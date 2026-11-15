const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = 'C:/Users/user/Downloads/japanese-pages';
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync(`${ROOT}/j/2b10e90aebe237af55/data/lessons.js`, 'utf8') + ';globalThis.L=LESSONS;', c);
const scenes = JSON.parse(fs.readFileSync(`${ROOT}/build/shorts/assignments.json`, 'utf8')).scenes;
const byId = new Map(scenes.map(s => [s.id, s]));
const L = c.L.filter(l => l.track === 'scene');
const dir = `${ROOT}/build/shorts/rewrite-prompts`;
fs.mkdirSync(dir, { recursive: true });

const header = `# 장면 대화 150편 — 자연스러움 전면 재작성

아래 장면 레슨들을 **일본 원어민이 실제 대화로 읽어도 위화감이 없는 대화**로 다시 쓴다.
지금 데이터는 문장은 맞지만 교과서 예문을 이어 붙인 느낌이 난다. 그 느낌을 없애는 것이 목적이다.

## 반드시 지킬 것

1. **한 장면 = 한 상황**. 대화가 시작되고 끝난다. 중간에 다른 화제로 튀지 마라.
2. **말투 일관성**. 한 사람이 です・ます와 だ・よ를 섞지 마라.
   - 점원·손님·상사·낯선 사람: です・ます (polite)
   - 친구·동료·가족: だ・よ・ね (casual)
   - 같은 장면에서 두 사람이 서로 다른 말투를 쓰는 것은 자연스럽다(점원은 정중, 손님은 반말 등). 단 상하관계에 맞게.
   - \\\`register\\\` 필드는 장면의 기본 말투다. 필요하면 고쳐서 출력한다.
3. **줄 수 10~12줄**. 원본과 같은 인물(\\\`who\\\`)만 쓴다.
4. **목표(targets)는 주어진 목록 그대로 유지**한다. kind·key를 바꾸지 마라.
   - 각 목표는 지정된 \\\`line\\\`(0부터) 줄에 실제로 나와야 한다. 줄을 옮겨도 되지만, 그 경우 \\\`line\\\` 값을 고쳐서 출력한다.
   - 목표 표현의 첫 등장만 \\\`{…}\\\`로 감싼다. 한 줄에 목표 1개.
   - 정말 자연스럽게 넣을 수 없는 목표가 있으면 억지로 넣지 말고 \\\`droppedTargets\\\`에 적는다. 자연스러움이 우선이다.
5. **목표가 없는 줄이 절반 이상**이어야 한다. 모든 줄에 문법을 넣지 마라.
6. **설명조·교과서조 금지**. 「～は大切です」「～を勉強しましょう」 같은 학습 안내 문장을 쓰지 마라. 인물이 실제로 할 말만 쓴다.
7. **되묻기·맞장구·말 끊기**를 넣어 실제 대화처럼 만든다. 단, 정보가 목표 문형 하나에만 매달리지 않게.
8. **루비**: 한자 읽기 루비는 원본에 있던 방식 그대로 \\\`[漢字|よみ]\\\`를 쓴다. 새로 쓴 한자어에도 필요한 만큼 붙인다. 가나에는 붙이지 마라.
9. **한국어**: 실제 대화 말투로 자연스럽게. 일본어를 남기지 마라(예: 「ですね」 그대로 두기 금지). 직역투 금지.
10. 일본어 줄에 한글을 넣지 마라.

## 출력

JSON 배열만. 코드펜스·설명 없이.

\\\`\\\`\\\`json
[
  {
    "id": "sh001",
    "scene": "카페",
    "title": "카페 — 첫 주문",
    "level": "N5",
    "register": "polite",
    "lines": [
      { "who": "aki", "s": "いらっしゃいませ。お[一人|ひとり]ですか。", "ko": "어서 오세요. 한 분이신가요?" }
    ],
    "targets": [
      { "kind": "표현", "key": "お待たせしました", "line": 5 }
    ]
  }
]
\\\`\\\`\\\`

## 레슨
`;

const BATCH = 10;
let n = 0;
for (let i = 0; i < L.length; i += BATCH) {
  n++;
  const chunk = L.slice(i, i + BATCH).map(l => {
    const a = byId.get(l.id) || {};
    return {
      id: l.id, scene: l.scene, title: l.goal, level: l.level,
      register: a.register || l.register || '',
      chars: a.chars || l.chars || ['jihu'],
      targets: (l.targets || []).map(t => ({ kind: t.kind, key: t.key, note: t.note || '' })),
      lines: l.lines.map(x => ({ who: x.who, s: x.s, ko: x.ko }))
    };
  });
  fs.writeFileSync(path.join(dir, `scene-${String(n).padStart(2, '0')}.md`),
    [header, '```json', JSON.stringify(chunk, null, 1), '```', ''].join('\n'), 'utf8');
}
console.log('scene prompt batches', n);
