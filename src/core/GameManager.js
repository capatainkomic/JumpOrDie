// ==============================================
// GameManager.js — Singleton
//
// Responsabilités :
//   1. Navigation centralisée (appState)
//   2. Config entraînement
//   3. Stats globales
// ==============================================

class GameManager {

  static STATES = {
    MENU        : 'menu',
    CONFIG      : 'config',
    TRAINING    : 'training',
    COMPETITION : 'competition',
  };

  constructor() {
    if (GameManager._instance) return GameManager._instance;
    GameManager._instance = this;

    // ── Navigation ─────────────────────────────
    this._appState  = 'menu';
    this._listeners = {};

    // ── Stats entraînement ──────────────────────
    this.generation  = 1;
    this.levelIndex  = 1;
    this.bestFitness = 0;
    this.aliveCount  = 0;

    // ── Config entraînement ─────────────────────
    this.config = {
      populationSize         : 50,
      inputCount             : 21,
      hiddenLayers           : 2,
      neuronsPerLayer        : 12,
      activationFn           : 'sigmoid',
      mutationRate           : 0.08,
      inputConfig : {
        grid        : true,
        avoidOpossum: true,
        avoidEagle  : true,
        seekCherry  : true,
        isOnGround  : true,
        vertSpeed   : true,
        horizSpeed  : true,
      },
      generationsPerLevel    : 10,
      levelsBeforeDifficulty : 3,
      stopConditionPct       : 0.60,
      stopConditionThreshold : 0.60,
      difficulty             : 'easy',
    };
  }

  // ── Getters navigation ─────────────────────────
  get appState() { return this._appState; }

  // ── Transitions ────────────────────────────────
  goTo(state) {
    const prev = this._appState;
    this._appState = state;
    this._notify(state, prev);
  }

  goToMenu()        { this.goTo('menu'); }
  goToConfig()      { this.goTo('config'); }
  goToTraining()    { this.goTo('training'); }
  goToCompetition() { this.goTo('competition'); }

  // ── Predicats ──────────────────────────────────
  isMenu()        { return this._appState === 'menu'; }
  isConfig()      { return this._appState === 'config'; }
  isTraining()    { return this._appState === 'training'; }
  isCompetition() { return this._appState === 'competition'; }

  // ── Observer ───────────────────────────────────
  on(state, cb) {
    if (!this._listeners[state]) this._listeners[state] = [];
    this._listeners[state].push(cb);
  }

  _notify(newState, prev) {
    (this._listeners[newState] || []).forEach(cb => cb({ newState, prev }));
    (this._listeners['*']      || []).forEach(cb => cb({ newState, prev }));
  }

  // ── Stats ───────────────────────────────────────
  nextGeneration() { this.generation++; }

  // ── Reset ───────────────────────────────────────
  reset() {
    this.generation  = 1;
    this.levelIndex  = 1;
    this.bestFitness = 0;
    this.aliveCount  = 0;
  }
}

const gm = new GameManager();