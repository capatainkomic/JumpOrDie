// ==============================================
// sketch.js
// Point d'entrée p5.js — setup() + draw()
// ==============================================

const CANVAS_W = 800;
const CANVAS_H = 400;
const TILE_SIZE = 16;

let camera;
let tileMap;
let level;
let levelGenerator;
let testAgent;

// ── Mesure physique empirique ─────────────────
let _jumpStartX = 0;
let _jumpStartY = 0;
let _jumpMaxY   = 0;
let _wasInAir   = false;
let _measuredH  = 0;
let _measuredD  = 0;

function preload() {
  tileMap = new TileMap();
  tileMap.preload();
}

function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  cnv.parent('canvas-container');
  camera         = new Camera(CANVAS_W, CANVAS_H);
  levelGenerator = new LevelGenerator();
  _generateNewLevel();

  // Spawner l'agent sur le sol réel du niveau
  testAgent = new Agent(
    3 * TILE_SIZE,
    level.groundY - Agent.HEIGHT / 2,
    color(231, 76, 60)
  );
  frameRate(60);
  console.log('[sketch] Setup terminé — JumpOrDie 🌊');
}

function draw() {
  background(135, 206, 235);
  switch (gm.state) {
    case GameManager.STATES.TRAINING:    drawTraining();    break;
    case GameManager.STATES.COMPETITION: drawCompetition(); break;
  }
  drawDebugInfo();
}

function _generateNewLevel() {
  const data = levelGenerator.generate(gm.config.difficulty);
  level = new Level(tileMap, data);
  // Respawner l'agent sur le sol du nouveau niveau
  if (testAgent) {
    testAgent.x  = 3 * TILE_SIZE;
    testAgent.y  = level.groundY - Agent.HEIGHT / 2;
    testAgent.vx = Agent.MOVE_SPEED;
    testAgent.vy = 0;
    testAgent.isDead     = false;
    testAgent.isOnGround = false;
  }
  console.log('[sketch] Niveau généré —', gm.config.difficulty,
    '— éléments :', data.elements.length);
}

function drawTraining() {
  const surfaces = level.getSolidSurfaces();

  // ── Mesure empirique du saut ─────────────────
  if (!testAgent.isOnGround && !testAgent.isDead) {
    if (testAgent.y < _jumpMaxY) _jumpMaxY = testAgent.y;
    _wasInAir = true;
  } else if (_wasInAir && testAgent.isOnGround) {
    _measuredH = _jumpStartY - _jumpMaxY;
    _measuredD = testAgent.x - _jumpStartX;
    _wasInAir  = false;
    console.log(`[physique] Hauteur: ${_measuredH.toFixed(1)}px | Distance: ${_measuredD.toFixed(1)}px`);
  }

  testAgent.update(surfaces);
  camera.update(testAgent);

  camera.begin();
    level.draw();
    testAgent.draw();
  camera.end();
}

function drawCompetition() {
  fill(255); noStroke();
  textSize(14); textAlign(CENTER, CENTER);
  text('🏆 Mode Compétition', CANVAS_W / 2, CANVAS_H / 2);
}

function drawDebugInfo() {
  fill(255, 255, 255, 180);
  noStroke();
  textSize(10);
  textAlign(LEFT, TOP);
  text(`FPS: ${Math.round(frameRate())}`,          8, 8);
  text(`État: ${gm.state}`,                        8, 22);
  text(`Gén: ${gm.generation} | Niv: ${gm.levelIndex}`, 8, 36);
  text(`Saut hauteur:  ${_measuredH.toFixed(0)}px`, 8, 50);
  text(`Saut distance: ${_measuredD.toFixed(0)}px`, 8, 64);
  text(`Agent X: ${testAgent.x.toFixed(1)}px`, 8, 78);
}

function mousePressed() {
  if (mouseButton === LEFT) inputManager.onClick(camera);
}

function keyPressed() {
  if (key === 't' || key === 'T') gm.setState(GameManager.STATES.TRAINING);
  if (key === 'c' || key === 'C') gm.setState(GameManager.STATES.COMPETITION);
  if (key === 'r' || key === 'R') _generateNewLevel();

  if (key === ' ') {
    if (testAgent.isOnGround) {
      _jumpStartX = testAgent.x;
      _jumpStartY = testAgent.y;
      _jumpMaxY   = testAgent.y;
    }
    testAgent.jump();
  }
}