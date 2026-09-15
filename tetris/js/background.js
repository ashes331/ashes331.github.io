'use strict';

(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H;
  let streams  = [];

  // ── 빌딩 데이터 ───────────────────────────────────────────
  // [x비율, 너비px, 높이px, layer]
  const CITY = [
    // 뒷 레이어
    [0.02, 70, 340, 0], [0.08, 55, 280, 0], [0.13, 80, 360, 0],
    [0.20, 60, 300, 0], [0.26, 90, 400, 0], [0.33, 55, 260, 0],
    [0.38, 75, 340, 0], [0.44, 65, 380, 0], [0.50, 50, 300, 0],
    [0.55, 85, 420, 0], [0.61, 60, 280, 0], [0.67, 75, 360, 0],
    [0.73, 55, 300, 0], [0.79, 80, 380, 0], [0.85, 65, 260, 0],
    [0.91, 70, 340, 0], [0.96, 55, 300, 0],
    // 앞 레이어
    [0.00, 90, 200, 1], [0.07, 75, 240, 1], [0.14, 100, 220, 1],
    [0.22, 85, 260, 1], [0.30, 110, 230, 1],[0.39, 90, 250, 1],
    [0.48, 75, 200, 1], [0.54, 120, 280, 1],[0.64, 85, 240, 1],
    [0.71, 100, 200, 1],[0.80, 90, 250, 1], [0.89, 110, 220, 1],
  ];

  function drawBuildings() {
    CITY.forEach(([xr, bw, bh, layer]) => {
      const bx = xr * W;
      const by = H - bh;

      // 본체
      ctx.fillStyle = layer === 0 ? '#080d18' : '#050b12';
      ctx.fillRect(bx, by, bw, bh);

      // 창문
      const wW   = 10;
      const wH   = 14;
      const gapX = 8;
      const gapY = 10;
      const cols = Math.max(1, Math.floor((bw - gapX) / (wW + gapX)));
      const rows = Math.max(1, Math.floor((bh * 0.75 - gapY) / (wH + gapY)));
      const ox   = (bw - cols * (wW + gapX) + gapX) / 2;
      const oy   = wH;
      const WIN  = ['rgba(255,210,90,0.75)', 'rgba(130,190,255,0.65)', 'rgba(190,160,255,0.60)'];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const seed = (xr * 1000 + r * 23 + c * 41 | 0) % 100;
          if (seed < 60) {
            ctx.fillStyle = WIN[seed % 3];
            ctx.fillRect(bx + ox + c * (wW + gapX), by + oy + r * (wH + gapY), wW, wH);
          }
        }
      }

      // 윤곽선
      ctx.strokeStyle = 'rgba(20,50,90,0.35)';
      ctx.lineWidth   = 0.5;
      ctx.strokeRect(bx, by, bw, bh);
    });
  }

  const FONT_SIZE      = 14;
  const SPAWN_INTERVAL = 180;
  let   spawnTimer     = 0;

  // ── 스트림 생성 ───────────────────────────────────────────
  function createStream() {
    const len   = 7 + Math.floor(Math.random() * 9);
    const chars = Array.from({ length: len }, () => Math.random() > 0.5 ? '1' : '0');
    return {
      x:           20 + Math.random() * (W - 40),
      y:           -FONT_SIZE * (len + 2 + Math.random() * 4),
      speed:       50 + Math.random() * 60,
      chars, len,
      chTimer:     0,
      chInterval:  400 + Math.random() * 600,
    };
  }

  function initStreams() {
    streams = [];
    const count = Math.floor(W / 35);
    for (let i = 0; i < count; i++) {
      const s = createStream();
      s.y = Math.random() * H * 0.55;
      streams.push(s);
    }
  }

  // ── 배경 하늘 ─────────────────────────────────────────────
  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,   '#020610');
    sky.addColorStop(0.5, '#05101e');
    sky.addColorStop(1,   '#0a1628');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    const g1 = ctx.createRadialGradient(W*.7, H*.2, 0, W*.7, H*.2, W*.4);
    g1.addColorStop(0, 'rgba(180,76,255,0.07)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createLinearGradient(0, H*.65, 0, H*.82);
    g2.addColorStop(0, 'rgba(255,0,110,0.08)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, H*.65, W, H*.17);
  }

  // ── 스트림 업데이트 & 그리기 ──────────────────────────────
  function updateStreams(dt) {
    ctx.font         = `bold ${FONT_SIZE}px monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';

    const fadeEnd = H * 0.60;

    for (let i = streams.length - 1; i >= 0; i--) {
      const s = streams[i];

      s.y += s.speed * dt / 1000;

      s.chTimer += dt;
      if (s.chTimer >= s.chInterval) {
        const changeCount = 2 + Math.floor(Math.random() * 2);
        for (let k = 0; k < changeCount; k++) {
          const idx = Math.floor(Math.random() * s.len);
          s.chars[idx] = s.chars[idx] === '1' ? '0' : '1';
        }
        s.chTimer    = 0;
        s.chInterval = 400 + Math.random() * 600;
      }

      if (s.y > H + s.len * FONT_SIZE) {
        streams.splice(i, 1);
        continue;
      }

      for (let j = 0; j < s.len; j++) {
        const charY = s.y + j * FONT_SIZE;
        if (charY < -FONT_SIZE || charY > H) continue;

        const fadeAlpha = Math.max(0, 1 - charY / fadeEnd);
        if (fadeAlpha <= 0) continue;

        const brightness = 1 - (j / s.len) * 0.75;

        if (j === 0) {
          ctx.globalAlpha = fadeAlpha * 0.95;
          ctx.fillStyle   = '#e0ffe0';
        } else if (j < 3) {
          ctx.globalAlpha = fadeAlpha * brightness * 0.75;
          ctx.fillStyle   = '#00ff41';
        } else {
          ctx.globalAlpha = fadeAlpha * brightness * 0.45;
          ctx.fillStyle   = '#00bb30';
        }

        ctx.fillText(s.chars[j], s.x, charY);
      }

      ctx.globalAlpha = 1;
    }
  }

  // ── 메인 루프 ─────────────────────────────────────────────
  let lastT = 0;

  function loop(t) {
    const dt = Math.min(t - lastT, 50);
    lastT = t;

    spawnTimer += dt;
    if (spawnTimer >= SPAWN_INTERVAL) {
      streams.push(createStream());
      spawnTimer = 0;
    }

    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawBuildings();
    updateStreams(dt);

    requestAnimationFrame(loop);
  }

  // ── 리사이즈 ──────────────────────────────────────────────
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStreams();
    spawnTimer = 0;
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);
})();
