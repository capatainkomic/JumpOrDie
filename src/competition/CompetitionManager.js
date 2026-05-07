// ==============================================
// CompetitionManager.js
//
// Orchestre le mode compétition :
//   Phase 1 — Setup : charger cerveaux + niveau
//   Phase 2 — Race  : agents courent, leaderboard
// ==============================================

class CompetitionManager {

  static RACE_TIMEOUT   = 60 * 45;  // 45s à 60fps
  static SKIN_NAMES     = ['fox', 'bunny', 'squirrel'];
  static SKIN_LABELS    = ['🦊 Fox', '🐰 Bunny', '🐿 Squirrel'];
  static MAX_AGENTS     = 3;

  // Couleurs distinctives par slot
  static SLOT_COLORS    = [
    [255, 150, 50],   // orange — fox
    [120, 200, 255],  // bleu clair — bunny
    [180, 220, 80],   // vert — squirrel
  ];

  constructor(tileMap, levelGenerator) {
    this.tileMap        = tileMap;
    this.levelGenerator = levelGenerator;

    this.phase     = 'setup';  // 'setup' | 'race'
    this.level     = null;
    this.agents    = [];       // CompetitionAgent[]
    this.stopped   = false;

    this._sessionFrames = 0;
    this._raceFinished  = false;

    // Slots : 3 slots, chacun peut avoir un brainEntry ou null
    this.slots = [null, null, null]; // brainEntry ou null

    // Agents idle pour animer les sprites en phase setup
    this._idleAgents = null; // initialisé dans preload() après p5.js ready

    // Parallax
    this._parallaxX = 0;
    this._bgLayers  = { clouds: null, mountains: null, trees: null };
  }

  // ── Preload parallax ──────────────────────
  preload() {
    this._bgLayers.clouds    = loadImage('assets/background parallax/bg-clouds.png',    ()=>{}, ()=>{ this._bgLayers.clouds    = null; });
    this._bgLayers.mountains = loadImage('assets/background parallax/bg-mountains.png', ()=>{}, ()=>{ this._bgLayers.mountains = null; });
    this._bgLayers.trees     = loadImage('assets/background parallax/bg-trees.png',     ()=>{}, ()=>{ this._bgLayers.trees     = null; });

    // Créer les agents idle pour le setup
    this._idleAgents = CompetitionManager.SKIN_NAMES.map(skinName => {
      const a = new CompetitionAgent(0, 0, skinName, null);
      a.preloadSprites();
      return a;
    });
  }

  // ── Charger un cerveau dans un slot ───────
  loadBrain(slotIndex, brainEntry) {
    if (slotIndex < 0 || slotIndex >= CompetitionManager.MAX_AGENTS) return;
    this.slots[slotIndex] = brainEntry;
  }

  unloadBrain(slotIndex) {
    this.slots[slotIndex] = null;
  }

  // ── Générer le niveau ─────────────────────
  generateLevel(difficulty = 'easy') {
    const data = this.levelGenerator.generate(difficulty);
    this.level = new Level(this.tileMap, data);
  }

  // ── Lancer la course ──────────────────────
  startRace() {
    if (!this.level) this.generateLevel('easy');

    this.agents         = [];
    this._sessionFrames = 0;
    this._raceFinished  = false;
    this._parallaxX     = 0;
    this.stopped        = false;
    this.phase          = 'race';

    const startX  = 3 * TILE_SIZE;
    const startY  = this.level.groundY - Agent.HEIGHT / 2 - 2;

    this.slots.forEach((entry, i) => {
      if (!entry) return;

      const skinName = CompetitionManager.SKIN_NAMES[i];
      const agent    = new CompetitionAgent(startX, startY, skinName, entry);
      agent.brain    = BrainStorage.toNeuralNetwork(entry);
      agent.preloadSprites();

      // Décalage horizontal léger pour éviter superposition
      // (pas vertical — sinon les agents hors-sol tombent et meurent)
      agent.x += i * 1;

      this.agents.push(agent);
    });
  }

  // ── Update race ───────────────────────────
  update() {
    if (this.phase !== 'race') return;
    if (this.stopped || this._raceFinished) return;

    this._sessionFrames++;

    const surfaces = this.level.getSolidSurfaces();

    for (const agent of this.agents) {
      if (agent.isDead) continue;

      const inputs = Sensors.compute(
        agent,
        surfaces,
        this.level.enemies,
        this.level.cherries,
        agent.brain.inputCount
      );

      agent.decide(inputs);
      agent.update(surfaces);
    }

    this.level.update(this.agents);

    // Timeout ou tous morts → fin
    const allDead = this.agents.every(a => a.isDead);
    if (allDead || this._sessionFrames >= CompetitionManager.RACE_TIMEOUT) {
      this._raceFinished = true;
    }
  }

  // ── Draw race ─────────────────────────────

  // ── Parallax ──────────────────────────────

  // ── Stats pour leaderboard ────────────────
  get raceStats() {
    return this.agents.map((a, i) => ({
      index      : i,
      skinName   : a.skinName,
      label      : CompetitionManager.SKIN_LABELS[CompetitionManager.SKIN_NAMES.indexOf(a.skinName)],
      brainName  : a.brainEntry?.name || `Cerveau ${i+1}`,
      distance   : Math.round(a.distanceTravelled),
      cherries   : a.cherriesCollected,
      isDead     : a.isDead,
      fitness    : Math.round(a.fitness),
    })).sort((a, b) => b.distance - a.distance);
  }

  get isFinished() { return this._raceFinished; }

  stop()   { this.stopped = true; }
  resume() { this.stopped = false; }

  reset() {
    this.phase          = 'setup';
    this.agents         = [];
    this.stopped        = false;
    this._raceFinished  = false;
    this._sessionFrames = 0;
  }
}