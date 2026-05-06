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
let appState = 'menu';

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

  frameRate(60);
}

// ── Draw ──────────────────────────────────────
function draw() {
  background(91, 200, 245);

  switch (appState) {
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
function _drawCompetition() {
  fill(0, 0, 0, 150);
  noStroke();
  rect(CANVAS_W/2 - 150, CANVAS_H/2 - 28, 300, 56, 4);

  fill(245, 200, 66);
  textSize(12);
  textAlign(CENTER, CENTER);
  text('🏆 MODE COMPÉTITION', CANVAS_W/2, CANVAS_H/2 - 8);

  fill(180, 200, 220);
  textSize(9);
  text('Feature 9 — coming soon', CANVAS_W/2, CANVAS_H/2 + 14);
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

  if (appState === 'menu') {
    const cx = CANVAS_W / 2;

    // Bouton ENTRAÎNEMENT
    if (mouseX > cx-130 && mouseX < cx+130 &&
        mouseY > 198   && mouseY < 242) {
      appState = 'config';
      uiPanel.showConfig((startDiff) => {
        // Callback START → créer le TrainingManager
        gm.reset();
        trainingManager = new TrainingManager(tileMap, levelGenerator);
        appState = 'training';
        uiPanel.showTraining(startDiff, _onReset);
      });
    }

    // Bouton COMPÉTITION
    if (mouseX > cx-130 && mouseX < cx+130 &&
        mouseY > 253   && mouseY < 297) {
      appState = 'competition';
    }
    return;
  }

  // Debug steering — sélection agent au clic
  if (appState === 'training' && uiPanel.debugSteering) {
    uiPanel.onCanvasClick(mouseX, mouseY, camera);
    return;
  }

  inputManager.onClick(camera);
}

// ── RESET callback ────────────────────────────
function _onReset() {
  trainingManager = null;
  gm.reset();
  appState = 'config';
  uiPanel.showConfig((startDiff) => {
    gm.reset();
    trainingManager = new TrainingManager(tileMap, levelGenerator);
    appState = 'training';
    uiPanel.showTraining(startDiff, _onReset);
  });
}

// ── KEYS ──────────────────────────────────────
function keyPressed() {
  if (keyCode === ESCAPE) {
    trainingManager = null;
    gm.reset();
    appState = 'menu';
    uiPanel.clear();
  }
}