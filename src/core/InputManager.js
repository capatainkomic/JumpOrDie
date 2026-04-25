// ==============================================
// InputManager.js
// Singleton — centralise tous les inputs
// souris + clavier
// ==============================================

class InputManager {

  constructor() {
    if (InputManager._instance) {
      return InputManager._instance;
    }
    InputManager._instance = this;

    // Position souris dans l'espace écran
    this.mouseX = 0;
    this.mouseY = 0;

    // Élément sélectionné dans l'éditeur
    // 'platform' | 'enemy' | 'trap' | null
    this.selectedEditorElement = null;

    // Callbacks enregistrés pour les clics
    this._clickCallbacks = [];
  }

  

  // ── Clic souris gauche ───────────────────────
  onClick(camera) {
    const worldPos = camera.screenToWorld(this.mouseX, this.mouseY);
    this._clickCallbacks.forEach(cb => cb(worldPos, this.selectedEditorElement));
  }

  // ── Enregistrer un callback de clic ─────────
  onClickRegister(callback) {
    this._clickCallbacks.push(callback);
  }

  // ── Sélection outil éditeur ──────────────────
  selectEditorElement(type) {
    this.selectedEditorElement = type;
    console.log('[InputManager] Outil sélectionné :', type);
  }

  clearEditorElement() {
    this.selectedEditorElement = null;
  }
}

const inputManager = new InputManager();