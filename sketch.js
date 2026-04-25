// ==============================================
// sketch.js
// Point d'entrée p5.js — setup() + draw()
// ==============================================

// ── Dimensions du canvas ─────────────────────
const CANVAS_W = 800;
const CANVAS_H = 400;
const TILE_SIZE = 16;

// ── Instances globales ───────────────────────
let camera;
let tileMap;
let level;
let levelGenerator;

// ── Assets ───────────────────────────────────
function preload() {
  // Charger les tiles ground
  tileMap = new TileMap();
  tileMap.preload();
}

function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  cnv.parent('canvas-container');

  camera         = new Camera(CANVAS_W, CANVAS_H);
  levelGenerator = new LevelGenerator();

  // Générer un premier niveau selon la difficulté config
  _generateNewLevel();

  frameRate(60);
  console.log('[sketch] Setup terminé — JumpOrDie 🌊');
}

function draw() {
  background(135, 206, 235);

  switch (gm.state) {
    case GameManager.STATES.TRAINING:
      drawTraining();
      break;
    case GameManager.STATES.COMPETITION:
      drawCompetition();
      break;
  }

  drawDebugInfo();
}

// ── Génère un nouveau niveau ─────────────────
function _generateNewLevel() {
  const data = levelGenerator.generate(gm.config.difficulty);
  level = new Level(tileMap, data);
  console.log('[sketch] Niveau généré —', gm.config.difficulty,
    '— éléments :', data.elements.length);
}

// ── Boucle entraînement ──────────────────────
function drawTraining() {
  // Dessiner le niveau dans l'espace monde
  camera.begin();
    level.draw();
  camera.end();
}

// ── Boucle compétition ───────────────────────
function drawCompetition() {
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text('🏆 Mode Compétition', CANVAS_W / 2, CANVAS_H / 2);
}

// ── Debug info ───────────────────────────────
function drawDebugInfo() {
  fill(255, 255, 255, 180);
  noStroke();
  textSize(10);
  textAlign(LEFT, TOP);
  text(`FPS: ${Math.round(frameRate())}`, 8, 8);
  text(`État: ${gm.state}`, 8, 22);
  text(`Gén: ${gm.generation} | Niv: ${gm.levelIndex}`, 8, 36);
}

// ── Inputs p5.js ─────────────────────────────
function mousePressed() {
  if (mouseButton === LEFT) {
    inputManager.onClick(camera);
  }
}

function keyPressed() {
  if (key === 't' || key === 'T') {
    gm.setState(GameManager.STATES.TRAINING);
  }
  if (key === 'c' || key === 'C') {
    gm.setState(GameManager.STATES.COMPETITION);
  }
  // R → regénérer un niveau (debug)
  if (key === 'r' || key === 'R') {
    _generateNewLevel();
  }
}