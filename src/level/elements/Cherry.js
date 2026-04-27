// ==============================================
// Cherry.js
//
// Collectible animé — séquence :
//   assets/objects/cherry/cherry-1.png .. cherry-7.png
//
// Collision AABB avec un Agent → collectée, score++
// ==============================================

class Cherry {

  static ANIM_RATE = 6; // frames p5 entre chaque sprite

  // frames : Cherry.frames (chargés via preload)
  static frames = [];

  static preload() {
    Cherry.frames = [];
    for (let i = 1; i <= 7; i++) {
      Cherry.frames.push(loadImage(`assets/objects/cherry/cherry-${i}.png`));
    }
  }

  // x, y = centre du collectible (cohérent avec le placement dans LevelGenerator)
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.collected    = false;
    this._frameIndex  = 0;
    this._frameTicker = 0;
  }

  // ── Dimensions AABB basées sur le premier sprite ──
  get w() { return Cherry.frames[0]?.width  ?? TILE_SIZE; }
  get h() { return Cherry.frames[0]?.height ?? TILE_SIZE; }

  // ── Rectangle AABB (centré sur x, y) ────────
  get left()   { return this.x - this.w / 2; }
  get right()  { return this.x + this.w / 2; }
  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }

  // ── Update : animation + détection collecte ──
  // score : objet { value: Number } passé par référence depuis sketch.js
  update(agent, score) {
    if (this.collected) return;

    this._tickAnim();

    if (this._collidesWithAgent(agent)) {
      this.collected = true;
      score.value++;
    }
  }

  // ── Rendu ────────────────────────────────────
  draw() {
    if (this.collected) return;

    const img = Cherry.frames[this._frameIndex];
    if (img) image(img, this.left, this.top);
  }

  // ── Privé ────────────────────────────────────
  _tickAnim() {
    this._frameTicker++;
    if (this._frameTicker >= Cherry.ANIM_RATE) {
      this._frameTicker = 0;
      this._frameIndex  = (this._frameIndex + 1) % Cherry.frames.length;
    }
  }

  _collidesWithAgent(agent) {
    return (
      this.right  > agent.left  &&
      this.left   < agent.right &&
      this.bottom > agent.top   &&
      this.top    < agent.bottom
    );
  }
}