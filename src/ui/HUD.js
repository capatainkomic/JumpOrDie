// ==============================================
// HUD.js
//
// Informations légères dessinées directement
// sur le canvas p5.js (pas dans les panels HTML)
// Les stats complètes sont dans UIPanel.updateHUD()
// ==============================================

class HUD {

  // ── Infos légères sur le canvas ──────────────
  // Appelé dans sketch._drawTraining()
  static drawCanvas(stats) {
    push();
    fill(255, 255, 255, 150);
    noStroke();
    textSize(9);
    textAlign(RIGHT, TOP);
    text(`GEN ${stats.generation}`, CANVAS_W - 8, 20);
    text(`${stats.aliveCount}/${stats.totalAgents} vivants`, CANVAS_W - 8, 32);

    // Indicateur trainingDone
    if (stats.trainingDone) {
      fill(76, 175, 80, 220);
      noStroke();
      rect(CANVAS_W/2 - 100, 8, 200, 22, 3);
      fill(255);
      textSize(9);
      textAlign(CENTER, TOP);
      text('✅ ENTRAÎNEMENT TERMINÉ !', CANVAS_W/2, 13);
    }
    pop();
  }
}