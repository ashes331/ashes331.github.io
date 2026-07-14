/*
  ============================================================
  world-lore 데이터 파일
  ============================================================
  새로운 게임을 추가하고 싶으면, 아래 gamesData 배열에
  객체 하나를 복사해서 붙여넣고 내용만 바꾸면 됩니다.
  HTML/CSS/JS는 건드릴 필요 없습니다.

  각 필드 설명:
  - id           : URL에 쓰일 고유 식별자 (영문 소문자, 하이픈만 사용, 공백 금지)
                   예: "blue-archive" -> detail.html?id=blue-archive
  - title        : 게임 제목
  - genre        : 장르/태그 (카드에 짧게 표시됨)
  - fileNumber   : 파일 번호처럼 표시될 문자열 (3자리 숫자 추천, 순서는 자유)
  - hook         : 목록 카드에 보일 한 줄 소개 (후킹 문구, 20자 내외 추천)
  - accentColor  : 이 게임 전용 포인트 색상 (hex). 비워두면 기본 골드색 사용
  - worldview    : 세계관 개요. 여러 문단은 배열로 나눠서 넣으면 각각 <p>로 렌더링됨
  - timeline     : 연표. { era: "시대/연도 표기", event: "설명" } 객체 배열
  - factions     : 주요 세력. { name, description }
  - characters   : 주요 캐릭터. { name, role, description }
  - glossary     : 용어집. { term, definition }

  timeline / factions / characters / glossary 는
  내용이 없는 게임이면 빈 배열 [] 로 두면 해당 섹션 탭이 자동으로 숨겨집니다.
  ============================================================
*/

const gamesData = [
  {
    id: "example-twilight-ark",
    title: "황혼의 방주",
    genre: "SF · 재난 · 다크판타지",
    fileNumber: "001",
    hook: "가라앉는 세계에서 마지막 배를 지키는 이야기",
    accentColor: "#a6432f",
    worldview: [
      "이것은 예시 데이터입니다. 실제 게임의 세계관을 이 자리에 채워 넣으면 됩니다.",
      "대륙 대부분이 '침수 현상'으로 가라앉은 세계. 살아남은 인류는 거대한 방주형 도시 '아르카'에 모여 살아가며, 방주를 움직이는 동력원인 '심핵'을 둘러싸고 여러 세력이 대립한다.",
      "플레이어는 방주의 항해사 후보생으로서, 침수의 원인을 추적하는 동시에 방주 내부의 정치 다툼에 휘말리게 된다."
    ],
    timeline: [
      { era: "침수 이전", event: "대륙 문명이 번영하던 시기. 심핵 기술이 개발됨." },
      { era: "침수 원년", event: "원인 불명의 침수 현상 시작. 각지에서 탈출 방주 건조." },
      { era: "표류기", event: "아르카를 포함한 소수의 방주만이 살아남아 표류를 시작." },
      { era: "현재", event: "방주 내 세력 다툼 심화. 플레이어가 항해사 후보생으로 합류." }
    ],
    factions: [
      { name: "항해평의회", description: "방주의 항로와 자원 배분을 결정하는 공식 통치 기구." },
      { name: "심핵교단", description: "심핵을 신성시하며 방주 운항 방식에 반대하는 종교 집단." },
      { name: "잠수부 길드", description: "침수된 구역을 탐사해 유물과 정보를 회수하는 독립 조직." }
    ],
    characters: [
      { name: "레이나", role: "항해사 교관", description: "냉정하지만 방주의 생존자 전원을 책임지려는 인물." },
      { name: "테오", role: "심핵교단 사제", description: "침수의 원인이 인간의 오만이라 믿는 젊은 사제." }
    ],
    glossary: [
      { term: "심핵", description: "방주를 움직이는 정체불명의 동력원. 기원이 밝혀지지 않았다." },
      { term: "침수 현상", description: "대륙을 가라앉게 만든 원인 불명의 재해." },
      { term: "아르카", description: "생존자들이 모여 사는 최대 규모의 방주형 도시." }
    ]
  }

  // 여기에 새 게임 객체를 추가하세요. 예:
  // {
  //   id: "my-second-game",
  //   title: "...",
  //   genre: "...",
  //   fileNumber: "002",
  //   hook: "...",
  //   accentColor: "#5c6f5d",
  //   worldview: ["..."],
  //   timeline: [],
  //   factions: [],
  //   characters: [],
  //   glossary: []
  // },
];
