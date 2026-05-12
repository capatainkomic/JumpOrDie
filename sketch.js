// ==============================================
// sketch.js — JumpOrDie
// Point d'entrée p5.js
// 
// États : 'menu' | 'config' | 'training' | 'competition'
// Navigation :
//   menu → config (clic ENTRAÎNEMENT)
//   menu → competition (clic COMPÉTITION)  
//   config → training (clic START)
//   training → menu (RESET ou ESC)
//   competition → menu (ESC)
// ==============================================

const CANVAS_W  = 800;
const CANVAS_H  = 400;
const TILE_SIZE = 16;

// ── Globals ───────────────────────────────────
let camera;
let tileMap;
let levelGenerator;
let trainingManager;
let uiPanel;
// Navigation centralisée dans gm.appState

// ── Assets ────────────────────────────────────
let bgImg;
let logoImg;

// ── Preload ───────────────────────────────────
function preload() {
  bgImg   = loadImage('./assets/images/background.png',
    () => {}, () => { bgImg = null; });
  logoImg = loadImage('./assets/images/logo.png',
    () => {}, () => { logoImg = null; });
  _woodBtn = loadImage('./assets/images/wood_button.png',
    () => {}, () => { _woodBtn = null; });

  tileMap = new TileMap();
  tileMap.preload();
  Eagle.preload();
  Opossum.preload();
  Cherry.preload();
}

// ── Setup ─────────────────────────────────────
function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  cnv.parent('canvas-container');

  camera         = new Camera(CANVAS_W, CANVAS_H);
  levelGenerator = new LevelGenerator();
  uiPanel        = new UIPanel();
  
  competitionManager = new CompetitionManager(tileMap, levelGenerator);
  competitionManager.preload();

  frameRate(60);
}

// ── Draw ──────────────────────────────────────
function draw() {
  background(91, 200, 245);

  switch (gm.appState) {
    case 'menu':        _drawMenu();        break;
    case 'config':      _drawConfig();      break;
    case 'training':    _drawTraining();    break;
    case 'competition': _drawCompetition(); break;
  }


}

// ── MENU ──────────────────────────────────────

// ── CONFIG ────────────────────────────────────

// ── TRAINING ──────────────────────────────────

// ── STEERING DEBUG ────────────────────────────

// ── COMPETITION ───────────────────────────────
// ── COMPETITION ───────────────────────────────
function _drawCompetition() {
  if (competitionManager.phase === 'setup') {
    // Panel droit — créé une seule fois via UIPanel
    uiPanel.showCompetitionSetup(competitionManager);
    _drawCompetitionSetup();
  } else {
    _drawCompetitionRace();
  }
}


// ── MOUSE ─────────────────────────────────────
function mousePressed() {
  if (mouseButton !== LEFT) return;

  // Ne pas intercepter les clics sur les éléments HTML hors canvas
  const cnv = document.querySelector('#canvas-container canvas');
  if (cnv) {
    const rect = cnv.getBoundingClientRect();
    const mx = (window.event || {}).clientX;
    const my = (window.event || {}).clientY;
    if (mx !== undefined && (mx < rect.left || mx > rect.right || my < rect.top || my > rect.bottom)) {
      return;
    }
  }

  if (gm.isMenu()) {
    const btnW = 260;
    const btnH = Math.round(btnW * (667 / 1746));
    const btnX = CANVAS_W / 2 - btnW / 2;
    const btnY1 = 155;
    const btnY2 = btnY1 + btnH + 16;

    // Bouton TRAINING
    if (mouseX > btnX && mouseX < btnX + btnW &&
        mouseY > btnY1 && mouseY < btnY1 + btnH) {
      gm.goToConfig();
      uiPanel.showConfig((startDiff) => {
        gm.reset();
        trainingManager = new TrainingManager(tileMap, levelGenerator);
        gm.goToTraining();
        uiPanel.showTraining(startDiff, _trainingCallbacks());
      });
    }

    // Bouton COMPETITION
    if (mouseX > btnX && mouseX < btnX + btnW &&
        mouseY > btnY2 && mouseY < btnY2 + btnH) {
      gm.goToCompetition();
      competitionManager.reset();
      uiPanel._phase = 'menu';
    }
    return;
  }

  // Clics slots compétition — phase setup
  if (gm.isCompetition() && competitionManager.phase === 'setup') {
    const slotW  = 200, slotH = 100;
    const totalW = slotW * 3 + 20 * 2;
    const startX = CANVAS_W / 2 - totalW / 2;
    const slotY  = 60;

    for (let i = 0; i < 3; i++) {
      const sx   = startX + i * (slotW + 20);
      const btnY = slotY + slotH + 5;
      const bx   = sx + 10;
      const btnW = slotW - 20;
      const btnH = 22;

      if (mouseX > bx && mouseX < bx + btnW &&
          mouseY > btnY && mouseY < btnY + btnH) {
        if (competitionManager.slots[i]) {
          competitionManager.unloadBrain(i);
        } else {
          _openBrainSelector(i);
        }
        return;
      }
    }
    return;
  }

  inputManager.onClick(camera);
}

// ── Callbacks training ────────────────────────
// POURQUOI : centralisé ici pour que UIPanel n'ait pas besoin
// de connaitre trainingManager. Sketch.js fournit les actions,
// UIPanel les appelle sans savoir d'ou elles viennent.
function _trainingCallbacks() {
  return {
    onStop   : () => trainingManager?.stop(),
    onResume : () => trainingManager?.resume(),
    onSave   : () => {
      if (!trainingManager?.population?.bestAgent) return null;
      const best = trainingManager.population.bestAgent;
      const s    = trainingManager.stats;
      return {
        brain      : best.brain,
        generation : s.generation,
        difficulty : s.difficulty,
        bestFitness: s.bestFitness,
      };
    },
    onReset  : () => _onReset(),
    onMenu   : () => { trainingManager = null; gm.reset(); gm.goToMenu(); uiPanel.clear(); },
    getAgents: () => trainingManager?.population?.agents || null,
  };
}

// ── RESET callback ────────────────────────────
function _onReset() {
  trainingManager = null;
  gm.reset();
  gm.goToConfig();
  uiPanel.showConfig((startDiff) => {
    gm.reset();
    trainingManager = new TrainingManager(tileMap, levelGenerator);
    gm.goToTraining();
    uiPanel.showTraining(startDiff, _trainingCallbacks());
  });
}

// ── Sélecteur de cerveau ──────────────────────

// ── KEYS ──────────────────────────────────────
function keyPressed() {
  if (keyCode === ESCAPE) {
    // Nettoyer l overlay des cards competition si présent
    if (typeof _cardOverlay !== 'undefined' && _cardOverlay) {
      _cardOverlay.remove(); _cardOverlay = null;
    }

    if (typeof _lastSlotsState !== 'undefined') _lastSlotsState = null;
    
    trainingManager = null;
    competitionManager.reset();
    gm.reset();
    gm.goToMenu();
    uiPanel.clear();
  }
}