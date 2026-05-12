class Leaderboard {

  static draw(stats, x, y) {
    if (!stats || stats.length === 0) return;

    push();
    textAlign(LEFT, TOP);

    const medals = ['🥇', '🥈', '🥉'];
    const rowH   = 28;
    const W      = 180;

    stats.forEach((s, rank) => {
      const ry = y + rank * (rowH + 3);

      // Fond carte
      const alpha = s.isDead ? 100 : 180;
      fill(10, 15, 35, alpha);
      noStroke();
      rect(x, ry, W, rowH, 5);

      // Bordure gauche colorée
      const cols = [[255,150,50],[120,200,255],[180,220,80]];
      const c = cols[s.index] || [200,200,200];
      fill(c[0], c[1], c[2]);
      rect(x, ry, 3, rowH, 3, 0, 0, 3);

      // Médaille + nom
      noStroke();
      fill(255);
      textSize(11);
      text(`${medals[rank] || '  '} ${s.label}`, x + 8, ry + 4);

      // Distance
      fill(245, 200, 66);
      textSize(10);
      text(`${s.distance}px`, x + 8, ry + 16);

      // Cerises
      fill(255, 100, 100);
      text(`🍒 ${s.cherries}`, x + 80, ry + 16);

      // Statut
      if (s.isDead) {
        fill(200, 100, 100);
        textSize(9);
        text('💀', x + W - 16, ry + 8);
      } else {
        fill(100, 220, 100);
        textSize(9);
        text('🟢', x + W - 16, ry + 8);
      }
    });

    pop();
  }
}