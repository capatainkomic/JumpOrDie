// ==============================================
// CompetitionAgent.js
//
// Agent avec sprite animé pour la compétition.
// Hérite de la physique Agent.
// Gère run/jump animations selon l'état physique.
// ==============================================

class CompetitionAgent extends Agent {

  // Configs des 3 skins disponibles
  static SKINS = {
    fox: {
      path     : 'assets/characters/fox_player/',
      run      : { prefix: 'run/player-run-',   count: 6, ext: '.png', w: 32, h: 32 },
      jump     : { prefix: 'jump/player-jump-',  count: 2, ext: '.png', w: 32, h: 32 },
      idle     : { prefix: 'idle/player-idle-',  count: 4, ext: '.png', w: 32, h: 32 },
    },
    bunny: {
      path     : 'assets/characters/bunny_player/',
      run      : { prefix: 'run/player-run-',   count: 8, ext: '.png', w: 37, h: 32 },
      jump     : { prefix: 'jump/player-jump-',  count: 4, ext: '.png', w: 37, h: 32 },
      idle     : { prefix: 'idle/player-idle-',  count: 9, ext: '.png', w: 37, h: 32 },
    },
    squirrel: {
      path     : 'assets/characters/squirel_player/',
      run      : { prefix: 'run/player-run-',   count: 6, ext: '.png', w: 90, h: 58 },
      jump     : { prefix: 'jump/player-jump-',  count: 4, ext: '.png', w: 90, h: 58 },
      idle     : { prefix: 'idle/player-idle-',  count: 8, ext: '.png', w: 90, h: 58 },
    },
  };

  static ANIM_RATE = 6; // frames p5 entre chaque sprite

  constructor(x, y, skinName, brainEntry) {
    super(x, y, color(255));

    this.skinName   = skinName;
    this.brainEntry = brainEntry; // métadonnées JSON

    // Frames chargées
    this._frames = { run: [], jump: [], idle: [] };
    this._loaded  = false;

    // Animation state
    this._frameTicker = 0;
    this._frameIndex  = 0;
    this._currentAnim = 'run';
  }

  // ── Preload des sprites ───────────────────
  preloadSprites() {
    const skin = CompetitionAgent.SKINS[this.skinName];
    if (!skin) return;

    const load = (anim) => {
      const cfg = skin[anim];
      for (let i = 1; i <= cfg.count; i++) {
        const path = skin.path + cfg.prefix + i + cfg.ext;
        this._frames[anim].push(loadImage(path,
          () => {},
          () => { console.warn(`[CompetitionAgent] Image manquante: ${path}`); }
        ));
      }
    };

    load('run');
    load('jump');
    load('idle');
    this._loaded = true;
  }

  // ── Animation selon état physique ─────────
  _getAnim() {
    if (!this.isOnGround) {
      return 'jump';
    }
    return 'run';
  }

  _getJumpFrame() {
    // Frame 0 = montée (vy < 0), Frame 1 = descente (vy >= 0)
    // Pour bunny/squirrel avec 4 frames : 0-1 montée, 2-3 descente
    const frames = this._frames.jump;
    if (!frames.length) return null;
    if (frames.length === 2) {
      return this.vy < 0 ? frames[0] : frames[1];
    }
    // 4 frames
    if (this.vy < -8)       return frames[0];
    if (this.vy < 0)        return frames[1];
    if (this.vy < 5)        return frames[2];
    return frames[3];
  }

  // ── Tick animation ────────────────────────
  _tickAnim() {
    this._frameTicker++;
    if (this._frameTicker >= CompetitionAgent.ANIM_RATE) {
      this._frameTicker = 0;
      this._frameIndex++;
    }
  }

  // ── Rendu ─────────────────────────────────
  draw() {
    if (!this._loaded) {
      // Fallback ellipse si sprites pas encore chargés
      super.draw();
      return;
    }

    this._tickAnim();
    const anim = this._getAnim();
    this._currentAnim = anim;

    let img = null;

    if (anim === 'jump') {
      img = this._getJumpFrame();
    } else {
      // Run — cycle
      const frames = this._frames.run;
      if (frames.length) {
        const idx = this._frameIndex % frames.length;
        img = frames[idx];
      }
    }

    if (!img) { super.draw(); return; }

    const skin = CompetitionAgent.SKINS[this.skinName];
    const cfg  = skin[anim];
    const w    = cfg.w;
    const h    = cfg.h;

    push();
    imageMode(CENTER);

    if (this.isDead) {
      tint(255, 80); // transparence si mort
    } else {
      noTint();
    }

    image(img, this.x, this.y, w, h);
    noTint();
    pop();
  }

  // ── Idle (pour la phase setup) ────────────
  drawIdle(x, y, w, h) {
    this._tickAnim();
    const frames = this._frames.idle;
    if (!frames.length) {
      // Fallback
      fill(200); noStroke();
      ellipse(x, y, 30, 30);
      return;
    }
    const idx = this._frameIndex % frames.length;
    const img = frames[idx];
    if (img) {
      push();
      imageMode(CENTER);
      noTint();
      image(img, x, y, w, h);
      pop();
    }
  }
}