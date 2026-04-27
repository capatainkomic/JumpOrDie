// ==============================================
// Level.js
// Responsabilité : instancier les éléments
// depuis les données JSON du générateur,
// et coordonner leur mise à jour + rendu.
// ==============================================

class Level {

  // tileMap  : instance de TileMap (tiles chargées)
  // data     : objet retourné par LevelGenerator.generate()
  constructor(tileMap, data) {
    this.tileMap  = tileMap;
    this.data     = data;
    this.length   = data.length;
    this.groundY  = data.groundY;

    this.grounds     = [];
    this.platforms   = [];
    this.gaps        = [];
    this.enemies     = [];
    this.cherries    = [];
    this.finish      = null;

    this._build(data.elements);

    // Cache des surfaces solides — calculé une fois
    // à la construction, pas à chaque frame
    this._surfaces = this._buildSurfaces();
  }

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

  // ── Met à jour les ennemis et les cerises ────
  // agent : Agent actif, score : { value: Number }
  update(agent, score) {
    for (const enemy of this.enemies) {
      enemy.update(agent);
    }
    for (const cherry of this.cherries) {
      cherry.update(agent, score);
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

  // ── Drapeau de fin temporaire ────────────────
  _drawFinishFlag(x, y) {
    stroke(255, 50, 50);
    strokeWeight(3);
    line(x, y, x, y - 60);
    noStroke();
    fill(255, 50, 50);
    triangle(x, y - 60, x + 30, y - 45, x, y - 30);
  }

  // ── Surfaces solides (depuis le cache) ───────
  // Appelé 60x/seconde — retourne le cache calculé
  // une seule fois à la construction du niveau
  getSolidSurfaces() {
    return this._surfaces;
  }

  // ── Construit le cache des surfaces ──────────
  // Appelé une seule fois dans le constructor
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
}