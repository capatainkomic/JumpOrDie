// ==============================================
// TrainingManager.js
//
// Orchestre le cycle d'entraînement — Option C hybride :
//
//   1. Générer niveau A (difficulté courante)
//   2. S'entraîner jusqu'à condition atteinte
//      → nouveau niveau même difficulté
//      → levelsCompleted++
//   3. Après levelsBeforeDifficulty niveaux réussis
//      → difficulté suivante
//   4. Si condition jamais atteinte après generationsPerLevel gens
//      → nouveau niveau quand même (levelsCompleted inchangé)
//   5. Arrêt si :
//      → bouton stop (manuel)
//      → difficulté killer + levelsBeforeDifficulty niveaux réussis
// ==============================================

class TrainingManager {

  static SESSION_TIMEOUT  = 60 * 30 * 2; // 2 minutes 
  static DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'killer'];

  constructor(tileMap, levelGenerator) {
    this.tileMap        = tileMap;
    this.levelGenerator = levelGenerator;

    this.level      = null;
    this.population = null;

    this._sessionFrames   = 0;
    this._genOnThisLevel  = 0;
    this._levelsCompleted = 0;

    this.stopped      = false;
    this.trainingDone = false;

    this._generateLevel(false);
    this._spawnPopulation();
  }

  // ── Update ───────────────────────────────────
  update() {
    if (this.stopped || this.trainingDone) return;

    this._sessionFrames++;

    const surfaces = this.level.getSolidSurfaces();
    this.population.update(surfaces, this.level);
    this.level.update(this.population.agents);

    if (this._shouldEndSession()) {
      this._endSession();
    }
  }

  // ── Rendu ────────────────────────────────────
  draw(camera) {
    camera.update(this.population.bestLiveAgent);
    camera.begin();
      this.level.draw();
      this.population.draw();
    camera.end();
  }

  // ── Stop / Resume ────────────────────────────
  stop()   { this.stopped = true;  }
  resume() { this.stopped = false; }

  // ── Stats pour le HUD ────────────────────────
  get stats() {
    return {
      generation      : gm.generation,
      levelIndex      : gm.levelIndex,
      aliveCount      : this.population.aliveCount,
      totalAgents     : gm.config.populationSize,
      bestFitness     : this.population.bestAgent.fitness,
      difficulty      : gm.config.difficulty,
      levelsCompleted : this._levelsCompleted,
      trainingDone    : this.trainingDone,
    };
  }

  // ── Fin de session ? ─────────────────────────
  _shouldEndSession() {
    if (this.population.isExtinct()) return true;
    if (this._sessionFrames >= TrainingManager.SESSION_TIMEOUT) return true;
    return false;
  }

  // ── Fin de session → prochaine génération ────
  _endSession() {
    this._sessionFrames = 0;
    this._genOnThisLevel++;

    const conditionMet = GeneticAlgorithm.checkStopCondition(
      this.population.agents, this.level
    );

    let newLevelGenerated = false;

    if (conditionMet) {
      this._levelsCompleted++;
      console.log(`[Training] Niveau réussi (${this._levelsCompleted}) — gen ${gm.generation}`);

      if (this._levelsCompleted >= gm.config.levelsBeforeDifficulty) {
        this._increaseDifficulty();
      }

      this._generateLevel(true);
      this._genOnThisLevel = 0;
      newLevelGenerated    = true;

    } else if (this._genOnThisLevel >= gm.config.generationsPerLevel) {
      console.log(`[Training] Timeout niveau — nouveau niveau gen ${gm.generation}`);
      this._generateLevel(true);
      this._genOnThisLevel = 0;
      newLevelGenerated    = true;
    }

    if (!newLevelGenerated) {
      this.level.resetCherries();
    }

    const newBrains = GeneticAlgorithm.nextGeneration(this.population.agents);
    gm.nextGeneration();
    this._spawnPopulation();

    for (let i = 0; i < this.population.agents.length; i++) {
      this.population.agents[i].brain = newBrains[i];
    }
  }

  // ── Augmenter la difficulté ──────────────────
  _increaseDifficulty() {
    const order   = TrainingManager.DIFFICULTY_ORDER;
    const current = order.indexOf(gm.config.difficulty);

    if (current < order.length - 1) {
      gm.config.difficulty  = order[current + 1];
      this._levelsCompleted = 0;
      console.log(`[Training] Difficulté → ${gm.config.difficulty}`);
    } else {
      // Killer + levelsBeforeDifficulty niveaux réussis → arrêt naturel
      console.log('[Training] Entraînement terminé — difficulté maximale maîtrisée');
      this.trainingDone = true;
    }
  }

  // ── Générer un nouveau niveau ────────────────
  _generateLevel(increment = true) {
    const data = this.levelGenerator.generate(gm.config.difficulty);
    this.level = new Level(this.tileMap, data);
    if (increment) gm.levelIndex++;
  }

  // ── Spawner la population ────────────────────
  _spawnPopulation() {
    const startX = 3 * TILE_SIZE;
    const startY = this.level.groundY - Agent.HEIGHT / 2;
    this.population = new Population(gm.config.populationSize, startX, startY);
  }
}