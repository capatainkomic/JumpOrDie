// ==============================================
// CompetitionPanel.js
// Competition panels — setup, course, leaderboard
// ==============================================

// Ajout des méthodes compétition sur UIPanel.prototype

UIPanel.prototype.showCompetitionSetup = function(cm) {
    if (this._phase === 'comp-setup') return;
    this._phase = 'comp-setup';
    this._clear();

    // Panel droit — config niveau + start
    const R = select('#ui-right');
    this.showPanel('right');

    const h2 = createElement('h2', 'NIVEAU');
    h2.class('h-green'); h2.parent(R); this._els.push(h2);

    const diffCard = createElement('div');
    diffCard.class('panel-card'); diffCard.parent(R); this._els.push(diffCard);

    const lbl = createElement('p', 'Difficulté :');
    lbl.style('font-size','11px'); lbl.style('color','#7B88A8');
    lbl.parent(diffCard); this._els.push(lbl);

    const sel = createSelect();
    ['easy','medium','hard','killer'].forEach(d => sel.option(d));
    sel.selected('easy'); sel.parent(diffCard); this._els.push(sel);

    const genBtn = createButton('GÉNÉRER NIVEAU');
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
      if (typeof _cardOverlay !== 'undefined' && _cardOverlay) {
        _cardOverlay.remove(); _cardOverlay = null; _lastSlotsState = null;
      }
      this._clear();
      this.hidePanels();
      this._showRacePanels(cm);
    });
    this._els.push(startBtn);

    const sepMenu = createElement('hr'); sepMenu.class('sep'); sepMenu.parent(R); this._els.push(sepMenu);

    const menuBtn = createButton('MENU');
    menuBtn.class('btn-menu'); menuBtn.parent(R);
    menuBtn.mousePressed(() => {
      cm.reset();
      gm.goToMenu();
      this.clear();
      if(typeof _cardOverlay!=="undefined"&&_cardOverlay){_cardOverlay.remove();_cardOverlay=null;_lastSlotsState=null;}
    });
    this._els.push(menuBtn);
  }

UIPanel.prototype._showRacePanels = function(cm) {
    const L = select('#ui-left');
    this.showPanel('left');

    const h2l = createElement('h2', '🏆 COURSE');
    h2l.class('h-pink'); h2l.parent(L); this._els.push(h2l);

    const statsDiv = createElement('div');
    statsDiv.class('panel-card'); statsDiv.id('race-stats'); statsDiv.parent(L);
    this._els.push(statsDiv);

    const R = select('#ui-right');
    this.showPanel('right');

    const h2r = createElement('h2', 'CONTRÔLES');
    h2r.class('h-purple'); h2r.parent(R); this._els.push(h2r);

    const ctrlCard = createElement('div');
    ctrlCard.class('panel-card'); ctrlCard.style('gap','4px'); ctrlCard.parent(R);
    this._els.push(ctrlCard);

    this._btn2(ctrlCard, '⏸ PAUSE',    'Mettre en pause',      'btn-stop',   () => cm.stop());
    this._btn2(ctrlCard, '▶ REPRENDRE','Continuer la course',   'btn-resume', () => cm.resume());

    const sep = createElement('hr'); sep.class('sep'); sep.parent(R); this._els.push(sep);

    const nav = createElement('div');
    nav.class('panel-card'); nav.style('gap','4px'); nav.parent(R); this._els.push(nav);

    this._btn2(nav, '⟳ REJOUER',  'Relancer la partie',  'btn-save',   () => {
      cm.startRace();
      this._phase = 'comp-race';
      if (typeof _cardOverlay !== 'undefined' && _cardOverlay) {
        _cardOverlay.remove(); _cardOverlay = null; _lastSlotsState = null;
      }
      this._clear();
      this.hidePanels();
      this._showRacePanels(cm);
    });

    this._btn2(nav, '⚙ CHANGER',  'Changer les cerveaux',    'btn-newcfg', () => {
      cm.reset();
      this.hidePanels();
      this._phase = 'none';
    });

    this._btn2(nav, ' MENU',     '', 'btn-menu',   () => {
      cm.reset(); 
      gm.goToMenu(); 
      this.clear(); 
      if(typeof _cardOverlay!=="undefined"&&_cardOverlay){_cardOverlay.remove();_cardOverlay=null;_lastSlotsState=null;}
    });
  }

UIPanel.prototype.updateRaceHUD = function(stats) {
    const div = select('#race-stats');
    if (!div || !stats) return;

    const medals    = ['🥇','🥈','🥉'];
    const colorsHex = ['#FF9632','#78C8FF','#B4DC50'];

    let html = '';
    stats.forEach((s, rank) => {
      html += `
        <div class="stat-row" style="border-left:3px solid ${colorsHex[s.index]||'#888'};padding-left:5px;">
          <span class="stat-lbl">${medals[rank]||''} ${s.label}</span>
          <span class="stat-val ${s.isDead?'v-pink':'v-green'}">${s.isDead?'💀':'♥️'}</span>
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