// ==============================================
// TrainingScreen.js
// Rendu du mode training et de la config
// Fonctions : _drawConfig, _drawTraining, _drawSteeringDebug
// ==============================================

function _drawConfig() {
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

  // Mise à jour panels HTML
  uiPanel.updateHUD(trainingManager.stats);
  
}

