class InputManager {

  constructor() {
    if (InputManager._instance) {
      return InputManager._instance;
    }
    InputManager._instance = this;

    // Position souris dans l'espace écran
    this.mouseX = 0;
    this.mouseY = 0;

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

}

const inputManager = new InputManager();