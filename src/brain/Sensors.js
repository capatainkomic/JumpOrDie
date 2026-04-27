// ==============================================
// Sensors.js
//
// Calcule les inputs du réseau de neurones
// à partir de l'état courant de l'agent et du niveau.
//
// TOUS les inputs sont normalisés entre 0 et 1.
// Le réseau ne doit jamais recevoir de valeurs brutes.
//
// INPUTS (jusqu'à 8 selon le curseur inputCount) :
//   0. distance ennemi devant       (normalisé / SENSOR_RANGE)
//   1. distance gap devant          (normalisé / SENSOR_RANGE)
//   2. largeur du gap devant        (normalisé / MAX_GAP_W)
//   3. est en l'air ?               (0 ou 1)
//   4. vitesse verticale            (normalisé / MAX_VY)
//   5. distance prochaine cerise    (normalisé / SENSOR_RANGE)
//   6. hauteur sol devant           (normalisé / CANVAS_H)
//   7. vitesse horizontale          (normalisé / MAX_VX)
// ==============================================

class Sensors {

  // Distances de référence pour la normalisation
  static SENSOR_RANGE = 300; // px — distance max de détection
  static MAX_GAP_W    = 300; // px — largeur max d'un gap
  static MAX_VY       =  15; // px/frame — vitesse verticale max
  static MAX_VX       =   5; // px/frame — vitesse horizontale max

  // ── Calcule les inputs pour un agent ─────────
  // agent      : instance Agent
  // surfaces   : { grounds, platforms, gaps }
  // cherries   : tableau de Cherry depuis Level
  // enemies    : tableau d'Enemy depuis Level
  // inputCount : nombre d'inputs actifs (curseur UI)
  //
  // Retourne un tableau de inputCount valeurs [0, 1]
  static compute(agent, surfaces, cherries, enemies, inputCount) {
    const all = [
      Sensors._enemyAhead(agent, enemies),
      Sensors._gapAhead(agent, surfaces.gaps),
      Sensors._gapWidth(agent, surfaces.gaps),
      agent.isOnGround ? 0 : 1,
      Sensors._normalizeVY(agent.vy),
      Sensors._cherryAhead(agent, cherries),
      Sensors._groundHeightAhead(agent, surfaces.grounds),
      Sensors._normalizeVX(agent.vx),
    ];

    // Retourner seulement les inputCount premiers
    return all.slice(0, inputCount);
  }

  // ── Distance ennemi le plus proche devant ────
  static _enemyAhead(agent, enemies) {
    let minDist = Sensors.SENSOR_RANGE;

    for (const e of enemies) {
      // Seulement les ennemis devant l'agent
      if (e.left < agent.right) continue;
      const dist = e.left - agent.right;
      if (dist < minDist) minDist = dist;
    }

    return 1 - (minDist / Sensors.SENSOR_RANGE); // proche = 1, loin = 0
  }

  // ── Distance du prochain gap devant ──────────
  static _gapAhead(agent, gaps) {
    let minDist = Sensors.SENSOR_RANGE;

    for (const g of gaps) {
      if (g.x + g.width < agent.right) continue; // gap déjà passé
      const dist = g.x - agent.right;
      if (dist < 0) dist = 0; // agent déjà dans le gap
      if (dist < minDist) minDist = dist;
    }

    return 1 - (minDist / Sensors.SENSOR_RANGE);
  }

  // ── Largeur du prochain gap devant ───────────
  static _gapWidth(agent, gaps) {
    let closestGap = null;
    let minDist    = Sensors.SENSOR_RANGE;

    for (const g of gaps) {
      if (g.x + g.width < agent.right) continue;
      const dist = Math.max(0, g.x - agent.right);
      if (dist < minDist) {
        minDist    = dist;
        closestGap = g;
      }
    }

    if (!closestGap) return 0;
    return Math.min(closestGap.width / Sensors.MAX_GAP_W, 1);
  }

  // ── Vitesse verticale normalisée ─────────────
  // vy négatif = monte, positif = descend
  // On normalise entre 0 et 1 : 0.5 = immobile
  static _normalizeVY(vy) {
    return constrain(
      (vy + Sensors.MAX_VY) / (2 * Sensors.MAX_VY),
      0, 1
    );
  }

  // ── Vitesse horizontale normalisée ───────────
  static _normalizeVX(vx) {
    return constrain(vx / Sensors.MAX_VX, 0, 1);
  }

  // ── Distance prochaine cerise devant ─────────
  static _cherryAhead(agent, cherries) {
    let minDist = Sensors.SENSOR_RANGE;

    for (const c of cherries) {
      if (c.collected) continue;
      if (c.x < agent.x) continue; // cerise derrière
      const dist = c.x - agent.x;
      if (dist < minDist) minDist = dist;
    }

    return 1 - (minDist / Sensors.SENSOR_RANGE);
  }

  // ── Hauteur du sol devant l'agent ────────────
  // Détecte si le sol monte ou descend devant
  // Retourne la hauteur normalisée par CANVAS_H
  static _groundHeightAhead(agent, grounds) {
    const lookAheadX = agent.right + 32; // regarder 2 tiles devant

    for (const g of grounds) {
      if (lookAheadX >= g.left && lookAheadX <= g.right) {
        return 1 - (g.top / CANVAS_H); // haut = 1, bas = 0
      }
    }

    return 0; // aucun sol détecté = trou probable
  }
}