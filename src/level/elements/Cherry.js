class Cherry {

  static ANIM_RATE = 6;
  static frames    = [];
  static _nextId   = 0; // compteur global pour IDs uniques

  

  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    this.id = Cherry._nextId++; 

    this._frameIndex  = 0;
    this._frameTicker = 0;
  }


  // ── AABB ─────────────────────────────────────

  get w() { return Cherry.frames[0]?.width  ?? TILE_SIZE; }
  get h() { return Cherry.frames[0]?.height ?? TILE_SIZE; }

  get left()   { return this.x - this.w / 2; }
  get right()  { return this.x + this.w / 2; }
  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }


  //  ─────────────────────────────────────────────

  static preload() {
    Cherry.frames = [];

    for (let i = 1; i <= 7; i++) {
      Cherry.frames.push(loadImage(`assets/objects/cherry/cherry-${i}.png`));
    }
  }

  //  ──────────────────── Public ────────────────────


  updateAnimation() { 
    this._tickAnim(); 
  }


  checkCollision(agent) {
    // Chaque agent a son propre Set de cerises collectées
    if (agent._collectedCherries.has(this.id)) return;

    if (this._collidesWithAgent(agent)) {
      agent._collectedCherries.add(this.id);
      agent.cherriesCollected++;
    }
  }


  draw() {
    const img = Cherry.frames[this._frameIndex];

    if (img) image(img, this.left, this.top);
  }
  

  
  //  ──────────────── Privé ───────────────────────

  //  Avance l'animation d'une frame 
  _tickAnim() {
    this._frameTicker++;

    if (this._frameTicker >= Cherry.ANIM_RATE) {
      this._frameTicker = 0;
      this._frameIndex  = (this._frameIndex + 1) % Cherry.frames.length;
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