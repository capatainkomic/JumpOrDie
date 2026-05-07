// ==============================================
// TrainingPanel.js
// Training panels — stats, progression, contrôles
// ==============================================

// Ajout des méthodes training sur UIPanel.prototype

UIPanel.prototype.showTraining = function(startDiff, callbacks = {}) {
    this._phase     = 'training';
    this._startDiff = startDiff || 'easy';
    this._cb = {
      onStop   : callbacks.onStop    || (() => {}),
      onResume : callbacks.onResume  || (() => {}),
      onSave   : callbacks.onSave    || null,
      onReset  : callbacks.onReset   || null,
      onMenu   : callbacks.onMenu    || (() => { gm.reset(); gm.goToMenu(); this.clear(); }),
      getAgents: callbacks.getAgents || null,
    };
    this._clear();

    const overlay = select('#config-overlay');
    if (overlay) overlay.style('display', 'none');

    // ── Panel gauche ──────────────────────────
    const L = select('#ui-left');
    this.showPanel('left');

    // Stats
    const h2s = createElement('h2', 'STATS');
    h2s.class('h-purple'); h2s.parent(L); this._els.push(h2s);
    const statCard = createElement('div');
    statCard.class('panel-card'); statCard.id('hud-stats'); statCard.parent(L);
    this._els.push(statCard);

    // Progression
    const h2p = createElement('h2', 'PROGRESSION');
    h2p.class('h-green'); h2p.parent(L); this._els.push(h2p);
    const progCard = createElement('div');
    progCard.class('panel-card'); progCard.id('hud-prog'); progCard.parent(L);
    this._els.push(progCard);

    // Config résumé
    const h2c = createElement('h2', 'CONFIG');
    h2c.class('h-blue'); h2c.parent(L); this._els.push(h2c);
    const cfgCard = createElement('div');
    cfgCard.class('panel-card'); cfgCard.id('hud-cfg'); cfgCard.parent(L);
    this._els.push(cfgCard);

    // ── Panel droit ───────────────────────────
    const R = select('#ui-right');
    this.showPanel('right');

    // Groupe simulation — grille 2×2 boutons carrés
    const h2r = createElement('h2', 'CONTRÔLES');
    h2r.class('h-pink'); h2r.parent(R); this._els.push(h2r);

    const grpSim = createElement('div');
    grpSim.class('panel-card'); grpSim.parent(R); this._els.push(grpSim);

    const grid = createElement('div');
    grid.class('btn-grid'); grid.parent(grpSim); this._els.push(grid);

    this._btnSquare(grid, '⏸', 'PAUSE',    'btn-square btn-stop',   () => this._cb.onStop());
    this._btnSquare(grid, '▶', 'RUN',      'btn-square btn-resume', () => this._cb.onResume());
    this._btnSquare(grid, '💾', 'SAVE',    'btn-square btn-save',   () => this._saveBrain());
    this._btnSquare(grid, '📤', 'EXPORT',  'btn-square btn-export', () => BrainStorage.exportJSON());

    // Navigation
    const grpNav = createElement('div');
    grpNav.class('panel-card'); grpNav.style('gap','4px'); grpNav.parent(R); this._els.push(grpNav);
    this._btn2(grpNav, '⚙ RECONFIGURER','Changer les paramètres',  'btn-newcfg', () => { if (this._cb.onReset) this._cb.onReset(); });
    this._btn2(grpNav, 'MENU',        '', 'btn-menu',   () => this._cb.onMenu());

    this._refreshCfgDisplay();
  }

UIPanel.prototype.updateHUD = function(stats) {
    if (this._phase !== 'training') return;

    // Stats
    const st = select('#hud-stats');
    if (st) st.html(`
      <div class="stat-row">
        <span class="stat-lbl">Génération</span>
        <span class="stat-val v-purple">${stats.generation}</span>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">Niveau</span>
        <span class="stat-val v-blue">${stats.levelIndex}</span>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">Vivants</span>
        <span class="stat-val v-green">${stats.aliveCount}<span style="font-size:8px;color:#B0BAC8"> /${stats.totalAgents}</span></span>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">Best fitness</span>
        <span class="stat-val">${Math.round(stats.bestFitness)}</span>
      </div>
    `);

    // Progression — cercle SVG
    const pr = select('#hud-prog');
    if (pr) {
      const diffs    = ['easy','medium','hard','killer'];
      const labels   = ['EASY','MED','HARD','KLR'];
      const colors   = ['#06D6A0','#FFD166','#FF6B9D','#7C6EEB'];
      const curIdx   = diffs.indexOf(stats.difficulty);
      const startIdx = diffs.indexOf(this._startDiff || 'easy');

      // Progression = niveaux réussis / levelsBeforeDifficulty
      const total    = gm.config.levelsBeforeDifficulty || 3;
      const done     = stats.levelsCompleted || 0;
      const pct      = Math.min(done / total, 1);
      const R_circle = 30;
      const circ     = 2 * Math.PI * R_circle;
      const offset   = circ * (1 - pct);
      const color    = colors[curIdx] || '#7C6EEB';
      const diffLabel= diffs[curIdx]?.toUpperCase() || 'EASY';

      // Mini track en dessous du cercle
      let track = '<div style="display:flex;gap:3px;width:100%;">';
      diffs.forEach((d, i) => {
        let bg = '#EAF0F8';
        let shadow = 'inset 1px 1px 3px #C8D0DE,inset -1px -1px 3px #FFFFFF';
        let txtColor = '#C0C8D8';
        if (i < startIdx) { bg='#EAF0F8'; txtColor='#D0D8E8'; }
        else if (i < curIdx)  { bg=colors[i]; shadow=`1px 2px 5px ${colors[i]}88`; txtColor='#fff'; }
        else if (i === curIdx){ bg=color; shadow=`1px 2px 8px ${color}99`; txtColor='#fff'; }
        track += `<div style="flex:1;height:14px;border-radius:4px;background:${bg};box-shadow:${shadow};display:flex;align-items:center;justify-content:center;font-family:Nunito,sans-serif;font-size:5px;font-weight:900;color:${txtColor};text-transform:uppercase;">${labels[i]}</div>`;
      });
      track += '</div>';

      pr.html(`
        <div class="prog-circle-wrap">
          <svg class="prog-circle-svg" viewBox="0 0 80 80">
            <circle class="prog-circle-bg" cx="40" cy="40" r="${R_circle}"/>
            <circle class="prog-circle-bar"
              cx="40" cy="40" r="${R_circle}"
              stroke="${color}"
              stroke-dasharray="${circ}"
              stroke-dashoffset="${offset}"/>
            <text class="prog-circle-diff" x="40" y="36" fill="${color}">${diffLabel}</text>
            <text class="prog-circle-gen"  x="40" y="50">GEN ${stats.generation}</text>
          </svg>
          <div class="prog-levels">NIVEAUX <span>${done}/${total}</span></div>
          ${track}
        </div>
      `);
    }
  }

UIPanel.prototype._refreshCfgDisplay = function() {
    const div = select('#hud-cfg');
    if (!div) return;
    const c = gm.config;
    div.html(`
      <div class="stat-row">
        <span class="stat-lbl">Population</span>
        <span class="stat-val v-purple">${c.populationSize}</span>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">Réseau</span>
        <span class="stat-val v-blue">${c.hiddenLayers}×${c.neuronsPerLayer}</span>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">Activation</span>
        <span class="stat-val v-green">${c.activationFn}</span>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">Mutation</span>
        <span class="stat-val">${c.mutationRate}</span>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">Inputs</span>
        <span class="stat-val v-pink">${c.inputCount}</span>
      </div>
    `);
  }

UIPanel.prototype._saveBrain = function() {
    if (!this._cb?.onSave) return;
    const result = this._cb.onSave();
    if (!result) return;
    BrainStorage.save(result.brain, {
      generation : result.generation,
      difficulty : result.difficulty,
      bestFitness: result.bestFitness,
    });
    alert(`✅ Sauvegardé !\nGén: ${result.generation} | Fitness: ${Math.round(result.bestFitness)}`);
  }

UIPanel.prototype.onCanvasClick = function(mx, my, camera) {
    if (!this.debugSteering || !this._cb?.getAgents) return;
    const agents = this._cb.getAgents();
    if (!agents) return;
    const w = camera.screenToWorld(mx, my);
    let closest = null, minD = 20;
    for (const a of agents) {
      if (a.isDead) continue;
      const d = dist(w.x, w.y, a.x, a.y);
      if (d < minD) { minD = d; closest = a; }
    }
    this.debugAgent = closest;
  }