/* ══════════════════════════════
   빔 배경 (Canvas 2D, 라이브러리 의존성 없음)
   index.html, detail.html 양쪽에서 공용으로 사용
══════════════════════════════ */
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'beams-bg';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const MINIMUM_BEAMS = 20;
  let beams = [];
  let logicalW = window.innerWidth;
  let logicalH = window.innerHeight;

  function createBeam(width, height) {
    const angle = -35 + Math.random() * 10;
    return {
      x: Math.random() * width * 1.5 - width * 0.25,
      y: Math.random() * height * 1.5 - height * 0.25,
      width: 30 + Math.random() * 60,
      length: height * 2.5,
      angle: angle,
      speed: 0.6 + Math.random() * 1.2,
      opacity: 0.12 + Math.random() * 0.16,
      hue: 190 + Math.random() * 70,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03
    };
  }

  function resetBeam(beam, index, totalBeams) {
    const column = index % 3;
    const spacing = logicalW / 3;

    beam.y = logicalH + 100;
    beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
    beam.width = 100 + Math.random() * 100;
    beam.speed = 0.5 + Math.random() * 0.4;
    beam.hue = 190 + (index * 70) / totalBeams;
    beam.opacity = 0.2 + Math.random() * 0.1;
    return beam;
  }

  function drawBeam(beam) {
    ctx.save();
    ctx.translate(beam.x, beam.y);
    ctx.rotate((beam.angle * Math.PI) / 180);

    const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2);

    const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
    gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
    gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
    gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
    gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
    gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
    gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
    ctx.restore();
  }

  function updateCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    logicalW = window.innerWidth;
    logicalH = window.innerHeight;

    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    canvas.style.width = logicalW + 'px';
    canvas.style.height = logicalH + 'px';

    // setTransform으로 매번 초기화 후 스케일 — resize 반복 시 스케일이 중첩되는 것을 방지
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const totalBeams = Math.floor(MINIMUM_BEAMS * 1.5);
    beams = Array.from({ length: totalBeams }, () => createBeam(logicalW, logicalH));
  }

  updateCanvasSize();
  window.addEventListener('resize', updateCanvasSize);

  function animate() {
    ctx.clearRect(0, 0, logicalW, logicalH);
    ctx.filter = 'blur(35px)';

    const totalBeams = beams.length;
    beams.forEach((beam, index) => {
      beam.y -= beam.speed;
      beam.pulse += beam.pulseSpeed;

      if (beam.y + beam.length < -100) {
        resetBeam(beam, index, totalBeams);
      }

      drawBeam(beam);
    });

    requestAnimationFrame(animate);
  }
  animate();
})();
