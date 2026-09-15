# 🎮 테트리스 (Tetris)

바닐라 HTML5 Canvas, CSS, JavaScript로 만든 클래식 테트리스 게임입니다.

> 이 프로젝트는 [ashes331.github.io](https://ashes331.github.io) 포트폴리오의 서브 프로젝트입니다.
> 플레이: https://ashes331.github.io/tetris/

## 기능

- **7-bag 랜덤화** — 편향 없이 공평한 블록 분배
- **고스트 블록** — 블록이 떨어질 위치를 미리 표시
- **홀드** — 현재 블록을 홀드 슬롯에 보관 (한 번 스폰 당 1회)
- **SRS 회전** — 일반 피스 / I 피스 별도 킥 테이블 적용
- **T-Spin 판정** — T-Spin / T-Spin Mini 구분 (4코너 + 앞면 2코너 체크)
- **Back-to-Back** — Tetris 또는 T-Spin 연속 시 점수 1.5배
- **콤보** — 연속 라인 클리어마다 `50 × combo × level` 추가 점수
- **All Clear 보너스** — 보드를 완전히 비우면 `3500 × level` 추가
- **DAS** — 방향키 꾹 누를 때 160ms 후 50ms 간격으로 자동 이동
- **레벨 시스템** — 10줄마다 레벨업, 최대 11레벨 (800ms → 80ms)
- **레트로 CRT UI** — CSS 스캔라인 + 네온 글로우 효과
- **사이버펑크 배경** — 매트릭스 바이너리 레인 + 2레이어 시티스케이프

## 조작법

| 키 | 동작 |
|----|------|
| `←` `→` | 좌우 이동 |
| `↑` 또는 `X` | 시계 방향 회전 |
| `Z` | 반시계 방향 회전 |
| `↓` | 소프트 드롭 (+1점/셀) |
| `Space` | 하드 드롭 (+2점/셀) |
| `C` | 블록 홀드 |
| `ESC` | 일시정지 메뉴 |

## 실행 방법

빌드 없이 `index.html`을 브라우저에서 바로 열면 됩니다.

```bash
git clone https://github.com/ashes331/ashes331.github.io.git
cd ashes331.github.io/tetris
open index.html       # macOS
# xdg-open index.html  (Linux)
# start index.html     (Windows)
```

## 프로젝트 구조

```
tetris/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── tetris.js
│   └── background.js
└── README.md
```

## 점수 체계

| 액션 | 점수 (× 레벨) |
|------|--------------|
| 싱글 | 100 |
| 더블 | 300 |
| 트리플 | 500 |
| 테트리스 | 800 |
| T-Spin (라인 없음) | 100 |
| T-Spin Single | 800 |
| T-Spin Double | 1200 |
| T-Spin Triple | 1600 |
| All Clear 보너스 | 3500 |
| Back-to-Back | × 1.5 |
| 콤보 | +50 × combo × level |
| 소프트 드롭 | +1 / 셀 |
| 하드 드롭 | +2 / 셀 |
