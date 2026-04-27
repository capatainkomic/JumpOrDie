// ==============================================
// GameManager.js
// Singleton — gère les états globaux du jeu
// États : TRAINING | COMPETITION
// ==============================================

class GameManager {

  // ── États possibles ──────────────────────────
  static STATES = {
    TRAINING    : 'TRAINING',
    COMPETITION : 'COMPETITION',
  };

  constructor() {
    if (GameManager._instance) {
      return GameManager._instance;
    }
    GameManager._instance = this;

    // État courant
    this._state = GameManager.STATES.TRAINING;

    // Listeners pour l'Observer pattern
    // { stateName: [callbacks] }
    this._listeners = {};

    // Stats d'entraînement globales
    this.generation   = 1;
    this.levelIndex   = 1;  // quel niveau dans la session courante
    this.bestFitness  = 0;
    this.aliveCount   = 0;

    // Config entraînement (modifiée par les curseurs UI)
    this.config = {
      populationSize      : 50,
      inputCount          : 6,
      hiddenLayers        : 2,
      neuronsPerLayer     : 12,
      activationFn        : 'sigmoid',  // 'sigmoid' | 'relu' | 'tanh'
      mutationRate        : 0.08,
      generationsPerLevel : 3,
      stopConditionPct    : 0.60,       // 60% des agents
      stopConditionThreshold  : 0.60,
      checkpointThresholds    : [0.25, 0.50, 0.75],    
      difficulty          : 'medium',   // 'easy' | 'medium' | 'hard' | 'killer'
    };

  }

  // ── Accesseur d'état ─────────────────────────
  get state() {
    return this._state;
  }

  // ── Changement d'état ────────────────────────
  setState(newState) {
    if (!GameManager.STATES[newState]) {
      console.warn('[GameManager] État inconnu :', newState);
      return;
    }
    const previous = this._state;
    this._state = newState;
    this._notify(newState, previous);
  }

  // ── Observer : s'abonner à un changement d'état ──
  on(stateName, callback) {
    if (!this._listeners[stateName]) {
      this._listeners[stateName] = [];
    }
    this._listeners[stateName].push(callback);
  }

  // ── Observer : notifier les abonnés ─────────
  _notify(newState, previousState) {
    const cbs = this._listeners[newState];
    if (cbs) {
      cbs.forEach(cb => cb({ newState, previousState }));
    }
    // Notifier les abonnés "any"
    const any = this._listeners['*'];
    if (any) {
      any.forEach(cb => cb({ newState, previousState }));
    }
  }

  // ── Helpers état  
  isTraining()    { return this._state === GameManager.STATES.TRAINING; }
  isCompetition() { return this._state === GameManager.STATES.COMPETITION; }

  // ── Mise à jour des stats  
  updateStats({ aliveCount, bestFitness } = {}) {
    if (aliveCount   !== undefined) this.aliveCount  = aliveCount;
    if (bestFitness  !== undefined) this.bestFitness = bestFitness;
  }

  // ── Nouvelle génération  
  nextGeneration() {
    this.generation++;
    // Changer de niveau toutes les K générations
    if ((this.generation - 1) % this.config.generationsPerLevel === 0) {
      this.levelIndex++;
    }
  }

  // ── Reset complet  
  reset() {
    this.generation  = 1;
    this.levelIndex  = 1;
    this.bestFitness = 0;
    this.aliveCount  = 0;
  }
}

// Export singleton
const gm = new GameManager();