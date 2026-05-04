// ==============================================
// Eagle — statique sur plateforme
// ==============================================
class Eagle extends Enemy {
 
  static SPRITE_W = 40;
  static SPRITE_H = 41;
 
  // frames : Eagle.frames (chargés via preload)
  static frames = [];
 
  static preload() {
    Eagle.frames = Enemy.loadFrames('eagle', 'eagle-attack-', 4);
  }
 
  // AABB basée sur les constantes — pas sur le chargement async
  get w() { return Eagle.SPRITE_W; }
  get h() { return Eagle.SPRITE_H; }

  constructor(x, y) {
    // x, y = coin haut-gauche de la plateforme sur laquelle il est posé.
    // On ajuste y pour que le bas de l'aigle soit aligné avec le dessus de la plateforme.
    super(x, y, Eagle.frames);
  }
 
  _checkCollision(agent) {
    if (this._collidesWithAgent(agent)) agent.isDead = true;
  }
 
  draw() {
    const img = this.frames[this._frameIndex];
    if (img) image(img, this.x, this.y);
  }
}