const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ==========================================
// SISTEMA DE ÁUDIO CHIPTUNE 8-BIT (WEB AUDIO)
// ==========================================
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmTimer = null;
    this.noteIndex = 0;
    this.melody = [
      { f: 523.25, d: 0.14 }, { f: 659.25, d: 0.14 }, { f: 783.99, d: 0.14 }, { f: 1046.50, d: 0.22 },
      { f: 783.99, d: 0.14 }, { f: 659.25, d: 0.14 }, { f: 587.33, d: 0.14 }, { f: 698.46, d: 0.14 },
      { f: 880.00, d: 0.22 }, { f: 783.99, d: 0.14 }, { f: 659.25, d: 0.14 }, { f: 523.25, d: 0.22 },
      { f: 587.33, d: 0.14 }, { f: 659.25, d: 0.14 }, { f: 523.25, d: 0.28 }, { f: 0, d: 0.14 }
    ];
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration, type = 'square', volume = 0.08, slideTo = null) {
    if (!this.enabled || !this.ctx || freq <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  sfxJump() {
    this.init();
    this.playTone(280, 0.18, 'square', 0.07, 620);
  }

  sfxCoin() {
    this.init();
    this.playTone(987.77, 0.08, 'square', 0.07);
    setTimeout(() => this.playTone(1318.51, 0.22, 'square', 0.07), 70);
  }

  sfxStomp() {
    this.init();
    this.playTone(420, 0.12, 'sawtooth', 0.09, 120);
  }

  sfxBlock() {
    this.init();
    this.playTone(220, 0.09, 'triangle', 0.12, 340);
  }

  sfxOneUp() {
    this.init();
    const notes = [659.25, 783.99, 1318.51, 1046.50, 1174.66, 1567.98];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.09, 'square', 0.07), i * 75);
    });
  }

  sfxHurt() {
    this.init();
    this.playTone(360, 0.28, 'sawtooth', 0.1, 110);
  }

  sfxWin() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.14, 'square', 0.08), i * 110);
    });
  }

  startBgm() {
    this.init();
    if (this.bgmTimer) return;
    this.bgmTimer = setInterval(() => {
      if (!this.enabled || gameState !== 'PLAYING') return;
      const note = this.melody[this.noteIndex % this.melody.length];
      if (note.f > 0) {
        this.playTone(note.f, note.d, 'triangle', 0.035);
      }
      this.noteIndex++;
    }, 210);
  }
}

const audio = new RetroAudio();

document.getElementById('soundToggle').addEventListener('click', (e) => {
  audio.enabled = !audio.enabled;
  e.target.textContent = audio.enabled ? 'SOM: ON ♪' : 'SOM: OFF';
  if (audio.enabled) audio.startBgm();
});

// ==========================================
// PALETA E SPRITES EM PIXEL ART VIA CÓDIGO
// ==========================================
const PALETTE = {
  '.': null,
  'K': '#3b1228',
  'W': '#ffffff',
  'P': '#ff7eb3',
  'L': '#ffc2dc',
  'D': '#d62872',
  'R': '#ff2e63',
  'G': '#4cd137',
  'Y': '#ffd32a',
  'O': '#ff9f1a',
  'V': '#8c7ae6',
  'U': '#5f27cd',
  'C': '#ff9ff3'
};

const SPRITE_PINKY_IDLE = [
  '..KK......KK..',
  '.KLLK....KLLK.',
  '.KLPK....KLPK.',
  '.KLPKKKKKKLPK.',
  '..KPPPPPPPPK..',
  '.KPPPPPPPPPPK.',
  '.KPPKPPPPKPPK.',
  '.KPWKPPPPKWPK.',
  '.KPPLPPRPLPPK.',
  '..KPPPPPPPPK..',
  '...KWWWWWWK...',
  '..KRRWWWWPPK..',
  '..KPPWWWWPPK..',
  '...KKKKKKKK...',
  '...KLLK.KLLK..',
  '...KKKK.KKKK..'
];

const SPRITE_PINKY_RUN = [
  '..KK......KK..',
  '.KLLK....KLLK.',
  '.KLPK....KLPK.',
  '.KLPKKKKKKLPK.',
  '..KPPPPPPPPK..',
  '.KPPPPPPPPPPK.',
  '.KPPKPPPPKPPK.',
  '.KPWKPPPPKWPK.',
  '.KPPLPPRPLPPK.',
  '..KPPPPPPPPK..',
  '...KWWWWWWK...',
  '.KKRRWWWWPPKK.',
  '.KPPWWWWWWPPK.',
  '..KKKKKKKKKK..',
  '.KLLK....KLLK.',
  '.KKKK....KKKK.'
];

const SPRITE_PINKY_JUMP = [
  '..KK......KK..',
  '.KLLK....KLLK.',
  '.KLPK....KLPK.',
  '.KLPKKKKKKLPK.',
  '..KPPPPPPPPK..',
  '.KPPPPPPPPPPK.',
  '.KPPKPPPPKPPK.',
  '.KPWKPPPPKWPK.',
  '.KPPLPPRPLPPK.',
  '..KPPPPPPPPK..',
  '.KKRWWWWWWPKK.',
  '.KPPWWWWWWPPK.',
  '..KKKKKKKKKK..',
  '..KLLK..KLLK..',
  '..KKKK..KKKK..',
  '..............'
];

const SPRITE_SLIME_1 = [
  '....KKKKKK....',
  '..KKVVVVVVKK..',
  '.KVVLLLLVVVVK.',
  'KVVVVVVVVVVVVK',
  'KVVKWVVVVKWVVK',
  'KVVKWVVVVKWVVK',
  'KVVVVRRRRVVVVK',
  'KUUUUUUUUUUUUK',
  '.KKKKKKKKKKKK.',
  '..............',
  '..............',
  '..............'
];

const SPRITE_SLIME_2 = [
  '..............',
  '....KKKKKK....',
  '..KKVVVVVVKK..',
  '.KVVLLLLVVVVK.',
  'KVVVVVVVVVVVVK',
  'KVVKWVVVVKWVVK',
  'KVVKWVVVVKWVVK',
  'KVVVVRRRRVVVVK',
  'KUUUUUUUUUUUUK',
  'KKKKKKKKKKKKKK',
  '..............',
  '..............'
];

const SPRITE_STRAWBERRY = [
  '....KKKK....',
  '..KKGGGGKK..',
  '.KGGGGGGGGK.',
  '.KKRRRRRRKK.',
  'KRRWRRRRWRRK',
  'KRRRRRRRRRRK',
  'KRRRRWRRRRRK',
  '.KRRWRRRWRK.',
  '.KRRRRRRRRK.',
  '..KRRRRRRK..',
  '...KRRRRK...',
  '....KKKK....'
];

const SPRITE_HEART = [
  '.KKK....KKK.',
  'KRRRK..KRRRK',
  'KRWWRKKRRRRK',
  'KRWRRRRRRRRK',
  'KRRRRRRRRRRK',
  '.KRRRRRRRRK.',
  '..KRRRRRRK..',
  '...KRRRRK...',
  '....KRRK....',
  '.....KK.....',
  '............'
];

function drawPixelSprite(sprite, x, y, scale, flipX = false) {
  const rows = sprite.length;
  const cols = sprite[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const char = sprite[r][flipX ? cols - 1 - c : c];
      const color = PALETTE[char];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          Math.floor(x + c * scale),
          Math.floor(y + r * scale),
          scale,
          scale
        );
      }
    }
  }
}

// ==========================================
// CONSTANTES E ESTADO DO JOGO
// ==========================================
const TILE = 40;
const GRAVITY = 0.58;
const MAX_FALL_SPEED = 13;

let gameState = 'TITLE';
let currentLevelIndex = 0;
let score = 0;
let lives = 3;
let strawberriesCollected = 0;
let cameraX = 0;
let frameCount = 0;
let particles = [];
let floatingTexts = [];
let popups = [];

const keys = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false
};

// ==========================================
// DEFINIÇÃO DAS 2 FASES COMPLETAS
// ==========================================
const LEVELS = [
  {
    name: 'FASE 1: VALE DOS MORANGOS',
    bgTop: '#ffc8dd',
    bgBottom: '#fff0f6',
    map: [
      '................................................................................',
      '................................................................................',
      '................................................................................',
      '.....................................S..S..S....................................',
      '....................?................BBBBBBB................?...................',
      '................................................................................',
      '.............S..S...........S..S..................S..S..........................',
      '...........BBBBBBBB.......PPPPPPPP..............BBBBBBBB...........L............',
      '...........................................................................F....',
      '.....S..............E....................E..................E.............###...',
      '###################################..#####################..####################',
      '###################################..#####################..####################'
    ]
  },
  {
    name: 'FASE 2: NUVENS DOCES',
    bgTop: '#ffafcc',
    bgBottom: '#ffe5ec',
    map: [
      '........................................................................................',
      '........................................................................................',
      '..............................................S..S......................................',
      '.........................L..................PPPPPPPP................?...................',
      '........................................................................................',
      '..............S..S...............?........................S..S..........................',
      '............PPPPPPPP....................................BBBBBBBB................F.......',
      '........................E..................E...................................###......',
      '.....S................#####..............#####................E...............#####.....',
      '##########....#####...........S..S..................#####...#####....#####...#######....',
      '##########....#####..........######.................#####...#####....#####...#######....',
      '##########....#####..........######.................#####...#####....#####...#######....'
    ]
  }
];

let tiles = [];
let enemies = [];
let items = [];
let flagGoal = null;
let levelWidth = 0;

const player = {
  x: 80,
  y: 200,
  w: 32,
  h: 42,
  vx: 0,
  vy: 0,
  speed: 4.4,
  jumpForce: -12.6,
  onGround: false,
  coyoteTimer: 0,
  facingLeft: false,
  invulnTimer: 0
};

function spawnParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 1.2) * 5,
      size: 4 + Math.floor(Math.random() * 4),
      color,
      life: 24 + Math.floor(Math.random() * 12)
    });
  }
}

function addFloatingText(x, y, text, color = '#fff') {
  floatingTexts.push({
    x,
    y,
    text,
    color,
    life: 45
  });
}

function loadLevel(index) {
  const lvl = LEVELS[index];
  tiles = [];
  enemies = [];
  items = [];
  particles = [];
  floatingTexts = [];
  popups = [];
  flagGoal = null;

  const mapRows = lvl.map;
  levelWidth = mapRows[0].length * TILE;

  for (let r = 0; r < mapRows.length; r++) {
    for (let c = 0; c < mapRows[r].length; c++) {
      const ch = mapRows[r][c];
      const x = c * TILE;
      const y = r * TILE;

      if (ch === '#' || ch === 'B' || ch === '?' || ch === 'L' || ch === 'P') {
        tiles.push({
          x,
          y,
          w: TILE,
          h: ch === 'P' ? 20 : TILE,
          type: ch,
          used: false,
          bumpOffset: 0
        });
      } else if (ch === 'S') {
        items.push({
          x: x + 8,
          y: y + 8,
          w: 24,
          h: 24,
          type: 'STRAWBERRY',
          bobOffset: Math.random() * Math.PI * 2
        });
      } else if (ch === 'E') {
        enemies.push({
          x: x + 4,
          y: y + 10,
          w: 32,
          h: 30,
          vx: -1.4,
          vy: 0,
          alive: true,
          squishTimer: 0
        });
      } else if (ch === 'F') {
        flagGoal = {
          x: x + 10,
          y: y - 80,
          w: 24,
          h: 120
        };
      }
    }
  }

  player.x = 70;
  player.y = 220;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.invulnTimer = 40;
  cameraX = 0;
}

function resetFullGame() {
  score = 0;
  lives = 3;
  strawberriesCollected = 0;
  currentLevelIndex = 0;
  loadLevel(0);
  gameState = 'PLAYING';
  audio.startBgm();
}

// ==========================================
// CONTROLES DE TECLADO E TOQUE
// ==========================================
window.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = true;
  if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = true;
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
    if (!keys.jump) keys.jumpPressed = true;
    keys.jump = true;
    e.preventDefault();
  }
  if (e.code === 'KeyR' && gameState === 'PLAYING') {
    loadLevel(currentLevelIndex);
  }
  if (e.code === 'Enter' || e.code === 'Space') {
    if (gameState === 'TITLE' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
      resetFullGame();
    } else if (gameState === 'LEVEL_CLEAR') {
      currentLevelIndex++;
      loadLevel(currentLevelIndex);
      gameState = 'PLAYING';
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
  if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
    keys.jump = false;
    if (player.vy < -4) player.vy *= 0.55;
  }
});

canvas.addEventListener('click', () => {
  if (gameState === 'TITLE' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
    resetFullGame();
  } else if (gameState === 'LEVEL_CLEAR') {
    currentLevelIndex++;
    loadLevel(currentLevelIndex);
    gameState = 'PLAYING';
  }
});

function bindTouchButton(id, keyName, isJump = false) {
  const btn = document.getElementById(id);
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState !== 'PLAYING') {
      if (gameState === 'LEVEL_CLEAR') {
        currentLevelIndex++;
        loadLevel(currentLevelIndex);
        gameState = 'PLAYING';
      } else {
        resetFullGame();
      }
      return;
    }
    if (isJump && !keys.jump) keys.jumpPressed = true;
    keys[keyName] = true;
  });
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys[keyName] = false;
    if (isJump && player.vy < -4) player.vy *= 0.55;
  });
}

bindTouchButton('btnLeft', 'left');
bindTouchButton('btnRight', 'right');
bindTouchButton('btnJump', 'jump', true);

// ==========================================
// FÍSICA E ATUALIZAÇÃO DO JOGO
// ==========================================
function rectIntersect(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function hurtPlayer() {
  if (player.invulnTimer > 0) return;
  lives--;
  audio.sfxHurt();
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff4d94', 14);

  if (lives <= 0) {
    gameState = 'GAME_OVER';
  } else {
    loadLevel(currentLevelIndex);
  }
}

function hitBlockFromBelow(tile) {
  tile.bumpOffset = -10;
  audio.sfxBlock();

  if ((tile.type === '?' || tile.type === 'L') && !tile.used) {
    tile.used = true;
    if (tile.type === 'L') {
      lives++;
      score += 500;
      audio.sfxOneUp();
      addFloatingText(tile.x, tile.y - 12, '+1 VIDA!', '#4cd137');
      spawnParticles(tile.x + 20, tile.y, '#4cd137', 12);
    } else {
      score += 200;
      strawberriesCollected++;
      audio.sfxCoin();
      addFloatingText(tile.x + 4, tile.y - 12, '+200', '#ffd32a');
      popups.push({
        x: tile.x + 8,
        y: tile.y - 24,
        vy: -3.5,
        life: 22
      });
    }
  } else if (tile.type === 'B') {
    spawnParticles(tile.x + 20, tile.y + 20, '#ff85b3', 6);
  }
}

function update() {
  frameCount++;

  if (gameState !== 'PLAYING') return;

  if (player.invulnTimer > 0) player.invulnTimer--;

  if (keys.left) {
    player.vx = Math.max(player.vx - 0.65, -player.speed);
    player.facingLeft = true;
  } else if (keys.right) {
    player.vx = Math.min(player.vx + 0.65, player.speed);
    player.facingLeft = false;
  } else {
    player.vx *= 0.78;
    if (Math.abs(player.vx) < 0.15) player.vx = 0;
  }

  if (player.onGround) {
    player.coyoteTimer = 7;
  } else if (player.coyoteTimer > 0) {
    player.coyoteTimer--;
  }

  if (keys.jumpPressed) {
    if (player.coyoteTimer > 0) {
      player.vy = player.jumpForce;
      player.onGround = false;
      player.coyoteTimer = 0;
      audio.sfxJump();
      spawnParticles(player.x + player.w / 2, player.y + player.h, '#ffffff', 5);
    }
    keys.jumpPressed = false;
  }

  player.vy = Math.min(player.vy + GRAVITY, MAX_FALL_SPEED);

  player.x += player.vx;
  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }
  if (player.x + player.w > levelWidth) {
    player.x = levelWidth - player.w;
  }

  for (const t of tiles) {
    if (t.type === 'P') continue;
    if (rectIntersect(player, t)) {
      if (player.vx > 0) {
        player.x = t.x - player.w;
        player.vx = 0;
      } else if (player.vx < 0) {
        player.x = t.x + t.w;
        player.vx = 0;
      }
    }
  }

  const prevBottom = player.y + player.h;
  player.y += player.vy;
  player.onGround = false;

  for (const t of tiles) {
    if (t.bumpOffset < 0) t.bumpOffset += 1.5;
    if (t.bumpOffset > 0) t.bumpOffset = 0;

    if (t.type === 'P') {
      if (player.vy >= 0 && prevBottom <= t.y + 8 && rectIntersect(player, t)) {
        player.y = t.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
      continue;
    }

    if (rectIntersect(player, t)) {
      if (player.vy > 0) {
        player.y = t.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0) {
        player.y = t.y + t.h;
        player.vy = 1.5;
        hitBlockFromBelow(t);
      }
    }
  }

  if (player.y > canvas.height + 40) {
    hurtPlayer();
  }

  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    if (rectIntersect(player, it)) {
      items.splice(i, 1);
      score += 100;
      strawberriesCollected++;
      audio.sfxCoin();
      addFloatingText(it.x, it.y, '+100', '#ff2e63');
      spawnParticles(it.x + 12, it.y + 12, '#ff2e63', 7);

      if (strawberriesCollected % 15 === 0) {
        lives++;
        audio.sfxOneUp();
        addFloatingText(player.x, player.y - 20, '+1 VIDA!', '#4cd137');
      }
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e.alive) {
      e.squishTimer--;
      if (e.squishTimer <= 0) enemies.splice(i, 1);
      continue;
    }

    e.vy = Math.min(e.vy + GRAVITY, MAX_FALL_SPEED);
    e.x += e.vx;

    let hitWall = false;
    for (const t of tiles) {
      if (t.type !== 'P' && rectIntersect(e, t)) {
        hitWall = true;
        if (e.vx > 0) e.x = t.x - e.w;
        else e.x = t.x + t.w;
        break;
      }
    }
    if (hitWall || e.x <= 0 || e.x + e.w >= levelWidth) {
      e.vx *= -1;
    }

    e.y += e.vy;
    let onFloor = false;
    for (const t of tiles) {
      if (rectIntersect(e, t) && e.vy >= 0) {
        e.y = t.y - e.h;
        e.vy = 0;
        onFloor = true;
      }
    }

    if (onFloor) {
      const probeX = e.vx > 0 ? e.x + e.w + 4 : e.x - 4;
      const probeY = e.y + e.h + 6;
      const hasGroundAhead = tiles.some(
        (t) => probeX >= t.x && probeX <= t.x + t.w && probeY >= t.y && probeY <= t.y + t.h
      );
      if (!hasGroundAhead) e.vx *= -1;
    }

    if (rectIntersect(player, e)) {
      const isStomp = player.vy > 0 && player.y + player.h - player.vy <= e.y + 14;
      if (isStomp) {
        e.alive = false;
        e.squishTimer = 16;
        player.vy = -9.2;
        score += 150;
        audio.sfxStomp();
        addFloatingText(e.x, e.y - 8, '+150', '#8c7ae6');
        spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#8c7ae6', 10);
      } else {
        hurtPlayer();
      }
    }
  }

  if (flagGoal && rectIntersect(player, flagGoal)) {
    score += 1000;
    audio.sfxWin();
    spawnParticles(flagGoal.x, flagGoal.y + 40, '#ffd32a', 20);
    if (currentLevelIndex < LEVELS.length - 1) {
      gameState = 'LEVEL_CLEAR';
    } else {
      gameState = 'VICTORY';
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.25;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 0.9;
    ft.life--;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  for (let i = popups.length - 1; i >= 0; i--) {
    const pop = popups[i];
    pop.y += pop.vy;
    pop.vy += 0.25;
    pop.life--;
    if (pop.life <= 0) popups.splice(i, 1);
  }

  const targetCam = player.x - canvas.width * 0.36;
  cameraX += (targetCam - cameraX) * 0.14;
  cameraX = Math.max(0, Math.min(cameraX, levelWidth - canvas.width));
}

// ==========================================
// RENDERIZAÇÃO RETRÔ EM PIXEL ART
// ==========================================
function drawBackground() {
  const lvl = LEVELS[currentLevelIndex] || LEVELS[0];
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, lvl.bgTop);
  grad.addColorStop(1, lvl.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 10; i++) {
    const cx = ((i * 260 - cameraX * 0.25) % (canvas.width + 260) + (canvas.width + 260)) % (canvas.width + 260) - 100;
    const cy = 55 + (i % 3) * 45;
    ctx.fillRect(cx + 16, cy, 48, 16);
    ctx.fillRect(cx + 8, cy + 8, 64, 16);
    ctx.fillRect(cx, cy + 16, 80, 12);
  }

  for (let i = 0; i < 8; i++) {
    const mx = ((i * 340 - cameraX * 0.45) % (canvas.width + 340) + (canvas.width + 340)) % (canvas.width + 340) - 140;
    const my = 320;
    ctx.fillStyle = '#ff9ebb';
    ctx.fillRect(mx + 40, my, 60, 130);
    ctx.fillRect(mx + 20, my + 24, 100, 106);
    ctx.fillRect(mx, my + 48, 140, 82);
    ctx.fillStyle = '#fff0f6';
    ctx.fillRect(mx + 40, my, 60, 16);
    ctx.fillRect(mx + 28, my + 16, 84, 10);
  }
}

function drawTile(t) {
  const x = Math.floor(t.x - cameraX);
  const y = Math.floor(t.y + t.bumpOffset);

  if (x + t.w < -20 || x > canvas.width + 20) return;

  if (t.type === '#') {
    ctx.fillStyle = '#e05697';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#c43b7c';
    ctx.fillRect(x + 6, y + 18, 8, 8);
    ctx.fillRect(x + 24, y + 26, 8, 8);

    ctx.fillStyle = '#fff0f6';
    ctx.fillRect(x, y, TILE, 10);
    ctx.fillRect(x + 4, y + 10, 10, 4);
    ctx.fillRect(x + 22, y + 10, 12, 4);
  } else if (t.type === 'B') {
    ctx.fillStyle = '#ff70a6';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = '#b81d5d';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, TILE - 3, TILE - 3);
    ctx.fillStyle = '#ffc2dc';
    ctx.fillRect(x + 4, y + 4, TILE - 8, 4);
    ctx.fillStyle = '#b81d5d';
    ctx.fillRect(x, y + 19, TILE, 3);
    ctx.fillRect(x + 19, y, 3, 19);
    ctx.fillRect(x + 9, y + 22, 3, 18);
  } else if (t.type === '?' || t.type === 'L') {
    ctx.fillStyle = t.used ? '#c8a2b8' : t.type === 'L' ? '#7bed9f' : '#ffd32a';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = '#3b1228';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, TILE - 3, TILE - 3);

    ctx.fillStyle = '#3b1228';
    ctx.fillRect(x + 5, y + 5, 3, 3);
    ctx.fillRect(x + TILE - 8, y + 5, 3, 3);
    ctx.fillRect(x + 5, y + TILE - 8, 3, 3);
    ctx.fillRect(x + TILE - 8, y + TILE - 8, 3, 3);

    if (!t.used) {
      ctx.fillStyle = '#fff';
      ctx.font = '16px "Press Start 2P"';
      ctx.fillText(t.type === 'L' ? '♥' : '?', x + 12, y + 28);
    }
  } else if (t.type === 'P') {
    ctx.fillStyle = '#fff0f6';
    ctx.fillRect(x, y, t.w, t.h);
    ctx.fillStyle = '#ff7eb3';
    ctx.fillRect(x, y + 12, t.w, 8);
    ctx.strokeStyle = '#b81d5d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, t.w - 2, t.h - 2);
  }
}

function drawFlagGoal() {
  if (!flagGoal) return;
  const x = Math.floor(flagGoal.x - cameraX);
  const y = Math.floor(flagGoal.y);

  ctx.fillStyle = '#ffd32a';
  ctx.fillRect(x + 8, y, 8, flagGoal.h);
  ctx.strokeStyle = '#3b1228';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 8, y, 8, flagGoal.h);

  const wave = Math.sin(frameCount * 0.12) * 3;
  ctx.fillStyle = '#ff2e63';
  ctx.fillRect(x + 16, y + 8 + wave, 42, 28);
  drawPixelSprite(SPRITE_HEART, x + 25, y + 12 + wave, 2);

  const cx = x + 48;
  const cy = y + 36;
  ctx.fillStyle = '#ff85b3';
  ctx.fillRect(cx, cy + 20, 68, 64);
  ctx.fillStyle = '#ffc2dc';
  ctx.fillRect(cx + 8, cy, 52, 24);
  ctx.fillStyle = '#ff2e63';
  ctx.fillRect(cx - 4, cy + 12, 16, 12);
  ctx.fillRect(cx + 56, cy + 12, 16, 12);
  ctx.fillRect(cx + 22, cy - 12, 24, 14);
  ctx.fillStyle = '#3b1228';
  ctx.fillRect(cx + 24, cy + 52, 20, 32);
}

function drawHUD() {
  ctx.fillStyle = 'rgba(59, 18, 40, 0.78)';
  ctx.fillRect(14, 12, canvas.width - 28, 42);
  ctx.strokeStyle = '#fff0f6';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 12, canvas.width - 28, 42);

  for (let i = 0; i < Math.min(lives, 5); i++) {
    drawPixelSprite(SPRITE_HEART, 26 + i * 28, 22, 2);
  }
  if (lives > 5) {
    ctx.fillStyle = '#fff';
    ctx.font = '11px "Press Start 2P"';
    ctx.fillText(`x${lives}`, 170, 38);
  }

  drawPixelSprite(SPRITE_STRAWBERRY, 235, 21, 2);
  ctx.fillStyle = '#ffd32a';
  ctx.font = '12px "Press Start 2P"';
  ctx.fillText(`x${String(strawberriesCollected).padStart(2, '0')}`, 265, 38);

  ctx.fillStyle = '#ffc2dc';
  ctx.font = '10px "Press Start 2P"';
  ctx.fillText(`FASE ${currentLevelIndex + 1}/${LEVELS.length}`, 370, 38);

  ctx.fillStyle = '#ffffff';
  ctx.font = '12px "Press Start 2P"';
  ctx.fillText(`PTS:${String(score).padStart(6, '0')}`, 560, 38);
}

function drawOverlayScreen(title, subtitle, hint) {
  ctx.fillStyle = 'rgba(43, 16, 36, 0.82)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bw = 620;
  const bh = 250;
  const bx = (canvas.width - bw) / 2;
  const by = (canvas.height - bh) / 2;

  ctx.fillStyle = '#ff7eb3';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#fff0f6';
  ctx.lineWidth = 6;
  ctx.strokeRect(bx, by, bw, bh);

  drawPixelSprite(SPRITE_PINKY_IDLE, bx + 42, by + 85, 4);
  drawPixelSprite(SPRITE_STRAWBERRY, bx + bw - 95, by + 95, 4);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = '22px "Press Start 2P"';
  ctx.fillText(title, canvas.width / 2, by + 68);

  ctx.fillStyle = '#fff0f6';
  ctx.font = '12px "Press Start 2P"';
  ctx.fillText(subtitle, canvas.width / 2, by + 125);

  if (Math.floor(frameCount / 25) % 2 === 0) {
    ctx.fillStyle = '#ffd32a';
    ctx.font = '12px "Press Start 2P"';
    ctx.fillText(hint, canvas.width / 2, by + 195);
  }
  ctx.textAlign = 'left';
}

function render() {
  drawBackground();

  for (const t of tiles) drawTile(t);
  drawFlagGoal();

  for (const it of items) {
    const bob = Math.sin(frameCount * 0.1 + it.bobOffset) * 3;
    drawPixelSprite(SPRITE_STRAWBERRY, it.x - cameraX, it.y + bob, 2);
  }

  for (const pop of popups) {
    drawPixelSprite(SPRITE_STRAWBERRY, pop.x - cameraX, pop.y, 2);
  }

  for (const e of enemies) {
    if (!e.alive) {
      ctx.fillStyle = '#8c7ae6';
      ctx.fillRect(e.x - cameraX, e.y + 18, e.w, 12);
      continue;
    }
    const sprite = Math.floor(frameCount / 14) % 2 === 0 ? SPRITE_SLIME_1 : SPRITE_SLIME_2;
    drawPixelSprite(sprite, e.x - cameraX - 4, e.y - 4, 3, e.vx > 0);
  }

  if (player.invulnTimer === 0 || Math.floor(frameCount / 4) % 2 === 0) {
    let pinkySprite = SPRITE_PINKY_IDLE;
    if (!player.onGround) {
      pinkySprite = SPRITE_PINKY_JUMP;
    } else if (Math.abs(player.vx) > 0.4) {
      pinkySprite = Math.floor(frameCount / 7) % 2 === 0 ? SPRITE_PINKY_RUN : SPRITE_PINKY_IDLE;
    }
    drawPixelSprite(pinkySprite, player.x - cameraX - 5, player.y - 6, 3, player.facingLeft);
  }

  for (const p of particles) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
  }

  for (const ft of floatingTexts) {
    ctx.fillStyle = '#3b1228';
    ctx.font = '11px "Press Start 2P"';
    ctx.fillText(ft.text, ft.x - cameraX + 2, ft.y + 2);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x - cameraX, ft.y);
  }

  drawHUD();

  if (gameState === 'TITLE') {
    drawOverlayScreen(
      'SUPER PINKY WORLD',
      'COLETE MORANGOS E PULE NOS SLIMES!',
      'APERTE ENTER OU CLIQUE PARA JOGAR'
    );
  } else if (gameState === 'LEVEL_CLEAR') {
    drawOverlayScreen(
      'FASE CONCLUIDA!',
      `PONTUACAO ATUAL: ${score}`,
      'APERTE ENTER PARA A PROXIMA FASE'
    );
  } else if (gameState === 'GAME_OVER') {
    drawOverlayScreen(
      'FIM DE JOGO',
      `PONTUACAO FINAL: ${score}`,
      'APERTE ENTER PARA TENTAR DE NOVO'
    );
  } else if (gameState === 'VICTORY') {
    drawOverlayScreen(
      'VOCE VENCEU!',
      `RECORDE DOCE: ${score} PONTOS`,
      'APERTE ENTER PARA JOGAR NOVAMENTE'
    );
  }
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

loadLevel(0);
gameLoop();