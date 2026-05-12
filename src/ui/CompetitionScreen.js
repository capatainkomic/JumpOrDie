// ==============================================
// CompetitionScreen.js
// Rendu du mode compétition (setup + course)
// Fonctions : _drawCompetitionSetup, _drawCompetitionRace,
//             _drawRaceHUD, _drawRaceFinished,
//             _openBrainSelector, _mkStat
// ==============================================

// ── Rendu de la course (extrait de CompetitionManager) ──────────────
// POURQUOI : le rendu appartient à CompetitionScreen, pas à la logique
// CompetitionManager expose now: agents, level, _parallaxX, _bgLayers

function _drawParallax(cm) {
  const camX = cm._parallaxX;
  const IMG_W = 160;
  const IMG_H = 208;
  const scale  = CANVAS_H / IMG_H;
  const drawW  = IMG_W * scale;
  const drawH  = CANVAS_H;

  const drawLayer = (img, speed) => {
    if (!img) return;
    const offset = (camX * speed) % drawW;
    const count  = Math.ceil(CANVAS_W / drawW) + 2;
    push();
    imageMode(CORNER);
    noTint();
    for (let t = -1; t < count; t++) {
      const x = t * drawW - offset;
      image(img, x, 0, drawW, drawH);
    }
    pop();
  };

  drawLayer(cm._bgLayers.clouds,    0.05);
  drawLayer(cm._bgLayers.mountains, 0.15);
  drawLayer(cm._bgLayers.trees,     0.35);
}

function _drawCompetitionGame(cm, camera) {
  const alive  = cm.agents.filter(a => !a.isDead);
  const leader = alive.length > 0
    ? alive.reduce((b, a) => a.distanceTravelled > b.distanceTravelled ? a : b, alive[0])
    : (cm.agents[0] || null);

  if (leader) cm._parallaxX = leader.x;

  _drawParallax(cm);

  camera.update(leader);
  camera.begin();
    cm.level.draw();
    for (const agent of cm.agents) {
      agent.draw();
    }
  camera.end();
}



function _drawCompetitionSetup() {
  // Fond derrière les cards
  background(91, 200, 245);
  if (typeof bgImg !== 'undefined' && bgImg) {
    imageMode(CORNER);
    image(bgImg, 0, 0, CANVAS_W, CANVAS_H);
  }
  noStroke(); fill(5, 12, 30, 100); rect(0, 0, CANVAS_W, CANVAS_H);

  // Titre
  fill(255, 255, 255, 220);
  textFont('Press Start 2P');
  textSize(8); textAlign(CENTER, TOP);
  text('SELECTION DES CERVEAUX', CANVAS_W/2, 10);

  // Animer les sprites idle dans les zones de cards
  // Les cards HTML sont gérées par _updateCompetitionCards()
  _updateCompetitionCards();
}

// Cards HTML pour les slots — recréées seulement si état a changé
let _cardOverlay = null;
let _lastSlotsState = null;

function _updateCompetitionCards() {
  const cm = competitionManager;

  // Sérialiser l'état des slots pour détecter un changement
  const state = cm.slots.map(s => s ? s.name : null).join('|');
  if (state === _lastSlotsState && _cardOverlay) {
    // Pas de changement — juste animer les sprites
      return;
  }
  _lastSlotsState = state;

  // Supprimer l'overlay précédent
  if (_cardOverlay) { _cardOverlay.remove(); _cardOverlay = null; }

  const skins  = ['fox', 'bunny', 'squirrel'];
  const labels = ['Fox', 'Bunny', 'Squirrel'];
  const topBgs = ['#fff5eb', '#eef5ff', '#edfaf3'];
  const avatarBgs = ['#fde8cc', '#d6e8ff', '#c8f0dc'];
  const emojis = ['🦊', '🐰', '🐿️'];
  const slotColors = ['#FF9632', '#78C8FF', '#B4DC50'];

  const container = document.querySelector('#canvas-container');
  if (!container) return;

  const overlay = document.createElement('div');

  overlay.style.cssText = [
    'position:absolute',
    'top:0', 'left:0', 'width:100%', 'height:100%',
    'pointer-events:none',
    'z-index:5',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'justify-content:center',
    'padding:30px 16px 16px',
    'box-sizing:border-box',
    'gap:0',
  ].join(';');

  // Grille des 3 cards
  const grid = document.createElement('div');
  grid.style.cssText = [
    'display:grid',
    'grid-template-columns:repeat(3,1fr)',
    'gap:12px',
    'width:100%',
    'pointer-events:auto',
  ].join(';');

  skins.forEach((skin, i) => {
    const entry = cm.slots[i];
    const card  = document.createElement('div');
    card.style.cssText = [
      'background:rgba(255,255,255,0.96)',
      'border:0.5px solid rgba(0,0,0,0.12)',
      'border-radius:12px',
      'overflow:hidden',
      'display:flex',
      'flex-direction:column',
      'font-family:Nunito,sans-serif',
    ].join(';');

    // Top — zone sprite (sera dessinée sur le canvas par p5.js par dessus)
    const top = document.createElement('div');
    top.id = `slot-top-${i}`;
    top.style.cssText = [
      'height:80px',
      `background:${topBgs[i]}`,
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'position:relative',
    ].join(';');

    // Avatar emoji (placeholder — le sprite p5.js sera dessiné par dessus)
    const avatar = document.createElement('div');
    avatar.style.cssText = [
      'width:64px', 'height:64px',
      'border-radius:50%',
      `background:${avatarBgs[i]}`,
      'display:flex', 'align-items:center', 'justify-content:center',
      'font-size:36px',
    ].join(';');
    avatar.textContent = emojis[i];
    top.appendChild(avatar);

    // Badge "Prêt" si cerveau chargé
    if (entry) {
      const badge = document.createElement('div');
      badge.style.cssText = [
        'position:absolute', 'top:8px', 'right:8px',
        'background:#e8f9f0', 'color:#0a7a4b',
        'font-size:8px', 'font-weight:700',
        'padding:2px 6px', 'border-radius:20px',
        'border:0.5px solid #9fe1cb',
        'font-family:Nunito,sans-serif',
      ].join(';');
      badge.textContent = '✓ Prêt';
      top.appendChild(badge);
    }
    card.appendChild(top);

    // Body
    const body = document.createElement('div');
    body.style.cssText = 'padding:10px 12px;flex:1;display:flex;flex-direction:column;gap:6px;';

    const nameRow = document.createElement('div');
    nameRow.innerHTML = `<p style="font-size:12px;font-weight:700;color:#111;margin:0;">${labels[i]}</p>` +
      (entry ? `<p style="font-size:10px;color:#888;margin:0;">${entry.name || 'Cerveau'}</p>` : '');
    body.appendChild(nameRow);

    if (entry) {
      const stats = document.createElement('div');
      stats.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:4px;';
      const mkStat = (lbl, val) => {
        const d = document.createElement('div');
        d.style.cssText = 'background:#f7f7f9;border-radius:6px;padding:4px 6px;';
        d.innerHTML = `<p style="font-size:8px;color:#aaa;text-transform:uppercase;letter-spacing:0.3px;margin:0;">${lbl}</p>`
                    + `<p style="font-size:11px;font-weight:700;color:#222;margin:0;">${val}</p>`;
        return d;
      };
      stats.appendChild(mkStat('Fitness',    Math.round(entry.bestFitness || 0).toLocaleString()));
      stats.appendChild(mkStat('Générations', entry.generation || '?'));
      stats.appendChild(mkStat('Inputs',     entry.inputCount || '?'));
      stats.appendChild(mkStat('Réseau',     (entry.hiddenLayers||'?') + '×' + (entry.neuronsPerLayer||'?')));
      body.appendChild(stats);
    } else {
      const hint = document.createElement('div');
      hint.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:10px;';
      hint.textContent = 'Aucun cerveau chargé';
      body.appendChild(hint);
    }
    card.appendChild(body);

    // Footer — bouton
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:0 12px 12px;';

    const btn = document.createElement('button');
    const isLoaded = !!entry;
    btn.style.cssText = [
      'width:100%', 'padding:7px',
      'border-radius:7px',
      'font-size:10px', 'font-weight:700',
      'cursor:pointer',
      'font-family:Nunito,sans-serif',
      'letter-spacing:0.3px',
      'transition:background 0.12s,transform 0.08s,box-shadow 0.1s',
      isLoaded
        ? 'background:#fff0f0;color:#c0392b;border:0.5px solid rgba(192,57,43,0.25);'
        : 'background:#fff;color:#333;border:0.5px solid rgba(0,0,0,0.15);',
    ].join(';');

    btn.textContent = isLoaded ? '✕ Retirer' : '+ Charger un cerveau';

    btn.onmouseenter = () => {
      btn.style.background = isLoaded ? '#ffe4e4' : '#f0f0f4';
      btn.style.boxShadow  = '0 2px 8px rgba(0,0,0,0.1)';
    };
    btn.onmouseleave = () => {
      btn.style.background = isLoaded ? '#fff0f0' : '#fff';
      btn.style.boxShadow  = 'none';
    };
    btn.onmousedown  = () => { btn.style.transform = 'scale(0.97)'; };
    btn.onmouseup    = () => { btn.style.transform = 'scale(1)'; };

    btn.onclick = () => {
      if (isLoaded) {
        cm.unloadBrain(i);
        _lastSlotsState = null; // forcer rebuild
      } else {
        _openBrainSelector(i);
      }
    };

    footer.appendChild(btn);
    card.appendChild(footer);
    grid.appendChild(card);
  });

  overlay.appendChild(grid);
  container.appendChild(overlay);
  _cardOverlay = overlay;
}




function _drawCompetitionRace() {
  // Background
  background(91, 200, 245);

  // Update + draw (parallax intégré dans draw)
  competitionManager.update();
  _drawCompetitionGame(competitionManager, camera);

  // Panel gauche — stats agents
  uiPanel.updateRaceHUD(competitionManager.raceStats);

  // Fin de course
  if (competitionManager.isFinished) {
    _drawRaceFinished();
  }
}


function _drawRaceFinished() {
  // Overlay fin de course
  fill(0, 0, 0, 140);
  noStroke();
  rect(CANVAS_W/2 - 160, CANVAS_H/2 - 50, 320, 100, 8);

  fill(245, 200, 66);
  textFont('Press Start 2P');
  textSize(12);
  textAlign(CENTER, CENTER);
  text('🏁 COURSE TERMINÉE !', CANVAS_W/2, CANVAS_H/2 - 20);

  // Vainqueur
  const stats = competitionManager.raceStats;
  if (stats.length > 0) {
    fill(255);
    textFont('VT323');
    textSize(16);
    text(`🥇 ${stats[0].label} — ${stats[0].distance}px`, CANVAS_W/2, CANVAS_H/2 + 15);
  }
}

function _openBrainSelector(slotIndex) {
   // Charger localStorage + default_brains.json en parallèle
  const localBrains = BrainStorage.loadAll();
 
  fetch('assets/brains/default_brains.json')
    .then(r => r.ok ? r.json() : { brains: [] })
    .catch(() => ({ brains: [] }))
    .then(data => {
      const defaults = (data.brains || []).map(b => ({ ...b, _isDefault: true }));
      // Fusionner : défauts d'abord, puis cerveaux locaux
      // Dédupliquer par nom pour éviter les doublons si l'user a importé les défauts
      const seen   = new Set();
      const brains = [...defaults, ...localBrains].filter(b => {
        const key = b.name + '_' + b.generation;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
 
      if (brains.length === 0) {
        alert('Aucun cerveau disponible.\nEntraînez un cerveau en mode Training puis sauvegardez-le avec 💾 SAUVEGARDER.');
        return;
      }
 
      _buildBrainPopup(slotIndex, brains);
    });
  
}

function _buildBrainPopup(slotIndex, brains) {
    const skinNames  = ['Fox', 'Bunny', 'Squirrel'];
  const skinEmojis = ['🦊', '🐰', '🐿️'];
  const slotColors = ['#FF9632', '#78C8FF', '#B4DC50'];
  const slotColor  = slotColors[slotIndex] || '#7C6EEB';

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;display:flex;align-items:center;justify-content:center;';
  document.body.appendChild(overlay);

  const popup = document.createElement('div');
  popup.style.cssText = [
    'background:#fff',
    'border-radius:12px',
    'border:0.5px solid rgba(0,0,0,0.12)',
    'width:440px',
    'max-width:92vw',
    'max-height:90vh',
    'display:flex',
    'flex-direction:column',
    'overflow:hidden',
    'font-family:Nunito,sans-serif',
  ].join(';');
  overlay.appendChild(popup);

  const close = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'padding:16px 20px 14px;border-bottom:0.5px solid rgba(0,0,0,0.08);flex-shrink:0;display:flex;align-items:flex-start;justify-content:space-between;';
 
  const headerLeft = document.createElement('div');
  headerLeft.innerHTML =
    '<p style="font-size:12px;color:#888;margin:0 0 2px;">Slot ' + (slotIndex+1) + ' &nbsp;—&nbsp; <span style="color:' + slotColor + ';font-weight:700;">' + skinNames[slotIndex] + '</span></p>' +
    '<p style="font-size:17px;font-weight:700;margin:0;color:#111;">Choisir un cerveau</p>';
 
  const importBtn = document.createElement('button');
  importBtn.style.cssText = 'width:fit-content;padding:6px 12px;background:none;color:#7C6EEB;border:0.5px solid rgba(124,110,235,0.4);border-radius:7px;font-family:Nunito;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;';
  importBtn.textContent = '📂 Importer';
  importBtn.onclick = () => {
    BrainStorage.importJSON(() => {
      close();
      setTimeout(() => _openBrainSelector(slotIndex), 100);
    });
  };
 
  header.appendChild(headerLeft);
  header.appendChild(importBtn);
  popup.appendChild(header);

  // Liste
  const list = document.createElement('div');
  list.style.cssText = 'overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:8px;flex:1;';
  popup.appendChild(list);

  brains.forEach((entry) => {
    const fitness = Math.round(entry.bestFitness || 0);
    const badgeColor = fitness > 5000
      ? { bg:'#e6f9f0', color:'#0a7a4b' }
      : fitness > 2000
        ? { bg:'#fff8e0', color:'#9a6500' }
        : { bg:'#f2f2f2', color:'#666' };

    const card = document.createElement('div');
    card.style.cssText = [
      'border:0.5px solid rgba(0,0,0,0.1)',
      'border-left:3px solid ' + slotColor,
      'border-radius:0 10px 10px 0',
      'padding:12px 14px',
      'cursor:pointer',
      'transition:background 0.1s',
    ].join(';');

    card.innerHTML =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">' +
        '<div>' +
          '<p style="font-size:14px;font-weight:700;margin:0;color:#111;">' + (entry.name || 'Cerveau') + '</p>' +
        '</div>' +
        '<span style="background:' + badgeColor.bg + ';color:' + badgeColor.color + ';font-size:11px;font-weight:700;padding:3px 9px;border-radius:6px;white-space:nowrap;">' + fitness.toLocaleString() + ' pts</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">' +
        _mkStat('Générations', entry.generation || '?') +
        _mkStat('Inputs', entry.inputCount || '?') +
        _mkStat('Couches × N', (entry.hiddenLayers || '?') + '×' + (entry.neuronsPerLayer || '?')) +
        _mkStat('Activation', entry.activationFn || '?') +
      '</div>';

    card.onmouseenter = () => { card.style.background = '#f7f7fa'; };
    card.onmouseleave = () => { card.style.background = ''; };
    card.onclick = () => {
      competitionManager.loadBrain(slotIndex, entry);
      close();
    };
    list.appendChild(card);
  });

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = 'padding:12px 16px;border-top:0.5px solid rgba(0,0,0,0.08);flex-shrink:0;';
  const cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = 'width:100%;padding:9px;background:none;color:#888;border:0.5px solid rgba(0,0,0,0.15);border-radius:8px;font-family:Nunito;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:0.5px;text-transform:uppercase;';
  cancelBtn.textContent = 'Annuler';
  cancelBtn.onclick = close;
  footer.appendChild(cancelBtn);
  popup.appendChild(footer);

}

function _mkStat(label, value) {
  return '<div style="background:#f5f5f7;border-radius:6px;padding:5px 7px;">' +
    '<p style="font-size:10px;color:#888;margin:0 0 1px;text-transform:uppercase;letter-spacing:0.3px;">' + label + '</p>' +
    '<p style="font-size:13px;font-weight:700;margin:0;color:#111;">' + value + '</p>' +
  '</div>';
}