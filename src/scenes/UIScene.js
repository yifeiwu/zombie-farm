// =============================================================================
// ZOMBIE FARM - UI Scene (HUD Overlay)
// =============================================================================
import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT,
  GRID_OFFSET_X, GRID_OFFSET_Y, GRID_ROWS, GRID_COLS, CELL_WIDTH, CELL_HEIGHT,
  ZOMBIE_TYPES, STARTING_BRAINS, COLORS, WAVE_CONFIG, EVENTS,
} from '../config/constants.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.gameScene = this.scene.get('GameScene');
    this.uiFontFamily = 'Arial, sans-serif';
    this.uiLabelColor = '#bbbbbb';
    this.uiValueColor = '#ffffff';
    this.waveBarWidth = 90;
    this.uiDepths = {
      topBg: 100,
      topFg: 110,
      topBar: 112,
      panelBg: 200,
      panelFg: 210,
      panelIcon: 212,
    };

    // --- Top bar background ---
    this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 60, 0x1a1a2e, 0.85)
      .setOrigin(0.5, 0)
      .setDepth(this.uiDepths.topBg);

    // --- Brain counter ---
    this.add.image(30, 20, 'brain_icon').setDepth(this.uiDepths.topFg).setScale(1.2);
    this.add.text(50, 2, 'BRAINS', {
      fontSize: '10px',
      color: this.uiLabelColor,
      fontFamily: this.uiFontFamily,
    }).setDepth(this.uiDepths.topFg);
    this.brainText = this.add.text(50, 12, `${STARTING_BRAINS}`, {
      fontSize: '22px',
      color: COLORS.BRAIN_COLOR,
      fontStyle: 'bold',
      fontFamily: this.uiFontFamily,
    }).setDepth(this.uiDepths.topFg);

    // (removed house HP bar)

    // (score display removed)

    // --- Stage label ---
    const stageName = this.gameScene.stageConfig
      ? `Stage ${this.gameScene.stageConfig.id}: ${this.gameScene.stageConfig.name}`
      : '';
    this.add.text(GAME_WIDTH / 2, 12, stageName, {
      fontSize: '13px',
      color: '#888888',
      fontFamily: this.uiFontFamily,
    }).setOrigin(0.5, 0).setDepth(this.uiDepths.topFg);

    // --- Wave indicator ---
    this.waveText = this.add.text(GAME_WIDTH - 20, 12, 'Wave 1', {
      fontSize: '16px',
      color: '#ffaa00',
      fontStyle: 'bold',
      fontFamily: this.uiFontFamily,
    }).setOrigin(1, 0).setDepth(this.uiDepths.topFg);

    // --- Time remaining ---
    this.plantsText = this.add.text(GAME_WIDTH - 20, 32, '⏱ 0s left', {
      fontSize: '12px',
      color: '#4caf50',
      fontFamily: this.uiFontFamily,
    }).setOrigin(1, 0).setDepth(this.uiDepths.topFg);

    // --- Wave countdown timer ---
    this.waveTimerText = this.add.text(GAME_WIDTH - 20, 47, '', {
      fontSize: '11px',
      color: this.uiLabelColor,
      fontFamily: this.uiFontFamily,
    }).setOrigin(1, 0).setDepth(this.uiDepths.topFg);
    // (removed wave progress bar)

    // --- Fullscreen toggle (mobile) ---
    if (!this.sys.game.device.os.desktop) {
      const fsBtn = this.add.text(GAME_WIDTH / 2, 12, '⛶', {
        fontSize: '24px',
        color: '#666688',
      }).setOrigin(0.5, 0).setDepth(this.uiDepths.topFg).setInteractive({ useHandCursor: true });

      fsBtn.on('pointerdown', () => {
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        } else {
          this.scale.startFullscreen();
        }
      });
    }

    // --- Zombie selection panel (bottom bar) ---
    this.createZombiePanel();
    this.createZombieInfoPanel();

    // --- Listen to game events ---
    this.gameScene.events.on(EVENTS.BRAINS_CHANGED, (brains) => {
      this.brainText.setText(`${brains}`);
      this.tweens.add({
        targets: this.brainText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        yoyo: true,
      });
      this.updateButtonStates();
      this.updateInfoPanel(this.previewType || this.selectedType);
    });

    // (score updates removed)

    // (removed house HP bar updates)

    this.gameScene.events.on(EVENTS.WAVE_STARTED, (wave) => {
      this.waveText.setText(`Wave ${wave}`);

      // Flash effect
      this.tweens.add({
        targets: this.waveText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        yoyo: true,
      });
    });

    // --- Keyboard shortcuts ---
    this.input.keyboard.on('keydown-ONE', () => this.selectZombie(0));
    this.input.keyboard.on('keydown-TWO', () => this.selectZombie(1));
    this.input.keyboard.on('keydown-THREE', () => this.selectZombie(2));
    this.input.keyboard.on('keydown-FOUR', () => this.selectZombie(3));
    this.input.keyboard.on('keydown-FIVE', () => this.selectZombie(4));
  }

  createZombiePanel() {
    const types = Object.values(ZOMBIE_TYPES);
    const buttonW = 124;
    const buttonH = 60;
    const panelW = types.length * 132 + 20;
    const panelX = GRID_OFFSET_X + (GRID_COLS * CELL_WIDTH) / 2;
    const gridBottom = GRID_OFFSET_Y + GRID_ROWS * CELL_HEIGHT;
    const panelY = Math.min(GAME_HEIGHT - 70, gridBottom + 5) + 35;

    // Panel background
    this.add.rectangle(panelX, panelY, panelW, 70, 0x1a1a2e, 0.9)
      .setStrokeStyle(1, 0x444466)
      .setDepth(this.uiDepths.panelBg);

    this.zombieButtons = [];
    this.buttonBgs = [];

    types.forEach((type, i) => {
      const x = panelX - panelW / 2 + 74 + i * 132;
      const y = panelY;

      // Button background
      const bg = this.add.rectangle(x, y, buttonW, buttonH, 0x2c2c3e)
        .setStrokeStyle(2, i === 0 ? 0xff6b6b : 0x444466)
        .setInteractive({ useHandCursor: true })
        .setDepth(this.uiDepths.panelFg);

      // Zombie icon
      this.add.image(x - 30, y - 6, type.key).setScale(0.6).setDepth(this.uiDepths.panelIcon);

      // Name
      this.add.text(x + 8, y - 16, type.name, {
        fontSize: '12px',
        color: this.uiValueColor,
        fontStyle: 'bold',
        fontFamily: this.uiFontFamily,
      }).setOrigin(0, 0).setDepth(this.uiDepths.panelIcon);

      // Cost
      const costText = this.add.text(x + 8, y + 2, `🧠 ${type.cost}`, {
        fontSize: '11px',
        color: COLORS.BRAIN_COLOR,
        fontFamily: this.uiFontFamily,
      }).setOrigin(0, 0).setDepth(this.uiDepths.panelIcon);

      // Keyboard hint
      this.add.text(x + 46, y - 26, `[${i + 1}]`, {
        fontSize: '9px',
        color: this.uiLabelColor,
        fontFamily: this.uiFontFamily,
      }).setOrigin(0.5, 0).setDepth(this.uiDepths.panelIcon);

      // Click handler
      bg.on('pointerdown', () => {
        this.selectZombie(i);
      });

      bg.on('pointerover', () => {
        if (this.selectedIndex !== i) {
          bg.setFillStyle(0x3c3c4e);
        }
        this.previewType = type;
        this.previewZombie(type);
      });

      bg.on('pointerout', () => {
        if (this.selectedIndex !== i) {
          bg.setFillStyle(0x2c2c3e);
        }
        this.previewType = null;
        this.previewZombie(this.selectedType);
      });

      this.buttonBgs.push(bg);
      this.zombieButtons.push({ bg, type, costText });
    });

    this.selectedIndex = 0;
    this.selectedType = types[0];
    this.previewType = null;
  }

  createZombieInfoPanel() {
    const boxX = 10;
    const gridBottom = GRID_OFFSET_Y + GRID_ROWS * CELL_HEIGHT;
    const boxY = Math.min(GAME_HEIGHT - 70, gridBottom + 5);
    const boxW = GRID_OFFSET_X - 20;
    const boxH = 70;
    const textWrapWidth = boxW - 20;

    this.add.rectangle(boxX, boxY, boxW, boxH, 0x1a1a2e, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x444466)
      .setDepth(this.uiDepths.panelBg);

    this.infoTitle = this.add.text(boxX + 10, boxY + 6, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: this.uiFontFamily,
      wordWrap: { width: textWrapWidth, useAdvancedWrap: true },
    }).setDepth(this.uiDepths.panelFg);

    this.infoStats = this.add.text(boxX + 10, boxY + 28, '', {
      fontSize: '11px',
      color: '#bbbbbb',
      fontFamily: this.uiFontFamily,
      wordWrap: { width: textWrapWidth, useAdvancedWrap: true },
    }).setDepth(this.uiDepths.panelFg);

    this.infoDesc = this.add.text(boxX + 10, boxY + 48, '', {
      fontSize: '11px',
      color: '#888888',
      fontFamily: this.uiFontFamily,
      wordWrap: { width: textWrapWidth, useAdvancedWrap: true },
    }).setDepth(this.uiDepths.panelFg);

    this.updateInfoPanel(this.selectedType);
  }

  updateInfoPanel(type) {
    if (!type) return;
    const brains = this.gameScene.brains;
    this.infoTitle.setText(`${type.name}  🧠 ${type.cost}`);
    this.infoStats.setText(`HP ${type.hp}  DMG ${type.damage}  SPD ${type.speed}`);
    const desc = type.description || '';
    const deficit = Math.max(0, type.cost - brains);
    const affordText = deficit > 0 ? `Need ${deficit} more brains` : 'Ready to deploy';
    this.infoDesc.setText(desc ? `${desc} | ${affordText}` : affordText);
  }

  previewZombie(type) {
    this.updateInfoPanel(type);
  }

  selectZombie(index) {
    const types = Object.values(ZOMBIE_TYPES);
    if (index < 0 || index >= types.length) return;

    this.selectedIndex = index;
    this.selectedType = types[index];

    // Update visuals
    this.buttonBgs.forEach((bg, i) => {
      if (i === index) {
        bg.setStrokeStyle(2, 0xff6b6b);
        bg.setFillStyle(0x3e2c2c);
      } else {
        bg.setStrokeStyle(2, 0x444466);
        bg.setFillStyle(0x2c2c3e);
      }
    });

    this.updateInfoPanel(this.selectedType);

    // Notify game scene
    this.gameScene.events.emit(EVENTS.SELECT_ZOMBIE_TYPE, types[index]);
  }

  updateButtonStates() {
    const brains = this.gameScene.brains;
    this.zombieButtons.forEach(({ bg, type, costText }, i) => {
      if (brains < type.cost) {
        bg.setAlpha(0.5);
        bg.setStrokeStyle(2, 0x555555);
        costText.setColor('#ff6b6b');
      } else {
        bg.setAlpha(1);
        if (i === this.selectedIndex) {
          bg.setStrokeStyle(2, 0xff6b6b);
        } else {
          bg.setStrokeStyle(2, 0x444466);
        }
        costText.setColor(COLORS.BRAIN_COLOR);
      }
    });
  }

  update() {
    // Continuously update button states
    this.updateButtonStates();

    // Update time remaining (final loss timer)
    if (this.gameScene.waveTimer && !this.gameScene.isGameOver) {
      const stageWave = this.gameScene.stageConfig
        ? this.gameScene.stageConfig.waveConfig
        : WAVE_CONFIG;
      const elapsed = this.gameScene.waveTimer.getElapsed();
      const total = stageWave.timeBetweenWaves;
      const wavesTotal = this.gameScene.waveManager.maxWaves * total;
      const wavesElapsed = Math.max(0, (this.gameScene.waveManager.currentWave - 1) * total + elapsed);
      const remaining = Math.max(0, Math.ceil((wavesTotal - wavesElapsed) / 1000));
      this.plantsText.setText(`⏱ ${remaining}s left`);
      if (this.gameScene.waveManager.currentWave < this.gameScene.waveManager.maxWaves) {
        const nextWaveRemaining = Math.max(0, Math.ceil((total - elapsed) / 1000));
        this.waveTimerText.setText(`Next wave: ${nextWaveRemaining}s`);
      } else {
        this.waveTimerText.setText('Final wave!');
      }
    }
  }
}

