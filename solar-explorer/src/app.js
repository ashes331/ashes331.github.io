// app.js - Three.js 3D Solar System Engine (Astronomical Time Ratio Synced)
'use strict';

/* JSDoc Type Definitions */
/**
 * @typedef {Object} StatItem
 * @property {string} label
 * @property {string} value
 */

/**
 * @typedef {Object} SpaceObjectData
 * @property {string} id
 * @property {string} name
 * @property {string} nameEn
 * @property {string} type
 * @property {string} typeColor
 * @property {StatItem[]} stats
 * @property {string} desc
 * @property {string[]} facts
 * @property {number} [sma] Semi-major axis in AU
 * @property {number} [ecc] Eccentricity
 * @property {number} [period] Orbital period in Earth days
 * @property {number} [startAngle] Initial orbital angle
 * @property {number} [rotationPeriod] Rotational period in Earth days (negative for retrograde)
 * @property {string} textureUrl Primary texture URL (Base64 if available)
 * @property {string} backupTextureUrl Fallback raw CDN texture URL
 * @property {string} [ringTextureUrl] Ring texture URL
 * @property {number} sizeScale Relative visual size in 3D scene
 * @property {string} fallbackColor Fallback hex color if texture fails
 */

/* ═══════════════════════════════════════════════════════
   DATA & RESOURCES DEFINITION
═══════════════════════════════════════════════════════ */
const hasBase64 = (typeof BASE64_TEXTURES !== 'undefined');

// 천문 날짜 동기화 상수
const EPOCH_DATE = new Date(2000, 0, 1);
const SIM_DAYS_PER_SEC = 365.25 / 300; // 지구 1년 300초 공전 기준 일 속도 (1초당 약 1.2175일)

const SUN_DATA = {
  id: 'sun', name: '태양', nameEn: 'SUN',
  type: 'G형 주계열성 (항성)', typeColor: '#FFD700',
  stats: [
    { label: '반지름', value: '695,700 km' },
    { label: '질량', value: '1.99 × 10³⁰ kg' },
    { label: '표면 온도', value: '5,778 K' },
    { label: '코로나 온도', value: '~100만 K' },
    { label: '나이', value: '약 46억 년' },
    { label: '수명 (잔여)', value: '약 50억 년' },
  ],
  desc: '태양계의 중심 항성. 태양계 전체 질량의 99.86%를 차지하며, 핵 내부의 수소 핵융합 반응으로 에너지를 생산합니다.',
  facts: [
    '빛이 지구까지 도달하는 데 약 8분 20초',
    '지름은 지구의 약 109배, 부피는 약 130만 배',
    '태양풍이 지구 자기권 형성에 영향',
    '은하계 중심을 약 2억 2,500만 년 주기로 공전'
  ],
  rotationPeriod: 27.0, // 태양 자전 주기: 27일
  textureUrl: hasBase64 ? BASE64_TEXTURES.sun : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/sun.jpg',
  backupTextureUrl: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/sun.jpg',
  sizeScale: 14,
  fallbackColor: '#ff6600'
};

const PLANET_DATA = [
  {
    id: 'mercury', name: '수성', nameEn: 'MERCURY',
    type: '암석 행성', typeColor: '#9E9E9E',
    sma: 0.387, ecc: 0.206, period: 87.97, startAngle: 0.3,
    rotationPeriod: 58.65, // 수성 자전 주기: 58.65일 (3:2 스핀-궤도 공명)
    sizeScale: 2.0,
    textureUrl: hasBase64 ? BASE64_TEXTURES.mercury : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/mercury.jpg',
    backupTextureUrl: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/mercury.jpg',
    fallbackColor: '#8c8c8c',
    stats: [
      { label: '태양까지 거리', value: '0.387 AU' },
      { label: '공전 주기', value: '87.97 일' },
      { label: '반지름', value: '2,440 km' },
      { label: '위성', value: '0개' },
      { label: '표면 온도', value: '-180 ~ 430°C' },
      { label: '중력', value: '3.7 m/s²' },
    ],
    desc: '태양에 가장 가까운 행성. 대기가 거의 없어 온도 변화가 극심하며, 표면에는 수천 개의 충돌 크레이터가 있습니다.',
    facts: ['1년이 지구의 88일에 불과', '하루(자전)가 지구 58.6일', '물이 있는 극지 영구 그늘 존재', '로마 전령의 신(머큐리)에서 이름 유래'],
    satellites: null
  },
  {
    id: 'venus', name: '금성', nameEn: 'VENUS',
    type: '암석 행성', typeColor: '#FFA040',
    sma: 0.723, ecc: 0.007, period: 224.7, startAngle: 1.8,
    rotationPeriod: -243.02, // 금성 자전 주기: 243.02일 (음수 = 역자전)
    sizeScale: 2.8,
    textureUrl: hasBase64 ? BASE64_TEXTURES.venus : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/venus.jpg',
    backupTextureUrl: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/venus.jpg',
    fallbackColor: '#e3bb76',
    stats: [
      { label: '태양까지 거리', value: '0.723 AU' },
      { label: '공전 주기', value: '224.7 일' },
      { label: '반지름', value: '6,052 km' },
      { label: '위성', value: '0개' },
      { label: '평균 온도', value: '462°C' },
      { label: '대기 주성분', value: 'CO₂ 96.5%' },
    ],
    desc: '두꺼운 이산화탄소 대기로 인한 극심한 온실 효과로 태양계에서 가장 뜨거운 행성입니다. 지구와 반대 방향으로 자전합니다.',
    facts: ['태양계에서 가장 뜨거운 행성 (462°C)', '역방향 자전 (동→서)', '자전 주기(243일)가 공전 주기보다 긺', '황산 구름으로 뒤덮여 햇빛을 강하게 반사'],
    satellites: null
  },
  {
    id: 'earth', name: '지구', nameEn: 'EARTH',
    type: '암석 행성', typeColor: '#4488FF',
    sma: 1.0, ecc: 0.017, period: 365.25, startAngle: 4.2,
    rotationPeriod: 1.0, // 지구 자전 주기: 1일 (공전하는 동안 정확히 365.25번 회전)
    sizeScale: 3.0,
    textureUrl: hasBase64 ? BASE64_TEXTURES.earth : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/earth.jpg',
    backupTextureUrl: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/earth.jpg',
    cloudsTextureUrl: hasBase64 ? BASE64_TEXTURES.earth_clouds : 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
    fallbackColor: '#2b82c9',
    stats: [
      { label: '태양까지 거리', value: '1.0 AU' },
      { label: '공전 주기', value: '365.25 일' },
      { label: '반지름', value: '6,371 km' },
      { label: '위성', value: '1개 (달)' },
      { label: '평균 온도', value: '15°C' },
      { label: '대기 주성분', value: 'N₂ 78%, O₂ 21%' },
    ],
    desc: '현재까지 알려진 유일한 생명체 서식 천체. 액체 상태의 물, 풍부한 산소 대기, 강력한 자기장이 우주 방사선을 차단해 생명을 유지해 줍니다.',
    facts: ['표면의 약 71%가 액체 상태의 물로 덮임', '지구 자전축(23.5도) 경사로 뚜렷한 사계절 발생', '달과의 조석력으로 자전 속도 조절 및 축 안정화', '대기권과 자기권이 생명체를 안전하게 보호'],
    satellites: {
      representative: [
        { name: '달', nameEn: 'Moon', img: 'assets/satellite_moon.png', desc: '지구의 유일한 자연위성으로, 인류가 직접 발을 디딘 최초이자 유일한 외계 천체입니다.' }
      ],
      others: []
    }
  },
  {
    id: 'mars', name: '화성', nameEn: 'MARS',
    type: '암석 행성', typeColor: '#DD4422',
    sma: 1.524, ecc: 0.093, period: 686.97, startAngle: 0.9,
    rotationPeriod: 1.026, // 화성 자전 주기: 1.026일 (지구 하루와 매우 유사)
    sizeScale: 2.2,
    textureUrl: hasBase64 ? BASE64_TEXTURES.mars : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/mars.jpg',
    backupTextureUrl: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/mars.jpg',
    fallbackColor: '#c1440e',
    stats: [
      { label: '태양까지 거리', value: '1.524 AU' },
      { label: '공전 주기', value: '687 일 (1.88년)' },
      { label: '반지름', value: '3,390 km' },
      { label: '위성', value: '2개 (포보스, 데이모스)' },
      { label: '평균 온도', value: '-63°C' },
      { label: '대기 주성분', value: 'CO₂ 95.3%' },
    ],
    desc: '붉은 행성. 표면의 산화철(녹슨 철) 성분 때문에 붉게 보입니다. 희박한 대기를 가지고 있으며, 과거 물이 흘렀던 생생한 흔적이 가득합니다.',
    facts: ['태양계 최대 화산인 올림푸스 몬스(높이 22km) 존재', '지구와 유사한 자전 주기(24시간 37분)', '양극 지방에 드라이아이스와 얼음으로 된 극관 존재', '인류의 최우선 화성 이주 및 우주 탐사 대상'],
    satellites: {
      representative: [
        { name: '포보스', nameEn: 'Phobos', img: 'assets/satellite_phobos.png', desc: '화성에 매우 가깝게 붙어 7.6시간마다 공전하는 감자 모양의 어두운 위성입니다.' },
        { name: '데이모스', nameEn: 'Deimos', img: 'assets/satellite_deimos.png', desc: '포보스보다 작고 더 멀리서 30.3시간마다 공전하며 미세 먼지로 뒤덮여 있습니다.' }
      ],
      others: []
    }
  },
  {
    id: 'jupiter', name: '목성', nameEn: 'JUPITER',
    type: '가스 거인', typeColor: '#FF8844',
    sma: 2.8, ecc: 0.049, period: 4332.6, startAngle: 2.1,
    rotationPeriod: 0.413, // 목성 자전 주기: 0.413일 (약 9시간 55분, 매우 빠름)
    sizeScale: 6.2,
    textureUrl: hasBase64 ? BASE64_TEXTURES.jupiter : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/jupiter.jpg',
    backupTextureUrl: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/jupiter.jpg',
    fallbackColor: '#b07f35',
    stats: [
      { label: '태양까지 거리', value: '5.203 AU' },
      { label: '공전 주기', value: '11.86 년' },
      { label: '반지름', value: '69,911 km' },
      { label: '위성', value: '95개 이상 (가니메데 등)' },
      { label: '구름 상단 온도', value: '-145°C' },
      { label: '자전 주기', value: '9시간 55분' },
    ],
    desc: '태양계 최대의 행성. 지구의 1,300배에 달하는 부피를 자랑하며, 다른 모든 행성들을 합친 것보다 무거운 압도적인 질량을 가집니다.',
    facts: ['거대한 폭풍 소용돌이인 대적점(Great Red Spot) 보유', '강력한 자기장으로 강력한 방사능 벨트 형성', '위성 가니메데는 수성보다 큼', '소행성 충돌로부터 내행성계를 보호하는 우주 방패 역할'],
    satellites: {
      representative: [
        { name: '이오', nameEn: 'Io', img: 'assets/satellite_io.png', desc: '강력한 조석력에 의한 지열로 태양계에서 가장 격렬하게 화산 활동이 일어나는 유황 위성입니다.' },
        { name: '유로파', nameEn: 'Europa', img: 'assets/satellite_europa.png', desc: '균열이 있는 매끄러운 얼음 껍질 아래에 생명체가 숨 쉴 수 있는 지하 바다가 존재합니다.' },
        { name: '가니메데', nameEn: 'Ganymede', img: 'assets/satellite_ganymede.png', desc: '수성과 화성보다 크며 태양계 위성 중 유일하게 독자적인 자기장을 보유하고 있습니다.' }
      ],
      others: ['칼리스토', '아말테아', '히말리아', '엘라라', '파시파에', '시노페', '리시테아', '카르메', '아난케', '레다', '테베', '아드라스테아', '메티스']
    }
  },
  {
    id: 'saturn', name: '토성', nameEn: 'SATURN',
    type: '가스 거인', typeColor: '#D4AA60',
    sma: 3.8, ecc: 0.057, period: 10759.2, startAngle: 3.5,
    rotationPeriod: 0.444, // 토성 자전 주기: 0.444일 (약 10시간 39분)
    sizeScale: 5.2,
    textureUrl: hasBase64 ? BASE64_TEXTURES.saturn : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/saturn.jpg',
    backupTextureUrl: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/saturn.jpg',
    ringTextureUrl: hasBase64 ? BASE64_TEXTURES.saturn_ring : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/saturn_ring.png',
    fallbackColor: '#e2bf7d',
    hasRings: true,
    stats: [
      { label: '태양까지 거리', value: '9.537 AU' },
      { label: '공전 주기', value: '29.46 년' },
      { label: '반지름', value: '58,232 km' },
      { label: '위성', value: '146개 이상 (타이탄 등)' },
      { label: '구름 상단 온도', value: '-178°C' },
      { label: '밀도', value: '0.687 g/cm³ (물보다 낮음)' },
    ],
    desc: '태양계에서 가장 화려하고 아름다운 고리를 가진 행성입니다. 밀도가 매우 낮아 커다란 물이 있다면 둥둥 뜰 수 있습니다.',
    facts: ['고리는 주로 물 얼음과 소량의 암석 파편으로 구성', '위성 타이탄은 대기와 액체 메탄 호수를 지닌 유일한 위성', '가장 많은 공식 위성을 거느린 위성 왕국', '고리의 두께는 평균 10미터 정도로 극도로 얇음'],
    satellites: {
      representative: [
        { name: '타이탄', nameEn: 'Titan', img: 'assets/satellite_titan.png', desc: '오렌지빛 짙은 질소 대기가 있어 액체 메탄 강과 호수가 흐르는 기이한 거대 위성입니다.' },
        { name: '엔셀라두스', nameEn: 'Enceladus', img: 'assets/satellite_enceladus.png', desc: '얼음 지각 밑 지하 바다에서 물과 가스가 거대한 지저분수처럼 우주로 뿜어져 나옵니다.' }
      ],
      others: ['미마스', '레아', '테티스', '디오네', '하이페리온', '이아페투스', '포에베', '야누스', '에피메테우스', '판도라', '프로메테우스', '헬레네', '텔레스토', '칼립소']
    }
  },
  {
    id: 'uranus', name: '천왕성', nameEn: 'URANUS',
    type: '얼음 거인', typeColor: '#80D8D8',
    sma: 4.8, ecc: 0.046, period: 30589, startAngle: 5.1,
    rotationPeriod: -0.718, // 천왕성 자전 주기: 0.718일 (음수 = 누운 축 역자전)
    sizeScale: 4.0,
    textureUrl: hasBase64 ? BASE64_TEXTURES.uranus : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/uranus.jpg',
    backupTextureUrl: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/uranus.jpg',
    fallbackColor: '#a0e6e6',
    hasRings: true,
    ringThin: true,
    stats: [
      { label: '태양까지 거리', value: '19.191 AU' },
      { label: '공전 주기', value: '84.01 년' },
      { label: '반지름', value: '25,362 km' },
      { label: '위성', value: '28개' },
      { label: '최저 온도', value: '-224°C' },
      { label: '자전축 기울기', value: '97.77°' },
    ],
    desc: '자전축이 약 98도 누워 있어, 거의 옆으로 누운 채 굴러가는 형태로 태양을 공전합니다. 메탄 성분 대기로 청록색을 띱니다.',
    facts: ['태양계에서 가장 추운 행성 중 하나 (-224°C)', '수직에 가까운 형태로 서 있는 세로형 고리 보유', '태양빛이 극지방에만 비추는 독특한 계절 주기', '자전축이 기이하게 누워 있는 이유는 거대 충돌로 추정'],
    satellites: {
      representative: [
        { name: '티타니아', nameEn: 'Titania', img: 'assets/satellite_europa.png', desc: '천왕성 위성 중 가장 크며 표면에 거대한 절벽과 충돌 계곡들이 발달해 있습니다.' }
      ],
      others: ['오베론', '아리엘', '엄브리엘', '미란다', '퍽', '시코락스', '포르티아', '크레시다', '데스데모나', '줄리엣', '벨린다']
    }
  },
  {
    id: 'neptune', name: '해왕성', nameEn: 'NEPTUNE',
    type: '얼음 거인', typeColor: '#4060E8',
    sma: 5.8, ecc: 0.010, period: 60182, startAngle: 1.3,
    rotationPeriod: 0.671, // 해왕성 자전 주기: 0.671일 (약 16시간 6분)
    sizeScale: 3.9,
    textureUrl: hasBase64 ? BASE64_TEXTURES.neptune : 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/neptune.jpg',
    backupTextureUrl: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/neptune.jpg',
    fallbackColor: '#274687',
    stats: [
      { label: '태양까지 거리', value: '30.069 AU' },
      { label: '공전 주기', value: '164.8 년' },
      { label: '반지름', value: '24,622 km' },
      { label: '위성', value: '16개 (트리톤 등)' },
      { label: '평균 온도', value: '-214°C' },
      { label: '최대 풍속', value: '2,100 km/h' },
    ],
    desc: '태양계 최외곽의 푸른 행성. 메탄 대기와 알려지지 않은 유기물로 짙은 대양빛 파란색을 띱니다. 초속 600m에 달하는 태풍이 붑니다.',
    facts: ['태양계 행성 중 가장 빠르고 거센 바람이 부는 대기 형성', '망원경 관측이 아닌 수학적 궤도 계산으로 위치를 먼저 예측해 발견', '위성 트리톤은 홀로 반대 방향으로 공전하는 역행 위성', '태양와의 거리가 너무 멀어 도달하는 햇빛이 지구의 1/900 수준'],
    satellites: {
      representative: [
        { name: '트리톤', nameEn: 'Triton', img: 'assets/satellite_triton.png', desc: '자전축과 반대로 공전하는 역행 위성이며 질소 얼음을 뿜어내는 활화산 분출구가 존재합니다.' }
      ],
      others: ['PROTEUS', '네레이드', '라리사', '갈라테아', '데스피나', '탈라사', '나이아드', '할리메데', '사오', '프사마테', '네소']
    }
  }
];

/* ═══════════════════════════════════════════════════════
   3D WEBGL ENGINE SETUP
═══════════════════════════════════════════════════════ */
const container = document.getElementById('webgl-container');
const fxCanvas = document.getElementById('fx-canvas');
const fxCtx = fxCanvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;
fxCanvas.width = W;
fxCanvas.height = H;

const scene = new THREE.Scene();
scene.background = createProceduralSpaceBackground();
scene.fog = new THREE.FogExp2(0x000005, 0.0002);

const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 10000);
camera.position.set(0, 180, 260);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 2500;
controls.minDistance = 6;
controls.target.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0x0e1428, 0.95);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xfff5e0, 2.8, 2000, 0.5);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const textureLoader = new THREE.TextureLoader();

/**
 * 360도 Equirectangular 우주 배경 텍스처를 캔버스에 절차적(Procedural)으로 그려 생성합니다.
 * @returns {THREE.CanvasTexture}
 */
function createProceduralSpaceBackground() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 1. 기본 깊은 우주 암흑 배경
  ctx.fillStyle = '#020208';
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. 부드러운 성운(Nebula) 효과 드로잉
  const numNebulae = 6;
  const colors = [
    'rgba(75, 0, 130, 0.15)',   // 인디고
    'rgba(25, 25, 112, 0.18)',  // 미드나잇 블루
    'rgba(139, 0, 139, 0.12)',  // 다크 마젠타
    'rgba(0, 0, 128, 0.15)',    // 네이비
    'rgba(72, 61, 139, 0.14)'   // 다크 슬레이트 블루
  ];

  for (let i = 0; i < numNebulae; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 250 + Math.random() * 350;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const baseColor = colors[Math.floor(Math.random() * colors.length)];
    grad.addColorStop(0, baseColor);
    grad.addColorStop(0.5, baseColor.replace(/[\d\.]+\)$/, '0.06)'));
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. 은하수(Milky Way) 대각선 별무리 띠 형성
  const numMilkyWayStars = 1500;
  for (let i = 0; i < numMilkyWayStars; i++) {
    const t = Math.random();
    const x = t * canvas.width;
    const center = t * canvas.height;
    const offset = (Math.random() - 0.5) * (Math.random() - 0.5) * 450; 
    const y = (center + offset + canvas.height) % canvas.height;

    const r = 0.5 + Math.random() * 1.5;
    const alpha = 0.2 + Math.random() * 0.8;
    const hue = Math.random() < 0.25 ? 200 + Math.random() * 40 : (Math.random() < 0.1 ? 40 + Math.random() * 20 : 0);

    if (hue > 0) {
      ctx.fillStyle = `hsla(${hue}, 80%, 80%, ${alpha})`;
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. 일반 배경의 촘촘한 미세 별빛들
  const numBgStars = 2000;
  for (let i = 0; i < numBgStars; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 0.3 + Math.random() * 0.8;
    const alpha = 0.15 + Math.random() * 0.65;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/**
 * CORS 에러나 데이터가 유효하지 않을 때, 캔버스를 통해 고품질의 절차적 텍스처를 그립니다.
 * @param {string} id
 * @param {string} baseColor
 * @returns {THREE.CanvasTexture}
 */
function createProceduralFallbackTexture(id, baseColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  if (id === 'sun') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#ff3c00');
    grad.addColorStop(0.5, '#ff8a00');
    grad.addColorStop(1, '#ffcc00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = 1 + Math.random() * 4;
      ctx.fillStyle = Math.random() < 0.25 ? 'rgba(74, 10, 0, 0.65)' : 'rgba(255, 235, 120, 0.15)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'jupiter') {
    ctx.fillStyle = '#b07f35';
    ctx.fillRect(0, 0, 512, 256);
    
    for (let i = 0; i < 256; i += 6) {
      ctx.fillStyle = `rgba(139, 90, 43, ${0.15 + Math.random() * 0.5})`;
      ctx.fillRect(0, i, 512, 3 + Math.random() * 6);
    }
    
    ctx.fillStyle = '#c1440e';
    ctx.beginPath();
    ctx.ellipse(340, 170, 32, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, baseColor);
    grad.addColorStop(0.85, baseColor);
    grad.addColorStop(1, '#050505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, Math.random() * 256, 512, 5 + Math.random() * 15);
    }
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * @returns {THREE.CanvasTexture}
 */
function createFallbackRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, 'rgba(212, 170, 96, 0)');
  grad.addColorStop(0.25, 'rgba(212, 170, 96, 0.85)');
  grad.addColorStop(0.5, 'rgba(180, 140, 70, 0.9)');
  grad.addColorStop(0.75, 'rgba(212, 170, 96, 0.5)');
  grad.addColorStop(1, 'rgba(212, 170, 96, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 16);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/* ═══════════════════════════════════════════════════════
   QUEUE-BASED ROBUST LOAD SYSTEM
═══════════════════════════════════════════════════════ */
const textures = {};
const ringTextures = {};
let loadedResources = 0;
let totalResources = 0;

const loadQueue = [];

loadQueue.push({ id: 'sun', url: SUN_DATA.textureUrl, backup: SUN_DATA.backupTextureUrl, fallback: SUN_DATA.fallbackColor });

PLANET_DATA.forEach(p => {
  loadQueue.push({ id: p.id, url: p.textureUrl, backup: p.backupTextureUrl, fallback: p.fallbackColor });
  if (p.id === 'earth' && p.cloudsTextureUrl) {
    loadQueue.push({ id: 'earth_clouds', url: p.cloudsTextureUrl, backup: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png', fallback: 'rgba(255,255,255,0.4)' });
    loadQueue.push({ id: 'moon', url: hasBase64 ? BASE64_TEXTURES.moon : 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg', backup: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg', fallback: '#aaaaaa' });
  }
});

const saturnRingData = PLANET_DATA.find(p => p.id === 'saturn');
loadQueue.push({ id: 'saturn_ring', url: saturnRingData.ringTextureUrl, backup: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/saturn_ring.png', fallback: 'ring' });

totalResources = loadQueue.length;

function resourceLoaded() {
  loadedResources++;
  const pct = Math.min(100, Math.floor((loadedResources / totalResources) * 100));
  document.getElementById('loading-text').textContent = `우주 지도 및 행성 텍스처 로딩 중... (${pct}%)`;
  
  if (loadedResources >= totalResources) {
    setTimeout(() => {
      document.getElementById('loading-overlay').style.opacity = 0;
      setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('intro').style.display = 'flex';
      }, 500);
    }, 400);
    
    initSolarSystem();
  }
}

function loadPlanetTextureRobust(key, url, backupUrl, fallbackColor) {
  if (url && url.startsWith('data:')) {
    const img = new Image();
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      textures[key] = tex;
      resourceLoaded();
    };
    img.onerror = () => {
      console.warn(`[1순위 실패] Base64 ${key} 로딩 실패. 백업 로딩 시도...`);
      loadBackupTexture(key, backupUrl, fallbackColor);
    };
    img.src = url;
  } else {
    loadPrimaryTexture(key, url, backupUrl, fallbackColor);
  }
}

function loadPrimaryTexture(key, url, backupUrl, fallbackColor) {
  textureLoader.load(
    url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      textures[key] = tex;
      resourceLoaded();
    },
    undefined,
    () => {
      loadBackupTexture(key, backupUrl, fallbackColor);
    }
  );
}

function loadBackupTexture(key, backupUrl, fallbackColor) {
  textureLoader.load(
    backupUrl,
    (tex2) => {
      tex2.colorSpace = THREE.SRGBColorSpace;
      textures[key] = tex2;
      resourceLoaded();
    },
    undefined,
    () => {
      console.warn(`[2순위 실패] ${key} 백업도 실패. 고품질 절차적 텍스처 생성...`);
      textures[key] = createProceduralFallbackTexture(key, fallbackColor);
      resourceLoaded();
    }
  );
}

loadQueue.forEach(item => {
  if (item.id === 'saturn_ring') {
    if (item.url && item.url.startsWith('data:')) {
      const img = new Image();
      img.onload = () => {
        const tex = new THREE.Texture(img);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        ringTextures['saturn'] = tex;
        resourceLoaded();
      };
      img.onerror = () => {
        console.warn(`[1순위 실패] Base64 saturn_ring 로딩 실패. 백업 로딩 시도...`);
        loadBackupRingTexture(item.backup);
      };
      img.src = item.url;
    } else {
      loadPrimaryRingTexture(item.url, item.backup);
    }
  } else {
    loadPlanetTextureRobust(item.id, item.url, item.backup, item.fallback);
  }
});

function loadPrimaryRingTexture(url, backupUrl) {
  textureLoader.load(
    url,
    (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      ringTextures['saturn'] = tex;
      resourceLoaded();
    },
    undefined,
    () => {
      loadBackupRingTexture(backupUrl);
    }
  );
}

function loadBackupRingTexture(backupUrl) {
  textureLoader.load(
    backupUrl,
    (tex2) => {
      tex2.wrapS = THREE.RepeatWrapping;
      tex2.wrapT = THREE.ClampToEdgeWrapping;
      ringTextures['saturn'] = tex2;
      resourceLoaded();
    },
    undefined,
    () => {
      ringTextures['saturn'] = createFallbackRingTexture();
      resourceLoaded();
    }
  );
}

/* ═══════════════════════════════════════════════════════
   3D OBJECT INITIALIZATION
═══════════════════════════════════════════════════════ */
const planetMeshes = [];
let sunMesh;
const orbitLines = [];
let spaceObjects = []; 

let earthCloudsMesh = null;
let moonMesh = null;

const ORBIT_BASE_SCALE = 85;
const EARTH_PERIOD_S = 300; // 지구 1년 300초 공전 기준
const DAY_IN_SECONDS = EARTH_PERIOD_S / 365.25;

function getRotationAngle(rotationPeriod, t) {
  if (!rotationPeriod || rotationPeriod === 0) return 0;
  const rotationSpeed = (2 * Math.PI) / (rotationPeriod * DAY_IN_SECONDS);
  return rotationSpeed * t;
}

function initSolarSystem() {
  // 1. 태양 (Sun)
  const sunGeo = new THREE.SphereGeometry(SUN_DATA.sizeScale, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({
    map: textures['sun']
  });
  sunMesh = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sunMesh);
  
  SUN_DATA.mesh = sunMesh;
  SUN_DATA.radius = SUN_DATA.sizeScale;
  spaceObjects.push(SUN_DATA);

  // 태양 코로나 효과
  const coronaGeo = new THREE.SphereGeometry(SUN_DATA.sizeScale * 1.3, 32, 32);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xff7c1a,
    transparent: true,
    opacity: 0.18,
    side: THREE.BackSide
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat);
  sunMesh.add(corona);

  const coronaOuterGeo = new THREE.SphereGeometry(SUN_DATA.sizeScale * 1.6, 32, 32);
  const coronaOuterMat = new THREE.MeshBasicMaterial({
    color: 0xff9900,
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide
  });
  const coronaOuter = new THREE.Mesh(coronaOuterGeo, coronaOuterMat);
  sunMesh.add(coronaOuter);

  // 2. 8대 행성 및 공전 궤도선
  PLANET_DATA.forEach((p) => {
    const sma3D = Math.pow(p.sma, 0.75) * ORBIT_BASE_SCALE + 28;
    p.sma3D = sma3D;
    p.ecc3D = p.ecc;

    // 타원 궤도선 생성
    const orbitPoints = [];
    const segments = 120;
    
    for (let i = 0; i <= segments; i++) {
      const nu = (i / segments) * Math.PI * 2;
      const r = sma3D * (1 - p.ecc3D * p.ecc3D) / (1 + p.ecc3D * Math.cos(nu));
      const x = r * Math.cos(nu);
      const z = r * Math.sin(nu);
      orbitPoints.push(new THREE.Vector3(x, 0, z));
    }
    
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x587eff,
      transparent: true,
      opacity: 0.22
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);
    orbitLines.push(orbitLine);

    // 행성 본체
    const planetGeo = new THREE.SphereGeometry(p.sizeScale, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({
      map: textures[p.id],
      roughness: 0.85,
      metalness: 0.05
    });
    
    if (p.id === 'earth') {
      planetMat.roughness = 0.35;
      planetMat.metalness = 0.15;
    }

    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    
    // 지구 대기 구름 레이어 추가
    if (p.id === 'earth') {
      const cloudsGeo = new THREE.SphereGeometry(p.sizeScale * 1.018, 32, 32);
      const cloudsMat = new THREE.MeshStandardMaterial({
        map: textures['earth_clouds'],
        transparent: true,
        opacity: 0.75,
        blending: THREE.NormalBlending
      });
      earthCloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
      planetMesh.add(earthCloudsMesh);

      // 지구의 위성 달 추가
      const moonGeo = new THREE.SphereGeometry(p.sizeScale * 0.25, 32, 32);
      const moonMat = new THREE.MeshStandardMaterial({
        map: textures['moon'],
        roughness: 0.9,
        metalness: 0.05
      });
      moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.position.set(p.sizeScale * 2.2, 0, 0);
      planetMesh.add(moonMesh);

      // 달의 미니 공전 궤도선 추가
      const moonOrbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        moonOrbitPoints.push(new THREE.Vector3(Math.cos(angle) * p.sizeScale * 2.2, 0, Math.sin(angle) * p.sizeScale * 2.2));
      }
      const moonOrbitGeo = new THREE.BufferGeometry().setFromPoints(moonOrbitPoints);
      const moonOrbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });
      const moonOrbitLine = new THREE.Line(moonOrbitGeo, moonOrbitMat);
      planetMesh.add(moonOrbitLine);
    }
    
    // 자전축 각도 설정
    if (p.id === 'uranus') {
      planetMesh.rotation.z = THREE.MathUtils.degToRad(97.77); 
    } else if (p.id === 'earth') {
      planetMesh.rotation.z = THREE.MathUtils.degToRad(23.5);
    } else if (p.id === 'mars') {
      planetMesh.rotation.z = THREE.MathUtils.degToRad(25.2);
    } else if (p.id === 'jupiter') {
      planetMesh.rotation.z = THREE.MathUtils.degToRad(3.13);
    } else if (p.id === 'saturn') {
      planetMesh.rotation.z = THREE.MathUtils.degToRad(26.73);
    }

    // 토성 고리
    if (p.hasRings) {
      if (p.id === 'saturn') {
        const innerRadius = p.sizeScale * 1.3;
        const outerRadius = p.sizeScale * 2.5;
        const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        
        // UV 좌표를 극좌표(Polar Coordinates)로 매핑하여 고리 텍스처가 동심원을 그리도록 보정
        const pos = ringGeo.attributes.position;
        const uv = ringGeo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const r = Math.sqrt(x * x + y * y);
          let angle = Math.atan2(y, x);
          if (angle < 0) angle += Math.PI * 2;
          
          const u = angle / (Math.PI * 2);
          const v = (r - innerRadius) / (outerRadius - innerRadius);
          uv.setXY(i, u, v);
        }
        uv.needsUpdate = true;
        
        ringGeo.rotateX(Math.PI / 2);
        
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTextures['saturn'],
          transparent: true,
          side: THREE.DoubleSide,
          opacity: 0.95
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        planetMesh.add(ringMesh);
      } else if (p.ringThin) {
        for (let i = 0; i < 3; i++) {
          const r = p.sizeScale * (1.25 + i * 0.2);
          const rRingGeo = new THREE.RingGeometry(r, r + 0.04, 64);
          rRingGeo.rotateX(Math.PI / 2.1);
          const rRingMat = new THREE.MeshBasicMaterial({
            color: 0xa5ffff,
            transparent: true,
            opacity: 0.3 - i * 0.08,
            side: THREE.DoubleSide
          });
          const rRingMesh = new THREE.Mesh(rRingGeo, rRingMat);
          planetMesh.add(rRingMesh);
        }
      }
    }

    scene.add(planetMesh);
    p.mesh = planetMesh;
    p.radius = p.sizeScale;
    planetMeshes.push(planetMesh);
    spaceObjects.push(p);
  });

  initParticleClouds();
}

/* ═══════════════════════════════════════════════════════
   3D 입자 물리 시스템 (Points)
═══════════════════════════════════════════════════════ */
let asteroidCloud, kuiperCloud, oortCloud;

function initParticleClouds() {
  // A. 소행성대 (Asteroid Belt)
  const astGeo = new THREE.BufferGeometry();
  const astCount = 3000;
  const astPos = new Float32Array(astCount * 3);
  const astColor = new Float32Array(astCount * 3);

  for (let i = 0; i < astCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 160 + Math.random() * 35; // 화성과 목성 사이로 보정 완료
    const y = (Math.random() - 0.5) * 5.0;

    const idx = i * 3;
    astPos[idx] = Math.cos(theta) * r;
    astPos[idx + 1] = y;
    astPos[idx + 2] = Math.sin(theta) * r;

    const colorMix = 0.5 + Math.random() * 0.4;
    astColor[idx] = colorMix * 0.85;     
    astColor[idx + 1] = colorMix * 0.8; 
    astColor[idx + 2] = colorMix * 0.75; 
  }
  astGeo.setAttribute('position', new THREE.BufferAttribute(astPos, 3));
  astGeo.setAttribute('color', new THREE.BufferAttribute(astColor, 3));
  const astMat = new THREE.PointsMaterial({
    size: 0.7,
    vertexColors: true,
    transparent: true,
    opacity: 0.7
  });
  asteroidCloud = new THREE.Points(astGeo, astMat);
  scene.add(asteroidCloud);

  // B. 카이퍼 벨트 (Kuiper Belt)
  const kpGeo = new THREE.BufferGeometry();
  const kpCount = 4200;
  const kpPos = new Float32Array(kpCount * 3);
  
  for (let i = 0; i < kpCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 480 + Math.random() * 140;
    const y = (Math.random() - 0.5) * 18;

    const idx = i * 3;
    kpPos[idx] = Math.cos(theta) * r;
    kpPos[idx + 1] = y;
    kpPos[idx + 2] = Math.sin(theta) * r;
  }
  kpGeo.setAttribute('position', new THREE.BufferAttribute(kpPos, 3));
  const kpMat = new THREE.PointsMaterial({
    size: 1.0,
    color: 0x8cb0ff,
    transparent: true,
    opacity: 0.5
  });
  kuiperCloud = new THREE.Points(kpGeo, kpMat);
  scene.add(kuiperCloud);

  // C. 오르트 구름 (Oort Cloud)
  const oortGeo = new THREE.BufferGeometry();
  const oortCount = 4500;
  const oortPos = new Float32Array(oortCount * 3);

  for (let i = 0; i < oortCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 1150 + Math.random() * 650;

    const sinPhi = Math.sin(phi);
    const idx = i * 3;
    oortPos[idx] = r * sinPhi * Math.cos(theta);
    oortPos[idx + 1] = r * Math.cos(phi);
    oortPos[idx + 2] = r * sinPhi * Math.sin(theta);
  }
  oortGeo.setAttribute('position', new THREE.BufferAttribute(oortPos, 3));
  const oortMat = new THREE.PointsMaterial({
    size: 0.8,
    color: 0x76aaff,
    transparent: true,
    opacity: 0.18
  });
  oortCloud = new THREE.Points(oortGeo, oortMat);
  scene.add(oortCloud);
}

/* ═══════════════════════════════════════════════════════
   ORBITAL ANIMATION MECHANICS
═══════════════════════════════════════════════════════ */
let simTime = 0;
let timeScale = 1.0;

// Web Audio API 오디오 합성 변수
let audioCtx = null;
let masterGain = null;
let isSoundMuted = false;
const bgmNodes = [];
let padTimeoutId = null;

function getPlanetPos3D(p, t) {
  const n = (2 * Math.PI) / ((p.period / 365.25) * EARTH_PERIOD_S);
  const M = n * t + (p.startAngle || 0);
  
  let E = M;
  for (let i = 0; i < 5; i++) {
    E = M + p.ecc3D * Math.sin(E);
  }
  
  const nu = 2 * Math.atan2(Math.sqrt(1 + p.ecc3D) * Math.sin(E / 2), Math.sqrt(1 - p.ecc3D) * Math.cos(E / 2));
  const r = p.sma3D * (1 - p.ecc3D * p.ecc3D) / (1 + p.ecc3D * Math.cos(nu));
  
  return new THREE.Vector3(r * Math.cos(nu), 0, r * Math.sin(nu));
}

/* ═══════════════════════════════════════════════════════
   3D RAYCASTING & INTERACTION
═══════════════════════════════════════════════════════ */
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();
let hoveredObject = null;
let selectedObject = null;

let isFocusing = false;
let lastPlanetPos = null; 

const pointerStart = { x: 0, y: 0 };
let pointerTime = 0;

window.addEventListener('mousemove', (e) => {
  mouseVec.x = (e.clientX / W) * 2 - 1;
  mouseVec.y = -(e.clientY / H) * 2 + 1;
  
  raycaster.setFromCamera(mouseVec, camera);
  const intersects = [];
  
  spaceObjects.forEach(obj => {
    if (obj.mesh) {
      const meshIntersects = raycaster.intersectObject(obj.mesh);
      if (meshIntersects.length > 0) {
        intersects.push({ distance: meshIntersects[0].distance, object: obj });
      }
    }
  });

  if (intersects.length > 0) {
    intersects.sort((a, b) => a.distance - b.distance);
    const matched = intersects[0].object;
    
    if (hoveredObject !== matched) {
      hoveredObject = matched;
      document.body.style.cursor = 'pointer';
      showTooltip(matched.name, e.clientX, e.clientY);
    } else {
      updateTooltipPos(e.clientX, e.clientY);
    }
  } else {
    if (hoveredObject) {
      hoveredObject = null;
      document.body.style.cursor = 'default';
      hideTooltip();
    }
  }
});

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerStart.x = e.clientX;
  pointerStart.y = e.clientY;
  pointerTime = performance.now();
});

renderer.domElement.addEventListener('pointerup', (e) => {
  const dist = Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y);
  const elapsed = performance.now() - pointerTime;
  
  if (dist < 4 && elapsed < 300 && (e.button === 0 || e.pointerType === 'touch')) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseVec, camera);
    const intersects = [];

    spaceObjects.forEach(obj => {
      if (obj.mesh) {
        const meshIntersects = raycaster.intersectObject(obj.mesh);
        if (meshIntersects.length > 0) {
          intersects.push({ distance: meshIntersects[0].distance, object: obj });
        }
      }
    });

    if (intersects.length > 0) {
      intersects.sort((a, b) => a.distance - b.distance);
      focusOnObject(intersects[0].object);
      playClickSFX();
    } else {
      resetFocus();
      playClickSFX();
    }
  }
});

function focusOnObject(obj) {
  selectedObject = obj;
  isFocusing = true;
  lastPlanetPos = obj.mesh.position.clone();
  openPanel(obj);
  renderSatellitesPanel(obj);
  
  const viewDist = obj.sizeScale * 3.8 + 12;
  const currentWorldPos = obj.mesh.position.clone();
  
  const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
  const targetCamPos = currentWorldPos.clone().add(direction.multiplyScalar(viewDist));
  
  camera.position.copy(targetCamPos);
  controls.target.copy(currentWorldPos);
  controls.enablePan = false; 
}

function resetFocus() {
  if (isFocusing) {
    isFocusing = false;
    selectedObject = null;
    lastPlanetPos = null;
    controls.enablePan = true;
    closePanel();
    
    controls.target.set(0, 0, 0);
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') {
    resetFocus();
    camera.position.set(0, 240, 360);
    controls.target.set(0, 0, 0);
  }
  if (e.key === 'Escape') resetFocus();
});

/* ═══════════════════════════════════════════════════════
   TOOLTIP & HUD MANAGEMENT
═══════════════════════════════════════════════════════ */
const tooltip = document.getElementById('tooltip');

function showTooltip(text, x, y) {
  tooltip.textContent = text;
  updateTooltipPos(x, y);
  tooltip.classList.add('show');
}
function updateTooltipPos(x, y) {
  tooltip.style.left = (x + 14) + 'px';
  tooltip.style.top = (y - 30) + 'px';
}
function hideTooltip() {
  tooltip.classList.remove('show');
}

const hudRegion = document.getElementById('hud-region');
const hudName = document.getElementById('hud-name');
const hudDist = document.getElementById('hud-dist');
const scaleLabel = document.getElementById('scale-label');
const zoomThumb = document.getElementById('zoom-thumb');

const REGIONS = [
  { minHeight: 0,    maxHeight: 120,  ko: '내태양계',    en: 'INNER SOLAR SYSTEM', color: '#FFE0A0' },
  { minHeight: 120,  maxHeight: 350,  ko: '외태양계',    en: 'OUTER SOLAR SYSTEM', color: '#C0D8FF' },
  { minHeight: 350,  maxHeight: 700,  ko: '카이퍼 대',   en: 'KUIPER BELT',        color: '#A0C0FF' },
  { minHeight: 700,  maxHeight: 1800, ko: '오르트 구름',  en: 'OORT CLOUD',         color: '#8AABFF' },
  { minHeight: 1800, maxHeight: Infinity, ko: '심우주 관측', en: 'DEEP SPACE',          color: '#5580ff' },
];

function updateHUD() {
  const dist = camera.position.distanceTo(controls.target);
  
  const reg = REGIONS.find(r => dist >= r.minHeight && dist < r.maxHeight) || REGIONS[REGIONS.length - 1];
  hudRegion.textContent = reg.ko;
  hudName.textContent = reg.en;
  hudName.style.color = reg.color;

  const virtualAU = dist / 11;
  let distText;
  if (virtualAU > 150) {
    distText = `태양계 중심과의 관측 거리: ${(virtualAU * 12).toLocaleString('ko-KR', { maximumFractionDigits: 0 })} AU`;
  } else if (virtualAU > 0.5) {
    distText = `태양계 중심과의 관측 거리: ${(virtualAU).toFixed(2)} AU`;
  } else {
    distText = `태양계 중심과의 관측 거리: ${(virtualAU * 149597870).toLocaleString('ko-KR', { maximumFractionDigits: 0 })} km`;
  }
  hudDist.textContent = distText;

  const scaleAU = (dist * 0.15) / 10;
  let scaleText;
  if (scaleAU >= 1000) scaleText = `${(scaleAU / 1000).toFixed(0)}k AU`;
  else if (scaleAU >= 1) scaleText = `${scaleAU.toFixed(2)} AU`;
  else scaleText = `${(scaleAU * 149.6).toFixed(1)} 백만 km`;
  scaleLabel.textContent = scaleText;

  const logMin = Math.log10(controls.minDistance);
  const logMax = Math.log10(controls.maxDistance);
  const logCur = Math.log10(Math.max(controls.minDistance, Math.min(controls.maxDistance, dist)));
  const pct = (logCur - logMin) / (logMax - logMin);
  zoomThumb.style.top = `${(1 - pct) * 128}px`;
}

/* ═══════════════════════════════════════════════════════
   FX CANVAS (유성우 렌더러)
═══════════════════════════════════════════════════════ */
let shootingStars = [];

function maybeSpawnShootingStar() {
  if (Math.random() < 0.002 && shootingStars.length < 3) {
    const startX = Math.random() * W;
    const startY = Math.random() * H * 0.4;
    shootingStars.push({
      x: startX, y: startY,
      vx: 3 + Math.random() * 6, vy: 1.5 + Math.random() * 3,
      len: 80 + Math.random() * 120, life: 1
    });
  }
}

function drawShootingStars(dt) {
  fxCtx.clearRect(0, 0, W, H);
  shootingStars = shootingStars.filter(s => s.life > 0);
  
  for (const s of shootingStars) {
    s.x += s.vx * dt * 60;
    s.y += s.vy * dt * 60;
    s.life -= dt * 1.35;
    const a = Math.max(0, s.life);

    const grad = fxCtx.createLinearGradient(s.x, s.y, s.x - s.vx * s.len * 0.1, s.y - s.vy * s.len * 0.1);
    grad.addColorStop(0, `rgba(200,225,255,${a})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    
    fxCtx.beginPath();
    fxCtx.moveTo(s.x, s.y);
    fxCtx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
    fxCtx.strokeStyle = grad;
    fxCtx.lineWidth = 1.6;
    fxCtx.stroke();
  }
}

/* ═══════════════════════════════════════════════════════
   INFO PANEL & MINI 3D GLOBE RENDERER
═══════════════════════════════════════════════════════ */
const panel = document.getElementById('info-panel');
const globeContainer = document.getElementById('panel-globe-container');

let miniScene, miniCamera, miniRenderer, miniMesh, miniRingMesh;

function initMiniGlobeRenderer() {
  miniScene = new THREE.Scene();
  
  miniCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  miniCamera.position.set(0, 0, 5.2);
  
  miniRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  miniRenderer.setSize(64, 64);
  miniRenderer.setPixelRatio(2);
  globeContainer.appendChild(miniRenderer.domElement);
  
  const mLight1 = new THREE.DirectionalLight(0xffffff, 1.25);
  mLight1.position.set(5, 3, 5);
  miniScene.add(mLight1);

  const mLight2 = new THREE.AmbientLight(0x203050, 0.9);
  miniScene.add(mLight2);
}

function openPanel(obj) {
  if (miniMesh) miniScene.remove(miniMesh);
  if (miniRingMesh) miniScene.remove(miniRingMesh);
  
  if (!miniRenderer) initMiniGlobeRenderer();

  const miniGeo = new THREE.SphereGeometry(1.65, 32, 32);
  const miniMat = new THREE.MeshStandardMaterial({
    map: textures[obj.id],
    roughness: 0.6,
    metalness: 0.1
  });
  
  if (obj.id === 'sun') {
    miniMat.color = new THREE.Color(0xffffff);
    miniMat.emissive = new THREE.Color(0xff8a00);
    miniMat.emissiveIntensity = 0.8;
  }
  
  miniMesh = new THREE.Mesh(miniGeo, miniMat);
  miniScene.add(miniMesh);

  if (obj.hasRings && obj.id === 'saturn') {
    const innerRadius = 2.1;
    const outerRadius = 3.6;
    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    
    // 미니 글로브용 고리 UV 좌표 극좌표 변환
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      let angle = Math.atan2(y, x);
      if (angle < 0) angle += Math.PI * 2;
      
      const u = angle / (Math.PI * 2);
      const v = (r - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, u, v);
    }
    uv.needsUpdate = true;

    ringGeo.rotateX(Math.PI / 2.3); 
    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTextures['saturn'],
      transparent: true,
      side: THREE.DoubleSide,
      opacity: 0.9
    });
    miniRingMesh = new THREE.Mesh(ringGeo, ringMat);
    miniScene.add(miniRingMesh);
  }

  document.getElementById('panel-name-ko').textContent = obj.name;
  document.getElementById('panel-name-en').textContent = obj.nameEn;
  
  const typeEl = document.getElementById('panel-type');
  typeEl.textContent = obj.type;
  typeEl.style.cssText = `background:rgba(${hexToRgb(obj.typeColor)},0.15);border:1px solid rgba(${hexToRgb(obj.typeColor)},0.4);color:${obj.typeColor}`;

  const statsEl = document.getElementById('panel-stats');
  statsEl.innerHTML = obj.stats.map(s =>
    `<div class="stat-box"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div>`
  ).join('');

  document.getElementById('panel-desc').textContent = obj.desc;
  document.getElementById('panel-facts').innerHTML = obj.facts.map(f =>
    `<div class="fact-row"><div class="fact-dot"></div><span>${f}</span></div>`
  ).join('');

  panel.classList.add('open');
}

function closePanel() {
  panel.classList.remove('open');
  document.getElementById('satellites-panel').classList.remove('open');
  resetFocus(); 
}

function renderSatellitesPanel(obj) {
  const satPanel = document.getElementById('satellites-panel');
  const satList = document.getElementById('satellites-list');
  const otherSats = document.getElementById('other-sats-section');

  if (!obj || !obj.satellites) {
    satPanel.classList.remove('open');
    return;
  }

  const data = obj.satellites;
  
  if (data.representative && data.representative.length > 0) {
    satList.innerHTML = data.representative.map(sat => `
      <div class="sat-card">
        <div class="sat-card-img-container">
          <img class="sat-card-img" src="${sat.img}" alt="${sat.name}">
        </div>
        <div class="sat-card-info">
          <div class="sat-card-names">
            <span class="sat-card-name-ko">${sat.name}</span>
            <span class="sat-card-name-en">${sat.nameEn}</span>
          </div>
          <p class="sat-card-desc">${sat.desc}</p>
        </div>
      </div>
    `).join('');
  } else {
    satList.innerHTML = '<div style="font-size: 12px; color: rgba(200, 220, 255, 0.4); text-align: center; padding: 20px 0;">주요 위성 정보 없음</div>';
  }

  if (data.others && data.others.length > 0) {
    otherSats.style.display = 'block';
    otherSats.innerHTML = `
      <div class="other-sats-title">그 외 위성 (${data.others.length}개)</div>
      <div class="other-sats-list">${data.others.join(', ')} 등</div>
    `;
  } else {
    otherSats.style.display = 'none';
    otherSats.innerHTML = '';
  }

  satPanel.classList.add('open');
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

document.getElementById('panel-close').addEventListener('click', closePanel);

/* ═══════════════════════════════════════════════════════
   MAIN 3D ANIMATION LOOP
═══════════════════════════════════════════════════════ */
let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  
  simTime += dt * timeScale * 0.3;

  const elapsedDays = simTime * SIM_DAYS_PER_SEC;
  const currentSimDate = new Date(EPOCH_DATE.getTime() + elapsedDays * 24 * 60 * 60 * 1000);
  
  const yy = currentSimDate.getFullYear();
  const mm = String(currentSimDate.getMonth() + 1).padStart(2, '0');
  const dd = String(currentSimDate.getDate()).padStart(2, '0');
  
  document.getElementById('date-display').textContent = `${yy}년 ${mm}월 ${dd}일`;
  
  const dateInput = document.getElementById('date-picker');
  if (dateInput && document.activeElement !== dateInput) {
    dateInput.value = `${yy}-${mm}-${dd}`;
  }

  // 1. 태양 자전 주기 동기화 적용
  if (sunMesh) {
    sunMesh.rotation.y = getRotationAngle(SUN_DATA.rotationPeriod, simTime);
  }

  // 2. 8대 행성 공전 및 자전 속도 물리적 시간비 동기화 적용
  PLANET_DATA.forEach((p) => {
    if (p.mesh) {
      const pos = getPlanetPos3D(p, simTime);
      p.mesh.position.copy(pos);
      p.mesh.rotation.y = getRotationAngle(p.rotationPeriod, simTime);
    }
  });

  // 지구 구름층 회전
  if (earthCloudsMesh) {
    earthCloudsMesh.rotation.y = getRotationAngle(0.96, simTime);
  }

  // 3. 지구 위성 달 공전 자전 동기화
  if (moonMesh) {
    const moonPeriod = 27.32;
    const moonAngle = (2 * Math.PI / (moonPeriod * DAY_IN_SECONDS)) * simTime;
    moonMesh.position.set(Math.cos(moonAngle) * 6.6, 0, Math.sin(moonAngle) * 6.6);
    moonMesh.rotation.y = moonAngle + Math.PI; 
  }

  if (isFocusing && selectedObject && selectedObject.mesh) {
    const currentPlanetPos = selectedObject.mesh.position.clone();
    
    if (lastPlanetPos) {
      const delta = currentPlanetPos.clone().sub(lastPlanetPos);
      camera.position.add(delta);
    }
    
    controls.target.copy(currentPlanetPos);
    lastPlanetPos = currentPlanetPos;
  }

  if (asteroidCloud) asteroidCloud.rotation.y += 0.0002;
  if (kuiperCloud) kuiperCloud.rotation.y += 0.00008;
  if (oortCloud) {
    oortCloud.rotation.y += 0.00002;
    oortCloud.rotation.x += 0.000008;
  }

  controls.update();
  renderer.render(scene, camera);

  if (miniRenderer && miniMesh) {
    miniMesh.rotation.y += 0.01;
    if (miniRingMesh) {
      miniRingMesh.rotation.z -= 0.002;
    }
    miniRenderer.render(miniScene, miniCamera);
  }

  maybeSpawnShootingStar();
  drawShootingStars(dt);
  updateHUD();

  requestAnimationFrame(loop);
}

/* ═══════════════════════════════════════════════════════
   UI EVENTS & VIEWPORT RESIZING
═══════════════════════════════════════════════════════ */
window.addEventListener('resize', () => {
  W = window.innerWidth;
  H = window.innerHeight;
  fxCanvas.width = W;
  fxCanvas.height = H;

  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
});

document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('intro').classList.add('fade-out');
  setTimeout(() => {
    document.getElementById('intro').style.display = 'none';
  }, 800);
  
  if (!isSoundMuted) {
    initAudioEngine();
  }
});

/* ═══════════════════════════════════════════════════════
   TIME CONTROLLER HUD BINDING
═══════════════════════════════════════════════════════ */
let isPaused = false;
let savedTimeScale = 1.0;

const playBtn = document.getElementById('time-play-btn');
const speedSlider = document.getElementById('time-speed-slider');
const speedVal = document.getElementById('time-speed-val');

playBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  if (isPaused) {
    savedTimeScale = timeScale;
    timeScale = 0;
    playBtn.textContent = '▶';
    playBtn.setAttribute('title', '재생');
    speedSlider.disabled = true;
    speedVal.textContent = '일시정지';
    speedVal.style.color = '#ff6666';
  } else {
    timeScale = savedTimeScale;
    playBtn.textContent = '⏸';
    playBtn.setAttribute('title', '일시정지');
    speedSlider.disabled = false;
    speedVal.textContent = `${timeScale.toFixed(1)}x`;
    speedVal.style.color = 'rgba(100, 150, 255, 0.9)';
  }
});

speedSlider.addEventListener('input', (e) => {
  timeScale = parseFloat(e.target.value);
  speedVal.textContent = `${timeScale.toFixed(1)}x`;
  if (timeScale === 0) {
    isPaused = true;
    playBtn.textContent = '▶';
    playBtn.setAttribute('title', '재생');
  } else {
    isPaused = false;
    playBtn.textContent = '⏸';
    playBtn.setAttribute('title', '일시정지');
  }
});

/* ═══════════════════════════════════════════════════════
   DATE PICKER EVENT BINDING
═══════════════════════════════════════════════════════ */
const datePicker = document.getElementById('date-picker');
if (datePicker) {
  datePicker.addEventListener('change', (e) => {
    const selected = new Date(e.target.value);
    if (isNaN(selected.getTime())) return;
    
    const diffTime = selected.getTime() - EPOCH_DATE.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    simTime = diffDays / SIM_DAYS_PER_SEC;
  });
}

/* ═══════════════════════════════════════════════════════
   WEB AUDIO API SYNTHESIZER ENGINE
═══════════════════════════════════════════════════════ */
const soundBtn = document.getElementById('sound-toggle-btn');
const soundIcon = document.getElementById('sound-icon');

if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    toggleSound();
  });
}

function toggleSound() {
  isSoundMuted = !isSoundMuted;
  
  if (!isSoundMuted) {
    soundIcon.textContent = '🔊';
    soundBtn.setAttribute('title', '음소거');
    
    if (!audioCtx) {
      initAudioEngine();
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } else {
    soundIcon.textContent = '🔇';
    soundBtn.setAttribute('title', '사운드 켜기');
    
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend();
    }
  }
}

function initAudioEngine() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
    
    startAmbientBGM();
  } catch (err) {
    console.warn("Web Audio API 초기화 실패:", err);
    isSoundMuted = true;
    if (soundIcon) soundIcon.textContent = '🔇';
  }
}

function createWindNoise(targetNode) {
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(150, audioCtx.currentTime);
  filter.Q.setValueAtTime(1.0, audioCtx.currentTime);
  
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.04, audioCtx.currentTime);
  lfoGain.gain.setValueAtTime(45, audioCtx.currentTime);
  
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.007, audioCtx.currentTime);
  
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(targetNode);
  
  lfo.start();
  whiteNoise.start();
  
  bgmNodes.push(whiteNoise, lfo);
}

function startAmbientBGM() {
  if (!audioCtx) return;

  createWindNoise(masterGain);

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(110, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.003, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  bgmNodes.push(osc);

  const chords = [
    [138.59, 207.65, 246.94, 329.63], // C#m7
    [146.83, 220.00, 277.18, 329.63], // Dmaj9
    [164.81, 246.94, 329.63, 440.00]  // Esus4
  ];

  function playNextChord() {
    if (!audioCtx || isSoundMuted || audioCtx.state === 'suspended') {
      padTimeoutId = setTimeout(playNextChord, 4000);
      return;
    }

    const chord = chords[Math.floor(Math.random() * chords.length)];

    chord.forEach((freq) => {
      const oscNode = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filterNode = audioCtx.createBiquadFilter();

      oscNode.type = 'sine';
      oscNode.frequency.setValueAtTime(freq + (Math.random() * 0.6 - 0.3), audioCtx.currentTime);

      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(600, audioCtx.currentTime);

      const attack = 3.5 + Math.random() * 1.5;
      const decay = 5.5 + Math.random() * 1.5;
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.004, audioCtx.currentTime + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + attack + decay);

      oscNode.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(masterGain);

      oscNode.start();
      oscNode.stop(audioCtx.currentTime + attack + decay + 0.5);
    });

    const nextInterval = 8000 + Math.random() * 3000;
    padTimeoutId = setTimeout(playNextChord, nextInterval);
  }

  playNextChord();
}

function playClickSFX() {
  if (!audioCtx || isSoundMuted || audioCtx.state === 'suspended') return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(987.77, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(493.88, audioCtx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.18);
}

requestAnimationFrame(loop);
