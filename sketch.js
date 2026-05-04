// ==============================================
// sketch.js
// Point d'entrée p5.js — setup() + draw()
// Délègue toute la logique à TrainingManager
// ==============================================

const CANVAS_W = 800;
const CANVAS_H = 400;
const TILE_SIZE = 16;

let camera;
let tileMap;
let levelGenerator;
let trainingManager;

// ── Debug physique (temporaire) ───────────────
const PhysicsDebug = {
  jumpStartX: 0, jumpStartY: 0, jumpMaxY: 0,
  wasInAir: false, measuredH: 0, measuredD: 0,

  onJumpStart(agent) {
    this.jumpStartX = agent.x;
    this.jumpStartY = agent.y;
    this.jumpMaxY   = agent.y;
  },

  update(agent) {
    if (!agent || agent.isDead) return;
    if (!agent.isOnGround) {
      if (agent.y < this.jumpMaxY) this.jumpMaxY = agent.y;
      this.wasInAir = true;
    } else if (this.wasInAir) {
      this.measuredH = this.jumpStartY - this.jumpMaxY;
      this.measuredD = agent.x - this.jumpStartX;
      this.wasInAir  = false;
    }
  },

  draw() {
    text(`H: ${this.measuredH.toFixed(0)}px`, 8, 92);
    text(`D: ${this.measuredD.toFixed(0)}px`, 8, 106);
  },
};

// ── Preload ───────────────────────────────────
function preload() {
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
  trainingManager = new TrainingManager(tileMap, levelGenerator);

  frameRate(60);
  console.log('[sketch] Setup — JumpOrDie 🌊');
}

// ── Draw ──────────────────────────────────────
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

// ── Mode entraînement ─────────────────────────
function drawTraining() {
  trainingManager.update();
  trainingManager.draw(camera);
  PhysicsDebug.update(trainingManager.population.bestAgent);
}

// ── Mode compétition ──────────────────────────
function drawCompetition() {
  fill(255); noStroke();
  textSize(14); textAlign(CENTER, CENTER);
  text('🏆 Mode Compétition', CANVAS_W / 2, CANVAS_H / 2);
}

// ── Debug info ────────────────────────────────
function drawDebugInfo() {
  const s = trainingManager.stats;
  fill(255, 255, 255, 180);
  noStroke();
  textSize(10);
  textAlign(LEFT, TOP);
  text(`FPS: ${Math.round(frameRate())}`,              8,  8);
  text(`État: ${gm.state}`,                            8, 22);
  text(`Gén: ${s.generation} | Niv: ${s.levelIndex}`, 8, 36);
  text(`Vivants: ${s.aliveCount}/${s.totalAgents}`,    8, 50);
  text(`Best fitness: ${s.bestFitness.toFixed(0)}`,    8, 64);
  text(`Difficulté: ${s.difficulty}`,                  8, 78);
  PhysicsDebug.draw();
}

// ── Inputs ────────────────────────────────────
function mousePressed() {
  if (mouseButton === LEFT) inputManager.onClick(camera);
}

function keyPressed() {
  if (key === 't' || key === 'T') gm.setState(GameManager.STATES.TRAINING);
  if (key === 'c' || key === 'C') gm.setState(GameManager.STATES.COMPETITION);
  // R → reset complet de l'entraînement
  if (key === 'r' || key === 'R') {
    gm.reset();
    trainingManager = new TrainingManager(tileMap, levelGenerator);
  }
}