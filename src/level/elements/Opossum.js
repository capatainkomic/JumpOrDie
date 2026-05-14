class Opossum extends Enemy {
 
  static SPEED    = 1.5;
  static SPRITE_W = 36;
  static SPRITE_H = 28;
 
  static frames = [];
 


  constructor(x, y, patrolLeft, patrolRight) {
    super(x, y, Opossum.frames);
 
    this.patrolLeft  = patrolLeft;
    this.patrolRight = patrolRight;
 
    // Direction initiale vers la gauche
    this._dir = -1;
  }


  get w() { return Opossum.SPRITE_W; }
  get h() { return Opossum.SPRITE_H; }


  //  ─────────────────────────────────────────────

  static preload() {
    Opossum.frames = Enemy.loadFrames('opossum', 'opossum-', 6);
  }


  //  ──────────────── Public ──────────────────────────

 
  updateMovement() {
    super.updateMovement();
    this._move();
  }


  draw() {
    const img = this.frames[this._frameIndex];
    if (!img) return;
 
    push();

    // Gestion de l'orientation du sprite selon la direction de déplacement
    if (this._dir === 1) {
      translate(this.x + this.w, this.y);
      scale(-1, 1);
      image(img, 0, 0);
    } else {
      image(img, this.x, this.y);
    }

    pop();
  }


  //  ──────────────── Privé ─────────────────────────────

 
  _move() {
    this.x += Opossum.SPEED * this._dir;
 
    // patrouille entre 2 limites 
    if (this.x <= this.patrolLeft) {
      this.x   = this.patrolLeft;
      this._dir = 1;
    } else if (this.x + this.w >= this.patrolRight) {
      this.x   = this.patrolRight - this.w;
      this._dir = -1;
    }
  }
 

  
}