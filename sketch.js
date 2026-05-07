// ==============================================
// sketch.js — JumpOrDie
// Point d'entrée p5.js
// 
// États : 'menu' | 'config' | 'training' | 'competition'
// Navigation :
//   menu → config (clic ENTRAÎNEMENT)
//   menu → competition (clic COMPÉTITION)  
//   config → training (clic START)
//   training → menu (RESET ou ESC)
//   competition → menu (ESC)
// ==============================================

const CANVAS_W  = 800;
const CANVAS_H  = 400;
const TILE_SIZE = 16;

// ── Globals ───────────────────────────────────
let camera;
let tileMap;
let levelGenerator;
let trainingManager;
let uiPanel;
// Navigation centralisée dans gm.appState

// ── Assets ────────────────────────────────────
let bgImg;
let logoImg;

// ── Preload ───────────────────────────────────
function preload() {
  bgImg   = loadImage('./assets/images/background.png');
  logoImg = loadImage('./assets/images/logo.png');


  tileMap = new TileMap();
  tileMap.preload();
  Eagle.preload();
  Opossum.preload();
  Cherry.preload();
}

// ── Setup ─────────────────────────────────────
function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  cnv.parent('canvas-container');

  camera         = new Camera(CANVAS_W, CANVAS_H);
  levelGenerator = new LevelGenerator();
  uiPanel        = new UIPanel();
  
  competitionManager = new CompetitionManager(tileMap, levelGenerator);
  competitionManager.preload();

  frameRate(60);
}

// ── Draw ──────────────────────────────────────
function draw() {
  background(91, 200, 245);

  switch (gm.appState) {
    case 'menu':        _drawMenu();        break;
    case 'config':      _drawConfig();      break;
    case 'training':    _drawTraining();    break;
    case 'competition': _drawCompetition(); break;
  }

  _drawFPS();
}

// ── MENU ──────────────────────────────────────
function _drawMenu() {
  uiPanel.hidePanels();

  // Sky background (fallback if image fails)
  background(91, 200, 245);

  // Background image (parallax-ish: draw slightly zoomed)
  if (bgImg && bgImg.width > 0) {
    imageMode(CORNER);
    image(bgImg, 0, 0, CANVAS_W, CANVAS_H);
  }

  _menuLogoY = sin(frameCount * 0.025) * 4;

  // ── Logo ────────────────────────────────────
  const logoW = 420, logoH = 100;
  const logoX = CANVAS_W / 2 - logoW / 2;
  const logoY = 42 + _menuLogoY;

  if (logoImg && logoImg.width > 0) {
    imageMode(CORNER);
    // Subtle shadow under logo
    drawingContext.shadowColor   = 'rgba(0,0,0,0.5)';
    drawingContext.shadowBlur    = 12;
    drawingContext.shadowOffsetY = 4;
    image(logoImg, logoX, logoY, logoW, logoH);
    drawingContext.shadowColor   = 'transparent';
    drawingContext.shadowBlur    = 0;
    drawingContext.shadowOffsetY = 0;
  } else {
    // Fallback text logo
    _drawFallbackLogo(CANVAS_W / 2, logoY + logoH / 2);
  }

  // ── Wooden signboard panel ──────────────────
  const panelW = 320, panelH = 170;
  const panelX = CANVAS_W / 2 - panelW / 2;
  const panelY = 160;

  // Panel shadow
  noStroke();
  fill(0, 0, 0, 60);
  rect(panelX + 5, panelY + 8, panelW, panelH, 10);

  // Wood base
  fill(80, 45, 15);
  stroke(40, 22, 5);
  strokeWeight(4);
  rect(panelX, panelY, panelW, panelH, 8);

  // Inner lighter wood
  fill(120, 72, 30);
  stroke(90, 55, 20);
  strokeWeight(2);
  rect(panelX + 5, panelY + 5, panelW - 10, panelH - 10, 5);

  // Wood grain lines
  stroke(100, 62, 25, 40);
  strokeWeight(1);
  for (let gy = 0; gy < panelH; gy += 9) {
    line(panelX + 8, panelY + 8 + gy, panelX + panelW - 8, panelY + 8 + gy);
  }

  // Corner nails
  _nail(panelX + 14, panelY + 14);
  _nail(panelX + panelW - 14, panelY + 14);
  _nail(panelX + 14, panelY + panelH - 14);
  _nail(panelX + panelW - 14, panelY + panelH - 14);

  // ── Menu buttons ────────────────────────────
  _menuBtn(CANVAS_W / 2, panelY + 50,  'TRAINING MODE',   [80, 160, 60],  [50, 120, 35]);
  _menuBtn(CANVAS_W / 2, panelY + 105, 'COMPETITION MODE', [180, 130, 20], [130, 90, 10]);

 
}

function _nail(x, y) {
  noStroke();
  fill(60, 40, 20);
  circle(x, y, 7);
  fill(140, 110, 70);
  circle(x - 1, y - 1, 4);
}

function _menuBtn(x, y, label, colTop, colBot) {
  const W = 280, H = 44;
  const hover = mouseX > x - W / 2 && mouseX < x + W / 2 &&
                mouseY > y - H / 2 && mouseY < y + H / 2;

  // Shadow
  noStroke();
  fill(0, 0, 0, 50);
  rect(x - W / 2 + 3, y - H / 2 + 5, W, H, 10);

  // Button gradient
  if (hover) {
    // Glowing highlight
    drawingContext.shadowColor = `rgba(${colTop[0]}, ${colTop[1]}, ${colTop[2]}, 0.5)`;
    drawingContext.shadowBlur  = 12;
  }
  const gr = drawingContext.createLinearGradient(0, y - H/2, 0, y + H/2);
  gr.addColorStop(0, `rgb(${colTop[0]+20}, ${colTop[1]+20}, ${colTop[2]+20})`);
  gr.addColorStop(1, `rgb(${colBot[0]}, ${colBot[1]}, ${colBot[2]})`);
  drawingContext.fillStyle = gr;

  stroke(Math.max(0, colTop[0] - 30), Math.max(0, colTop[1] - 30), Math.max(0, colTop[2] - 30));
  strokeWeight(3);
  rect(x - W / 2, y - H / 2, W, H, 10);
  drawingContext.shadowColor = 'transparent';
  drawingContext.shadowBlur  = 0;

  // Top highlight line
  stroke(255, 255, 255, hover ? 80 : 40);
  strokeWeight(1);
  line(x - W/2 + 12, y - H/2 + 3, x + W/2 - 12, y - H/2 + 3);

  // Bottom shadow line
  stroke(0, 0, 0, 60);
  line(x - W/2 + 6, y + H/2 - 4, x + W/2 - 6, y + H/2 - 4);

  // Label
  noStroke();
  fill(hover ? 255 : 240, hover ? 255 : 240, hover ? 210 : 180);
  textFont('Press Start 2P');
  textSize(10);
  textAlign(CENTER, CENTER);
  text(label, x + (hover ? 1 : 0), y + (hover ? 1 : 0));

  // Hover arrow
  if (hover) {
    fill(255, 255, 180, 200);
    textSize(10);
    text('»', x - W / 2 + 16, y);
  }
}

function _drawFallbackLogo(x, y) {
  textFont('Press Start 2P');
  fill(245, 200, 66);
  stroke(90, 50, 10);
  strokeWeight(3);
  textSize(28);
  textAlign(CENTER, CENTER);
  text('JUMP OR DIE', x, y);
}

// ── CONFIG ────────────────────────────────────
function _drawConfig() {
  // Le panel gauche contient les sliders
  // Le canvas montre juste un message d'indication
  fill(0, 0, 0, 110);
  noStroke();
  rect(CANVAS_W/2 - 200, CANVAS_H/2 - 28, 400, 56, 4);

  fill(245, 200, 66);
  textSize(10);
  textAlign(CENTER, CENTER);
  text('⚙ Configurez les paramètres dans le panel gauche', CANVAS_W/2, CANVAS_H/2 - 8);

  fill(180, 200, 220);
  textSize(9);
  text('puis cliquez ▶ START TRAINING', CANVAS_W/2, CANVAS_H/2 + 14);
}

// ── TRAINING ──────────────────────────────────
function _drawTraining() {
  if (!trainingManager) return;

  trainingManager.update();
  trainingManager.draw(camera);

  // HUD léger sur canvas
  HUD.drawCanvas(trainingManager.stats);

  // Mise à jour panels HTML
  uiPanel.updateHUD(trainingManager.stats);

  // Debug steering sur agent sélectionné
  if (uiPanel.debugSteering && uiPanel.debugAgent) {
    camera.begin();
    _drawSteeringDebug(uiPanel.debugAgent);
    camera.end();
  }
}

// ── STEERING DEBUG ────────────────────────────
function _drawSteeringDebug(agent) {
  if (!agent || agent.isDead) return;

  const vel = createVector(agent.vx, agent.vy);
  const a1  = p5.Vector.mult(vel, 30);
  const a2  = p5.Vector.mult(vel, 15);
  const pA  = createVector(agent.x + a1.x, agent.y + a1.y);
  const pA2 = createVector(agent.x + a2.x, agent.y + a2.y);

  push();

  // Ahead jaune
  stroke(255, 255, 0); strokeWeight(2); noFill();
  line(agent.x, agent.y, pA.x, pA.y);
  fill(255, 0, 0); noStroke();
  circle(pA.x, pA.y, 8);

  // Ahead2 violet
  stroke(176, 107, 255); strokeWeight(2); noFill();
  line(agent.x, agent.y, pA2.x, pA2.y);
  fill(100, 200, 255); noStroke();
  circle(pA2.x, pA2.y, 6);

  // Zone évitement (blanc semi-transparent)
  stroke(255, 40); strokeWeight(Agent.WIDTH); noFill();
  line(agent.x, agent.y, pA.x, pA.y);

  // Force seek cerise (vert)
  const activeCherries = trainingManager.level.cherries
    .filter(c => !agent._collectedCherries.has(c.id));
  const fSeek = agent.seekForce(activeCherries);
  if (fSeek.mag() > 0.01) {
    stroke(0, 255, 100); strokeWeight(2); fill(0, 255, 100);
    line(agent.x, agent.y, agent.x + fSeek.x*40, agent.y + fSeek.y*40);
    circle(agent.x + fSeek.x*40, agent.y + fSeek.y*40, 6);
  }

  // Force avoid ennemi (rouge)
  const fAvoid = agent.avoidForce(trainingManager.level.enemies);
  if (fAvoid.mag() > 0.01) {
    stroke(255, 50, 50); strokeWeight(2); fill(255, 50, 50);
    line(agent.x, agent.y, agent.x + fAvoid.x*40, agent.y + fAvoid.y*40);
    circle(agent.x + fAvoid.x*40, agent.y + fAvoid.y*40, 6);
  }

  // Cercle de perception
  noFill(); stroke(255, 255, 0, 80); strokeWeight(1);
  circle(agent.x, agent.y, Agent.PERCEPTION_RADIUS * 2);

  pop();
}

// ── COMPETITION ───────────────────────────────
// ── COMPETITION ───────────────────────────────
function _drawCompetition() {
  if (competitionManager.phase === 'setup') {
    _drawCompetitionSetup();
  } else {
    _drawCompetitionRace();
  }
}

function _drawCompetitionSetup() {
  uiPanel.showCompetitionSetup(competitionManager);

  // Background
  background(91, 200, 245);
  if (bgImg) { imageMode(CORNER); image(bgImg, 0, 0, CANVAS_W, CANVAS_H); }
  noStroke(); fill(5, 12, 30, 100); rect(0, 0, CANVAS_W, CANVAS_H);

  // Titre
  fill(245, 200, 66);
  textFont('Press Start 2P');
  textSize(10); textAlign(CENTER, TOP);
  text('🏆 SÉLECTION DES CERVEAUX', CANVAS_W/2, 12);

  // 3 slots
  const slotW = 200, slotH = 100;
  const totalW = slotW * 3 + 20 * 2;
  const startX = CANVAS_W/2 - totalW/2;
  const slotY  = 60;

  const skins    = ['🦊 Fox', '🐰 Bunny', '🐿 Squirrel'];
  const slotCols = [[255,150,50],[120,200,255],[180,220,80]];

  for (let i = 0; i < 3; i++) {
    const sx = startX + i * (slotW + 20);
    const entry = competitionManager.slots[i];
    const col   = slotCols[i];

    // Fond carte
    fill(10, 15, 35, 200);
    stroke(col[0], col[1], col[2], 120);
    strokeWeight(2);
    rect(sx, slotY, slotW, slotH, 8);

    // Titre skin
    noStroke(); fill(col[0], col[1], col[2]);
    textFont('Press Start 2P'); textSize(7);
    textAlign(CENTER, TOP);
    text(skins[i], sx + slotW/2, slotY + 10);

    // Sprite idle animé à gauche du slot
    const idleAgent = competitionManager._idleAgents[i];
    if (idleAgent) {
      idleAgent.drawIdle(sx + 28, slotY + 58, 40, 40);
    }

    if (entry) {
      // Cerveau chargé
      fill(255); textFont('VT323'); textSize(13);
      textAlign(LEFT, TOP);
      text(entry.name || 'Cerveau', sx + 55, slotY + 28);
      fill(180); textSize(11);
      text(`Gen: ${entry.generation || '?'}`, sx + 55, slotY + 44);
      text(`Fit: ${entry.bestFitness || '?'}`, sx + 55, slotY + 58);
      fill(100, 220, 100); textSize(11);
      textAlign(CENTER, TOP);
      text('✓ Prêt', sx + slotW/2, slotY + 76);
    } else {
      fill(100); textFont('VT323'); textSize(12);
      textAlign(CENTER, CENTER);
      text('Cliquez pour\ncharger un cerveau', sx + slotW/2, slotY + 60);
    }

    // Bouton charger/retirer (zone de clic gérée dans mousePressed)
    const btnY = slotY + slotH + 5;
    const btnW = slotW - 20, btnH = 22;
    const bx   = sx + 10;

    if (entry) {
      fill(180, 50, 50, 200); noStroke();
    } else {
      fill(col[0], col[1], col[2], 200); noStroke();
    }
    rect(bx, btnY, btnW, btnH, 5);

    fill(255); textFont('Press Start 2P'); textSize(6);
    textAlign(CENTER, CENTER);
    text(entry ? '✕ RETIRER' : '📂 CHARGER', bx + btnW/2, btnY + btnH/2);
  }

  // Message si niveau généré
  if (competitionManager.level) {
    fill(100, 220, 100, 200);
    textFont('VT323'); textSize(13); textAlign(CENTER, BOTTOM);
    text('✓ Niveau prêt — cliquez START dans le panel droit', CANVAS_W/2, CANVAS_H - 8);
  } else {
    fill(200, 180, 100, 180);
    textFont('VT323'); textSize(12); textAlign(CENTER, BOTTOM);
    text('Générez un niveau depuis le panel droit', CANVAS_W/2, CANVAS_H - 8);
  }
}

function _drawCompetitionRace() {
  // Background
  background(91, 200, 245);

  // Update + draw (parallax intégré dans draw)
  competitionManager.update();
  competitionManager.draw(camera);

  // HUD léger
  _drawRaceHUD();

  // Panel gauche — stats agents
  uiPanel.updateRaceHUD(competitionManager.raceStats);

  // Fin de course
  if (competitionManager.isFinished) {
    _drawRaceFinished();
  }
}

function _drawRaceHUD() {
  // Timer
  const frames  = competitionManager._sessionFrames;
  const seconds = Math.floor(frames / 60);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timeStr = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  fill(255, 255, 255, 180);
  noStroke();
  textFont('VT323');
  textSize(14);
  textAlign(RIGHT, TOP);
  text(`⏱ ${timeStr}`, CANVAS_W - 8, 8);
}

function _drawRaceFinished() {
  // Overlay fin de course
  fill(0, 0, 0, 140);
  noStroke();
  rect(CANVAS_W/2 - 160, CANVAS_H/2 - 50, 320, 100, 8);

  fill(245, 200, 66);
  textFont('Press Start 2P');
  textSize(12);
  textAlign(CENTER, CENTER);
  text('🏁 COURSE TERMINÉE !', CANVAS_W/2, CANVAS_H/2 - 20);

  // Vainqueur
  const stats = competitionManager.raceStats;
  if (stats.length > 0) {
    fill(255);
    textFont('VT323');
    textSize(16);
    text(`🥇 ${stats[0].label} — ${stats[0].distance}px`, CANVAS_W/2, CANVAS_H/2 + 15);
  }
}

// ── FPS ───────────────────────────────────────
function _drawFPS() {
  fill(255, 255, 255, 100);
  noStroke();
  textSize(9);
  textAlign(RIGHT, TOP);
  text(`${Math.round(frameRate())} fps`, CANVAS_W - 6, 6);
}

// ── MOUSE ─────────────────────────────────────
function mousePressed() {
  if (mouseButton !== LEFT) return;

  // Ne pas intercepter les clics sur les éléments HTML hors canvas
  const cnv = document.querySelector('#canvas-container canvas');
  if (cnv) {
    const rect = cnv.getBoundingClientRect();
    const mx = (window.event || {}).clientX;
    const my = (window.event || {}).clientY;
    if (mx !== undefined && (mx < rect.left || mx > rect.right || my < rect.top || my > rect.bottom)) {
      return;
    }
  }

  if (gm.isMenu()) {
    const cx = CANVAS_W / 2;

    // Bouton ENTRAÎNEMENT
    if (mouseX > cx-130 && mouseX < cx+130 &&
        mouseY > 198   && mouseY < 242) {
      gm.goToConfig();
      uiPanel.showConfig((startDiff) => {
        gm.reset();
        trainingManager = new TrainingManager(tileMap, levelGenerator);
        gm.goToTraining();
        uiPanel.showTraining(startDiff, _trainingCallbacks());
      });
    }

    // Bouton COMPÉTITION
    if (mouseX > cx-130 && mouseX < cx+130 &&
        mouseY > 253   && mouseY < 297) {
      gm.goToCompetition();
      competitionManager.reset();
      uiPanel._phase = 'menu';
    }
    return;
  }

  // Clics slots compétition — phase setup
  if (gm.isCompetition() && competitionManager.phase === 'setup') {
    const slotW  = 200, slotH = 100;
    const totalW = slotW * 3 + 20 * 2;
    const startX = CANVAS_W / 2 - totalW / 2;
    const slotY  = 60;

    for (let i = 0; i < 3; i++) {
      const sx   = startX + i * (slotW + 20);
      const btnY = slotY + slotH + 5;
      const bx   = sx + 10;
      const btnW = slotW - 20;
      const btnH = 22;

      if (mouseX > bx && mouseX < bx + btnW &&
          mouseY > btnY && mouseY < btnY + btnH) {
        if (competitionManager.slots[i]) {
          competitionManager.unloadBrain(i);
        } else {
          _openBrainSelector(i);
        }
        return;
      }
    }
    return;
  }

  // Debug steering — sélection agent au clic
  if (gm.isTraining() && uiPanel.debugSteering) {
    uiPanel.onCanvasClick(mouseX, mouseY, camera);
    return;
  }

  inputManager.onClick(camera);
}

// ── Callbacks training ────────────────────────
// POURQUOI : centralisé ici pour que UIPanel n'ait pas besoin
// de connaitre trainingManager. Sketch.js fournit les actions,
// UIPanel les appelle sans savoir d'ou elles viennent.
function _trainingCallbacks() {
  return {
    onStop   : () => trainingManager?.stop(),
    onResume : () => trainingManager?.resume(),
    onSave   : () => {
      if (!trainingManager?.population?.bestAgent) return null;
      const best = trainingManager.population.bestAgent;
      const s    = trainingManager.stats;
      return {
        brain      : best.brain,
        generation : s.generation,
        difficulty : s.difficulty,
        bestFitness: s.bestFitness,
      };
    },
    onReset  : () => _onReset(),
    onMenu   : () => { trainingManager = null; gm.reset(); gm.goToMenu(); uiPanel.clear(); },
    getAgents: () => trainingManager?.population?.agents || null,
  };
}

// ── RESET callback ────────────────────────────
function _onReset() {
  trainingManager = null;
  gm.reset();
  gm.goToConfig();
  uiPanel.showConfig((startDiff) => {
    gm.reset();
    trainingManager = new TrainingManager(tileMap, levelGenerator);
    gm.goToTraining();
    uiPanel.showTraining(startDiff, _trainingCallbacks());
  });
}

// ── Sélecteur de cerveau ──────────────────────
function _openBrainSelector(slotIndex) {
  const brains = BrainStorage.loadAll();

  if (brains.length === 0) {
    alert('Aucun cerveau disponible.\nEntrainez un cerveau en mode Training puis sauvegardez-le avec SAUVEGARDER.');
    return;
  }

  const skinNames  = ['Fox', 'Bunny', 'Squirrel'];
  const skinEmojis = ['🦊', '🐰', '🐿'];
  const slotColors = ['#FF9632', '#78C8FF', '#B4DC50'];
  const slotColor  = slotColors[slotIndex] || '#7C6EEB';
  const skinLabel  = skinEmojis[slotIndex] + ' ' + skinNames[slotIndex];

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;display:flex;align-items:center;justify-content:center;';
  document.body.appendChild(overlay);

  const popup = document.createElement('div');
  popup.style.cssText = [
    'background:#fff',
    'border-radius:12px',
    'border:0.5px solid rgba(0,0,0,0.12)',
    'width:440px',
    'max-width:92vw',
    'max-height:90vh',
    'display:flex',
    'flex-direction:column',
    'overflow:hidden',
    'font-family:Nunito,sans-serif',
  ].join(';');
  overlay.appendChild(popup);

  const close = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'padding:16px 20px 14px;border-bottom:0.5px solid rgba(0,0,0,0.08);display:flex;align-items:flex-start;justify-content:space-between;flex-shrink:0;';
  header.innerHTML =
    '<div>' +
      '<p style="font-size:12px;color:#888;margin:0 0 2px;">Slot ' + (slotIndex+1) + ' &nbsp;—&nbsp; <span style="color:' + slotColor + ';font-weight:700;">' + skinLabel + '</span></p>' +
      '<p style="font-size:17px;font-weight:700;margin:0;color:#111;">Choisir un cerveau</p>' +
    '</div>' +
    '<button id="close-popup" style="background:none;border:none;cursor:pointer;font-size:18px;color:#aaa;padding:2px 4px;line-height:1;">✕</button>';
  popup.appendChild(header);
  header.querySelector('#close-popup').onclick = close;

  // Liste
  const list = document.createElement('div');
  list.style.cssText = 'overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:8px;flex:1;';
  popup.appendChild(list);

  brains.forEach((entry) => {
    const fitness = Math.round(entry.bestFitness || 0);
    const badgeColor = fitness > 5000
      ? { bg:'#e6f9f0', color:'#0a7a4b' }
      : fitness > 2000
        ? { bg:'#fff8e0', color:'#9a6500' }
        : { bg:'#f2f2f2', color:'#666' };

    const card = document.createElement('div');
    card.style.cssText = [
      'border:0.5px solid rgba(0,0,0,0.1)',
      'border-left:3px solid ' + slotColor,
      'border-radius:0 10px 10px 0',
      'padding:12px 14px',
      'cursor:pointer',
      'transition:background 0.1s',
    ].join(';');

    card.innerHTML =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">' +
        '<div>' +
          '<p style="font-size:14px;font-weight:700;margin:0;color:#111;">' + (entry.name || 'Cerveau') + '</p>' +
        '</div>' +
        '<span style="background:' + badgeColor.bg + ';color:' + badgeColor.color + ';font-size:11px;font-weight:700;padding:3px 9px;border-radius:6px;white-space:nowrap;">' + fitness.toLocaleString() + ' pts</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">' +
        _mkStat('Générations', entry.generation || '?') +
        _mkStat('Inputs', entry.inputCount || '?') +
        _mkStat('Couches × N', (entry.hiddenLayers || '?') + '×' + (entry.neuronsPerLayer || '?')) +
        _mkStat('Activation', entry.activationFn || '?') +
      '</div>';

    card.onmouseenter = () => { card.style.background = '#f7f7fa'; };
    card.onmouseleave = () => { card.style.background = ''; };
    card.onclick = () => {
      competitionManager.loadBrain(slotIndex, entry);
      close();
    };
    list.appendChild(card);
  });

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = 'padding:12px 16px;border-top:0.5px solid rgba(0,0,0,0.08);flex-shrink:0;';
  const cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = 'width:100%;padding:9px;background:none;color:#888;border:0.5px solid rgba(0,0,0,0.15);border-radius:8px;font-family:Nunito;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:0.5px;text-transform:uppercase;';
  cancelBtn.textContent = 'Annuler';
  cancelBtn.onclick = close;
  footer.appendChild(cancelBtn);
  popup.appendChild(footer);
}

function _mkStat(label, value) {
  return '<div style="background:#f5f5f7;border-radius:6px;padding:5px 7px;">' +
    '<p style="font-size:10px;color:#888;margin:0 0 1px;text-transform:uppercase;letter-spacing:0.3px;">' + label + '</p>' +
    '<p style="font-size:13px;font-weight:700;margin:0;color:#111;">' + value + '</p>' +
  '</div>';
}


// ── KEYS ──────────────────────────────────────
function keyPressed() {
  if (keyCode === ESCAPE) {
    trainingManager = null;
    gm.reset();
    gm.goToMenu();
    uiPanel.clear();
  }
}