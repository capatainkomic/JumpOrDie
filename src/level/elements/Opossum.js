
// ==============================================
// Opossum — patrouille sur sa section de ground
// ==============================================
class Opossum extends Enemy {
 
  static SPEED    = 1.5;
  static SPRITE_W = 36;
  static SPRITE_H = 28;
 
  // frames : Opossum.frames (chargés via preload)
  static frames = [];
 
  static preload() {
    Opossum.frames = Enemy.loadFrames('opossum', 'opossum-', 6);
  }
 
  // patrolLeft / patrolRight : bornes X de la patrouille en pixels
  constructor(x, y, patrolLeft, patrolRight) {
    super(x, y, Opossum.frames);
 
    this.patrolLeft  = patrolLeft;
    this.patrolRight = patrolRight;
 
    // Les sprites regardent vers la gauche → direction initiale : gauche
    this._dir = -1;
  }
 
  update(agent) {
    this._tickAnim();
    this._move();
 
    if (this._collidesWithAgent(agent)) {
      agent.isDead = true;
    }
  }
 
  _move() {
    this.x += Opossum.SPEED * this._dir;
 
    // Demi-tour aux bornes de patrouille
    if (this.x <= this.patrolLeft) {
      this.x   = this.patrolLeft;
      this._dir = 1;
    } else if (this.x + this.w >= this.patrolRight) {
      this.x   = this.patrolRight - this.w;
      this._dir = -1;
    }
  }
 
  draw() {
    const img = this.frames[this._frameIndex];
    if (!img) return;
 
    push();
    if (this._dir === 1) {
      // Sprite regarde gauche → flip horizontal pour regarder droite
      translate(this.x + this.w, this.y);
      scale(-1, 1);
      image(img, 0, 0);
    } else {
      image(img, this.x, this.y);
    }
    pop();
  }
}