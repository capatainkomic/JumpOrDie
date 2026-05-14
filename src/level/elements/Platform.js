class Platform {

  /**
   * @constructor
   * @param {*} x position de la plateforme 
   * @param {*} y position de la plateforme
   * @param {*} width  largeur de la plateforme (doit être un multiple de TILE_SIZE)
   * @param {*} spriteSet  ensemble des images à utiliser pour le rendu de la plateforme 
   */
  constructor(x, y, width, spriteSet) {
    this.x = x;
    this.y = y;

    this.width = width;

    // Hauteur fixe en pixel, egale a la hauteur d'un tile
    this.height = TILE_SIZE;

    this.spriteSet = spriteSet;

  }


  get left()   { return this.x; }
  get right()  { return this.x + this.width; }
  get top()    { return this.y; }
  get bottom() { return this.y + this.height; }



  //  ──────────────── Public ──────────────────────────


  draw() {
    const cols = Math.round(this.width / TILE_SIZE);

    if (cols <= 0) return;

    if (cols === 1) {
      // Si la plateforme mesure un tile , on utilise le tile du milieu pour l'affichage de la plateforme
      image(this.spriteSet.mid, this.x, this.y, TILE_SIZE, TILE_SIZE);
      return;
    }

    // Tile gauche de la plateforme 
    image(this.spriteSet.left, this.x, this.y, TILE_SIZE, TILE_SIZE);

    // Tiles du milieu de la plateforme 
    for (let i = 1; i < cols - 1; i++) {
      image(this.spriteSet.mid, this.x + i * TILE_SIZE, this.y, TILE_SIZE, TILE_SIZE);
    }

    // Tile droit de la plateforme
    image(this.spriteSet.right,
      this.x + (cols - 1) * TILE_SIZE, this.y, TILE_SIZE, TILE_SIZE);
  }
}