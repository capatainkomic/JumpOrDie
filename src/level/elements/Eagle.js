class Eagle extends Enemy {
 
  static SPRITE_W = 40;
  static SPRITE_H = 41;
 
  static frames = [];
 


  constructor(x, y) {
    super(x, y, Eagle.frames);
  }


  get w() { return Eagle.SPRITE_W; }
  get h() { return Eagle.SPRITE_H; }
 

  //  ─────────────────────────────────────────────

  static preload() {
    Eagle.frames = Enemy.loadFrames('eagle', 'eagle-attack-', 4);
  }


  //  ──────────────── Public ──────────────────────────

  
  updateMovement() {
    super.updateMovement();
  }

 
  draw() {
    const img = this.frames[this._frameIndex];

    if (img) image(img, this.x, this.y);
  }
}