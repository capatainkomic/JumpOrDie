// ==============================================
// Platform.js
// Représente une plateforme dans le niveau.
// Responsabilité : stocker position/taille
// et se dessiner avec les bons tiles.
// ==============================================

class Platform {

  // tiles : objet { left, mid, right } contenant
  //         les images p5.js chargées dans preload()
  constructor(x, y, width, tiles) {
    // Position monde (coin top-left de la plateforme)
    this.x = x;
    this.y = y;

    // Largeur en pixels — toujours multiple de TILE_SIZE
    this.width = width;

    // Hauteur fixe = 1 tile (plateformes fines style Mario)
    this.height = TILE_SIZE;

    // Tiles visuels
    this.tiles = tiles;

    // AABB pour les collisions (Feature 3)
    this.left   = this.x;
    this.right  = this.x + this.width;
    this.top    = this.y;
    this.bottom = this.y + this.height;
  }

  // ── Rendu ────────────────────────────────────
  draw() {
    const t = TILE_SIZE;
    const cols = Math.round(this.width / t);

    if (cols <= 0) return;

    if (cols === 1) {
      // Plateforme d'1 seul tile : on utilise mid
      image(this.tiles.mid, this.x, this.y, t, t);
      return;
    }

    // Tile gauche
    image(this.tiles.left, this.x, this.y, t, t);

    // Tiles du milieu
    for (let i = 1; i < cols - 1; i++) {
      image(this.tiles.mid, this.x + i * t, this.y, t, t);
    }

    // Tile droit
    image(this.tiles.right,
      this.x + (cols - 1) * t, this.y, t, t);
  }
}