// ==============================================
// UIPanel.js
// Socle — constructor, helpers DOM, clear
// ==============================================

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
  _btnSquare(p, icon, label, cls, onClick) {
    const b = createButton('');
    b.class(cls); b.parent(p);
    b.elt.innerHTML = `<span class="btn-sq-icon">${icon}</span><span class="btn-sq-label">${label}</span>`;
    b.mousePressed(onClick);
    this._els.push(b);
    return b;
  }
  clear() {
    this._clear();
    this.hidePanels();
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
  _sep(p)    { const e=createElement('hr'); e.class('sep'); e.parent(p); this._els.push(e); }
  _btn(p, label, cls, onClick) {
    const b=createButton(label); b.class(cls); b.parent(p); b.mousePressed(onClick);
    this._els.push(b); return b;
  }
}