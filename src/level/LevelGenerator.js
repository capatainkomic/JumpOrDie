// ==============================================
// LevelGenerator.js
// Responsabilité : générer les données d'un
// niveau selon la difficulté.
// Ne dessine RIEN — produit uniquement des
// données que Level.js va consommer.
//
// RÈGLES DE HAUTEUR :
//   3 niveaux : LOW, MEDIUM, HIGH
//   LOW → MEDIUM → HIGH (pas de saut direct LOW↔HIGH)
//   La hauteur ne change QU'après un gap
//   2 grounds consécutifs à même hauteur = fusionnés
// ==============================================

class LevelGenerator {

  static RULES = {
    easy: {
      gapMinWidth    : 80,
      gapMaxWidth    : 120,
      gapFrequency   : 0.20,
      groundMinW     : 150,
      groundMaxW     : 300,
      platformMinW   : 96,
      platformMaxW   : 192,
      platformFreq   : 0.3,
      platformMinGap : 80,
      platformMinY   : 80,
      platformMaxY   : 150,
      enemySpeed     : [1, 2],
      enemyFreq      : 0.2,
      cherryFreq     : 0.5,
      checkpointEvery: 800,
    },
    medium: {
      gapMinWidth    : 96,
      gapMaxWidth    : 144,
      gapFrequency   : 0.28,
      groundMinW     : 112,
      groundMaxW     : 240,
      platformMinW   : 80,
      platformMaxW   : 160,
      platformFreq   : 0.35,
      platformMinGap : 64,
      platformMinY   : 70,
      platformMaxY   : 140,
      enemySpeed     : [2, 3],
      enemyFreq      : 0.3,
      cherryFreq     : 0.35,
      checkpointEvery: 700,
    },
    hard: {
      gapMinWidth    : 112,
      gapMaxWidth    : 176,
      gapFrequency   : 0.38,
      groundMinW     : 80,
      groundMaxW     : 160,
      platformMinW   : 48,
      platformMaxW   : 112,
      platformFreq   : 0.4,
      platformMinGap : 48,
      platformMinY   : 60,
      platformMaxY   : 130,
      enemySpeed     : [3, 4],
      enemyFreq      : 0.4,
      cherryFreq     : 0.25,
      checkpointEvery: 600,
    },
    killer: {
      gapMinWidth    : 144,
      gapMaxWidth    : 224,
      gapFrequency   : 0.5,
      groundMinW     : 64,
      groundMaxW     : 128,
      platformMinW   : 32,
      platformMaxW   : 80,
      platformFreq   : 0.45,
      platformMinGap : 32,
      platformMinY   : 50,
      platformMaxY   : 120,
      enemySpeed     : [4, 6],
      enemyFreq      : 0.55,
      cherryFreq     : 0.15,
      checkpointEvery: 500,
    },
  };

  // ── Les 3 hauteurs de sol possibles ─────────
  static HEIGHT_LEVELS = {
    LOW   : 0,
    MEDIUM: -32,
    HIGH  : -64,
  };

  // ── Transitions autorisées — SANS la hauteur actuelle ──
  // Quand on change, on change vraiment
  static HEIGHT_TRANSITIONS = {
    LOW   : ['MEDIUM'],           // LOW ne peut aller que vers MEDIUM
    MEDIUM: ['LOW', 'HIGH'],      // MEDIUM peut aller vers LOW ou HIGH
    HIGH  : ['MEDIUM'],           // HIGH ne peut aller que vers MEDIUM
  };

  generate(difficulty = 'medium', levelLength = 5000) {
    const rules       = LevelGenerator.RULES[difficulty];
    const baseGroundY = CANVAS_H - 80;

    const elements    = [];
    let cursorX       = 0;
    let lastPlatformX = -9999;

    // ── Snap sur grille TILE_SIZE ────────────────
    const snap = (v) => Math.round(v / TILE_SIZE) * TILE_SIZE;

    // ── Hauteur courante du sol ──────────────────
    // On démarre toujours en LOW
    let currentHeightKey = 'LOW';
    let currentGroundY   = baseGroundY + LevelGenerator.HEIGHT_LEVELS['LOW'];

    // ── Helper : prochain niveau de hauteur ──────
    // Choisit aléatoirement parmi les transitions
    // autorisées depuis la hauteur actuelle
    const nextHeightKey = (current) => {
      const allowed = LevelGenerator.HEIGHT_TRANSITIONS[current];
      return allowed[Math.floor(random(allowed.length))];
    };

    // ── Helper : Y de sol depuis une clé ────────
    const groundYFromKey = (key) => {
      return baseGroundY + LevelGenerator.HEIGHT_LEVELS[key];
    };

    // ── Zone de départ safe (300px, sol LOW) ─────
    const safeZoneW = 300;
    elements.push({
      type  : 'ground',
      x     : 0,
      y     : currentGroundY,
      width : safeZoneW,
      height: CANVAS_H - currentGroundY,
    });
    cursorX = safeZoneW;

    // ── Génération procédurale ───────────────────
    while (cursorX < levelLength - 400) {

      const hasGap = random() < rules.gapFrequency;

      if (hasGap) {
        // ── Trou ────────────────────────────────
        const gapW = snap(random(rules.gapMinWidth, rules.gapMaxWidth));
        elements.push({ type: 'gap', x: cursorX, width: gapW });
        cursorX += gapW;

        // La hauteur ne change QU'après un gap
        // On choisit la prochaine hauteur selon les transitions autorisées
        currentHeightKey = nextHeightKey(currentHeightKey);
        currentGroundY   = groundYFromKey(currentHeightKey);

      } else {
        // ── Bloc de sol ──────────────────────────
        const groundW = snap(random(rules.groundMinW, rules.groundMaxW));

        // Règle fusion : si le dernier ground a la MÊME hauteur
        // → on l'agrandit (même niveau continu)
        // Si hauteur DIFFÉRENTE → nouveau bloc = palier voulu
        const lastGround = this._lastGroundElement(elements);

        if (lastGround && lastGround.y === currentGroundY) {
          // Même hauteur → fusion en un seul bloc continu
          lastGround.width += groundW;
        } else {
          // Hauteur différente → nouveau bloc (palier)
          elements.push({
            type  : 'ground',
            x     : cursorX,
            y     : currentGroundY,
            width : groundW,
            height: CANVAS_H - currentGroundY,
          });
        }

        // Après avoir posé un bloc, on décide aléatoirement
        // si le prochain bloc (toujours dans la même section)
        // monte ou descend d'un palier
        // Probabilité 30% de changer de hauteur entre deux blocs
        if (random() < 0.3) {
          currentHeightKey = nextHeightKey(currentHeightKey);
          currentGroundY   = groundYFromKey(currentHeightKey);
        }

        // ── Ennemi ────────────────────────────
        if (random() < rules.enemyFreq) {
          const speed = random(rules.enemySpeed[0], rules.enemySpeed[1]);
          elements.push({
            type : 'enemy',
            x    : cursorX + groundW / 2,
            y    : currentGroundY - TILE_SIZE,
            speed: speed,
          });
        }

        // ── Cerise sur le sol ─────────────────
        if (random() < rules.cherryFreq) {
          elements.push({
            type: 'cherry',
            x   : cursorX + random(8, groundW - 8),
            y   : currentGroundY - 30,
          });
        }

        // ── Plateforme flottante ──────────────
        const distFromLastPlat = cursorX - lastPlatformX;
        if (
          random() < rules.platformFreq &&
          distFromLastPlat >= rules.platformMinGap
        ) {
          const platW = snap(random(rules.platformMinW, rules.platformMaxW));
          const platY = currentGroundY - random(rules.platformMinY, rules.platformMaxY);
          const platX = cursorX + random(0, max(0, groundW - platW));

          elements.push({
            type : 'platform',
            x    : platX,
            y    : platY,
            width: platW,
          });

          lastPlatformX = platX + platW;

          // Cerise sur la plateforme
          if (random() < 0.6) {
            elements.push({
              type: 'cherry',
              x   : platX + platW / 2,
              y   : platY - 25,
            });
          }
        }

        cursorX += groundW;
      }

      // ── Checkpoint ──────────────────────────
      const nextCPCount = elements.filter(e => e.type === 'checkpoint').length;
      const expectedCP  = Math.floor(cursorX / rules.checkpointEvery);
      if (expectedCP > nextCPCount) {
        elements.push({
          type : 'checkpoint',
          x    : cursorX - 20,
          y    : currentGroundY - 40,
          index: nextCPCount + 1,
        });
      }
    }

    // ── Zone de fin : sol LOW garanti ───────────
    elements.push({
      type  : 'ground',
      x     : levelLength - 300,
      y     : baseGroundY,
      width : 300,
      height: CANVAS_H - baseGroundY,
    });

    elements.push({
      type: 'finish',
      x   : levelLength - 100,
      y   : baseGroundY,
    });

    return {
      difficulty,
      length  : levelLength,
      groundY : baseGroundY,
      elements,
    };
  }

  // ── Retourne le dernier élément ground ───────
  // dans la liste (ignore les autres types)
  _lastGroundElement(elements) {
    for (let i = elements.length - 1; i >= 0; i--) {
      if (elements[i].type === 'ground') return elements[i];
    }
    return null;
  }
}