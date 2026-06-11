// ==============================================
// Level.js
// Responsabilité : instancier les éléments depuis les données JSON du générateur, et coordonner leur mise à jour + rendu.
// ==============================================

class Level {

  /**
   * @constructor
   * @param {*} tileMap Ensemble des tiles images utilisées pour l'affichage du ground et des plateformes
   * @param {*} data  Ensemble des données permettant de construire le niveau (ground, plateformes, gap, ennemis, cerises)
   */
  constructor(tileMap, data) {
    this.tileMap  = tileMap;
    this.length   = data.length;
    this.groundY  = data.groundY;

    this.grounds     = [];
    this.platforms   = [];
    this.gaps        = [];
    this.enemies     = [];
    this.cherries    = [];
    this.finish      = null;

    this._build(data.elements);

    // Cache des surfaces solides — calculé une fois à la construction, pas à chaque frame
    this._surfaces = this._buildSurfaces();
  }


  //  ──────────────────── Public ────────────────────
  

  // ── Met à jour les ennemis et les cerises ────
  update(agents) {
    const alive = agents.filter(a => !a.isDead);

    // Mouvement + animation — une seule fois par frame
    for (const enemy  of this.enemies)  enemy.updateMovement();
    for (const cherry of this.cherries) cherry.updateAnimation();

    // Collisions — pour chaque agent vivant
    for (const agent of alive) {
      for (const enemy  of this.enemies)  enemy.checkCollision(agent);
      for (const cherry of this.cherries) cherry.checkCollision(agent);
    }
  }


  // ── Rendu complet du niveau ──────────────────
  draw() {
    for (const g of this.grounds) {
      this.tileMap.drawGround(g.x, g.y, g.width, g.height);
    }

    for (const p of this.platforms) {
      p.draw();
    }

    for (const cherry of this.cherries) {
      cherry.draw();
    }

    for (const enemy of this.enemies) {
      enemy.draw();
    }

    if (this.finish) {
      this._drawFinishFlag(this.finish.x, this.finish.y);
    }
  }


  // ── Surfaces solides (depuis le cache) ───────
  getSolidSurfaces() {
    return this._surfaces;
  }



  //  ──────────────── Privé ─────────────────────────────

  // ── Construit les éléments depuis les données ─
  _build(elements) {
    for (const el of elements) {
      switch (el.type) {

        case 'ground':
          this.grounds.push({
            x: el.x, y: el.y,
            width: el.width, height: el.height,
          });
          break;

        case 'platform':
          this.platforms.push(
            new Platform(el.x, el.y, el.width, this.tileMap.platform)
          );
          break;

        case 'gap':
          this.gaps.push({ x: el.x, width: el.width });
          break;

        case 'eagle':
          this.enemies.push(new Eagle(el.x, el.y));
          break;

        case 'opossum':
          this.enemies.push(new Opossum(el.x, el.y, el.patrolLeft, el.patrolRight));
          break;

        case 'cherry':
          this.cherries.push(new Cherry(el.x, el.y));
          break;

        case 'finish':
          this.finish = el;
          break;
      }
    }
  }

  // ── Construit le cache des surfaces ──────────
  _buildSurfaces() {
    const grounds = this.grounds.map(g => ({
      left: g.x, right: g.x + g.width,
      top: g.y,  bottom: g.y + g.height,
    }));

    const platforms = this.platforms.map(p => ({
      left: p.left, right: p.right,
      top: p.top,   bottom: p.bottom,
    }));

    const gaps = this.gaps.map(g => ({
      x: g.x, width: g.width,
    }));

    return { grounds, platforms, gaps };
  }


  _drawFinishFlag(x, y) {
    const POLE_HEIGHT = 60;
    const FLAG_WIDTH  = 30;
    const FLAG_TOP    = y - POLE_HEIGHT;
    const FLAG_MIDDLE    = y - POLE_HEIGHT + 15;
    const FLAG_BOTTOM    = y - POLE_HEIGHT + 30;

    stroke(255, 50, 50);
    strokeWeight(3);
    line(x, y, x, FLAG_TOP);
    noStroke();
    fill(255, 50, 50);
    triangle(x, FLAG_TOP, x + FLAG_WIDTH, FLAG_MIDDLE, x, FLAG_BOTTOM);
  }


  
}