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

// ── Debug physique (temporaire — à supprimer après Feature 4) ──
const PhysicsDebug = {
  jumpStartX : 0,
  jumpStartY : 0,
  jumpMaxY   : 0,
  wasInAir   : false,
  measuredH  : 0,
  measuredD  : 0,

  onJumpStart(agent) {
    this.jumpStartX = agent.x;
    this.jumpStartY = agent.y;
    this.jumpMaxY   = agent.y;
  },

  update(agent) {
    if (!agent.isOnGround && !agent.isDead) {
      if (agent.y < this.jumpMaxY) this.jumpMaxY = agent.y;
      this.wasInAir = true;
    } else if (this.wasInAir && agent.isOnGround) {
      this.measuredH = this.jumpStartY - this.jumpMaxY;
      this.measuredD = agent.x - this.jumpStartX;
      this.wasInAir  = false;
      console.log(`[physique] H: ${this.measuredH.toFixed(1)}px | D: ${this.measuredD.toFixed(1)}px`);
    }
  },

  draw() {
    fill(255, 255, 255, 180);
    noStroke();
    textSize(10);
    textAlign(LEFT, TOP);
    text(`Saut hauteur:  ${this.measuredH.toFixed(0)}px`, 8, 50);
    text(`Saut distance: ${this.measuredD.toFixed(0)}px`, 8, 64);
  },
};

let score = { value: 0 };

function preload() {
  tileMap = new TileMap();
  tileMap.preload();


  Eagle.preload();
  Opossum.preload();
  Cherry.preload();
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

  PhysicsDebug.update(testAgent);

  level.update(testAgent, score);
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
  text(`FPS: ${Math.round(frameRate())}`,               8, 8);
  text(`État: ${gm.state}`,                             8, 22);
  text(`Gén: ${gm.generation} | Niv: ${gm.levelIndex}`,8, 36);
  text(`Agent X: ${testAgent.x.toFixed(1)}px`,          8, 78);
  PhysicsDebug.draw();
}

function mousePressed() {
  if (mouseButton === LEFT) inputManager.onClick(camera);
}

function keyPressed() {
  if (key === 't' || key === 'T') gm.setState(GameManager.STATES.TRAINING);
  if (key === 'c' || key === 'C') gm.setState(GameManager.STATES.COMPETITION);
  if (key === 'r' || key === 'R') _generateNewLevel();

  if (key === ' ') {
    if (testAgent.isOnGround) PhysicsDebug.onJumpStart(testAgent);
    testAgent.jump();
  }
}