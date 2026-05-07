// ==============================================
// TrainingScreen.js
// Rendu du mode training et de la config
// Fonctions : _drawConfig, _drawTraining, _drawSteeringDebug
// ==============================================

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