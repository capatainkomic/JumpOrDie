// ==============================================
// Agent.js
//
// Physique AABB complète :
// - On calcule le rectangle futur après mouvement
// - Pour chaque solide on résout par la plus
//   petite pénétration (overlapX vs overlapY)
//
// TYPES DE SURFACES :
//   ground   → résolution complète (haut/côté/bas)
//              côté en bord de gap → mort
//   platform → résolution complète (haut/côté/bas)
//              côté en bord de gap → pas mort (bloque)
//   gap      → mort si y > CANVAS_H
// ==============================================

class Agent {

  static GRAVITY    =  0.6;
  static JUMP_FORCE = -12;
  static MOVE_SPEED =  3.1;
  static WIDTH      =  14; // doit être < TILE_SIZE
  static HEIGHT     =  20; // doit être < TILE_SIZE * 2

  // Valeurs empiriques mesurées
  static MAX_JUMP_HEIGHT   = 100;
  static MAX_JUMP_DISTANCE =  85;

  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.col = col;

    this.vx = Agent.MOVE_SPEED;
    this.vy = 0;

    this.isOnGround = false;
    this.isDead     = false;

    // Cerveau — assigné par Population en Feature 5
    // null = agent contrôlé manuellement (test)
    this.brain = null;

    this.fitness           = 0;
    this._startX           = x;
    this.distanceTravelled = 0;
  }

  // ── Décision du cerveau ──────────────────────
  // Appelé avant update() par Population (Feature 5)
  // inputs : tableau normalisé [0,1] calculé par Sensors
  decide(inputs) {
    if (!this.brain) return;

    const output = this.brain.forward(inputs);

    // output[0] > 0.5 → sauter
    if (output[0] > 0.5) this.jump();
  }


  // ── AABB helpers ─────────────────────────────
  get left()   { return this.x - Agent.WIDTH  / 2; }
  get right()  { return this.x + Agent.WIDTH  / 2; }
  get top()    { return this.y - Agent.HEIGHT / 2; }
  get bottom() { return this.y + Agent.HEIGHT / 2; }

  // ── Update principal ─────────────────────────
  // surfaces : { grounds: [], platforms: [], gaps: [] }
  update(surfaces) {
    if (this.isDead) return;

    // 1. Appliquer gravité
    this.vy += Agent.GRAVITY;

    // 2. Calculer déplacement ce frame
    const dx = this.vx;
    const dy = this.vy;

    // 3. Résoudre les collisions avec déplacement continu
    //    On sépare X et Y pour éviter les coins
    this._moveX(dx, surfaces);
    this._moveY(dy, surfaces);

    // 4. Mort si tombe hors canvas
    if (this.y > CANVAS_H + 50) {
      this.isDead = true;
    }

    // Distance réelle depuis le point de spawn
    this.distanceTravelled = this.x - this._startX;
  }

  // ── Déplacement horizontal + collisions ──────
  _moveX(dx, surfaces) {
    // Toujours restaurer la vitesse horizontale
    // Si un mur est toujours là, la collision le bloquera à nouveau
    this.vx = Agent.MOVE_SPEED;
    this.x += this.vx;

    const hw = Agent.WIDTH / 2;

    // Tester grounds
    for (const g of surfaces.grounds) {
      if (!this._overlapRect(g)) continue;

      const overlapLeft  = this.right  - g.left;
      const overlapRight = g.right - this.left;

      // Vient de la gauche → pousse vers la gauche
      if (overlapLeft < overlapRight) {
        // Vérifier si c'est un bord de gap
        const atGapEdge = surfaces.gaps.some(gap =>
          Math.abs((gap.x + gap.width) - g.left) < 4
        );
        if (atGapEdge) {
          this.isDead = true;
          return;
        }
        this.x = g.left - hw;
        // pas besoin de vx=0 car vx est restauré au début de chaque frame
      }
    }

    // Tester platforms
    for (const p of surfaces.platforms) {
      if (!this._overlapRect(p)) continue;

      const overlapLeft = this.right - p.left;
      const overlapRight = p.right - this.left;

      if (overlapLeft < overlapRight) {
        this.x = p.left - hw;
        // pas besoin de vx=0 car vx est restauré au début de chaque frame
      }
    }
  }

  // ── Déplacement vertical + collisions ────────
  _moveY(dy, surfaces) {
    this.y += dy;

    const hh = Agent.HEIGHT / 2;

    this.isOnGround = false;

    // Tester grounds
    for (const g of surfaces.grounds) {
      if (!this._overlapRect(g)) continue;

      const overlapTop    = this.bottom - g.top;
      const overlapBottom = g.bottom+2 - this.top;

      if (overlapTop < overlapBottom) {
        // Atterrissage par le haut
        this.y          = g.top - hh;
        this.vy         = 0;
        this.isOnGround = true;
      } else {
        // Collision par le bas (plafond)
        this.y  = g.bottom + hh;
        this.vy = 0;
      }
    }

    // Tester platforms
    for (const p of surfaces.platforms) {
      if (!this._overlapRect(p)) continue;

      const overlapTop    = this.bottom - p.top;
      const overlapBottom = p.bottom+2 - this.top;

      if (overlapTop < overlapBottom && dy >= 0) {
        // Atterrissage par le haut uniquement si on descend
        this.y          = p.top - hh;
        this.vy         = 0;
        this.isOnGround = true;
      } else if (overlapBottom < overlapTop && dy < 0) {
        // Plafond
        this.y  = p.bottom + hh;
        this.vy = 0;
      }
    }
  }

  // ── Test overlap AABB ────────────────────────
  _overlapRect(rect) {
    return (
      this.right  > rect.left  &&
      this.left   < rect.right &&
      this.bottom > rect.top   &&
      this.top    < rect.bottom
    );
  }

  // ── Saut ─────────────────────────────────────
  jump() {
    if (!this.isOnGround) return;
    this.vy         = Agent.JUMP_FORCE;
    this.isOnGround = false;
  }

  // ── Rendu ────────────────────────────────────
  draw() {
    const alpha = this.isDead ? 60 : 255;
    push();
    fill(red(this.col), green(this.col), blue(this.col), alpha);
    noStroke();
    // Point d'amélioration 
    ellipse(floor(this.x), floor(this.y), Agent.WIDTH, Agent.HEIGHT);
    if (!this.isDead) {
      fill(255, alpha);
      ellipse(this.x + 3, this.y - 4, 4, 4);
      fill(0, alpha);
      ellipse(this.x + 4, this.y - 4, 2, 2);
    }
    pop();
  }
}