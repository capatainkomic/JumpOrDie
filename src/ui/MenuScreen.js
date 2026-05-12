let _menuLogoY = 0;
let _woodBtn   = null;

// ==============================================
// MenuScreen.js
// Rendu du menu principal
// Fonctions : _drawMenu, _nail, _menuBtn, _drawFallbackLogo
// ==============================================

function _drawMenu() {
  uiPanel.hidePanels();

  // Sky background (fallback if image fails)
  background(91, 200, 245);

  // Background image (parallax-ish: draw slightly zoomed)
  if (bgImg && bgImg.width > 0) {
    imageMode(CORNER);
    image(bgImg, 0, 0, CANVAS_W, CANVAS_H);
  }

  _menuLogoY = sin(frameCount * 0.025) * 4;

  // ── Logo ────────────────────────────────────
  const logoW = 420, logoH = 100;
  const logoX = CANVAS_W / 2 - logoW / 2;
  const logoY = 42 + _menuLogoY;

  if (logoImg && logoImg.width > 0) {
    imageMode(CORNER);
    // Subtle shadow under logo
    drawingContext.shadowColor   = 'rgba(0,0,0,0.5)';
    drawingContext.shadowBlur    = 12;
    drawingContext.shadowOffsetY = 4;
    image(logoImg, logoX, logoY, logoW, logoH);
    drawingContext.shadowColor   = 'transparent';
    drawingContext.shadowBlur    = 0;
    drawingContext.shadowOffsetY = 0;
  } else {
    // Fallback text logo
    _drawFallbackLogo(CANVAS_W / 2, logoY + logoH / 2);
  }

  // ── Menu buttons flottants ──────────────────
  const btnW  = 260;
  const btnH  = round(btnW * (667 / 1746)); // ratio 1746x667
  const btnY1 = 155;
  const btnY2 = btnY1 + btnH + 16;
  const btnX  = CANVAS_W / 2 - btnW / 2;

  _menuBtn(btnX, btnY1, btnW, btnH, 'TRAINING MODE');
  _menuBtn(btnX, btnY2, btnW, btnH, 'COMPETITION MODE');

 
}

function _nail(x, y) {
  noStroke();
  fill(60, 40, 20);
  circle(x, y, 7);
  fill(140, 110, 70);
  circle(x - 1, y - 1, 4);
}

function _menuBtn(x, y, w, h, label) {
  const hover = mouseX > x - (w * 0.05) && mouseX < x + w + (w * 0.05) &&
                mouseY > y - (h * 0.05) && mouseY < y + h + (h * 0.05);
  const press = hover && mouseIsPressed;

  // Scale up au hover : 5% plus grand, centré
  const scale = press ? 0.97 : (hover ? 1.05 : 1.0);
  const dw    = w * scale;
  const dh    = h * scale;
  const dx    = x + (w - dw) / 2;
  const dy    = y + (h - dh) / 2 + (press ? 2 : 0);

  push();
  imageMode(CORNER);
  noTint();

  // Ombre portée
  if (!press && _woodBtn) {
    drawingContext.globalAlpha = 0.35;
    image(_woodBtn, dx + 3, dy + 5, dw, dh);
    drawingContext.globalAlpha = 1.0;
  }

  // Bouton — pas de tint, couleur originale
  if (_woodBtn) {
    image(_woodBtn, dx, dy, dw, dh);
  } else {
    fill(110, 65, 22); noStroke();
    rect(dx, dy, dw, dh, 8);
  }

  // Texte ombre
  fill(40, 20, 5, 160);
  textFont('Press Start 2P');
  textSize(9 * scale);
  textAlign(CENTER, CENTER);
  text(label, dx + dw/2 + 1, dy + dh/2 + 1);

  // Texte principal
  fill(245, 235, 165);
  text(label, dx + dw/2, dy + dh/2);

  pop();
}

function _drawFallbackLogo(x, y) {
  textFont('Press Start 2P');
  fill(245, 200, 66);
  stroke(90, 50, 10);
  strokeWeight(3);
  textSize(28);
  textAlign(CENTER, CENTER);
  text('JUMP OR DIE', x, y);
}