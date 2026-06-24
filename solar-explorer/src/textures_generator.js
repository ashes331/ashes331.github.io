// textures_generator.js
// 순수 Node.js만 사용하여 외부 텍스처 리소스를 다운로드하고 Base64 파일로 변환합니다.
// 8대 행성 및 태양, 그리고 달(위성) 텍스처 데이터를 포함합니다.
const fs = require('fs');
const path = require('path');
const https = require('https');

const TEXTURE_SOURCES = {
  sun: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/sun.jpg', mime: 'image/jpeg' },
  mercury: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/mercury.jpg', mime: 'image/jpeg' },
  venus: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/venus.jpg', mime: 'image/jpeg' },
  earth: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/earth.jpg', mime: 'image/jpeg' },
  earth_clouds: { url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png', mime: 'image/png' },
  moon: { url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg', mime: 'image/jpeg' }, // 달 위성 추가
  mars: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/mars.jpg', mime: 'image/jpeg' },
  jupiter: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/jupiter.jpg', mime: 'image/jpeg' },
  saturn: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/saturn.jpg', mime: 'image/jpeg' },
  saturn_ring: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/saturn_ring.png', mime: 'image/png' },
  uranus: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/uranus.jpg', mime: 'image/jpeg' },
  neptune: { url: 'https://raw.githubusercontent.com/SoumyaEXE/3d-Solar-System-ThreeJS/main/public/textures/neptune.jpg', mime: 'image/jpeg' }
};

const results = {};
const keys = Object.keys(TEXTURE_SOURCES);
let completed = 0;

console.log('NASA 및 위성 텍스처 리소스 다운로드 및 Base64 변환 시작...');

keys.forEach(key => {
  const { url, mime } = TEXTURE_SOURCES[key];
  console.log(`[다운로드 중] ${key}: ${url}`);

  const parsedUrl = new URL(url);
  const options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname + parsedUrl.search,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  };

  https.get(options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Error downloading ${key}: Status Code ${res.statusCode}`);
      completed++;
      if (completed === keys.length) saveToFile();
      return;
    }

    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString('base64');
      results[key] = `data:${mime};base64,${base64}`;
      console.log(`[성공] ${key} 변환 완료 (크기: ${(buffer.length / 1024).toFixed(1)} KB)`);
      
      completed++;
      if (completed === keys.length) {
        saveToFile();
      }
    });
  }).on('error', (err) => {
    console.error(`Network error downloading ${key}:`, err.message);
    completed++;
    if (completed === keys.length) saveToFile();
  });
});

function saveToFile() {
  const outputPath = path.join(__dirname, 'textures_data.js');
  let outputContent = '// textures_data.js - Generated NASA Base64 Texture Map\n';
  outputContent += 'const BASE64_TEXTURES = {\n';
  
  keys.forEach(key => {
    if (results[key]) {
      outputContent += `  ${key}: "${results[key]}",\n`;
    }
  });
  
  outputContent += '};\n';
  
  fs.writeFileSync(outputPath, outputContent, 'utf-8');
  console.log(`\n[최종 결과] textures_data.js 생성 완료. 성공한 리소스 수: ${Object.keys(results).length}/${keys.length}`);
}
