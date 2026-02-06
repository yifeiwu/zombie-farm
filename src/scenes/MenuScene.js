// =============================================================================
// ZOMBIE FARM - Menu Scene
// =============================================================================
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, STAGES, ZOMBIE_TYPES } from '../config/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // =====================================================================
    // Ambient background — dark grid with subtle glow
    // =====================================================================
    const g = this.add.graphics();

    // Faint grid lines
    g.lineStyle(1, 0x2a2a4e, 0.3);
    for (let x = 0; x < GAME_WIDTH; x += 80) {
      g.moveTo(x, 0);
      g.lineTo(x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 80) {
      g.moveTo(0, y);
      g.lineTo(GAME_WIDTH, y);
    }
    g.strokePath();

    // Radial vignette overlay (dark edges, slightly lighter center)
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.4);
    vignette.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    vignette.fillStyle(0x1a1a2e, 0.6);
    vignette.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 420);

    // =====================================================================
    // Shambling zombie horde in the background
    // =====================================================================
    const zombieKeys = Object.values(ZOMBIE_TYPES).map((t) => t.key);
    const hordeCount = 10;
    for (let i = 0; i < hordeCount; i++) {
      const key = zombieKeys[i % zombieKeys.length];
      const startX = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const startY = Phaser.Math.Between(340, 520);
      const z = this.add.image(startX, startY, key)
        .setAlpha(Phaser.Math.FloatBetween(0.08, 0.2))
        .setScale(Phaser.Math.FloatBetween(1.0, 1.8))
        .setAngle(Phaser.Math.Between(-8, 8));

      // Slow shamble drift
      this.tweens.add({
        targets: z,
        x: z.x + Phaser.Math.Between(-50, 50),
        y: z.y + Phaser.Math.Between(-12, 12),
        angle: z.angle + Phaser.Math.Between(-4, 4),
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // =====================================================================
    // Title
    // =====================================================================

    // Glow behind title
    const glowTitle = this.add.text(GAME_WIDTH / 2, 90, 'ZOMBIE FARM', {
      fontSize: '76px',
      fontFamily: 'Georgia, serif',
      color: '#ff6b6b',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.15).setScale(1.05);

    const title = this.add.text(GAME_WIDTH / 2, 90, 'ZOMBIE FARM', {
      fontSize: '76px',
      fontFamily: 'Georgia, serif',
      color: '#ff6b6b',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtle pulse on the glow
    this.tweens.add({
      targets: glowTitle,
      alpha: 0.25,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle with typewriter-style fade
    const subtitle = this.add.text(GAME_WIDTH / 2, 160, 'Command the Horde', {
      fontSize: '24px',
      color: '#cccccc',
      fontStyle: 'italic',
      fontFamily: 'Georgia, serif',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      y: subtitle.y - 4,
      duration: 800,
      delay: 400,
      ease: 'Sine.easeOut',
    });

    // =====================================================================
    // Stage selection
    // =====================================================================
    this.add.text(GAME_WIDTH / 2, 210, '— SELECT STAGE —', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial, sans-serif',
      letterSpacing: 4,
    }).setOrigin(0.5);

    const stageY = 295;
    const cardW = 180;
    const cardH = 150;
    const stageSpacing = cardW + 20;
    const startStageX = GAME_WIDTH / 2 - (STAGES.length - 1) * stageSpacing / 2;
    const difficultyLabels = ['EASY', 'MEDIUM', 'HARD'];
    const difficultyColors = ['#4caf50', '#ffaa00', '#ff6b6b'];

    STAGES.forEach((stage, i) => {
      const x = startStageX + i * stageSpacing;

      // Card background
      const card = this.add.rectangle(x, stageY, cardW, cardH, 0x22223a)
        .setStrokeStyle(2, 0x3a3a5e)
        .setInteractive({ useHandCursor: true });

      // Difficulty badge
      const badgeColor = Phaser.Display.Color.HexStringToColor(difficultyColors[i]).color;
      this.add.rectangle(x, stageY - cardH / 2 + 12, 60, 16, badgeColor, 0.2)
        .setStrokeStyle(1, badgeColor, 0.5);
      this.add.text(x, stageY - cardH / 2 + 12, difficultyLabels[i], {
        fontSize: '11px',
        color: difficultyColors[i],
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);

      // Stage number
      this.add.text(x, stageY - 20, `Stage ${stage.id}`, {
        fontSize: '16px',
        fontFamily: 'Georgia, serif',
        color: '#ff6b6b',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      // Stage name
      this.add.text(x, stageY + 2, stage.name, {
        fontSize: '15px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      // Description
      this.add.text(x, stageY + 22, stage.description, {
        fontSize: '11px',
        color: '#999999',
        fontFamily: 'Arial, sans-serif',
        wordWrap: { width: cardW - 20 },
        align: 'center',
      }).setOrigin(0.5, 0);

      // Stats line
      const wc = stage.waveConfig;
      this.add.text(x, stageY + cardH / 2 - 14, `${wc.maxWaves} waves  •  HP ${stage.houseHp}`, {
        fontSize: '11px',
        color: '#778899',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);

      // --- Hover ---
      card.on('pointerover', () => {
        card.setFillStyle(0x3a2a2a);
        card.setStrokeStyle(2, 0xff6b6b);
        this.tweens.add({
          targets: card,
          scaleX: 1.03,
          scaleY: 1.03,
          duration: 120,
          ease: 'Sine.easeOut',
        });
      });
      card.on('pointerout', () => {
        card.setFillStyle(0x22223a);
        card.setStrokeStyle(2, 0x3a3a5e);
        this.tweens.add({
          targets: card,
          scaleX: 1,
          scaleY: 1,
          duration: 120,
          ease: 'Sine.easeOut',
        });
      });

      // --- Click ---
      card.on('pointerdown', () => {
        // Quick press effect
        this.tweens.add({
          targets: card,
          scaleX: 0.96,
          scaleY: 0.96,
          duration: 60,
          yoyo: true,
          ease: 'Sine.easeIn',
        });
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('GameScene', { stageIndex: i });
        });
      });

      // Staggered entrance animation
      card.setAlpha(0).setScale(0.9);
      this.tweens.add({
        targets: card,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        delay: 600 + i * 120,
        ease: 'Back.easeOut',
      });
    });

    // =====================================================================
    // Instructions (bottom)
    // =====================================================================
    const instructions = [
      'Send zombies from the RIGHT to destroy the house on the LEFT.',
      'Kill plants to earn 🧠 brains — spend them to grow your horde.',
    ];

    instructions.forEach((text, idx) => {
      this.add.text(GAME_WIDTH / 2, 400 + idx * 24, text, {
        fontSize: '13px',
        color: '#8888aa',
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
    });

    // Divider line
    const divG = this.add.graphics();
    divG.lineStyle(1, 0x333355, 0.5);
    divG.moveTo(GAME_WIDTH / 2 - 200, 390);
    divG.lineTo(GAME_WIDTH / 2 + 200, 390);
    divG.strokePath();

    // =====================================================================
    // Footer
    // =====================================================================
    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v0.2.0', {
      fontSize: '11px',
      color: '#333333',
    }).setOrigin(1, 1);

    // =====================================================================
    // Fullscreen button (useful on mobile)
    // =====================================================================
    if (!this.sys.game.device.os.desktop) {
      const fsBtn = this.add.text(GAME_WIDTH - 14, 14, '⛶', {
        fontSize: '28px',
        color: '#666688',
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      fsBtn.on('pointerdown', () => {
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        } else {
          this.scale.startFullscreen();
        }
      });
    }

    // =====================================================================
    // Fade in
    // =====================================================================
    this.cameras.main.fadeIn(600);
  }
}
