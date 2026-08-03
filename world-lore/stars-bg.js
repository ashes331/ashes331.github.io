(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], shootingStars = [];
  const COLORS = ['rgba(143,172,255,', 'rgba(155,140,246,', 'rgba(94,232,212,'];

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
      this.baseX = this.x;
      this.driftAmp = Math.random() * 30 + 10;
      this.driftSpeed = Math.random() * 0.006 + 0.002;
      this.vy = -(Math.random() * 0.4 + 0.12);
      this.r = Math.random() * 2.2 + 1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.55 + 0.35;
      this.life = 0;
      this.maxLife = Math.random() * 500 + 400;
    }
    update() {
      this.y += this.vy;
      this.x = this.baseX + Math.sin(this.life * this.driftSpeed) * this.driftAmp;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset(false);
    }
    draw() {
      const a = this.alpha * Math.sin((this.life / this.maxLife) * Math.PI);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color + '0.9)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  class ShootingStar {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W * 0.6 + W * 0.2;
      this.y = -20;
      this.len = Math.random() * 140 + 100;
      this.speed = Math.random() * 9 + 7;
      this.angle = Math.PI / 3.2;
      this.life = 0;
      this.maxLife = 40;
      this.alpha = 0;
    }
    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.life++;
      this.alpha = Math.sin((this.life / this.maxLife) * Math.PI);
    }
    draw() {
      const tailX = this.x - Math.cos(this.angle) * this.len;
      const tailY = this.y - Math.sin(this.angle) * this.len;
      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      grad.addColorStop(0, `rgba(220,232,255,${this.alpha})`);
      grad.addColorStop(1, 'rgba(220,232,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  const count = window.innerWidth < 720 ? 45 : 90;
  for (let i = 0; i < count; i++) particles.push(new Mote());

  let nextStarAt = Math.random() * 250 + 150;
  let frame = 0;

  function loop() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => { p.update(); p.draw(); });

    frame++;
    if (frame >= nextStarAt) {
      shootingStars.push(new ShootingStar());
      nextStarAt = frame + Math.random() * 350 + 250;
    }
    shootingStars = shootingStars.filter(s => s.life < s.maxLife && s.y < H + 50);
    shootingStars.forEach(s => { s.update(); s.draw(); });

    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('mousemove', e => {
    const cx = e.clientX / window.innerWidth - 0.5;
    const cy = e.clientY / window.innerHeight - 0.5;
    document.querySelectorAll('.orb').forEach((orb, i) => {
      const f = (i + 1) * 18;
      orb.style.transform = `translate(${cx * f}px, ${cy * f}px)`;
    });
  });
})();
