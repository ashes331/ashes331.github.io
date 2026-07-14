/* ══════════════════════════════
   PROJECTS DATA
   새 프로젝트를 추가하려면 아래 배열에 객체 하나만 추가하면 됩니다.
   (README.md의 프로젝트 테이블은 별도 파일이라 수동으로 함께 업데이트해주세요.)
══════════════════════════════ */
const projects = [
  {
    emoji: "🎮",
    title: "Special Playground",
    desc: "게임, 도구, 알고리즘 시각화까지 — 직접 만들고 실험하는 인터랙티브 프로젝트 모음집. Tetris, Neural Network Playground, Pathfinding Visualizer, RL Playground 등 다수 포함.",
    tags: ["Vanilla JS", "Canvas API", "ML / RL", "Games", "Tools"],
    link: "https://ashes331.github.io/Special-Playground/",
    featured: true
  },
  {
    emoji: "🪐",
    title: "3D Solar Explorer",
    desc: "Three.js 기반의 인터랙티브 3D 태양계 시뮬레이터. 천문학적 공전/자전 시간비, 절차적 우주 배경, Web Audio API 음향 시스템 수록.",
    tags: ["Three.js", "Web Audio API", "Vanilla JS", "3D Graphics"],
    link: "./solar-explorer/index.html",
    featured: false
  },
  {
    emoji: "📚",
    title: "World Lore Archive",
    desc: "플레이한 서브컬쳐 게임들의 세계관을 파일 카탈로그처럼 정리한 아카이브. 세계관, 타임라인, 주요 세력, 캐릭터, 용어집까지 게임별로 분류.",
    tags: ["Vanilla JS", "HTML / CSS", "Archive"],
    link: "./world-lore/index.html",
    featured: false
  }
];

function renderProjectCard(p) {
  const tagsHtml = p.tags.map(t => `<span class="card-tag">${t}</span>`).join('');
  return `
    <a class="project-card${p.featured ? ' featured' : ''}" href="${p.link}" target="_blank" rel="noopener">
      ${p.featured ? '<span class="featured-badge">Featured</span>' : ''}
      <div class="card-top"><span class="card-emoji">${p.emoji}</span><span class="card-arrow">↗</span></div>
      <div class="card-title">${p.title}</div>
      <p class="card-desc">${p.desc}</p>
      <div class="card-tags">${tagsHtml}</div>
    </a>`;
}

const comingSoonCard = `
  <div class="project-card placeholder">
    <div class="card-top"><span class="card-emoji">✨</span></div>
    <div class="card-title">Coming Soon</div>
    <p class="card-desc">더 많은 것들이 추가될 예정입니다.</p>
    <div class="card-tags"><span class="card-tag">TBD</span></div>
  </div>`;

const featuredProjects = projects.filter(p => p.featured);
const otherProjects = projects.filter(p => !p.featured);

document.getElementById('featured-projects').innerHTML = featuredProjects.map(renderProjectCard).join('');
document.getElementById('other-projects').innerHTML = otherProjects.map(renderProjectCard).join('') + comingSoonCard;

// Hero 섹션의 "Projects" 카운터를 배열 길이에 맞춰 자동 갱신
document.getElementById('counter-projects').dataset.target = projects.length;

/* ══════════════════════════════
   COPYRIGHT YEAR (자동 갱신)
══════════════════════════════ */
document.getElementById('copyright-year').textContent = new Date().getFullYear();

/* ══════════════════════════════
   THEME TOGGLE
══════════════════════════════ */
const html = document.documentElement;
const themeIcon  = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');
const sbThemeBtn = document.getElementById('sb-theme-btn');
const mobileThemeBtn = document.getElementById('mobile-theme-btn');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    themeIcon.textContent  = '☀️';
    themeLabel.textContent = '라이트 모드';
    mobileThemeBtn.textContent = '☀️';
  } else {
    themeIcon.textContent  = '☀️';
    themeLabel.textContent = '다크 모드';
    mobileThemeBtn.textContent = '☀️';
  }
}

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

function toggleTheme() {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}
sbThemeBtn.addEventListener('click', toggleTheme);
mobileThemeBtn.addEventListener('click', toggleTheme);

/* ══════════════════════════════
   CANVAS PARTICLES
══════════════════════════════ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x:-9999, y:-9999 };
  const COLORS = ['rgba(139,92,246,','rgba(94,234,212,','rgba(249,168,212,'];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random()*W; this.y = init ? Math.random()*H : H+10;
      this.vx = (Math.random()-0.5)*0.3; this.vy = -(Math.random()*0.6+0.2);
      this.r = Math.random()*1.5+0.4; this.color = COLORS[Math.floor(Math.random()*COLORS.length)];
      this.alpha = Math.random()*0.5+0.15; this.life = 0; this.maxLife = Math.random()*200+150;
    }
    update() {
      const dx=this.x-mouse.x, dy=this.y-mouse.y, d=Math.sqrt(dx*dx+dy*dy);
      if (d<100) { const f=(100-d)/100*0.4; this.vx+=dx/d*f; this.vy+=dy/d*f; }
      this.vx*=0.99; this.vy*=0.99; this.x+=this.vx; this.y+=this.vy; this.life++;
      if (this.life>this.maxLife||this.y<-10) this.reset(false);
    }
    draw() {
      const a = this.alpha * Math.sin(this.life/this.maxLife*Math.PI);
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
      ctx.fillStyle = this.color+a+')'; ctx.fill();
    }
  }
  for (let i=0;i<90;i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0,0,W,H);
    for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
      const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
      if (d<100) {
        ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y);
        ctx.strokeStyle=`rgba(139,92,246,${0.08*(1-d/100)})`; ctx.lineWidth=0.6; ctx.stroke();
      }
    }
    particles.forEach(p=>{p.update();p.draw();});
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ══════════════════════════════
   TYPING EFFECT
══════════════════════════════ */
(function () {
  const phrases = ['// Hello, world','// Building things','// Learning every day'];
  const el = document.getElementById('typed-text');
  let pi=0, ci=0, deleting=false, wait=0;
  function type() {
    if (wait>0){wait--;return;}
    const p=phrases[pi];
    if (!deleting) { el.textContent=p.slice(0,++ci); if(ci===p.length){deleting=true;wait=80;} }
    else { el.textContent=p.slice(0,--ci); if(ci===0){deleting=false;pi=(pi+1)%phrases.length;wait=15;} }
  }
  setInterval(type,55);
})();

/* ══════════════════════════════
   SIDEBAR TOGGLE
══════════════════════════════ */
const sidebar = document.getElementById('sidebar');
const toggle  = document.getElementById('sb-toggle');
if (localStorage.getItem('sb-expanded')==='true') sidebar.classList.add('expanded');
toggle.addEventListener('click',()=>{
  sidebar.classList.toggle('expanded');
  localStorage.setItem('sb-expanded', sidebar.classList.contains('expanded'));
});

/* ══════════════════════════════
   SCROLL FADE-UP
══════════════════════════════ */
const fadeObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('visible');fadeObserver.unobserve(e.target);} });
},{threshold:0.08});
document.querySelectorAll('.fade-up').forEach(el=>fadeObserver.observe(el));

/* ══════════════════════════════
   SKILL BARS — animate when visible
══════════════════════════════ */
const barObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill[data-pct]').forEach(bar=>{
        setTimeout(()=>{ bar.style.width = bar.dataset.pct + '%'; }, 100);
      });
      barObserver.unobserve(e.target);
    }
  });
},{threshold:0.15});
document.querySelectorAll('.skill-bar-list').forEach(el=>barObserver.observe(el));

/* ══════════════════════════════
   COUNTER ANIMATION
══════════════════════════════ */
const counterObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if (e.isIntersecting) {
      e.target.querySelectorAll('.counter-num[data-target]').forEach(el=>{
        const target = +el.dataset.target;
        const dur = 1400, step = 16;
        const inc = target / (dur/step);
        let cur = 0;
        const t = setInterval(()=>{
          cur += inc;
          if (cur >= target) { cur=target; clearInterval(t); }
          el.textContent = Math.floor(cur) + (target >= 10 ? '+' : '+');
        }, step);
      });
      counterObserver.unobserve(e.target);
    }
  });
},{threshold:0.3});
document.querySelectorAll('.counters').forEach(el=>counterObserver.observe(el));

/* ══════════════════════════════
   NAV ACTIVE (sidebar + mobile)
══════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn[data-section]');

const secObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(a=>a.classList.remove('active'));
      const act = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (act) act.classList.add('active');
      mobileNavBtns.forEach(b=>b.classList.remove('active'));
      const mact = document.querySelector(`.mobile-nav-btn[data-section="${id}"]`);
      if (mact) mact.classList.add('active');
    }
  });
},{threshold:0.35});
sections.forEach(s=>secObserver.observe(s));

/* ══════════════════════════════
   PARALLAX ORBS
══════════════════════════════ */
window.addEventListener('mousemove',e=>{
  const cx=e.clientX/window.innerWidth-0.5, cy=e.clientY/window.innerHeight-0.5;
  document.querySelectorAll('.orb').forEach((orb,i)=>{
    const f=(i+1)*15;
    orb.style.transform=`translate(${cx*f}px,${cy*f}px)`;
  });
});
