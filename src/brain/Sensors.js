// ==============================================
// Sensors.js
//
// Calcule les inputs du réseau de neurones.
// 3 blocs :
//   1. Grille spatiale (terrain devant l'agent)
//   2. Forces Reynolds (seek/avoid normalisées)
//   3. États internes (physique de l'agent)
//
// TOTAL max : 25 inputs
//   Grille 6×3    = 18  (6 colonnes dont 2 à gauche)
//   Forces        =  6  (mag + y par force)
//   États internes=  2  (isOnGround, vertSpeed)
//   vx            =  1  (toujours inclus)
// ==============================================

class Sensors {

  // Distances des colonnes de la grille (en tiles)
  // Négatives = derrière l'agent (gauche), positives = devant (droite)
  static GRID_COLS   = [-2, -1, 0, 1, 2, 4, 8]; // 6 colonnes
  static GRID_ROWS   = 3; // haut / milieu / bas

  // Hauteurs des lignes relatives au centre de l'agent
  // en pixels
  static ROW_OFFSETS = [
    -3 * 16, // ligne haute (niveau eagle)
     0,             // ligne milieu (niveau agent)
     2 * 16, // ligne basse (niveau sol)
  ];

  // ── Calcul complet des inputs ────────────────
  // Retourne un tableau de valeurs [0, 1]
  // Seuls les blocs activés dans gm.config.inputConfig
  // sont inclus — le tableau a exactement inputCount valeurs
  static compute(agent, surfaces, enemies, cherries, inputCount) {
    const cfg    = gm.config.inputConfig;
    const inputs = [];

    // ── Bloc 1 : Grille spatiale (12 inputs) ─
    if (cfg.grid) {
      for (const colT of Sensors.GRID_COLS) {
        const cellX = agent.x + colT * TILE_SIZE;
        for (const rowOffset of Sensors.ROW_OFFSETS) {
          const cellY = agent.y + rowOffset;
          inputs.push(Sensors._cellValue(cellX, cellY, surfaces));
        }
      }
    }

    // ── Bloc 2 : Forces Reynolds ─────────────
    if (cfg.avoidOpossum) {
      const opossums = enemies.filter(e => e instanceof Opossum);
      const f = agent.avoidForce(opossums);
      inputs.push(Sensors._normMag(f));
      inputs.push(Sensors._normY(f));
    }

    if (cfg.avoidEagle) {
      const eagles = enemies.filter(e => e instanceof Eagle);
      const f = agent.avoidForce(eagles);
      inputs.push(Sensors._normMag(f));
      inputs.push(Sensors._normY(f));
    }

    if (cfg.seekCherry) {
      const active = cherries.filter(c => !agent._collectedCherries.has(c.id));
      const f = agent.seekForce(active);
      inputs.push(Sensors._normMag(f));
      inputs.push(Sensors._normY(f));
    }

    // ── Bloc 3 : États internes ───────────────
    if (cfg.isOnGround) {
      inputs.push(agent.isOnGround ? 0 : 1);
    }

    if (cfg.vertSpeed) {
      inputs.push(Sensors._normVY(agent.vy));
    }

     // Vitesse horizontale — si activé
    if (cfg.horizSpeed) {
      inputs.push(constrain((agent.vx / Agent.MOVE_SPEED + 1) / 2, 0, 1));
    }
 

    return inputs; // longueur = inputCount exact
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
  // force.x encode la proximité [0, MAX_FORCE] → [0, 1]
  // 0 = absent/loin, 1 = très proche
  static _normMag(force) {
    return constrain(force.x / Agent.MAX_FORCE, 0, 1);
  }

  // ── Normalisation composante Y ───────────────
  // force.y entre -MAX_FORCE et +MAX_FORCE → [0, 1]
  // 0   = obstacle/cerise en haut (signal : sauter possible)
  // 0.5 = même niveau
  // 1   = obstacle/cerise en bas
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