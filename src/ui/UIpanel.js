// ==============================================
// UIPanel.js — JumpOrDie
//
// Phase 1 : config overlay sur le canvas
// Phase 2 : panels gauche/droite
// ==============================================

class UIPanel {

  constructor() {
    this._els          = [];
    this.debugSteering = false;
    this.debugAgent    = null;
    this._phase        = 'menu';
    this._onReset      = null;
    this._startDiff    = 'easy';
    this._inputConfig  = {
      grid: true, avoidOpossum: true, avoidEagle: true,
      seekCherry: true, isOnGround: true, vertSpeed: true,
    };
    // Valeurs courantes des sliders config
    this._cfgVals = {
      pop: gm?.config.populationSize   ?? 50,
      lay: gm?.config.hiddenLayers     ?? 2,
      neu: gm?.config.neuronsPerLayer  ?? 12,
      mut: gm?.config.mutationRate     ?? 0.08,
      act: gm?.config.activationFn     ?? 'sigmoid',
      diff: gm?.config.difficulty      ?? 'easy',
      pct: gm?.config.stopConditionPct ?? 0.6,
      th : gm?.config.stopConditionThreshold ?? 0.6,
    };
  }

  hidePanels() {
    select('#ui-left').removeClass('visible');
    select('#ui-right').removeClass('visible');
  }
  showPanel(side) { select(`#ui-${side}`).addClass('visible'); }

  // ─────────────────────────────────────────────
  // PHASE 1 — Config overlay
  // ─────────────────────────────────────────────
  showConfig(onStart) {
    this._phase   = 'config';
    this._clear();
    this.hidePanels();

    const overlay = select('#config-overlay');
    if (!overlay) { console.error('[UIPanel] #config-overlay manquant'); return; }

    // Construire le HTML de l'overlay
    overlay.html(this._buildConfigHTML());
    overlay.style('display', 'flex');

    // Brancher les events
    this._bindConfigEvents(overlay, onStart);
  }

  _buildConfigHTML() {
    const v = this._cfgVals;
    const ic = this._inputConfig;

    const diffBtns = ['easy','medium','hard','killer'].map(d => {
      const icons = { easy:'🌸', medium:'🌿', hard:'🪨', killer:'💀' };
      const active = d === v.diff ? 'active' : '';
      return `<div class="cfg-diff-btn ${d} ${active}" data-diff="${d}">
        <span class="cfg-diff-icon">${icons[d]}</span>
        <span class="cfg-diff-label">${d.toUpperCase()}</span>
      </div>`;
    }).join('');

    const cbRow = (isChild, key, label, count) => {
      const checked = ic[key] !== false;
      const cls = isChild ? 'cfg-cb-row child' : 'cfg-cb-row';
      return `<div class="${cls}" data-key="${key}">
        <span class="cfg-cb-label">${label}</span>
        <div class="cfg-cb-check ${checked?'checked':''}" data-key="${key}">${checked?'✓':''}</div>
      </div>`;
    };

    const totalInputs = this._countInputs();
    const pctA = Math.round(v.pct * 100);
    const pctB = Math.round(v.th  * 100);

    return `
    <div class="cfg-header">
      <div class="cfg-header-plaque">
        <div class="cfg-title-main"> CONFIGURATION </div>
        <div class="cfg-subtitle">PRÊT À ENTRAÎNER VOS AGENTS !</div>
      </div>
    </div>

    <div class="cfg-main-panel">

      <!-- COLONNE GAUCHE -->
      <div class="cfg-col-left">

        <div class="cfg-section-header">
          <span class="cfg-section-title">RÉSEAU DE NEURONES</span>
        </div>

        ${this._sliderHTML('pop',  'POPULATION',        10,  200, v.pop,  10)}
        ${this._sliderHTML('lay',  'COUCHES CACHÉES',    1,    4, v.lay,   1)}
        ${this._sliderHTML('neu',  'NEURONES/COUCHE',    4,   32, v.neu,   2)}
        ${this._sliderHTML('mut',  'TAUX DE MUTATION', 0.01, 0.5, v.mut, 0.01)}

        <div class="cfg-select-row">
          <span class="cfg-select-label">ACTIVATION</span>
          <select class="cfg-select-input" id="cfg-act">
            <option ${v.act==='sigmoid'?'selected':''}>sigmoid</option>
            <option ${v.act==='relu'   ?'selected':''}>relu</option>
            <option ${v.act==='tanh'   ?'selected':''}>tanh</option>
          </select>
        </div>

        <div class="cfg-section-header" style="margin-top:3px;">
          <span class="cfg-section-title">INPUTS ACTIVÉS</span>
        </div>

        <div class="cfg-cb-grid">
          ${cbRow(false,'grid',        'GRILLE (12)',  12,  true)}
          ${cbRow(false,'forces',      'REYNOLDS (6)',  6,  true)}
          ${cbRow(false,'states',      'INTERNES (2)', 2,  true)}
          ${cbRow(true, 'avoidEagle',  '↳ EAGLE',    '+2', false)}
          ${cbRow(true, 'vertSpeed',   '↳ VITESSE VERTICALE',  '+1', false)}
          ${cbRow(true, 'avoidOpossum','↳ OPOSSUM',  '+2', false)}
          ${cbRow(true, 'isOnGround',  '↳ EN L\'AIR', '+1', false)}
          ${cbRow(true, 'seekCherry',  '↳ CHERRY',   '+2', false)}
          
        </div>

        <div class="cfg-total-row">
          <span class="cfg-total-label">▶ TOTAL INPUTS</span>
          <span class="cfg-total-value" id="cfg-total">${totalInputs}</span>
        </div>

      </div>

      <!-- COLONNE DROITE -->
      <div class="cfg-col-right">

        <div class="cfg-section-header green">
          <span class="cfg-section-title">DIFFICULTÉ DU LEVEL DE DÉPART</span>
        </div>

        <div class="cfg-diff-grid">${diffBtns}</div>

        <div class="cfg-section-header teal" style="margin-top:6px;">
          <span class="cfg-section-icon"></span>
          <span class="cfg-section-title">CONDITION D'ARRÊT DE NIVEAU</span>
        </div>

        <div class="cfg-stop-phrase-box">
          <div class="cfg-stop-text">
            MAÎTRISÉ QUAND
            <span class="cfg-stop-pct-agents" id="cfg-pct-a-display">${pctA}%</span> DES AGENTS
            PARCOURENT
            <span class="cfg-stop-pct-level" id="cfg-pct-b-display">${pctB}%</span> DU NIVEAU
          </div>
        </div>

        <div class="cfg-stop-sliders-row">
          <div class="cfg-stop-slider-block">
            <div class="cfg-stop-slider-head">
              <span class="cfg-stop-slider-label">🐾 % AGENTS</span>
              <span class="cfg-sl-val" id="cfg-pct-a-val">${pctA}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:3px;">
              <button class="cfg-btn-minus" data-sl="pct" data-step="-5">−</button>
              <input type="range" class="cfg-range" id="cfg-sl-pct" min="30" max="100" value="${pctA}" step="5" style="flex:1">
              <button class="cfg-btn-plus" data-sl="pct" data-step="5">+</button>
            </div>
          </div>
          <div class="cfg-stop-slider-block">
            <div class="cfg-stop-slider-head">
              <span class="cfg-stop-slider-label">🏁 % NIVEAU</span>
              <span class="cfg-sl-val" id="cfg-pct-b-val">${pctB}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:3px;">
              <button class="cfg-btn-minus" data-sl="th" data-step="-5">−</button>
              <input type="range" class="cfg-range" id="cfg-sl-th" min="30" max="100" value="${pctB}" step="5" style="flex:1">
              <button class="cfg-btn-plus" data-sl="th" data-step="5">+</button>
            </div>
          </div>
        </div>

        <button class="cfg-start-btn" id="cfg-start-btn">
          <span class="cfg-start-main">▶▶ START TRAINING ◀◀</span>
          <span class="cfg-start-sub">LANCER L'ENTRAÎNEMENT</span>
        </button>

      </div>
    </div>`;
  }

  _sliderHTML(id, label, min, max, val, step) {
    return `
    <div class="cfg-slider-row">
      <span class="cfg-slider-label">${label}</span>
      <span class="cfg-slider-value" id="cfg-val-${id}">${val}</span>
      <div class="cfg-slider-track">
        <input type="range" class="cfg-range" id="cfg-sl-${id}" min="${min}" max="${max}" value="${val}" step="${step}">
      </div>
    </div>`;
  }

  _toggleBox(box, value) {
    if (value) {
      box.classList.add('checked');
      box.textContent = '✓';
    } else {
      box.classList.remove('checked');
      box.textContent = '';
    }
  }

  _bindConfigEvents(overlay, onStart) {
    const el = overlay.elt;
    const v  = this._cfgVals;
    const ic = this._inputConfig;

    // Sliders réseau
    ['pop','lay','neu','mut'].forEach(id => {
      const sl  = el.querySelector(`#cfg-sl-${id}`);
      const val = el.querySelector(`#cfg-val-${id}`);
      if (!sl) return;
      sl.addEventListener('input', () => { v[id] = parseFloat(sl.value); val.textContent = sl.value; });
    });

    // Boutons +/-
    el.querySelectorAll('.cfg-btn-minus, .cfg-btn-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const slId = btn.dataset.sl;
        const step = parseFloat(btn.dataset.step);
        const sl   = el.querySelector(`#cfg-sl-${slId}`);
        if (!sl) return;
        const newVal = Math.min(parseFloat(sl.max||100), Math.max(parseFloat(sl.min||0), parseFloat(sl.value) + step));
        sl.value = newVal;
        sl.dispatchEvent(new Event('input'));
      });
    });

    // Sliders stop condition
    const slPct = el.querySelector('#cfg-sl-pct');
    const slTh  = el.querySelector('#cfg-sl-th');
    if (slPct) slPct.addEventListener('input', () => {
      v.pct = slPct.value / 100;
      el.querySelector('#cfg-pct-a-val').textContent     = slPct.value + '%';
      el.querySelector('#cfg-pct-a-display').textContent = slPct.value + '%';
    });
    if (slTh) slTh.addEventListener('input', () => {
      v.th = slTh.value / 100;
      el.querySelector('#cfg-pct-b-val').textContent     = slTh.value + '%';
      el.querySelector('#cfg-pct-b-display').textContent = slTh.value + '%';
    });

    // Activation select
    const actSel = el.querySelector('#cfg-act');
    if (actSel) actSel.addEventListener('change', () => { v.act = actSel.value; });

    // Boutons difficulté
    el.querySelectorAll('.cfg-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.querySelectorAll('.cfg-diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        v.diff = btn.dataset.diff;
      });
    });

    // Checkboxes inputs
    el.querySelectorAll('.cfg-cb-check').forEach(box => {
      box.addEventListener('click', () => {
        const key     = box.dataset.key;
        const newVal  = !box.classList.contains('checked');

        this._toggleBox(box, newVal);

        if (key === 'forces') {
          // Parent → sync tous les enfants visuellement
          ['avoidOpossum','avoidEagle','seekCherry'].forEach(k => {
            ic[k] = newVal;
            const child = el.querySelector(`.cfg-cb-check[data-key="${k}"]`);
            if (child) this._toggleBox(child, newVal);
          });
        } else if (key === 'states') {
          ['isOnGround','vertSpeed'].forEach(k => {
            ic[k] = newVal;
            const child = el.querySelector(`.cfg-cb-check[data-key="${k}"]`);
            if (child) this._toggleBox(child, newVal);
          });
        } else {
          ic[key] = newVal;
          // Enfant décoché → décocher parent si tous décochés
          if (!newVal) {
            if (['avoidOpossum','avoidEagle','seekCherry'].includes(key)) {
              if (!ic.avoidOpossum && !ic.avoidEagle && !ic.seekCherry) {
                const p = el.querySelector('.cfg-cb-check[data-key="forces"]');
                if (p) this._toggleBox(p, false);
              }
            }
            if (['isOnGround','vertSpeed'].includes(key)) {
              if (!ic.isOnGround && !ic.vertSpeed) {
                const p = el.querySelector('.cfg-cb-check[data-key="states"]');
                if (p) this._toggleBox(p, false);
              }
            }
          }
        }

        el.querySelector('#cfg-total').textContent = this._countInputs();
      });
    });

    // Bouton START
    const startBtn = el.querySelector('#cfg-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => {
      // Appliquer dans gm.config
      gm.config.populationSize         = parseInt(v.pop);
      gm.config.hiddenLayers           = parseInt(v.lay);
      gm.config.neuronsPerLayer        = parseInt(v.neu);
      gm.config.mutationRate           = parseFloat(v.mut);
      gm.config.activationFn           = v.act;
      gm.config.difficulty             = v.diff;
      gm.config.stopConditionPct       = parseFloat(v.pct);
      gm.config.stopConditionThreshold = parseFloat(v.th);
      gm.config.inputConfig            = { ...ic };
      gm.config.inputCount             = this._countInputs();
      overlay.style('display', 'none');
      if (onStart) onStart(v.diff);
    });
  }

  _countInputs() {
    const ic = this._inputConfig;
    return (ic.grid?12:0)+(ic.avoidOpossum?2:0)+(ic.avoidEagle?2:0)+
           (ic.seekCherry?2:0)+(ic.isOnGround?1:0)+(ic.vertSpeed?1:0);
  }

  // ─────────────────────────────────────────────
  // PHASE 2 — Training
  // ─────────────────────────────────────────────
  showTraining(startDiff, onReset) {
    this._phase     = 'training';
    this._startDiff = startDiff || 'easy';
    this._onReset   = onReset;
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

    this._btnSquare(grid, '⏸', 'PAUSE',    'btn-square btn-stop',   () => trainingManager?.stop());
    this._btnSquare(grid, '▶', 'RUN',      'btn-square btn-resume', () => trainingManager?.resume());
    this._btnSquare(grid, '💾', 'SAVE',    'btn-square btn-save',   () => this._saveBrain());
    this._btnSquare(grid, '📤', 'EXPORT',  'btn-square btn-export', () => BrainStorage.exportJSON());

    // Navigation
    const grpNav = createElement('div');
    grpNav.class('panel-card'); grpNav.style('gap','4px'); grpNav.parent(R); this._els.push(grpNav);
    this._btn2(grpNav, '⚙ RECONFIGURER','Changer les paramètres',  'btn-newcfg', () => { if (this._onReset) this._onReset(); });
    this._btn2(grpNav, 'MENU',        '', 'btn-menu',   () => {
      if (typeof trainingManager !== 'undefined') trainingManager = null;
      gm.reset(); gm.goToMenu(); this.clear();
    });

    this._refreshCfgDisplay();
  }

  updateHUD(stats) {
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

  _refreshCfgDisplay() {
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

  _btnSquare(p, icon, label, cls, onClick) {
    const b = createButton('');
    b.class(cls); b.parent(p);
    b.elt.innerHTML = `<span class="btn-sq-icon">${icon}</span><span class="btn-sq-label">${label}</span>`;
    b.mousePressed(onClick);
    this._els.push(b);
    return b;
  }
   

  _saveBrain() {
    if (!trainingManager?.population) return;
    const best = trainingManager.population.bestAgent;
    const s    = trainingManager.stats;
    BrainStorage.save(best.brain, {
      generation : s.generation,
      difficulty : s.difficulty,
      bestFitness: s.bestFitness,
    });
    alert(`✅ Sauvegardé !\nGén: ${s.generation} | Fitness: ${Math.round(s.bestFitness)}`);
  }

  onCanvasClick(mx, my, camera) {
    if (!this.debugSteering || !trainingManager?.population) return;
    const w = camera.screenToWorld(mx, my);
    let closest = null, minD = 20;
    for (const a of trainingManager.population.agents) {
      if (a.isDead) continue;
      const d = dist(w.x, w.y, a.x, a.y);
      if (d < minD) { minD = d; closest = a; }
    }
    this.debugAgent = closest;
  }

  clear() {
    this._clear();
    this.hidePanels();
    this._phase = 'menu';
    const ov = select('#config-overlay');
    if (ov) { ov.html(''); ov.style('display','none'); }
  }

  _clear() {
    this._els.forEach(el => { try { el.remove(); } catch(e){} });
    this._els = [];
    try { select('#ui-left').html('');  } catch(e){}
    try { select('#ui-right').html(''); } catch(e){}
  }

  _h2(p, t) { const e=createElement('h2',t); e.parent(p); this._els.push(e); return e; }
  _sep(p)    { const e=createElement('hr'); e.class('sep'); e.parent(p); this._els.push(e); }
  _btn(p, label, cls, onClick) {
    const b=createButton(label); b.class(cls); b.parent(p); b.mousePressed(onClick);
    this._els.push(b); return b;
  }

  _btn2(p, label, sub, cls, onClick) {
    const b = createButton('');
    b.class(cls); b.parent(p);
    b.elt.innerHTML = `<span class="btn-label">${label}</span><span class="btn-sub">${sub}</span>`;
    b.mousePressed(onClick);
    this._els.push(b);
    return b;
  }

  // ─────────────────────────────────────────────
  // COMPÉTITION — Setup
  // ─────────────────────────────────────────────
  showCompetitionSetup(cm) {
    this._phase = 'comp-setup';
    this._clear();

    // Panel droit — config niveau + start
    const R = select('#ui-right');
    this.showPanel('right');

    const h2 = createElement('h2', '🌍 NIVEAU');
    h2.class('h-green'); h2.parent(R); this._els.push(h2);

    const diffCard = createElement('div');
    diffCard.class('panel-card'); diffCard.parent(R); this._els.push(diffCard);

    const lbl = createElement('p', 'Difficulté :');
    lbl.style('font-size','11px'); lbl.style('color','#7B88A8');
    lbl.parent(diffCard); this._els.push(lbl);

    const sel = createSelect();
    ['easy','medium','hard','killer'].forEach(d => sel.option(d));
    sel.selected('easy'); sel.parent(diffCard); this._els.push(sel);

    const genBtn = createButton('🎲 GÉNÉRER NIVEAU');
    genBtn.class('btn-export'); genBtn.parent(diffCard);
    genBtn.mousePressed(() => cm.generateLevel(sel.value()));
    this._els.push(genBtn);

    const sep = createElement('hr'); sep.class('sep'); sep.parent(R); this._els.push(sep);

    const startBtn = createButton('▶ START RACE');
    startBtn.class('btn-resume'); startBtn.parent(R);
    startBtn.mousePressed(() => {
      const hasOne = cm.slots.some(s => s !== null);
      if (!hasOne) { alert('Chargez au moins 1 cerveau !'); return; }
      if (!cm.level) cm.generateLevel(sel.value());
      cm.startRace();
      this._phase = 'comp-race';
      this._clear();
      this.hidePanels();
      this._showRacePanels(cm);
    });
    this._els.push(startBtn);

    const sepMenu = createElement('hr'); sepMenu.class('sep'); sepMenu.parent(R); this._els.push(sepMenu);

    const menuBtn = createButton('🏠 MENU');
    menuBtn.class('btn-menu'); menuBtn.parent(R);
    menuBtn.mousePressed(() => {
      cm.reset();
      gm.goToMenu();
      this.clear();
    });
    this._els.push(menuBtn);
  }

  // ─────────────────────────────────────────────
  // COMPÉTITION — Race panels
  // ─────────────────────────────────────────────
  _showRacePanels(cm) {
    const L = select('#ui-left');
    this.showPanel('left');

    const h2l = createElement('h2', '🏆 COURSE');
    h2l.class('h-pink'); h2l.parent(L); this._els.push(h2l);

    const statsDiv = createElement('div');
    statsDiv.class('panel-card'); statsDiv.id('race-stats'); statsDiv.parent(L);
    this._els.push(statsDiv);

    const R = select('#ui-right');
    this.showPanel('right');

    const h2r = createElement('h2', '🎮 CONTRÔLES');
    h2r.class('h-purple'); h2r.parent(R); this._els.push(h2r);

    const ctrlCard = createElement('div');
    ctrlCard.class('panel-card'); ctrlCard.style('gap','4px'); ctrlCard.parent(R);
    this._els.push(ctrlCard);

    this._btn2(ctrlCard, '⏸ PAUSE',    'Mettre en pause',      'btn-stop',   () => cm.stop());
    this._btn2(ctrlCard, '▶ REPRENDRE','Continuer la course',   'btn-resume', () => cm.resume());

    const sep = createElement('hr'); sep.class('sep'); sep.parent(R); this._els.push(sep);

    const nav = createElement('div');
    nav.class('panel-card'); nav.style('gap','4px'); nav.parent(R); this._els.push(nav);

    this._btn2(nav, '🔄 REJOUER',  'Relancer même cerveaux',  'btn-save',   () => {
      cm.startRace();
      this._phase = 'comp-race';
      this._clear();
      this.hidePanels();
      this._showRacePanels(cm);
    });
    this._btn2(nav, '⚙ CHANGER',  'Changer les cerveaux',    'btn-newcfg', () => {
      cm.reset();
      this._phase = 'none';
    });
    this._btn2(nav, '🏠 MENU',     'Retour à l\'écran titre', 'btn-menu',   () => {
      cm.reset(); gm.goToMenu(); this.clear();
    });
  }

  // ─────────────────────────────────────────────
  // COMPÉTITION — updateRaceHUD
  // ─────────────────────────────────────────────
  updateRaceHUD(stats) {
    const div = select('#race-stats');
    if (!div || !stats) return;

    const medals    = ['🥇','🥈','🥉'];
    const colorsHex = ['#FF9632','#78C8FF','#B4DC50'];

    let html = '';
    stats.forEach((s, rank) => {
      html += `
        <div class="stat-row" style="border-left:3px solid ${colorsHex[s.index]||'#888'};padding-left:5px;">
          <span class="stat-lbl">${medals[rank]||''} ${s.label}</span>
          <span class="stat-val ${s.isDead?'v-pink':'v-green'}">${s.isDead?'💀':'🟢'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-lbl">Distance</span>
          <span class="stat-val">${s.distance}px</span>
        </div>
        <div class="stat-row" style="margin-bottom:5px;">
          <span class="stat-lbl">Cerises</span>
          <span class="stat-val v-purple">🍒 ${s.cherries}</span>
        </div>
      `;
    });
    div.html(html);
  }
}