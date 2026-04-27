// ==============================================
// TileMap.js
// Responsabilité UNIQUE : charger les images
// de tiles et les exposer aux autres classes.
// C'est le seul fichier qui connaît les chemins
// des assets ground.
// ==============================================

class TileMap {

  constructor() {
    this.ground  = null; 
    this.platform = null; 
  }


  preload() {
    const path = 'assets/ground tileset/';

    // ── Sol principal (9 tiles) ──────────────
    this.ground = {
      topLeft     : loadImage(path + 'ground_top_left_tile.png'),
      topMid      : loadImage(path + 'ground_top_middle_tile.png'),
      topRight    : loadImage(path + 'ground_top_right_tile.png'),
      midLeft     : loadImage(path + 'ground_middle_left_tile.png'),
      midMid      : loadImage(path + 'ground_middle_middle_tile.png'),
      midRight    : loadImage(path + 'ground_middle_right_tile.png'),
      botLeft     : loadImage(path + 'ground_bottom_left_tile.png'),
      botMid      : loadImage(path + 'ground_bottom_middle_tile.png'),
      botRight    : loadImage(path + 'ground_bottom_right_tile.png'),
    };

    // ── Plateformes flottantes ───────────────
    this.platform = {
      left  : loadImage(path + 'ground_platform_left_tile.png'),
      mid   : loadImage(path + 'ground_platform_middle_tile.png'),
      right : loadImage(path + 'ground_platform_right_tile.png'),
    };
  }

  // ── Dessine un bloc de sol complet ──────────
  // x, y     : position monde du coin top-left
  // widthPx  : largeur en pixels
  // heightPx : hauteur en pixels
  // Les deux doivent être multiples de TILE_SIZE
  drawGround(x, y, widthPx, heightPx) {
    const t    = TILE_SIZE;
    const cols = Math.round(widthPx  / t);
    const rows = Math.round(heightPx / t);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = this._getGroundTile(col, row, cols, rows);
        image(tile, x + col * t, y + row * t, t, t);
      }
    }
  }

  // ── Choisit le bon tile selon position ──────
  _getGroundTile(col, row, cols, rows) {
    const isTop    = row === 0;
    const isBottom = row === rows - 1;
    const isLeft   = col === 0;
    const isRight  = col === cols - 1;

    const g = this.ground;

    if (isTop    && isLeft)  return g.topLeft;
    if (isTop    && isRight) return g.topRight;
    if (isTop)               return g.topMid;
    if (isBottom && isLeft)  return g.botLeft;
    if (isBottom && isRight) return g.botRight;
    if (isBottom)            return g.botMid;
    if (isLeft)              return g.midLeft;
    if (isRight)             return g.midRight;
    return g.midMid;
  }
}