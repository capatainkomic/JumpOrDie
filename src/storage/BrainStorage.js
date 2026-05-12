class BrainStorage {

  static STORAGE_KEY = 'jumpOrDie_brains';

  // ── Sauvegarder un cerveau ───────────────────
  // brain   : instance NeuralNetwork
  // meta    : { name, generation, difficulty, bestFitness }
  static save(brain, meta) {
    const entry = {
      // Métadonnées
      name           : meta.name || `Brain_gen${meta.generation}_${meta.difficulty}`,
      savedAt        : new Date().toLocaleDateString('fr-FR'),
      generation     : meta.generation,
      difficulty     : meta.difficulty,
      bestFitness    : Math.round(meta.bestFitness),

      // Architecture
      inputCount     : brain.inputCount,
      hiddenLayers   : brain.hiddenLayers,
      neuronsPerLayer: brain.neuronsPerLayer,
      activationFn   : brain.activationFn,

      // Poids appris
      weights        : brain.weights,
      biases         : brain.biases,
    };

    // Charger les cerveaux existants
    const all = BrainStorage.loadAll();
    all.push(entry);

    // Sauvegarder dans localStorage
    try {
      localStorage.setItem(
        BrainStorage.STORAGE_KEY,
        JSON.stringify({ brains: all })
      );
      console.log(`[BrainStorage] Cerveau sauvegardé : ${entry.name}`);
      return entry;
    } catch (e) {
      console.error('[BrainStorage] Erreur save :', e);
      return null;
    }
  }

  // ── Charger tous les cerveaux ────────────────
  static loadAll() {
    try {
      const raw = localStorage.getItem(BrainStorage.STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return data.brains || [];
    } catch (e) {
      console.error('[BrainStorage] Erreur loadAll :', e);
      return [];
    }
  }

  // ── Supprimer un cerveau par index ───────────
  static delete(index) {
    const all = BrainStorage.loadAll();
    if (index < 0 || index >= all.length) return;
    all.splice(index, 1);
    localStorage.setItem(
      BrainStorage.STORAGE_KEY,
      JSON.stringify({ brains: all })
    );
  }

  // ── Reconstruire un NeuralNetwork depuis une entrée ──
  static toNeuralNetwork(entry) {
    return NeuralNetwork.fromJSON({
      inputCount     : entry.inputCount,
      hiddenLayers   : entry.hiddenLayers,
      neuronsPerLayer: entry.neuronsPerLayer,
      activationFn   : entry.activationFn,
      weights        : entry.weights,
      biases         : entry.biases,
    });
  }

  // ── Exporter tous les cerveaux en JSON ───────
  static exportJSON() {
    const all  = BrainStorage.loadAll();
    if (all.length === 0) {
      console.warn('[BrainStorage] Aucun cerveau à exporter');
      return;
    }

    const json     = JSON.stringify({ brains: all }, null, 2);
    const blob     = new Blob([json], { type: 'application/json' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = `jumpOrDie_brains_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`[BrainStorage] Export JSON — ${all.length} cerveau(x)`);
  }

  // ── Importer des cerveaux depuis un fichier JSON ──
  static importJSON(onSuccess) {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = '.json';

    input.onchange = (e) => {
      const file   = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.brains || !Array.isArray(data.brains)) {
            throw new Error('Format invalide');
          }

          // Fusionner avec les cerveaux existants
          const existing = BrainStorage.loadAll();
          const merged   = [...existing, ...data.brains];
          localStorage.setItem(
            BrainStorage.STORAGE_KEY,
            JSON.stringify({ brains: merged })
          );

          console.log(`[BrainStorage] Import JSON — ${data.brains.length} cerveau(x)`);
          if (onSuccess) onSuccess(merged);
        } catch (err) {
          console.error('[BrainStorage] Erreur import :', err);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  // ── Vider tous les cerveaux ──────────────────
  static clear() {
    localStorage.removeItem(BrainStorage.STORAGE_KEY);
    console.log('[BrainStorage] Tous les cerveaux supprimés');
  }
}