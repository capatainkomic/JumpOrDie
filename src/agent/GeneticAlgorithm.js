// ==============================================
// GeneticAlgorithm.js
//
// Implémente la sélection naturelle :
//   1. Trier les agents par fitness
//   2. Garder les meilleurs (élitisme)
//   3. Crossover + mutation pour les autres
//
// FITNESS FUNCTION :
//   distance × 2
//   + cerises collectées × 100
//   + temps survécu × 3
//   - sauts inutiles × 5
// ==============================================

class GeneticAlgorithm {

  static ELITE_RATIO = 0.30; // top 30% conservés sans mutation

  // ── Calcul du fitness ────────────────────────
  // Appelé à chaque frame par Population.update()
  // Met à jour agent.fitness en temps réel
  static calcFitness(agent, level) {
    if (agent.isDead) return;

    // Vitesse moyenne de progression réelle
    // = distance / frames — récompense efficacité ET survie
    const avgSpeed = agent.framesAlive > 0
      ? agent.distanceTravelled / agent.framesAlive
      : 0;

    agent.fitness =
      agent.distanceTravelled * 2
      + agent.cherriesCollected * 200
      + avgSpeed * 15
      + (agent.wasHitByEnemy ? -600 : 0);
  }

  // ── Prochaine génération ─────────────────────
  // agents : tableau d'Agent de la génération courante
  // Retourne un tableau de NeuralNetwork pour la prochaine génération
  static nextGeneration(agents) {
    // 1. Trier par fitness décroissant
    const sorted = [...agents].sort((a, b) => b.fitness - a.fitness);

    const eliteCount = Math.max(1, Math.floor(agents.length * GeneticAlgorithm.ELITE_RATIO));
    const newBrains  = [];

    // 2. Élitisme — conserver les meilleurs cerveaux tels quels
    for (let i = 0; i < eliteCount; i++) {
      newBrains.push(sorted[i].brain.copy());
    }

    // 3. Remplir le reste par crossover + mutation
    while (newBrains.length < agents.length) {
      const parentA = GeneticAlgorithm._selectParent(sorted);
      const parentB = GeneticAlgorithm._selectParent(sorted);

      const childBrain = GeneticAlgorithm._crossover(
        parentA.brain,
        parentB.brain
      );

      childBrain.mutate(gm.config.mutationRate);
      newBrains.push(childBrain);
    }

    return newBrains;
  }

  // ── Sélection par tournoi ────────────────────
  // Choisit un parent parmi les meilleurs
  // Les agents avec un meilleur fitness ont plus
  // de chances d'être sélectionnés
  static _selectParent(sortedAgents) {
    // Sélection par roulette biaisée vers le haut
    // Plus le rang est élevé, plus la probabilité est grande
    const totalFitness = sortedAgents.reduce((sum, a) => sum + Math.max(0, a.fitness), 0);

    if (totalFitness === 0) {
      // Tous à 0 → sélection aléatoire
      return sortedAgents[Math.floor(random(sortedAgents.length))];
    }

    let threshold = random(totalFitness);
    for (const agent of sortedAgents) {
      threshold -= Math.max(0, agent.fitness);
      if (threshold <= 0) return agent;
    }

    return sortedAgents[0];
  }

  // ── Crossover entre deux cerveaux ────────────
  // Pour chaque poids : choisir aléatoirement brainA ou brainB
  static _crossover(brainA, brainB) {
    const child = brainA.copy();

    for (let l = 0; l < child.weights.length; l++) {
      for (let r = 0; r < child.weights[l].length; r++) {
        for (let c = 0; c < child.weights[l][r].length; c++) {
          // 50% de chance de prendre le poids de B
          if (random() < 0.5) {
            child.weights[l][r][c] = brainB.weights[l][r][c];
          }
        }
      }

      // Crossover des biais aussi
      for (let r = 0; r < child.biases[l].length; r++) {
        if (random() < 0.5) {
          child.biases[l][r] = brainB.biases[l][r];
        }
      }
    }

    return child;
  }

  // ── Vérifie la condition d'arrêt ─────────────
  // Retourne true si l'entraînement doit s'arrêter
  static checkStopCondition(agents, level) {
    const threshold = gm.config.stopConditionThreshold;
    const pct       = gm.config.stopConditionPct;

    const passed = agents.filter(a =>
      a.distanceTravelled >= level.length * threshold
    ).length;

    return (passed / agents.length) >= pct;
  }
}