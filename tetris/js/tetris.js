'use strict';

// ── Constants ─────────────────────────────────────────────────
const COLS         = 10;
const ROWS_VISIBLE = 20;
const BUFFER       = 4;          // 화면 위 숨겨진 스폰 공간
const ROWS_TOTAL   = ROWS_VISIBLE + BUFFER;  // 내부 보드 총 24행
const CELL         = 36;

const COLORS = {
  I:'#00d4ff', O:'#ffe600', T:'#b44cff',
  S:'#00ff88', Z:'#ff006e', J:'#4488ff', L:'#ff8800',
};

// 모든 shape은 패딩 없이 실제 크기만 사용
const SHAPES = {
  I: [
    [[1,1,1,1]],
    [[1],[1],[1],[1]],
  ],
  O: [
    [[1,1],[1,1]],
  ],
  T: [
    [[0,1,0],[1,1,1]],
    [[1,0],[1,1],[1,0]],
    [[1,1,1],[0,1,0]],
    [[0,1],[1,1],[0,1]],
  ],
  S: [
    [[0,1,1],[1,1,0]],
    [[1,0],[1,1],[0,1]],
  ],
  Z: [
    [[1,1,0],[0,1,1]],
    [[0,1],[1,1],[1,0]],
  ],
  J: [
    [[1,0,0],[1,1,1]],
    [[1,1],[1,0],[1,0]],
    [[1,1,1],[0,0,1]],
    [[0,1],[0,1],[1,1]],
  ],
  L: [
    [[0,0,1],[1,1,1]],
    [[1,0],[1,0],[1,1]],
    [[1,1,1],[1,0,0]],
    [[1,1],[0,1],[0,1]],
  ],
};

// 점수
const LINE_SCORES    = [0, 100, 300, 500, 800];
const TSPIN_SCORES   = { mini:100, single:800, double:1200, triple:1600 };
const ALL_CLEAR_BONUS = 3500;
const LEVEL_SPEEDS   = [800,700,600,500,400,300,250,200,150,100,80];

// ── DOM ───────────────────────────────────────────────────────
const gameCanvas = document.getElementById('game-canvas');
const nextCanvas = document.getElementById('next-canvas');
const holdCanvas = document.getElementById('hold-canvas');
const ctx     = gameCanvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');
const holdCtx = holdCanvas.getContext('2d');

const overlay    = document.getElementById('overlay');
const overlayMsg = document.getElementById('overlay-msg');
const finalScore = document.getElementById('final-score');
const scoreEl    = document.getElementById('score');
const linesEl    = document.getElementById('lines');
const levelEl    = document.getElementById('level');
const comboEl    = document.getElementById('combo');
const noticeEl   = document.getElementById('notice');
const pauseMenu  = document.getElementById('pause-menu');

document.getElementById('btn-resume') .addEventListener('click', resumeGame);
document.getElementById('btn-restart').addEventListener('click', ()=>{ closePauseMenu(); startGame(); });
document.getElementById('btn-quit')   .addEventListener('click', quitGame);
pauseMenu.addEventListener('click', e => { if (e.target === pauseMenu) resumeGame(); });

// ── State ─────────────────────────────────────────────────────
let board, current, ghost, nextPiece, hold;
let score, lines, level;
let dropTimer, lastTime;
let state;        // 'idle'|'playing'|'paused'|'over'
let holdUsed, bag;
let combo, btbActive;
let noticeTimer = null;

// ── Notice ────────────────────────────────────────────────────
function showNotice(text, color='#ffffff') {
  noticeEl.textContent = text;
  noticeEl.style.color = color;
  noticeEl.style.textShadow = `0 0 12px ${color}`;
  noticeEl.classList.add('show');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(()=> noticeEl.classList.remove('show'), 1400);
}

// ── Bag ───────────────────────────────────────────────────────
function refillBag() {
  bag = Object.keys(SHAPES);
  for (let i = bag.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
}
function nextFromBag() {
  if (!bag || !bag.length) refillBag();
  return createPiece(bag.pop());
}
function createPiece(type) {
  const shape = SHAPES[type][0];
  const w = shape[0].length;
  const x = Math.floor((COLS - w) / 2);
  // 버퍼 영역 상단(y=1)에서 스폰 → 자연스럽게 내려옴
  const y = 1;
  return { type, shape, rotIdx:0, x, y, color:COLORS[type], rotated:false };
}

// ── Board ─────────────────────────────────────────────────────
function emptyBoard() {
  return Array.from({length: ROWS_TOTAL}, ()=> Array(COLS).fill(null));
}

// ── Collision ─────────────────────────────────────────────────
function collides(piece, dx=0, dy=0, shape=piece.shape) {
  for (let r=0; r < shape.length; r++) {
    for (let c=0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS)        return true;  // 좌우 벽
      if (ny >= ROWS_TOTAL)            return true;  // 바닥
      if (ny < 0)                      continue;     // 버퍼 위 공간은 통과
      if (board[ny][nx])               return true;  // 기존 블록
    }
  }
  return false;
}

// ── SRS Wall-kick (dx, dy 순서로 정의) ───────────────────────
// dx: 좌우, dy: 상하 (양수=아래)
const KICKS_NORMAL = [
  [[0,0],[1,0],[1,-1],[0,2],[1,2]],    // 0→1 (CW)
  [[0,0],[1,0],[1,1],[0,-2],[1,-2]],   // 1→2
  [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],// 2→3
  [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],// 3→0
  // CCW (역방향은 CW의 반대)
  [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],// 1→0
  [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],// 2→1
  [[0,0],[1,0],[1,-1],[0,2],[1,2]],    // 3→2
  [[0,0],[1,0],[1,1],[0,-2],[1,-2]],   // 0→3
];
const KICKS_I = [
  [[0,0],[-2,0],[1,0],[-2,1],[1,-2]], // 0→1
  [[0,0],[-1,0],[2,0],[-1,-2],[2,1]], // 1→2
  [[0,0],[2,0],[-1,0],[2,-1],[-1,2]], // 2→3
  [[0,0],[1,0],[-2,0],[1,2],[-2,-1]], // 3→0
  [[0,0],[2,0],[-1,0],[2,-1],[-1,2]], // 1→0
  [[0,0],[1,0],[-2,0],[1,2],[-2,-1]], // 2→1
  [[0,0],[-2,0],[1,0],[-2,1],[1,-2]], // 3→2
  [[0,0],[-1,0],[2,0],[-1,-2],[2,1]], // 0→3
];

function rotate(piece, dir=1) {
  const shapes = SHAPES[piece.type];
  const n = shapes.length;
  const newIdx = ((piece.rotIdx + dir) % n + n) % n;
  const newShape = shapes[newIdx];

  // kick 테이블 인덱스: CW(dir=1)는 0~3, CCW(dir=-1)는 4~7
  const kicks = piece.type === 'I' ? KICKS_I : KICKS_NORMAL;
  const baseIdx = piece.rotIdx % 4;
  const kickIdx = dir === 1 ? baseIdx : baseIdx + 4;
  const table = kicks[kickIdx] || [[0,0]];

  for (const [dx, dy] of table) {
    const nx = piece.x + dx;
    const ny = piece.y + dy;
    if (!collides({...piece, x:nx, y:ny}, 0, 0, newShape)) {
      return {...piece, shape:newShape, rotIdx:newIdx, x:nx, y:ny, rotated:true};
    }
  }
  return piece; // 회전 불가
}

// ── Ghost ─────────────────────────────────────────────────────
function computeGhost() {
  let g = {...current};
  while (!collides(g, 0, 1)) g = {...g, y: g.y+1};
  return g;
}

// ── T-spin 감지 ───────────────────────────────────────────────
function detectTSpin(piece) {
  if (piece.type !== 'T' || !piece.rotated) return null;
  // T 중심
  const cx = piece.x + 1, cy = piece.y + 1;
  const corners = [[cy-1,cx-1],[cy-1,cx+1],[cy+1,cx-1],[cy+1,cx+1]];
  let filled = 0;
  for (const [r,c] of corners) {
    if (r<0||r>=ROWS_TOTAL||c<0||c>=COLS) filled++;
    else if (board[r]?.[c]) filled++;
  }
  if (filled < 3) return null;

  // 앞쪽 모서리 2개 (facing 방향 기준)
  const front = [
    [[cy-1,cx-1],[cy-1,cx+1]], // facing up (rot=0)
    [[cy-1,cx+1],[cy+1,cx+1]], // facing right (rot=1)
    [[cy+1,cx-1],[cy+1,cx+1]], // facing down (rot=2)
    [[cy-1,cx-1],[cy+1,cx-1]], // facing left (rot=3)
  ][piece.rotIdx] || [];

  let frontFilled = 0;
  for (const [r,c] of front) {
    if (r<0||r>=ROWS_TOTAL||c<0||c>=COLS) frontFilled++;
    else if (board[r]?.[c]) frontFilled++;
  }
  return frontFilled >= 2 ? 'tspin' : 'mini';
}

// ── Lock ──────────────────────────────────────────────────────
function lockPiece() {
  const tspinType = detectTSpin(current);

  // 보드에 블록 배치
  for (let r=0; r < current.shape.length; r++) {
    for (let c=0; c < current.shape[r].length; c++) {
      if (!current.shape[r][c]) continue;
      const ny = current.y + r;
      if (ny < 0 || ny >= ROWS_TOTAL) continue;
      board[ny][current.x + c] = current.color;
    }
  }

  // 버퍼 영역에 블록 쌓이면 게임오버
  for (let r=0; r < BUFFER; r++) {
    if (board[r].some(c => c !== null)) { gameOver(); return; }
  }

  const cleared = clearLines();
  calcScore(cleared, tspinType);
  spawnPiece();
}

// ── Line clear ────────────────────────────────────────────────
function clearLines() {
  let cleared = 0;
  for (let r = ROWS_TOTAL-1; r >= 0; r--) {
    if (board[r].every(c => c !== null)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(null));
      cleared++;
      r++; // 같은 인덱스 재검사
    }
  }
  return cleared;
}

// ── Score ─────────────────────────────────────────────────────
function calcScore(cleared, tspinType) {
  let pts = 0;
  const notices = [];
  let isSpecial = false;

  if (tspinType && cleared === 0) {
    pts = (tspinType==='tspin' ? TSPIN_SCORES.mini : TSPIN_SCORES.mini) * level;
    notices.push(tspinType==='tspin' ? 'T-SPIN' : 'T-SPIN MINI');
    isSpecial = true;
  } else if (tspinType === 'tspin' && cleared > 0) {
    const k = ['','single','double','triple'][Math.min(cleared,3)];
    pts = TSPIN_SCORES[k] * level;
    notices.push(`T-SPIN ${k.toUpperCase()}`);
    isSpecial = true;
  } else if (cleared === 4) {
    pts = LINE_SCORES[4] * level;
    notices.push('TETRIS!');
    isSpecial = true;
  } else if (cleared > 0) {
    pts = LINE_SCORES[cleared] * level;
    notices.push(['','SINGLE','DOUBLE','TRIPLE'][cleared]);
  }

  // Back-to-Back
  if (isSpecial) {
    if (btbActive && cleared > 0) {
      pts = Math.floor(pts * 1.5);
      notices.unshift('BACK-TO-BACK');
    }
    btbActive = true;
  } else if (cleared > 0) {
    btbActive = false;
  }

  // Combo: 첫 클리어부터 combo=1로 시작
  if (cleared > 0) {
    combo = Math.max(combo, 0) + 1;  // 0이하면 1로, 이미 양수면 +1
    const cb = 50 * combo * level;
    pts += cb;
    notices.push(`${combo} COMBO!`);
  } else {
    combo = 0;
  }

  // All Clear
  const allClear = board.every(row => row.every(c => c === null));
  if (allClear && cleared > 0) {
    pts += ALL_CLEAR_BONUS * level;
    notices.unshift('ALL CLEAR!!');
  }

  if (cleared > 0) {
    gameCanvas.classList.add('flash');
    setTimeout(()=> gameCanvas.classList.remove('flash'), 120);
  }

  if (notices.length) {
    const colorMap = {
      'T-SPIN':'#b44cff','TETRIS!':'#00d4ff',
      'ALL CLEAR!!':'#ffe600','BACK-TO-BACK':'#ff8800',
    };
    const key = Object.keys(colorMap).find(k => notices[0].includes(k));
    showNotice(notices.join(' + '), key ? colorMap[key] : '#ffffff');
  }

  score += pts;
  lines += cleared;
  level  = Math.floor(lines / 10) + 1;
  updateHUD();
}

// ── Spawn ─────────────────────────────────────────────────────
function spawnPiece() {
  current   = nextPiece;
  nextPiece = nextFromBag();
  holdUsed  = false;
  drawNext();
  if (collides(current)) { gameOver(); return; }
  ghost = computeGhost();
}

// ── Hold ──────────────────────────────────────────────────────
function holdPiece() {
  if (holdUsed) return;
  holdUsed = true;
  if (hold) {
    const tmp = hold;
    hold    = createPiece(current.type);
    current = createPiece(tmp.type);
  } else {
    hold = createPiece(current.type);
    spawnPiece();
    return;
  }
  ghost = computeGhost();
  drawHold();
}

// ── HUD ───────────────────────────────────────────────────────
function updateHUD() {
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
  comboEl.textContent = combo >= 1 ? `x${combo}` : '-';
}

// ── Draw ──────────────────────────────────────────────────────
function drawCell(context, x, y, color) {
  const px = x*CELL, py = y*CELL;
  context.fillStyle = color;
  context.fillRect(px+1, py+1, CELL-2, CELL-2);
  // 상단 하이라이트
  context.fillStyle = 'rgba(255,255,255,0.20)';
  context.fillRect(px+2, py+2, CELL-4, 5);
  // 테두리 글로우
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.shadowColor = color;
  context.shadowBlur = 8;
  context.strokeRect(px+1, py+1, CELL-2, CELL-2);
  context.shadowBlur = 0;
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(40,80,120,0.3)';
  ctx.lineWidth = 0.5;
  for (let c=0; c<=COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c*CELL, 0); ctx.lineTo(c*CELL, ROWS_VISIBLE*CELL);
    ctx.stroke();
  }
  for (let r=0; r<=ROWS_VISIBLE; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r*CELL); ctx.lineTo(COLS*CELL, r*CELL);
    ctx.stroke();
  }
}

function drawBoard() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  ctx.fillStyle = '#0d1520';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  drawGrid();

  // 보드 셀 (버퍼 행 제외, 화면 y = 보드y - BUFFER)
  for (let r=BUFFER; r < ROWS_TOTAL; r++) {
    for (let c=0; c < COLS; c++) {
      if (board[r][c]) drawCell(ctx, c, r-BUFFER, board[r][c]);
    }
  }

  // ghost
  if (ghost && state==='playing') {
    for (let r=0; r < ghost.shape.length; r++) {
      for (let c=0; c < ghost.shape[r].length; c++) {
        if (!ghost.shape[r][c]) continue;
        const drawY = ghost.y + r - BUFFER;
        if (drawY < 0) continue;
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = current.color;
        ctx.fillRect((ghost.x+c)*CELL+1, drawY*CELL+1, CELL-2, CELL-2);
        ctx.strokeStyle = current.color;
        ctx.lineWidth = 1;
        ctx.strokeRect((ghost.x+c)*CELL+1, drawY*CELL+1, CELL-2, CELL-2);
        ctx.globalAlpha = 1;
      }
    }
  }

  // current piece
  if (current) {
    for (let r=0; r < current.shape.length; r++) {
      for (let c=0; c < current.shape[r].length; c++) {
        if (!current.shape[r][c]) continue;
        const drawY = current.y + r - BUFFER;
        if (drawY < 0) continue;
        drawCell(ctx, current.x+c, drawY, current.color);
      }
    }
  }
}

function drawPreview(context, piece) {
  const W = 144;
  context.clearRect(0,0,W,W);
  context.fillStyle = '#0d1520';
  context.fillRect(0,0,W,W);
  if (!piece) return;

  const s = piece.shape;
  const rows = s.length, cols = s[0].length;
  const pc = Math.min(Math.floor((W-16)/Math.max(rows,cols)), 34);
  const ox = Math.floor((W - cols*pc)/2);
  const oy = Math.floor((W - rows*pc)/2);

  for (let r=0; r < rows; r++) {
    for (let c=0; c < cols; c++) {
      if (!s[r][c]) continue;
      const px = ox + c*pc, py = oy + r*pc;
      context.fillStyle = piece.color;
      context.fillRect(px+1, py+1, pc-2, pc-2);
      context.fillStyle = 'rgba(255,255,255,0.20)';
      context.fillRect(px+2, py+2, pc-4, 5);
      context.strokeStyle = piece.color;
      context.lineWidth = 1;
      context.shadowColor = piece.color;
      context.shadowBlur = 8;
      context.strokeRect(px+1, py+1, pc-2, pc-2);
      context.shadowBlur = 0;
    }
  }
}

function drawNext() { drawPreview(nextCtx, nextPiece); }
function drawHold() { drawPreview(holdCtx, hold); }

// ── Game loop ─────────────────────────────────────────────────
function gameLoop(timestamp) {
  if (state !== 'playing') return;
  const dt = Math.min(timestamp - (lastTime || timestamp), 200);
  lastTime = timestamp;
  dropTimer += dt;

  const speed = LEVEL_SPEEDS[Math.min(level-1, LEVEL_SPEEDS.length-1)];
  if (dropTimer >= speed) {
    dropTimer = 0;
    if (!collides(current, 0, 1)) {
      current = {...current, y: current.y+1, rotated: false};
      ghost = computeGhost();
    } else {
      lockPiece();
    }
  }

  drawBoard();
  requestAnimationFrame(gameLoop);
}

// ── Start / Over / Pause ──────────────────────────────────────
function startGame() {
  board     = emptyBoard();
  score=0; lines=0; level=1;
  combo=0; btbActive=false;
  hold=null; holdUsed=false;
  dropTimer=0; lastTime=null;
  bag=[];

  refillBag();
  nextPiece = nextFromBag();
  spawnPiece();
  drawNext(); drawHold(); updateHUD();

  state = 'playing';
  overlay.classList.add('hidden');
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  state = 'over';
  overlayMsg.textContent = 'GAME OVER';
  finalScore.textContent = `SCORE: ${score}`;
  overlay.classList.remove('hidden');
}

function openPauseMenu() {
  if (state !== 'playing') return;
  state = 'paused';
  pauseMenu.classList.remove('hidden');
}
function closePauseMenu() { pauseMenu.classList.add('hidden'); }

function resumeGame() {
  if (state !== 'paused') return;
  closePauseMenu();
  state='playing'; lastTime=null; dropTimer=0;
  requestAnimationFrame(gameLoop);
}

function quitGame() {
  closePauseMenu();
  state='idle';
  board=emptyBoard(); drawBoard();
  overlay.classList.remove('hidden');
  overlayMsg.textContent='PRESS SPACE';
  finalScore.textContent='';
}

// ── Input ─────────────────────────────────────────────────────
const DAS_DELAY=160, DAS_REPEAT=50;
let dasTimer=null, dasTimeout=null, dasKey=null;

function clearDAS() {
  if (dasTimeout) { clearTimeout(dasTimeout); dasTimeout=null; }
  if (dasTimer)   { clearInterval(dasTimer);  dasTimer=null; }
  dasKey=null;
}
function startDAS(key, action) {
  if (dasKey===key) return;
  clearDAS(); dasKey=key; action();
  dasTimeout=setTimeout(()=>{ dasTimer=setInterval(action,DAS_REPEAT); },DAS_DELAY);
}

document.addEventListener('keydown', e => {
  if (state==='idle'||state==='over') {
    if (e.code==='Space') { startGame(); return; }
  }
  if (e.code==='Escape') { openPauseMenu(); return; }
  if (state!=='playing') return;

  switch(e.code) {
    case 'ArrowLeft':
      e.preventDefault();
      startDAS('left', ()=>{
        if (!collides(current,-1,0)) { current={...current,x:current.x-1}; ghost=computeGhost(); drawBoard(); }
      });
      break;
    case 'ArrowRight':
      e.preventDefault();
      startDAS('right', ()=>{
        if (!collides(current,1,0)) { current={...current,x:current.x+1}; ghost=computeGhost(); drawBoard(); }
      });
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (!collides(current,0,1)) { current={...current,y:current.y+1}; score+=1; updateHUD(); }
      else lockPiece();
      break;
    case 'ArrowUp': case 'KeyX':
      e.preventDefault();
      { const r=rotate(current,1); if(r!==current){current=r; ghost=computeGhost();} }
      break;
    case 'KeyZ':
      e.preventDefault();
      { const r=rotate(current,-1); if(r!==current){current=r; ghost=computeGhost();} }
      break;
    case 'Space':
      e.preventDefault();
      while (!collides(current,0,1)) { current={...current,y:current.y+1}; score+=2; }
      updateHUD();
      lockPiece();
      break;
    case 'KeyC':
      e.preventDefault();
      holdPiece();
      break;
  }
});

document.addEventListener('keyup', e => {
  if (e.code==='ArrowLeft'||e.code==='ArrowRight') clearDAS();
});

// ── Init ──────────────────────────────────────────────────────
state='idle';
overlayMsg.textContent='PRESS SPACE';
finalScore.textContent='';
board=emptyBoard();
drawBoard();
