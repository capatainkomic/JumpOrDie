// ==============================================
// ConfigPanel.js
// Config overlay — sliders, checkboxes, difficulté
// ==============================================

// Ajout des méthodes config sur UIPanel.prototype

UIPanel.prototype.showConfig = function(onStart) {
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

UIPanel.prototype._buildConfigHTML = function() {
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

UIPanel.prototype._sliderHTML = function(id, label, min, max, val, step) {
    return `
    <div class="cfg-slider-row">
      <span class="cfg-slider-label">${label}</span>
      <span class="cfg-slider-value" id="cfg-val-${id}">${val}</span>
      <div class="cfg-slider-track">
        <input type="range" class="cfg-range" id="cfg-sl-${id}" min="${min}" max="${max}" value="${val}" step="${step}">
      </div>
    </div>`;
  }

UIPanel.prototype._toggleBox = function(box, value) {
    if (value) {
      box.classList.add('checked');
      box.textContent = '✓';
    } else {
      box.classList.remove('checked');
      box.textContent = '';
    }
  }

UIPanel.prototype._bindConfigEvents = function(overlay, onStart) {
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

UIPanel.prototype._countInputs = function() {
    const ic = this._inputConfig;
    return (ic.grid?12:0)+(ic.avoidOpossum?2:0)+(ic.avoidEagle?2:0)+
           (ic.seekCherry?2:0)+(ic.isOnGround?1:0)+(ic.vertSpeed?1:0);
  }