

class Enemy {
 
  // Cadence d'animation commune (frames p5 entre chaque sprite)
  static ANIM_RATE = 8;
 
  // ── Chargement des sprites (à appeler dans preload()) ──
  // Retourne un tableau d'images p5.Image
  static loadFrames(folder, baseName, count) {
    const frames = [];
    for (let i = 1; i <= count; i++) {
      frames.push(loadImage(`assets/characters/${folder}/${baseName}${i}.png`));
    }
    return frames;
  }
 
  constructor(x, y, frames) {
    this.x      = x;
    this.y      = y;
    this.frames = frames;
 
    this._frameIndex  = 0;
    this._frameTicker = 0;
  }
 
  // ── Largeur / hauteur AABB basées sur le premier sprite ──
  get w() { return this.frames[0]?.width  ?? TILE_SIZE; }
  get h() { return this.frames[0]?.height ?? TILE_SIZE; }
 
  // ── Rectangle AABB (coin haut-gauche) ───────
  get left()   { return this.x; }
  get right()  { return this.x + this.w; }
  get top()    { return this.y; }
  get bottom() { return this.y + this.h; }
 
  // ── Avance l'animation d'une frame ──────────
  _tickAnim() {
    this._frameTicker++;
    if (this._frameTicker >= Enemy.ANIM_RATE) {
      this._frameTicker = 0;
      this._frameIndex  = (this._frameIndex + 1) % this.frames.length;
    }
  }
 
  // ── Vérifie la collision AABB avec un agent ──
  _collidesWithAgent(agent) {
    return (
      this.right  > agent.left  &&
      this.left   < agent.right &&
      this.bottom > agent.top   &&
      this.top    < agent.bottom
    );
  }
 
  // ── Interface publique ───────────────────────
  // Surchargée par les sous-classes
  update(agent) { this._tickAnim(); }
  draw()        {}
}