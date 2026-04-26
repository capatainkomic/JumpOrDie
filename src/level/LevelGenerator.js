// ==============================================
// LevelGenerator.js — VERSION CORRIGÉE
// Génération procédurale 100% tile-based cohérente
// ==============================================

class LevelGenerator {

  // ATTENTION : Ces constantes sont en unités de TILES !
  // Il est crucial de les distinguer des valeurs en pixels.
  static MAX_JUMP_HEIGHT_T   = 7;  // Hauteur max d'un saut, en tiles
  static MAX_JUMP_DISTANCE_T = 4;  // Distance max d'un saut, en tiles
  static MIN_PLAT_SPACING_T  = 2;  // Espacement min entre plateformes, en tiles
  static GROUND_DEPTH_T      = 5;  // Profondeur du sol sous la ligne de base, en tiles

  // Niveaux de hauteur pour le sol, exprimés en décalage de tiles par rapport à la base
  static HEIGHT_LEVELS_T = {
    LOW   : 0,  // Niveau de sol de base
    MEDIUM: -4, // 4 tiles plus haut que LOW
    HIGH  : -8, // 8 tiles plus haut que LOW
  };

  // Transitions possibles entre les niveaux de hauteur
  static HEIGHT_TRANSITIONS = {
    LOW   : ['MEDIUM'],
    MEDIUM: ['LOW', 'HIGH'],
    HIGH  : ['MEDIUM'],
  };

  // Règles de génération par difficulté, toutes les valeurs sont en TILES,
  // sauf enemySpeed et cherryFreq.
  static RULES = {
    easy: {
      gapMin: 2, gapMax: 10, gapFreq: 0.20,
      groundMin: 10, groundMax: 18,
      platMin: 4, platMax: 8,
      platFreq: 0.30,
      platMinH: 4, platMaxH: 6, // min/max height for platforms above ground
      enemySpeed: [1,2], enemyFreq: 0.15,
      cherryFreq: 0.5,
      cpEvery: 50, // Checkpoint every X tiles
    },
    medium: {
      gapMin: 3, gapMax: 13, gapFreq: 0.28,
      groundMin: 8, groundMax: 15,
      platMin: 3, platMax: 7,
      platFreq: 0.35,
      platMinH: 4, platMaxH: 6,
      enemySpeed: [2,3], enemyFreq: 0.25,
      cherryFreq: 0.35,
      cpEvery: 44,
    },
    hard: {
      gapMin: 4, gapMax: 16, gapFreq: 0.38,
      groundMin: 5, groundMax: 10,
      platMin: 3, platMax: 6,
      platFreq: 0.40,
      platMinH: 4, platMaxH: 6,
      enemySpeed: [3,4], enemyFreq: 0.35,
      cherryFreq: 0.25,
      cpEvery: 38,
    },
    killer: {
      gapMin: 5, gapMax: 18, gapFreq: 0.50,
      groundMin: 4, groundMax: 8,
      platMin: 2, platMax: 5,
      platFreq: 0.45,
      platMinH: 4, platMaxH: 6,
      enemySpeed: [4,6], enemyFreq: 0.50,
      cherryFreq: 0.15,
      cpEvery: 32,
    },
  };

  // Méthode principale pour générer le niveau
  // levelLengthT est la longueur totale du niveau en TILES.
  generate(difficulty = 'medium', levelLengthT = 320) {
    // TILE_SIZE doit être une constante globale (ex: dans sketch.js)
    const T = TILE_SIZE;
    const rules = LevelGenerator.RULES[difficulty];

    // Calcul de la ligne de base du sol en unités de tiles
    // S'assure que le sol démarre à une coordonnée Y qui est un multiple de TILE_SIZE
    const baseGroundRowT = Math.floor(CANVAS_H / T) - LevelGenerator.GROUND_DEPTH_T;
    const baseGroundY = baseGroundRowT * T; // La coordonnée Y en pixels du sol de base

    // Helper pour convertir une longueur en tiles en pixels
    const px = (tiles) => tiles * T;
    // Helper pour générer un nombre entier aléatoire entre min et max (inclus)
    const randT = (min, max) => Math.floor(random(min, max + 1));

    // Helper pour obtenir la coordonnée Y en pixels d'un niveau de sol
    const groundYOf = (heightKey) => (baseGroundRowT + LevelGenerator.HEIGHT_LEVELS_T[heightKey]) * T;
    // Helper pour choisir le prochain niveau de hauteur
    const nextKey = (currentKey) => {
      const opts = LevelGenerator.HEIGHT_TRANSITIONS[currentKey];
      return opts[Math.floor(random(opts.length))];
    };

    const elements = []; // Liste des éléments du niveau (sol, plateformes, gaps, etc.)
    let curT = 0;       // Position X actuelle, en TILES
    let heightKey = 'LOW'; // Niveau de hauteur actuel du sol
    let groundY = groundYOf('LOW'); // Coordonnée Y en pixels du sol actuel

    // --- Zone de départ sûre ---
    // Ajoute un bloc de sol de 20 tiles au début pour que l'agent ne tombe pas directement
    const safeT = 20;
    elements.push({
      type:'ground',
      x:0,
      y:groundY,
      width:px(safeT),
      height:CANVAS_H - groundY, // La hauteur doit être un multiple de T
    });
    curT = safeT;

    // --- Boucle de génération du niveau ---
    // Génère des sections tant que curT est inférieur à la longueur totale moins une zone de fin
    while (curT < levelLengthT - 24) { // Laisse de la place pour la zone de fin
        console.log('groundY check : ',groundY);
      // Décide si on génère un gap ou un bloc de sol
      if (random() < rules.gapFreq) {
        // --- Génération d'un gap ---
        
        const gapT = randT(rules.gapMin, rules.gapMax);
        const gapX = px(curT);

        elements.push({
          type:'gap',
          x:gapX,
          width:px(gapT),
        });

        // Si le gap est trop large pour un saut simple, place des plateformes "pont"
        // COMPARER DES TILES AVEC DES TILES
        if (gapT > LevelGenerator.MAX_JUMP_DISTANCE_T) {
          // La hauteur des plateformes de pont sera par rapport au groundY
          this._placeGapBridges(elements, curT, gapT, groundY, T, rules);
        }

        

        curT += gapT; // Avance la position X de la largeur du gap
      } else {

        // --- Changement de hauteur du sol --- AVANT IMPORTANT si apres alors mis jour TROP en avance pour le bridge gap 
        if (random() < 0.3) { // 30% de chance de changer de hauteur
          heightKey = nextKey(heightKey);
          groundY = groundYOf(heightKey);
        }


        // --- Génération d'un bloc de sol ---
        const groundT = randT(rules.groundMin, rules.groundMax);
        const groundX = px(curT);

        elements.push({
          type:'ground',
          x:groundX,
          y:groundY,
          width:px(groundT),
          height:CANVAS_H - groundY, // La hauteur doit être un multiple de T
        });

        // --- Placement d'un ennemi sur le sol ---
        if (random() < rules.enemyFreq) {
          elements.push({
            type:'enemy',
            // Centre l'ennemi horizontalement sur le bloc de sol
            x:groundX + px(groundT / 2),
            // Place l'ennemi une tile au-dessus du sol
            y:groundY - T,
            speed: random(rules.enemySpeed[0], rules.enemySpeed[1]),
          });
        }

        // --- Placement d'une cerise sur le sol ---
        // S'assure que le bloc de sol est assez grand pour une cerise
        if (random() < rules.cherryFreq && groundT >= 2) {
          const cxT = curT + randT(0, groundT - 1); // Position en tiles dans le bloc de sol
          elements.push({
            type:'cherry',
            // Centre la cerise horizontalement sur la tile
            x:px(cxT) + T / 2,
            // Place la cerise une tile au-dessus du sol
            y:groundY - T,
          });
        }

        // --- Placement d'une plateforme flottante au-dessus du sol ---
        // S'assure que le bloc de sol est assez grand pour la plateforme
        if (random() < rules.platFreq && groundT >= rules.platMin) {
          this._placeGroundPlatform(elements, curT, groundT, groundY, rules, T);
        }


        curT += groundT; // Avance la position X de la largeur du bloc de sol
      }

      // --- Placement de checkpoints ---
      const cpCount = elements.filter(e => e.type === 'checkpoint').length;
      const expectedCp = Math.floor(curT / rules.cpEvery); // Nombre de CPs attendus à cette distance
      if (expectedCp > cpCount) { // Si on a parcouru assez de distance pour un nouveau CP
        elements.push({
          type:'checkpoint',
          x:px(curT) - T, // Place le CP une tile avant la fin de la section actuelle
          y:groundY - (3 * T), // 3 tiles au-dessus du sol
          index:cpCount + 1,
        });
      }
    }

    // --- Zone de fin ---
    // S'assure que le sol de fin est au niveau "LOW"
    const endY = groundYOf('LOW');
    elements.push({
      type:'ground',
      x:px(curT), 
      y:endY,
      width:px(20),             // 20 tiles de large
      height:CANVAS_H - endY,
    });

    elements.push({
      type:'finish',
      x:px(levelLengthT - 8), // Place le drapeau 8 tiles avant la fin du niveau
      y:endY,
    });

    return {
      difficulty,
      length:px(levelLengthT), // Longueur totale du niveau en pixels
      groundY:baseGroundY,     // Y de base du sol en pixels
      elements,
    };
  }

  // --- Helpers de placement d'éléments ---

  // Place des plateformes pour traverser un grand gap
  _placeGapBridges(elements, gapStartT, gapT, groundY, T, rules) {
    const jumpT = LevelGenerator.MAX_JUMP_DISTANCE_T; // Max saut en tiles
    const minPlatWT = rules.platMin; // Min largeur plateforme en tiles
    const maxPlatWT = rules.platMax; // Max largeur plateforme en tiles

    const px = (tiles) => tiles * T;
    let remainingGapT = gapT; // Largeur restante du gap à couvrir, en tiles
    let currentCursorT = gapStartT; // Position X actuelle du curseur, en tiles

    // Tant qu'il reste de la place pour un saut + une plateforme
    while (remainingGapT > jumpT) {
      const minOffsetT = LevelGenerator.MIN_PLAT_SPACING_T;
      // Le max offset est la distance de saut moins la largeur min de la prochaine plateforme,
      // pour s'assurer que l'agent puisse atterrir sur la plateforme suivante.
      const maxOffsetT = jumpT /  2 ;

      // S'assurer que maxOffsetT est au moins minOffsetT
      const offsetT = Math.floor(random(minOffsetT, Math.max(minOffsetT, maxOffsetT) + 1));
      let platStartT = currentCursorT + offsetT;

      // Si le reste du gap est trop petit pour une plateforme complète + saut
      if (currentCursorT + offsetT + minPlatWT >= gapStartT + gapT) {
        break; // Ne pas placer de plateforme si elle chevauche la fin du gap
      }

      // Largeur aléatoire pour la plateforme (en tiles)
      const platWT =(currentCursorT + offsetT + maxPlatWT >= gapStartT + gapT) ? Math.floor(random(minPlatWT, maxPlatWT -1)) : Math.floor(random(minPlatWT, maxPlatWT + 1));
      // Hauteur aléatoire pour la plateforme au-dessus du groundY (en tiles)
      // Utilise les règles platMinH/platMaxH pour les plateformes "normales"
      const hT = Math.floor(random(rules.platMinH, rules.platMaxH));

      elements.push({
        type:'platform',
        x:platStartT * T,
        y:groundY - hT * T,
        width:platWT * T,
      });

      // Ajoute une cerise sur la plateforme avec 50% de chance
      if (random() < 0.5) {
        elements.push({
          type:'cherry',
          x:platStartT * T + (platWT * T) / 2, // Centrée sur la plateforme
          y:groundY - hT * T - T,             // Une tile au-dessus de la plateforme
        });
      }

      currentCursorT = platStartT + platWT; // Avance le curseur à la fin de cette plateforme
      remainingGapT = gapStartT + gapT - currentCursorT; // Met à jour le reste du gap
    }
  }

  // Place une plateforme flottante au-dessus d'un bloc de sol
  _placeGroundPlatform(elements, groundStartT, groundT, groundY, rules, T) {
    // Largeur de la plateforme en tiles
    const platWT = Math.floor(random(rules.platMin, rules.platMax + 1));

    // Si la plateforme est plus large que le sol, ou trop proche des bords, on ne la place pas
    // La plateforme a besoin d'au moins 1 tile de chaque côté pour être "flottante"
    if (platWT >= groundT - 2) return;

    // Calcul des bornes pour le début de la plateforme sur le sol
    // Elle ne doit pas commencer à la première tile du sol ni finir à la dernière
    const startMinT = groundStartT + 1; // Au moins 1 tile d'offset au début du sol
    const startMaxT = groundStartT + groundT - platWT - 1; // Au moins 1 tile d'offset à la fin

    // Si l'intervalle est valide, place la plateforme
    if (startMinT >= startMaxT) return; // Pas assez de place

    const platStartT = Math.floor(random(startMinT, startMaxT + 1));
    // Hauteur de la plateforme au-dessus du sol (en tiles)
    const hT = Math.floor(random(rules.platMinH, rules.platMaxH + 1)); // Utilise les règles spécifiques

    elements.push({
      type:'platform',
      x:platStartT * T,
      y:groundY - hT * T,
      width:platWT * T,
    });

    // Ajoute une cerise sur la plateforme avec 60% de chance
    if (random() < 0.6) {
      elements.push({
        type:'cherry',
        x:platStartT * T + (platWT * T) / 2, // Centrée sur la plateforme
        y:groundY - hT * T - T,             // Une tile au-dessus de la plateforme
      });
    }
  }
}