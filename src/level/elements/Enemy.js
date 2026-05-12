// ==============================================
// Enemy.js
//
// Classe de base Enemy + sous-classes :
//   Eagle   → statique sur plateforme, animation battement d'ailes
//   Opossum → patrouille sur sa section de ground (path following)
//
// Chargement des sprites :
//   assets/characters/eagle/eagle-attack-1.png  .. eagle-attack-4.png
//   assets/characters/opossum/opossum-1.png     .. opossum-6.png
//
// Collision AABB avec un Agent → agent.isDead = true
// ==============================================
 
class Enemy {
 
  // Cadence d'animation commune (frames p5 entre chaque sprite)
  static ANIM_RATE = 8;
 
  // ── Chargement des sprites (à appeler dans preload()) ──
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
 
  // ── Largeur / hauteur AABB ───────────────────
  // Surchargées par les sous-classes via SPRITE_W/H
  // pour éviter de dépendre du chargement async des images
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
 

  updateMovement() {
    this._tickAnim();
  }

  _checkCollision(agent) {
    if (this._collidesWithAgent(agent)) {
      agent.isDead = true;
      agent.wasHitByEnemy = true;
    } 
  }

  // Gardé pour compatibilité si appelé directement
  update(agent) {
    this.updateMovement();
    this._checkCollision(agent);
  }

  draw() {}
}