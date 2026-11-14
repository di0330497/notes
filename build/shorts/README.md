# 쇼츠 대화 파이프라인

입력: `build/reconstruction/core-items.json` + 사전 데이터
출력: `build/shorts/*.json` → `data/shorts.js`, `data/lessons.js`

## 순서

```powershell
node tools/shorts/build_inventory.cjs      # 사전 항목 + 장면 태그
node tools/shorts/build_core_targets.cjs   # 코어 700 → 대화 목표 506
node tools/shorts/build_scenes.cjs         # 150 장면
node tools/shorts/assign.cjs               # 목표 → 장면 배정
node tools/shorts/make_prompts.cjs         # batch-01.md … batch-10.md
# batch-01.json … batch-10.json 집필
node tools/shorts/validate_shorts.cjs      # 목표가 실제 대사에 있는지 검사
node tools/shorts/build_site_data.cjs      # shorts.js + lessons.js
node tools/shorts/report.cjs               # 커버리지 리포트
```

## 규격

- 1편 8~12줄
- 목표 3~4개 (한자 1, 표현 0~1, 문법/문형/구어체 1~2, 품사 0~1)
- 목표 없는 줄이 절반 이상
- 3줄에 새 문법 1개 이하
- 1편 = 1레슨 (쪼개지 않음)
- 95% 목표: 506개 중 481개 이상

## 검사

`validate_shorts.cjs`는 다음을 본다.

- 150편이 모두 있는가
- 8~14줄인가
- 배정된 목표가 전부 `targets`에 있는가
- 목표가 실제 해당 줄에 있는가

실패 목록은 `build/shorts/validation.json` 에 남는다.
