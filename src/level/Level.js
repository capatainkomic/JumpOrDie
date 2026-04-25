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

    // Listes des éléments instanciés
    this.grounds     = [];  // blocs de sol { x, y, width, height }
    this.platforms   = [];  // instances Platform
    this.gaps        = [];  // trous { x, width }
    this.enemies     = [];  // à remplir Feature 3
    this.cherries    = [];  // à remplir Feature 3
    this.checkpoints = [];  // à remplir Feature 3
    this.finish      = null;

    this._build(data.elements);
  }

  // ── Construit les éléments depuis les données ─
  _build(elements) {
    for (const el of elements) {
      switch (el.type) {

        case 'ground':
          this.grounds.push({
            x     : el.x,
            y     : el.y,
            width : el.width,
            height: el.height,
          });
          break;

        case 'platform':
          this.platforms.push(
            new Platform(
              el.x, el.y, el.width,
              this.tileMap.platform
            )
          );
          break;

        case 'gap':
          this.gaps.push({ x: el.x, width: el.width });
          break;

        // Ennemis, cerises, checkpoints, finish
        // seront instanciés dans les features suivantes
        case 'enemy':
        case 'cherry':
        case 'checkpoint':
        case 'finish':
          // Stockés bruts pour l'instant
          if (el.type === 'finish') this.finish = el;
          break;
      }
    }
  }

  // ── Rendu complet du niveau ──────────────────
  // Appelé entre camera.begin() et camera.end()
  draw() {
    // 1. Sol
    for (const g of this.grounds) {
      this.tileMap.drawGround(g.x, g.y, g.width, g.height);
    }

    // 2. Plateformes flottantes
    for (const p of this.platforms) {
      p.draw();
    }

    // 3. Drapeau de fin (visuel temporaire)
    if (this.finish) {
      this._drawFinishFlag(this.finish.x, this.finish.y);
    }
  }

  // ── Drapeau de fin temporaire ────────────────
  // Sera remplacé par un sprite en mode compétition
  _drawFinishFlag(x, y) {
    stroke(255, 50, 50);
    strokeWeight(3);
    line(x, y, x, y - 60);
    noStroke();
    fill(255, 50, 50);
    triangle(x, y - 60, x + 30, y - 45, x, y - 30);
  }

  // ── Retourne toutes les surfaces solides ─────
  // Utilisé par Agent.js pour les collisions (Feature 3)
  getSolidSurfaces() {
    const surfaces = [];

    for (const g of this.grounds) {
      surfaces.push({
        left  : g.x,
        right : g.x + g.width,
        top   : g.y,
        bottom: g.y + g.height,
      });
    }

    for (const p of this.platforms) {
      surfaces.push({
        left  : p.left,
        right : p.right,
        top   : p.top,
        bottom: p.bottom,
      });
    }

    return surfaces;
  }
}