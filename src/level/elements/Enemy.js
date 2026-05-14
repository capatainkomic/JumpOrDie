class Enemy {
 
  // Cadence d'animation 
  static ANIM_RATE = 8;
 
  
 
  constructor(x, y, frames) {
    this.x  = x;
    this.y  = y;

    this.frames = frames;
    this._frameIndex  = 0;
    this._frameTicker = 0;
  }

 
  // ── AABB ─────────────────────────────────────

  get w() {throw new Error('Enemy subclass must override get w() and get h()')}
  get h() {throw new Error('Enemy subclass must override get w() and get h()')}
 
  get left()   { return this.x; }
  get right()  { return this.x + this.w; }
  get top()    { return this.y; }
  get bottom() { return this.y + this.h; }


  //  ─────────────────────────────────────────────

  //  Chargement des sprites 
  static loadFrames(folder, baseName, count) {
    const frames = [];

    for (let i = 1; i <= count; i++) {
      frames.push(loadImage(`assets/characters/${folder}/${baseName}${i}.png`));
    }

    return frames;
  }
 

  //  ──────────────── Public ──────────────────────────

  updateMovement() {
    this._tickAnim();
  }


  checkCollision(agent) {
    if (this._collidesWithAgent(agent)) {
      agent.isDead = true;
      agent.wasHitByEnemy = true;
    } 
  }


  draw() {throw new Error('Enemy subclass must override draw()')}



  //  ──────────────── Privé ─────────────────────────────

  // ── Avance l'animation d'une frame ──────────
  _tickAnim() {
    this._frameTicker++;

    if (this._frameTicker >= Enemy.ANIM_RATE) {
      this._frameTicker = 0;
      this._frameIndex  = (this._frameIndex + 1) % this.frames.length;
    }
  }


  // Vérifie la collision AABB avec un agent 
  _collidesWithAgent(agent) {
    return (
      this.right  > agent.left  &&
      this.left   < agent.right &&
      this.bottom > agent.top   &&
      this.top    < agent.bottom
    );
  }


  
}