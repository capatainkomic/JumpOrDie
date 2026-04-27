// ==============================================
// NeuralNetwork.js
//
// Réseau de neurones multicouche (MLP).
// Utilisé par chaque agent comme "cerveau".
//
// STRUCTURE :
//   inputs → [couche cachée 1] → ... → [couche cachée N] → outputs
//
// OUTPUTS (2 neurones) :
//   [0] → sauter si > 0.5
//   [1] → ne rien faire
// ==============================================

class NeuralNetwork {

  // inputCount    : nombre d'inputs (capteurs)
  // hiddenLayers  : nombre de couches cachées
  // neuronsPerLayer : neurones par couche cachée
  // activationFn  : 'sigmoid' | 'relu' | 'tanh'
  constructor(inputCount, hiddenLayers, neuronsPerLayer, activationFn = 'sigmoid') {
    this.inputCount      = inputCount;
    this.hiddenLayers    = hiddenLayers;
    this.neuronsPerLayer = neuronsPerLayer;
    this.activationFn    = activationFn;

    // Poids et biais — initialisés aléatoirement entre -1 et 1
    // weights[i] = matrice de poids entre couche i et couche i+1
    // biases[i]  = vecteur de biais de la couche i+1
    this.weights = [];
    this.biases  = [];

    this._initWeights();
  }

  // ── Initialisation aléatoire des poids ───────
  _initWeights() {
    // Tailles des couches : [inputs, hidden..., outputs]
    const sizes = this._layerSizes();

    for (let i = 0; i < sizes.length - 1; i++) {
      const rows = sizes[i + 1]; // neurones de la couche suivante
      const cols = sizes[i];     // neurones de la couche courante

      // Matrice rows × cols
      const W = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          row.push(random(-1, 1));
        }
        W.push(row);
      }
      this.weights.push(W);

      // Vecteur de biais pour cette couche
      const B = [];
      for (let r = 0; r < rows; r++) {
        B.push(random(-1, 1));
      }
      this.biases.push(B);
    }
  }

  // ── Tailles de chaque couche ─────────────────
  // [inputCount, neuronsPerLayer × hiddenLayers, 2 outputs]
  _layerSizes() {
    const sizes = [this.inputCount];
    for (let i = 0; i < this.hiddenLayers; i++) {
      sizes.push(this.neuronsPerLayer);
    }
    sizes.push(2); // 2 outputs : sauter / ne rien faire
    return sizes;
  }

  // ── Forward pass ─────────────────────────────
  // inputs : tableau de valeurs normalisées [0, 1]
  // retourne : tableau de 2 valeurs (outputs)
  forward(inputs) {
    let current = inputs.slice(); // copie des inputs

    for (let i = 0; i < this.weights.length; i++) {
      const W   = this.weights[i];
      const B   = this.biases[i];
      const next = [];

      for (let r = 0; r < W.length; r++) {
        // Produit scalaire + biais
        let sum = B[r];
        for (let c = 0; c < W[r].length; c++) {
          sum += W[r][c] * current[c];
        }
        next.push(this._activate(sum));
      }

      current = next;
    }

    return current; // [valeur_sauter, valeur_rien]
  }

  // ── Fonction d'activation ────────────────────
  _activate(x) {
    switch (this.activationFn) {
      case 'relu':
        return Math.max(0, x);
      case 'tanh':
        return Math.tanh(x);
      case 'sigmoid':
      default:
        return 1 / (1 + Math.exp(-x));
    }
  }

  // ── Copie profonde du réseau ─────────────────
  // Utilisée pour l'élitisme et le crossover (Feature 5)
  copy() {
    const clone = new NeuralNetwork(
      this.inputCount,
      this.hiddenLayers,
      this.neuronsPerLayer,
      this.activationFn
    );

    // Copier les poids
    clone.weights = this.weights.map(W =>
      W.map(row => row.slice())
    );

    // Copier les biais
    clone.biases = this.biases.map(B => B.slice());

    return clone;
  }

  // ── Mutation ─────────────────────────────────
  // rate : probabilité de muter chaque poids (ex: 0.08)
  // Ajoute un bruit gaussien approximé aux poids mutés
  mutate(rate) {
    for (const W of this.weights) {
      for (const row of W) {
        for (let c = 0; c < row.length; c++) {
          if (random() < rate) {
            // Bruit gaussien approximé (Box-Muller simplifié)
            row[c] += randomGaussian(0, 0.3);
            // Clamp pour éviter les valeurs explosives
            row[c] = constrain(row[c], -2, 2);
          }
        }
      }
    }

    for (const B of this.biases) {
      for (let i = 0; i < B.length; i++) {
        if (random() < rate) {
          B[i] += randomGaussian(0, 0.3);
          B[i]  = constrain(B[i], -2, 2);
        }
      }
    }
  }

  // ── Sérialisation JSON ───────────────────────
  // Utilisée pour Save/Load en Feature 8
  toJSON() {
    return {
      inputCount      : this.inputCount,
      hiddenLayers    : this.hiddenLayers,
      neuronsPerLayer : this.neuronsPerLayer,
      activationFn    : this.activationFn,
      weights         : this.weights,
      biases          : this.biases,
    };
  }

  // ── Désérialisation JSON ─────────────────────
  static fromJSON(data) {
    const nn = new NeuralNetwork(
      data.inputCount,
      data.hiddenLayers,
      data.neuronsPerLayer,
      data.activationFn
    );
    nn.weights = data.weights;
    nn.biases  = data.biases;
    return nn;
  }
}