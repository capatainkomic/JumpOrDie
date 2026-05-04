// ==============================================
// Sensors.js
//
// Calcule les inputs du réseau de neurones.
// 3 blocs :
//   1. Grille spatiale (terrain devant l'agent)
//   2. Forces Reynolds (seek/avoid normalisées)
//   3. États internes (physique de l'agent)
//
// TOTAL : 20 inputs
//   Grille 4×3    = 12
//   Forces        =  6 (mag + y par force)
//   États internes=  2
// ==============================================

class Sensors {

  // Distances des colonnes de la grille (en tiles)
  static GRID_COLS   = [1, 2, 4, 8];
  static GRID_ROWS   = 3; // haut / milieu / bas

  // Hauteurs des lignes relatives au centre de l'agent
  // en pixels
  static ROW_OFFSETS = [
    -3 * 16, // ligne haute (niveau eagle)
     0,             // ligne milieu (niveau agent)
     2 * 16, // ligne basse (niveau sol)
  ];

  // ── Calcul complet des inputs ────────────────
  // Retourne un tableau de inputCount valeurs [0, 1]
  static compute(agent, surfaces, enemies, cherries, inputCount) {
    const inputs = [];

    // ── Bloc 1 : Grille spatiale ─────────────
    for (const colT of Sensors.GRID_COLS) {
      const cellX = agent.x + colT * TILE_SIZE;

      for (const rowOffset of Sensors.ROW_OFFSETS) {
        const cellY = agent.y + rowOffset;
        inputs.push(Sensors._cellValue(cellX, cellY, surfaces));
      }
    }

    // ── Bloc 2 : Forces Reynolds ─────────────
    // Opossums (ennemis sol)
    const opossums = enemies.filter(e => e instanceof Opossum);
    const fOpossum = agent.avoidForce(opossums);
    inputs.push(Sensors._normMag(fOpossum));
    inputs.push(Sensors._normY(fOpossum));

    // Eagles (ennemis aériens)
    const eagles = enemies.filter(e => e instanceof Eagle);
    const fEagle = agent.avoidForce(eagles);
    inputs.push(Sensors._normMag(fEagle));
    inputs.push(Sensors._normY(fEagle));

    // Seek cherry — seulement celles non collectées
    const activeCherries = cherries.filter(c => !c.collected);
    const fCherry = agent.seekForce(activeCherries);
    inputs.push(Sensors._normMag(fCherry));
    inputs.push(Sensors._normY(fCherry));

    // ── Bloc 3 : États internes ───────────────
    inputs.push(agent.isOnGround ? 0 : 1);
    inputs.push(Sensors._normVY(agent.vy));

    // Retourner les inputCount premiers
    return inputs.slice(0, inputCount);
  }

  // ── Valeur d'une cellule de la grille ────────
  // 1.0 = sol ou plateforme présent
  // 0.0 = vide / gap
  static _cellValue(x, y, surfaces) {
    // Vérifier grounds
    for (const g of surfaces.grounds) {
      if (x >= g.left && x <= g.right &&
          y >= g.top  && y <= g.bottom) {
        return 1.0;
      }
    }
    // Vérifier platforms
    for (const p of surfaces.platforms) {
      if (x >= p.left && x <= p.right &&
          y >= p.top  && y <= p.bottom) {
        return 1.0;
      }
    }
    return 0.0;
  }

  // ── Normalisation magnitude ──────────────────
  // force.mag() / MAX_FORCE → [0, 1]
  static _normMag(force) {
    return constrain(force.mag() / Agent.MAX_FORCE, 0, 1);
  }

  // ── Normalisation composante Y ───────────────
  // force.y entre -MAX_FORCE et +MAX_FORCE → [0, 1]
  // 0.5 = neutre, <0.5 = vers le haut, >0.5 = vers le bas
  static _normY(force) {
    return constrain(
      (force.y + Agent.MAX_FORCE) / (2 * Agent.MAX_FORCE),
      0, 1
    );
  }

  // ── Normalisation vitesse verticale ──────────
  // vy entre -15 et +15 → [0, 1]
  // 0.5 = immobile, <0.5 = monte, >0.5 = descend
  static _normVY(vy) {
    return constrain((vy + 15) / 30, 0, 1);
  }
}