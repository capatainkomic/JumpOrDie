class Population {

  constructor(size, startX, startY) {
    this.size   = size;
    this.agents = [];

    // Palette de couleurs pour distinguer les agents
    const colors = [
      [231, 76,  60],  // rouge
      [52,  152, 219], // bleu
      [46,  204, 113], // vert
      [241, 196, 15],  // jaune
      [155, 89,  182], // violet
      [26,  188, 156], // turquoise
      [230, 126, 34],  // orange
      [236, 240, 241], // blanc
    ];

    for (let i = 0; i < size; i++) {
      const c   = colors[i % colors.length];
      const col = color(c[0], c[1], c[2]);
      const agent = new Agent(startX, startY, col);

      // Créer un cerveau aléatoire depuis la config GameManager
      agent.brain = new NeuralNetwork(
        gm.config.inputCount,
        gm.config.hiddenLayers,
        gm.config.neuronsPerLayer,
        gm.config.activationFn
      );

      this.agents.push(agent);
    }
  }

  // ── Mise à jour de tous les agents ───────────
  update(surfaces, level) {
    for (const agent of this.agents) {
      if (agent.isDead) continue;

      const inputs = Sensors.compute(
        agent,
        surfaces,
        level.cherries,
        level.enemies,
        gm.config.inputCount
      );

      agent.decide(inputs);
      agent.update(surfaces);
      GeneticAlgorithm.calcFitness(agent, level);
    }
  }

  // ── Rendu de tous les agents ─────────────────
  draw() {
    // Dessiner les morts en premier (derrière)
    for (const agent of this.agents) {
      if (agent.isDead) agent.draw();
    }
    // Dessiner les vivants par dessus
    for (const agent of this.agents) {
      if (!agent.isDead) agent.draw();
    }
  }

  // ── Nombre d'agents vivants ──────────────────
  get aliveCount() {
    return this.agents.filter(a => !a.isDead).length;
  }

  // ── Meilleur agent absolu (fitness max) : Utilisé par GeneticAlgorithm — mort ou vivant ─────
  get bestAgent() {
    return this.agents.reduce((best, a) =>
      a.fitness > best.fitness ? a : best
    , this.agents[0]);
  }

  // ── Meilleur agent vivant (pour la caméra) ───
  get bestLiveAgent() {
    const alive = this.agents.filter(a => !a.isDead);
    if (alive.length === 0) return this.bestAgent;
    return alive.reduce((best, a) =>
      a.fitness > best.fitness ? a : best
    , alive[0]);
  }

  // ── Tous les agents sont morts ? ─────────────
  isExtinct() {
    return this.agents.every(a => a.isDead);
  }
}