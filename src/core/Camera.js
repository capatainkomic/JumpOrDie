// ==============================================
// Camera.js
// Gère le scroll horizontal du niveau
// La caméra suit le meilleur agent vivant
// ==============================================

class Camera {

  constructor(canvasWidth, canvasHeight) {
    this.canvasW = canvasWidth;
    this.canvasH = canvasHeight;

    // Position monde de la caméra (coin top-left)
    this.x = 0;
    this.y = 0;

    // Lerp — fluidité du suivi (0 = instantané, 1 = jamais)
    this.lerpFactor = 0.08;

    // Offset horizontal : l'agent cible est affiché
    // au 1/3 gauche du canvas
    this.targetOffsetX = canvasWidth * 0.33;
  }

  // ── Mise à jour — suit la cible ─────────────
  // target : objet avec une propriété x (position monde)
  update(target) {
    if (!target) return;

    const desiredX = target.x - this.targetOffsetX;
    // Lerp vers la position désirée
    this.x += (desiredX - this.x) * this.lerpFactor;

    // Ne pas aller en dessous de 0 (début du niveau)
    this.x = max(0, this.x);
  }

  // ── Applique la transformation au canvas ────
  begin() {
    push();
    translate(-this.x, -this.y);
  }

  // ── Fin de la transformation ─────────────────
  end() {
    pop();
  }

  // ── Conversion coordonnées écran → monde ────
  screenToWorld(sx, sy) {
    return {
      x: sx + this.x,
      y: sy + this.y,
    };
  }

  // ── Conversion coordonnées monde → écran ────
  worldToScreen(wx, wy) {
    return {
      x: wx - this.x,
      y: wy - this.y,
    };
  }

  // ── Vérifie si un objet monde est visible ───
  isVisible(worldX, margin = 100) {
    return (
      worldX > this.x - margin &&
      worldX < this.x + this.canvasW + margin
    );
  }

  // ── Reset ────────────────────────────────────
  reset() {
    this.x = 0;
    this.y = 0;
  }
}