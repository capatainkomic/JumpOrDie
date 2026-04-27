// ==============================================
// LevelGenerator.js
// Génération procédurale 100% tile-based cohérente
// ==============================================

class LevelGenerator {

  // Constantes en unités de TILES
  static MAX_JUMP_HEIGHT_T   = 7;
  static MAX_JUMP_DISTANCE_T = 4;
  static MIN_PLAT_SPACING_T  = 2;
  static GROUND_DEPTH_T      = 5;

  static HEIGHT_LEVELS_T = {
    LOW   :  0,
    MEDIUM: -4,
    HIGH  : -8,
  };

  static HEIGHT_TRANSITIONS = {
    LOW   : ['MEDIUM'],
    MEDIUM: ['LOW', 'HIGH'],
    HIGH  : ['MEDIUM'],
  };

  static RULES = {
    easy: {
      gapMin: 2, gapMax: 10, gapFreq: 0.20,
      groundMin: 10, groundMax: 18,
      platMin: 4, platMax: 8,
      platFreq: 0.30,
      platMinH: 4, platMaxH: 6,
      enemySpeed: [1, 2], enemyFreq: 0.15,
      cherryFreq: 0.5,
    },
    medium: {
      gapMin: 3, gapMax: 13, gapFreq: 0.28,
      groundMin: 8, groundMax: 15,
      platMin: 3, platMax: 7,
      platFreq: 0.35,
      platMinH: 4, platMaxH: 6,
      enemySpeed: [1, 2], enemyFreq: 0.25,
      cherryFreq: 0.35,
    },
    hard: {
      gapMin: 4, gapMax: 16, gapFreq: 0.38,
      groundMin: 5, groundMax: 10,
      platMin: 3, platMax: 6,
      platFreq: 0.40,
      platMinH: 4, platMaxH: 6,
      enemySpeed: [2, 3], enemyFreq: 0.35,
      cherryFreq: 0.25,
    },
    killer: {
      gapMin: 5, gapMax: 18, gapFreq: 0.50,
      groundMin: 4, groundMax: 8,
      platMin: 2, platMax: 5,
      platFreq: 0.45,
      platMinH: 4, platMaxH: 6,
      enemySpeed: [2, 3], enemyFreq: 0.50,
      cherryFreq: 0.15,
    },
  };

  // ── Méthode principale ───────────────────────
  generate(difficulty = 'medium', levelLengthT = 320) {
    const T     = TILE_SIZE;
    const rules = LevelGenerator.RULES[difficulty];
    const px    = (tiles) => tiles * T;
    const randT = (min, max) => Math.floor(random(min, max + 1));

    const baseGroundRowT = Math.floor(CANVAS_H / T) - LevelGenerator.GROUND_DEPTH_T;
    const baseGroundY    = baseGroundRowT * T;

    const groundYOf = (key) => (baseGroundRowT + LevelGenerator.HEIGHT_LEVELS_T[key]) * T;
    const nextKey   = (key) => {
      const opts = LevelGenerator.HEIGHT_TRANSITIONS[key];
      return opts[Math.floor(random(opts.length))];
    };

    const elements = [];
    let curT      = 0;
    let heightKey = 'LOW';
    let groundY   = groundYOf('LOW');

    // Zone de départ sûre (20 tiles)
    elements.push({
      type: 'ground', x: 0, y: groundY,
      width: px(20), height: CANVAS_H - groundY,
    });
    curT = 20;

    // ── Boucle principale ────────────────────────
    while (curT < levelLengthT - 24) {

      if (random() < rules.gapFreq) {
        curT = this._generateGap(elements, curT, rules, groundY, T, randT, px);
      } else {
        // Changement de hauteur AVANT le placement du sol
        if (random() < 0.3) {
          heightKey = nextKey(heightKey);
          groundY   = groundYOf(heightKey);
        }
        curT = this._generateGroundSection(elements, curT, rules, groundY, T, randT, px);
      }

    }

    // Zone de fin
    const endY = groundYOf('LOW');
    elements.push({
      type: 'ground', x: px(curT), y: endY,
      width: px(20), height: CANVAS_H - endY,
    });
    elements.push({
      type: 'finish',
      x: px(levelLengthT - 8),
      y: endY,
    });

    return {
      difficulty,
      length: px(levelLengthT),
      groundY: baseGroundY,
      elements,
    };
  }

  // ── Génération d'un gap ──────────────────────
  // Retourne la nouvelle valeur de curT
  _generateGap(elements, curT, rules, groundY, T, randT, px) {
    const gapT = randT(rules.gapMin, rules.gapMax);

    elements.push({ type: 'gap', x: px(curT), width: px(gapT) });

    if (gapT >= LevelGenerator.MAX_JUMP_DISTANCE_T) {
      this._placeGapBridges(elements, curT, gapT, groundY, T, rules);
    }

    return curT + gapT;
  }

  // ── Génération d'une section de sol ─────────
  // Retourne la nouvelle valeur de curT
  _generateGroundSection(elements, curT, rules, groundY, T, randT, px) {
    const groundT = randT(rules.groundMin, rules.groundMax);
    const groundX = px(curT);

    elements.push({
      type: 'ground', x: groundX, y: groundY,
      width: px(groundT), height: CANVAS_H - groundY,
    });

    // Positions déjà occupées sur cette section (en tiles, relatif au niveau)
    // Sert à éviter de superposer enemy et cherry.
    const occupiedTiles = new Set();

    this._maybeAddOpossum(elements, curT, groundT, groundY, T, rules, px, occupiedTiles);
    this._maybeAddCherry(elements, curT, groundT, groundY, T, rules, px, randT, occupiedTiles);
    this._maybeAddGroundPlatform(elements, curT, groundT, groundY, rules, T);

    return curT + groundT;
  }

  // ── Opossum sur le sol ───────────────────────
  _maybeAddOpossum(elements, curT, groundT, groundY, T, rules, px, occupiedTiles) {
    if (random() >= rules.enemyFreq) return;

    // Centre de la section
    const tileOffset = Math.floor(groundT / 2);
    if (occupiedTiles.has(tileOffset)) return;

    occupiedTiles.add(tileOffset);

    elements.push({
      type        : 'opossum',
      x           : px(curT + tileOffset),
      y           : groundY - Opossum.SPRITE_H, // posé sur le top du sol
      patrolLeft  : px(curT),
      patrolRight : px(curT + groundT),
    });
  }

  // ── Cherry sur le sol ────────────────────────
  _maybeAddCherry(elements, curT, groundT, groundY, T, rules, px, randT, occupiedTiles) {
    if (random() > rules.cherryFreq) return;
    if (groundT < 2) return;

    // Cherche une tile libre aléatoirement
    const tileOffset = this._findFreeTile(curT, groundT, occupiedTiles, randT);
    if (tileOffset === null) return;

    occupiedTiles.add(tileOffset - curT);

    elements.push({
      type: 'cherry',
      x   : px(tileOffset) + T / 2, // centré sur la tile
      y   : groundY - T,
    });
  }

  // Retourne un offset de tile libre dans [curT, curT+groundT[, ou null
  _findFreeTile(curT, groundT, occupiedTiles, randT) {
    const candidates = [];
    for (let i = 0; i < groundT; i++) {
      if (!occupiedTiles.has(i)) candidates.push(curT + i);
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(random(candidates.length))];
  }


  // ── Plateformes dans un gap (bridges) ────────
  _placeGapBridges(elements, gapStartT, gapT, groundY, T, rules) {
    const px        = (tiles) => tiles * T;
    const jumpT     = LevelGenerator.MAX_JUMP_DISTANCE_T;
    const minPlatWT = rules.platMin;
    const maxPlatWT = rules.platMax;

    let remainingGapT  = gapT;
    let currentCursorT = gapStartT;

    while (remainingGapT > jumpT) {
      const minOffsetT = LevelGenerator.MIN_PLAT_SPACING_T;
      const maxOffsetT = jumpT / 2;
      const offsetT    = Math.floor(random(minOffsetT, Math.max(minOffsetT, maxOffsetT) + 1));
      const platStartT = currentCursorT + offsetT;

      if (platStartT + minPlatWT >= gapStartT + gapT) break;

      const nearEnd  = platStartT + maxPlatWT >= gapStartT + gapT;
      const platWT   = nearEnd
        ? Math.floor(random(minPlatWT, maxPlatWT - 2))
        : Math.floor(random(minPlatWT, maxPlatWT + 1));
      const hT       = Math.floor(random(rules.platMinH, rules.platMaxH));

      elements.push({
        type : 'platform',
        x    : px(platStartT),
        y    : groundY - hT * T,
        width: px(platWT),
      });

      if (random() < rules.cherryFreq) {
        // Cherry sur la plateforme si pas d'eagle
        elements.push({
          type: 'cherry',
          x   : px(platStartT) + px(platWT) / 2,
          y   : groundY - hT * T - T,
        });
      }

      currentCursorT = platStartT + platWT;
      remainingGapT  = gapStartT + gapT - currentCursorT;
    }
  }

  // ── Plateforme flottante au-dessus d'un sol ──
  _maybeAddGroundPlatform(elements, groundStartT, groundT, groundY, rules, T) {
    if (random() >= rules.platFreq) return;

    const platWT = Math.floor(random(rules.platMin, rules.platMax + 1));
    if (platWT >= groundT - 2) return;

    const startMinT = groundStartT + 1;
    const startMaxT = groundStartT + groundT - platWT - 1;
    if (startMinT >= startMaxT) return;

    const platStartT = Math.floor(random(startMinT, startMaxT + 1));
    const hT         = Math.floor(random(rules.platMinH, rules.platMaxH + 1));
    const px         = (tiles) => tiles * T;

    elements.push({
      type : 'platform',
      x    : px(platStartT),
      y    : groundY - hT * T,
      width: px(platWT),
    });

    // Eagle sur la plateforme (fréquence fixe 35%)
    if (random() < rules.enemyFreq) {
      elements.push({
        type: 'eagle',
        x   : px(platStartT) + (px(platWT) - Eagle.SPRITE_W) / 2, // centré horizontalement
        y   : groundY - hT * T - 2*Eagle.SPRITE_H,                   // posé sur le top de la plateforme
      });
    } 
    if (random() < rules.cherryFreq) {
      // Cherry si pas d'eagle
      elements.push({
        type: 'cherry',
        x   : px(platStartT) + px(platWT) / 2,
        y   : groundY - hT * T - T,
      });
    }
  }
}