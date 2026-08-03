/* ══════════════════════════════
   인트로 모달: 아카이브 입장 전 소개 슬라이드
══════════════════════════════ */
(function () {
  const overlay = document.getElementById('introOverlay');
  if (!overlay) return;

  const slides = Array.from(document.querySelectorAll('.intro-slide'));
  const dotsWrap = document.getElementById('introDots');
  const prevBtn = document.getElementById('introPrev');
  const nextBtn = document.getElementById('introNext');
  const skipBtn = document.getElementById('introSkip');

  let step = 0;
  const total = slides.length;

  // 점 인디케이터 생성
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'intro-dot' + (i === 0 ? ' is-active' : '');
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === step));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === step));
    prevBtn.style.visibility = step === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = step === total - 1 ? '입장하기' : '다음';
  }

  function close() {
    overlay.classList.add('is-hidden');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.style.display = 'none'; }, 500);
  }

  nextBtn.addEventListener('click', () => {
    if (step === total - 1) { close(); return; }
    step++;
    render();
  });

  prevBtn.addEventListener('click', () => {
    if (step === 0) return;
    step--;
    render();
  });

  skipBtn.addEventListener('click', close);

  document.body.style.overflow = 'hidden';
  render();
})();
