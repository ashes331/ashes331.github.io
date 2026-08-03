/* ══════════════════════════════
   배경 이펙트: 떠다니는 빛 입자 + 오브 패럴랙스
   index.html, detail.html 양쪽에서 공용으로 사용
══════════════════════════════ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['rgba(227,197,137,', 'rgba(155,140,246,', 'rgba(94,232,212,'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Mote {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = -(Math.random() * 0.35 + 0.08);
      this.r = Math.random() * 1.6 + 0.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.15;
      this.life = 0;
      this.maxLife = Math.random() * 500 + 400;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset(false);
    }
    draw() {
      const a = this.alpha * Math.sin((this.life / this.maxLife) * Math.PI);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color + '0.8)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  const count = window.innerWidth < 720 ? 30 : 60;
  for (let i = 0; i < count; i++) particles.push(new Mote());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();

  // 오브 패럴랙스 (마우스 움직임에 따라 은은하게 이동)
  window.addEventListener('mousemove', e => {
    const cx = e.clientX / window.innerWidth - 0.5;
    const cy = e.clientY / window.innerHeight - 0.5;
    document.querySelectorAll('.orb').forEach((orb, i) => {
      const f = (i + 1) * 18;
      orb.style.transform = `translate(${cx * f}px, ${cy * f}px)`;
    });
  });
})();
