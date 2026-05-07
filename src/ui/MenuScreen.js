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

  // ── Wooden signboard panel ──────────────────
  const panelW = 320, panelH = 170;
  const panelX = CANVAS_W / 2 - panelW / 2;
  const panelY = 160;

  // Panel shadow
  noStroke();
  fill(0, 0, 0, 60);
  rect(panelX + 5, panelY + 8, panelW, panelH, 10);

  // Wood base
  fill(80, 45, 15);
  stroke(40, 22, 5);
  strokeWeight(4);
  rect(panelX, panelY, panelW, panelH, 8);

  // Inner lighter wood
  fill(120, 72, 30);
  stroke(90, 55, 20);
  strokeWeight(2);
  rect(panelX + 5, panelY + 5, panelW - 10, panelH - 10, 5);

  // Wood grain lines
  stroke(100, 62, 25, 40);
  strokeWeight(1);
  for (let gy = 0; gy < panelH; gy += 9) {
    line(panelX + 8, panelY + 8 + gy, panelX + panelW - 8, panelY + 8 + gy);
  }

  // Corner nails
  _nail(panelX + 14, panelY + 14);
  _nail(panelX + panelW - 14, panelY + 14);
  _nail(panelX + 14, panelY + panelH - 14);
  _nail(panelX + panelW - 14, panelY + panelH - 14);

  // ── Menu buttons ────────────────────────────
  _menuBtn(CANVAS_W / 2, panelY + 50,  'TRAINING MODE',   [80, 160, 60],  [50, 120, 35]);
  _menuBtn(CANVAS_W / 2, panelY + 105, 'COMPETITION MODE', [180, 130, 20], [130, 90, 10]);

 
}

function _nail(x, y) {
  noStroke();
  fill(60, 40, 20);
  circle(x, y, 7);
  fill(140, 110, 70);
  circle(x - 1, y - 1, 4);
}

function _menuBtn(x, y, label, colTop, colBot) {
  const W = 280, H = 44;
  const hover = mouseX > x - W / 2 && mouseX < x + W / 2 &&
                mouseY > y - H / 2 && mouseY < y + H / 2;

  // Shadow
  noStroke();
  fill(0, 0, 0, 50);
  rect(x - W / 2 + 3, y - H / 2 + 5, W, H, 10);

  // Button gradient
  if (hover) {
    // Glowing highlight
    drawingContext.shadowColor = `rgba(${colTop[0]}, ${colTop[1]}, ${colTop[2]}, 0.5)`;
    drawingContext.shadowBlur  = 12;
  }
  const gr = drawingContext.createLinearGradient(0, y - H/2, 0, y + H/2);
  gr.addColorStop(0, `rgb(${colTop[0]+20}, ${colTop[1]+20}, ${colTop[2]+20})`);
  gr.addColorStop(1, `rgb(${colBot[0]}, ${colBot[1]}, ${colBot[2]})`);
  drawingContext.fillStyle = gr;

  stroke(Math.max(0, colTop[0] - 30), Math.max(0, colTop[1] - 30), Math.max(0, colTop[2] - 30));
  strokeWeight(3);
  rect(x - W / 2, y - H / 2, W, H, 10);
  drawingContext.shadowColor = 'transparent';
  drawingContext.shadowBlur  = 0;

  // Top highlight line
  stroke(255, 255, 255, hover ? 80 : 40);
  strokeWeight(1);
  line(x - W/2 + 12, y - H/2 + 3, x + W/2 - 12, y - H/2 + 3);

  // Bottom shadow line
  stroke(0, 0, 0, 60);
  line(x - W/2 + 6, y + H/2 - 4, x + W/2 - 6, y + H/2 - 4);

  // Label
  noStroke();
  fill(hover ? 255 : 240, hover ? 255 : 240, hover ? 210 : 180);
  textFont('Press Start 2P');
  textSize(10);
  textAlign(CENTER, CENTER);
  text(label, x + (hover ? 1 : 0), y + (hover ? 1 : 0));

  // Hover arrow
  if (hover) {
    fill(255, 255, 180, 200);
    textSize(10);
    text('»', x - W / 2 + 16, y);
  }
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