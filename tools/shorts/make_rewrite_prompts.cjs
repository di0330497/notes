const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = 'C:/Users/user/Downloads/japanese-pages';
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync(`${ROOT}/j/2b10e90aebe237af55/data/lessons.js`, 'utf8') + ';globalThis.L=LESSONS;', c);
const L = c.L.filter(l => l.track === 'grammar');
const dir = `${ROOT}/build/shorts/rewrite-prompts`;
fs.mkdirSync(dir, { recursive: true });
const BATCH = 15;
const header = `# 문법 대화 전면 재작성 — 배치

아래 15개 문법 레슨을 **원어민이 읽어도 자연스러운 짧은 대화**로 다시 쓴다.

## 규칙

1. **4~6줄**. 6줄을 넘기지 마라.
2. 주어진 \`targets\` 중 **2개만** 고른다. 억지로 3개를 넣지 마라. 정말 안 맞으면 1개만 써도 된다.
3. 목표가 없는 줄이 **2줄 이상** 있어야 한다. 모든 줄에 문법을 넣지 마라.
4. 한 줄에 새 문법은 1개만. 같은 문법을 두 번 넣지 마라.
5. 장면(\`scene\`), 말투(\`register\`), 인물(\`chars\`)을 지킨다.
   - polite: です・ます
   - casual: だ・よ・ね
   - written: だ・である
6. 대화는 하나의 상황으로 끝난다. 문법 예문을 나열하지 말고, 두 사람이 실제로 주고받게 쓴다.
7. 한국어 번역은 자연스럽게. 직역투 금지.
8. target의 첫 등장에만 \`{표현}\` 표시. \`line\`은 0부터.
9. 기존 대화는 참고만 하고, 자연스러움을 위해 자유롭게 다시 써도 된다.

## 출력

JSON 배열만. 코드펜스·설명 없이.

\`\`\`json
[
  {
    "id": "g001",
    "scene": "카페",
    "title": "카페 — 첫 주문 문법",
    "level": "N5",
    "register": "polite",
    "lines": [
      { "who": "aki", "s": "いらっしゃいませ。ご注文はお決まりですか。", "ko": "어서 오세요. 주문하시겠어요?" },
      { "who": "jihu", "s": "はい、ホットコーヒーをお願いします。", "ko": "네, 따뜻한 커피 부탁드립니다." }
    ],
    "targets": [
      { "kind": "문형", "key": "～をお願いします", "line": 1 }
    ]
  }
]
\`\`\`

## 레슨
`;
let n = 0;
for (let i = 0; i < L.length; i += BATCH) {
  n++;
  const chunk = L.slice(i, i + BATCH).map(l => ({
    id: l.id, scene: l.scene, title: l.goal, level: l.level, register: l.register || '',
    chars: l.chars || ['jihu', 'aki'],
    targets: l.targets.map(t => ({ kind: t.kind, key: t.key, note: t.note })),
    currentLines: l.lines.map(x => ({ who: x.who, s: x.s, ko: x.ko }))
  }));
  fs.writeFileSync(path.join(dir, `grammar-${String(n).padStart(2,'0')}.md`),
    [header, '```json', JSON.stringify(chunk, null, 1), '```', ''].join('\n'), 'utf8');
}
console.log('batches', n, dir);
