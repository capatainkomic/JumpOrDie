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
  uiPanel.showCompetitionSetup(competitionManager);

  // Background
  background(91, 200, 245);
  if (bgImg) { imageMode(CORNER); image(bgImg, 0, 0, CANVAS_W, CANVAS_H); }
  noStroke(); fill(5, 12, 30, 100); rect(0, 0, CANVAS_W, CANVAS_H);

  // Titre
  fill(245, 200, 66);
  textFont('Press Start 2P');
  textSize(10); textAlign(CENTER, TOP);
  text('🏆 SÉLECTION DES CERVEAUX', CANVAS_W/2, 12);

  // 3 slots
  const slotW = 200, slotH = 100;
  const totalW = slotW * 3 + 20 * 2;
  const startX = CANVAS_W/2 - totalW/2;
  const slotY  = 60;

  const skins    = ['🦊 Fox', '🐰 Bunny', '🐿 Squirrel'];
  const slotCols = [[255,150,50],[120,200,255],[180,220,80]];

  for (let i = 0; i < 3; i++) {
    const sx = startX + i * (slotW + 20);
    const entry = competitionManager.slots[i];
    const col   = slotCols[i];

    // Fond carte
    fill(10, 15, 35, 200);
    stroke(col[0], col[1], col[2], 120);
    strokeWeight(2);
    rect(sx, slotY, slotW, slotH, 8);

    // Titre skin
    noStroke(); fill(col[0], col[1], col[2]);
    textFont('Press Start 2P'); textSize(7);
    textAlign(CENTER, TOP);
    text(skins[i], sx + slotW/2, slotY + 10);

    // Sprite idle animé à gauche du slot
    const idleAgent = competitionManager._idleAgents[i];
    if (idleAgent) {
      idleAgent.drawIdle(sx + 28, slotY + 58, 40, 40);
    }

    if (entry) {
      // Cerveau chargé
      fill(255); textFont('VT323'); textSize(13);
      textAlign(LEFT, TOP);
      text(entry.name || 'Cerveau', sx + 55, slotY + 28);
      fill(180); textSize(11);
      text(`Gen: ${entry.generation || '?'}`, sx + 55, slotY + 44);
      text(`Fit: ${entry.bestFitness || '?'}`, sx + 55, slotY + 58);
      fill(100, 220, 100); textSize(11);
      textAlign(CENTER, TOP);
      text('✓ Prêt', sx + slotW/2, slotY + 76);
    } else {
      fill(100); textFont('VT323'); textSize(12);
      textAlign(CENTER, CENTER);
      text('Cliquez pour\ncharger un cerveau', sx + slotW/2, slotY + 60);
    }

    // Bouton charger/retirer (zone de clic gérée dans mousePressed)
    const btnY = slotY + slotH + 5;
    const btnW = slotW - 20, btnH = 22;
    const bx   = sx + 10;

    if (entry) {
      fill(180, 50, 50, 200); noStroke();
    } else {
      fill(col[0], col[1], col[2], 200); noStroke();
    }
    rect(bx, btnY, btnW, btnH, 5);

    fill(255); textFont('Press Start 2P'); textSize(6);
    textAlign(CENTER, CENTER);
    text(entry ? '✕ RETIRER' : '📂 CHARGER', bx + btnW/2, btnY + btnH/2);
  }

  // Message si niveau généré
  if (competitionManager.level) {
    fill(100, 220, 100, 200);
    textFont('VT323'); textSize(13); textAlign(CENTER, BOTTOM);
    text('✓ Niveau prêt — cliquez START dans le panel droit', CANVAS_W/2, CANVAS_H - 8);
  } else {
    fill(200, 180, 100, 180);
    textFont('VT323'); textSize(12); textAlign(CENTER, BOTTOM);
    text('Générez un niveau depuis le panel droit', CANVAS_W/2, CANVAS_H - 8);
  }
}

function _drawCompetitionRace() {
  // Background
  background(91, 200, 245);

  // Update + draw (parallax intégré dans draw)
  competitionManager.update();
  _drawCompetitionGame(competitionManager, camera);

  // HUD léger
  _drawRaceHUD();

  // Panel gauche — stats agents
  uiPanel.updateRaceHUD(competitionManager.raceStats);

  // Fin de course
  if (competitionManager.isFinished) {
    _drawRaceFinished();
  }
}

function _drawRaceHUD() {
  // Timer
  const frames  = competitionManager._sessionFrames;
  const seconds = Math.floor(frames / 60);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timeStr = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  fill(255, 255, 255, 180);
  noStroke();
  textFont('VT323');
  textSize(14);
  textAlign(RIGHT, TOP);
  text(`⏱ ${timeStr}`, CANVAS_W - 8, 8);
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
  const brains = BrainStorage.loadAll();

  if (brains.length === 0) {
    alert('Aucun cerveau disponible.\nEntrainez un cerveau en mode Training puis sauvegardez-le avec SAUVEGARDER.');
    return;
  }

  const skinNames  = ['Fox', 'Bunny', 'Squirrel'];
  const skinEmojis = ['🦊', '🐰', '🐿'];
  const slotColors = ['#FF9632', '#78C8FF', '#B4DC50'];
  const slotColor  = slotColors[slotIndex] || '#7C6EEB';
  const skinLabel  = skinEmojis[slotIndex] + ' ' + skinNames[slotIndex];

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
  header.style.cssText = 'padding:16px 20px 14px;border-bottom:0.5px solid rgba(0,0,0,0.08);display:flex;align-items:flex-start;justify-content:space-between;flex-shrink:0;';
  header.innerHTML =
    '<div>' +
      '<p style="font-size:12px;color:#888;margin:0 0 2px;">Slot ' + (slotIndex+1) + ' &nbsp;—&nbsp; <span style="color:' + slotColor + ';font-weight:700;">' + skinLabel + '</span></p>' +
      '<p style="font-size:17px;font-weight:700;margin:0;color:#111;">Choisir un cerveau</p>' +
    '</div>' +
    '<button id="close-popup" style="background:none;border:none;cursor:pointer;font-size:18px;color:#aaa;padding:2px 4px;line-height:1;">✕</button>';
  popup.appendChild(header);
  header.querySelector('#close-popup').onclick = close;

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