//  Dimensions du canvas  
const CANVAS_W = 800;
const CANVAS_H = 400;
const TILE_SIZE = 16;

//   Instances globales  
let camera;


function preload() {

}

function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  cnv.parent('canvas-container');

  // Initialiser la caméra
  camera = new Camera(CANVAS_W, CANVAS_H);

  // Frame rate cible
  frameRate(60);

  console.log('[sketch] Setup terminé — JumpOrDie 🌊');
  console.log('[sketch] État initial :', gm.state);
}

function draw() {
  background(135, 206, 235); // ciel bleu temporaire


  //   Dispatcher selon l'état du jeu 
  switch (gm.state) {
    case GameManager.STATES.TRAINING:
      drawTraining();
      break;
    case GameManager.STATES.COMPETITION:
      drawCompetition();
      break;
  }

  //   Debug temporaire 
  drawDebugInfo();
}





//  Boucle entraînement  
function drawTraining() {
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text('🌊 Mode Entraînement — Feature 1 OK', CANVAS_W / 2, CANVAS_H / 2);
}

//  Boucle compétition  
function drawCompetition() {
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text('🏆 Mode Compétition', CANVAS_W / 2, CANVAS_H / 2);
}






//  Debug info (coin haut gauche) 
function drawDebugInfo() {
  fill(255, 255, 255, 180);
  noStroke();
  textSize(10);
  textAlign(LEFT, TOP);
  text(`FPS: ${Math.round(frameRate())}`, 8, 8);
  text(`État: ${gm.state}`, 8, 22);
  text(`Gén: ${gm.generation} | Niv: ${gm.levelIndex}`, 8, 36);
}









function mousePressed() {
  if (mouseButton === LEFT) {
    inputManager.onClick(camera);
  }
}

function keyPressed() {
  // T → passer en mode Training
  if (key === 't' || key === 'T') {
    gm.setState(GameManager.STATES.TRAINING);
  }
  // C → passer en mode Competition
  if (key === 'c' || key === 'C') {
    gm.setState(GameManager.STATES.COMPETITION);
  }
}