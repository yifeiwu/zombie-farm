// =============================================================================
// ZOMBIE FARM - Game Scene (Core Gameplay)
// =============================================================================
import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT,
  GRID_ROWS, GRID_COLS, CELL_WIDTH, CELL_HEIGHT,
  GRID_OFFSET_X, GRID_OFFSET_Y,
  STARTING_BRAINS, BRAIN_REGEN_RATE, BRAIN_REGEN_AMOUNT, PLANT_KILL_BOUNTY,
  SIGNAL_FLARE, PLANT_REACTION,
  ZOMBIE_TYPES, PLANT_TYPES, COLORS, WAVE_CONFIG, HOUSE_MAX_HP, EVENTS,
  STAGES,
} from '../config/constants.js';
import { Zombie } from '../entities/Zombie.js';
import { Projectile } from '../entities/Projectile.js';
import { WaveManager } from '../managers/WaveManager.js';
import { ProjectileManager } from '../managers/ProjectileManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { MusicManager } from '../managers/MusicManager.js';
import { SONG_DEPP } from '../config/songs.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    // --- Stage config ---
    this.stageIndex = (data && data.stageIndex != null) ? data.stageIndex : 0;
    this.stageConfig = STAGES[this.stageIndex] || STAGES[0];

    // --- State ---
    this.brains = STARTING_BRAINS;
    this.selectedZombieType = ZOMBIE_TYPES.BASIC;
    this.zombiesReached = 0;
    this.isGameOver = false;
    this.houseHp = this.stageConfig.houseHp;
    this.houseMaxHp = this.stageConfig.houseHp;
  }

  create() {
    const stageWave = this.stageConfig.waveConfig;

    // --- Groups ---
    this.zombies = this.physics.add.group();
    this.plants = this.physics.add.group();
    this.projectileManager = new ProjectileManager(this);
    this.audioManager = new AudioManager(this);

    // --- Background music ---
    if (!this.musicManager) {
      this.musicManager = new MusicManager();
      this.musicManager.prepareSong(SONG_DEPP);
    }
    this.musicManager.play();

    // --- Draw the lawn ---
    this.drawLawn();

    // --- Spawn zone label (inside drop zone) ---
    this.drawSpawnZoneLabel();

    // --- Wave Manager ---
    this.waveManager = new WaveManager(this, this.stageConfig);
    this.waveManager.spawnInitialPlants();

    // --- Event listeners ---
    this.setupEvents();

    // --- Collision detection ---
    this.collisionManager = new CollisionManager(this, this.projectileManager, this.zombies, this.plants);

    // --- Brain regeneration (tick every 300ms) ---
    this.brainRegenAccumulator = 0;
    this.brainRegenPopupAccumulator = 0;
    this.brainRegenTickAmount = (BRAIN_REGEN_AMOUNT * 300) / BRAIN_REGEN_RATE;
    this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        if (this.isGameOver) return;
        this.brainRegenAccumulator += this.brainRegenTickAmount;
        const gainedBrains = Math.floor(this.brainRegenAccumulator);
        if (gainedBrains <= 0) return;

        this.brainRegenAccumulator -= gainedBrains;
        this.brains += gainedBrains;
        this.events.emit(EVENTS.BRAINS_CHANGED, this.brains);

        this.brainRegenPopupAccumulator += gainedBrains;
        if (this.brainRegenPopupAccumulator >= BRAIN_REGEN_AMOUNT) {
          this.brainRegenPopupAccumulator -= BRAIN_REGEN_AMOUNT;
          this.showBrainPopup();
        }
      },
    });

    // --- Wave timer: plants get reinforcements ---
    this.waveTimer = this.time.addEvent({
      delay: stageWave.timeBetweenWaves,
      loop: true,
      callback: () => {
        if (!this.isGameOver) {
          this.waveManager.spawnNextWave();
        }
      },
    });

    // --- Launch UI scene on top ---
    this.scene.launch('UIScene');

    // --- Row hover indicator ---
    this.rowHighlight = this.add.text(0, 0, '←', {
      fontSize: '32px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    }).setOrigin(0.5)
      .setVisible(false)
      .setDepth(1);

    // --- Cache per-row zombie arrays to reduce allocations in update ---
    this.zombiesByRow = Array.from({ length: GRID_ROWS }, () => []);
    this.plantSpawnPreview = [];
    this.plantSpawnPreviewTimer = null;
    this.rowState = Array.from({ length: GRID_ROWS }, () => ({ spawnCount: 0 }));

    // --- Fade in ---
    this.cameras.main.fadeIn(500);

    // --- Stop music when scene shuts down (restart / menu) ---
    this.events.on('shutdown', () => {
      if (this.musicManager) this.musicManager.stop();
    });

    // --- Input ---
    this.input.on('pointerdown', (pointer) => this.handleClick(pointer));
    this.input.on('pointermove', (pointer) => this.handleHover(pointer));
  }

  // ===========================================================================
  // Drawing
  // ===========================================================================

  drawLawn() {
    // Grass checkerboard
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = GRID_OFFSET_X + col * CELL_WIDTH;
        const y = GRID_OFFSET_Y + row * CELL_HEIGHT;
        const color = (row + col) % 2 === 0 ? COLORS.GRASS_LIGHT : COLORS.GRASS_DARK;
        this.add.rectangle(x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2, CELL_WIDTH, CELL_HEIGHT, color, 0.9);
      }
    }

    // Left side - the house the plants are defending
    const houseX = GRID_OFFSET_X / 2;
    const housePanelHeight = GRID_ROWS * CELL_HEIGHT;
    const housePanelTop = GRID_OFFSET_Y;
    const housePanelCenterY = housePanelTop + housePanelHeight / 2;
    this.houseBg = this.add.rectangle(
      houseX,
      housePanelCenterY,
      GRID_OFFSET_X - 20,
      housePanelHeight,
      0x5d4037,
      0.6
    ).setStrokeStyle(2, 0x3e2723);

    const houseEmojiY = housePanelTop + housePanelHeight * 0.35;
    this.houseEmoji = this.add.text(houseX, houseEmojiY, '🏠', {
      fontSize: '120px',
    }).setOrigin(0.5);

    const destroyTextY = housePanelTop + housePanelHeight * 0.55;
    this.add.text(houseX, destroyTextY, 'DESTROY', {
      fontSize: '36px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // House HP bar
    const hpBarWidth = GRID_OFFSET_X - 80;
    const hpBarY = housePanelTop + housePanelHeight * 0.72;
    this.houseHpBarBg = this.add.rectangle(houseX, hpBarY, hpBarWidth, 20, 0x333333)
      .setDepth(10);
    this.houseHpBar = this.add.rectangle(houseX, hpBarY, hpBarWidth, 20, 0x4caf50)
      .setDepth(11);
    this.houseHpText = this.add.text(houseX, hpBarY + 28, `${this.houseHp} / ${this.houseMaxHp}`, {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(11);
  }

  drawSpawnZoneLabel() {
    const spawnX = GRID_OFFSET_X + GRID_COLS * CELL_WIDTH;
    const zoneWidth = GAME_WIDTH - spawnX;
    const labelX = spawnX + zoneWidth / 2;

    for (let row = 0; row < GRID_ROWS; row++) {
      const labelY = GRID_OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;
      this.add.text(labelX, labelY, '☠ SPAWN', {
        fontSize: '36px',
        color: '#ff6b6b',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }
  }

  // ===========================================================================
  // Input Handling
  // ===========================================================================

  handleClick(pointer) {
    if (this.isGameOver) return;

    // Block clicks outside the grid bounds
    const gridBottom = GRID_OFFSET_Y + GRID_ROWS * CELL_HEIGHT;
    if (pointer.y < GRID_OFFSET_Y || pointer.y > gridBottom) return;

    // Determine which row was clicked
    const row = Math.floor((pointer.y - GRID_OFFSET_Y) / CELL_HEIGHT);
    if (row < 0 || row >= GRID_ROWS) return;

    // Only allow spawning on the right side of the grid
    const spawnX = GRID_OFFSET_X + GRID_COLS * CELL_WIDTH;
    if (pointer.x < spawnX - CELL_WIDTH) return;

    this.spawnZombie(row);
  }

  handleHover(pointer) {
    if (this.isGameOver) return;

    const spawnX = GRID_OFFSET_X + GRID_COLS * CELL_WIDTH;
    const row = Math.floor((pointer.y - GRID_OFFSET_Y) / CELL_HEIGHT);

    if (row >= 0 && row < GRID_ROWS && pointer.x >= spawnX - CELL_WIDTH) {
      const y = GRID_OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;
      this.rowHighlight.setPosition(spawnX + 36, y);
      this.rowHighlight.setVisible(true);
    } else {
      this.rowHighlight.setVisible(false);
    }
  }

  spawnZombie(row) {
    const type = this.selectedZombieType;

    // Check cost
    if (this.brains < type.cost) {
      this.showMessage('Not enough brains!', '#ff6b6b');
      return;
    }

    // Deduct cost
    this.brains -= type.cost;
    this.events.emit(EVENTS.BRAINS_CHANGED, this.brains);

    // Spawn position: right edge of the grid
    const x = GRID_OFFSET_X + GRID_COLS * CELL_WIDTH + 40;
    const y = GRID_OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

    const zombie = new Zombie(this, x, y, type);
    zombie.row = row;
    this.zombies.add(zombie);

    // Spawn flash effect (no scale tween — it conflicts with physics)
    zombie.setAlpha(0);
    this.tweens.add({
      targets: zombie,
      alpha: 1,
      duration: 200,
      ease: 'Sine.easeOut',
    });

    // Spawn particle burst with additive blend for glow effect
    const spawnEmitter = this.add.particles(x, y, 'particle_white', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 300,
      tint: type.color || 0xff6b6b,
      frequency: -1,
      quantity: 6,
      blendMode: Phaser.BlendModes.ADD, // Additive blending for glow
    }).setDepth(10);
    spawnEmitter.explode();
    this.time.delayedCall(500, () => spawnEmitter.destroy());

    this.audioManager.playSound('spawn', { x: zombie.x });
    this.registerRowSpawn(row);
  }

  // ===========================================================================
  // Events
  // ===========================================================================

  setupEvents() {
    // Plant shooting
    this.events.on(EVENTS.PLANT_SHOOT, (plant, target) => {
      const isSunbeam = !!plant.piercing;
      const texKey = isSunbeam ? 'sunbeam' : (plant.slowFactor ? 'snowpea_projectile' : 'pea');
      const speed = plant.projectileSpeed || 200;
      this.projectileManager.spawnPlantProjectile(
        plant.x + 40, plant.y,
        texKey,
        plant.damage,
        speed, // velocity to the right
        target,
        {
          slowFactor: plant.slowFactor || 0,
          piercing: plant.piercing || false,
          originX: isSunbeam ? 0 : 0.5,
        }
      );
    });

    // Zombie spitting
    this.events.on(EVENTS.ZOMBIE_SPIT, (zombie, target) => {
      const speed = zombie.projectileSpeed || 150;
      this.projectileManager.spawnZombieProjectile(
        zombie.x - 40, zombie.y,
        'spit',
        zombie.damage,
        -speed, // velocity to the left
        target,
        { isZombieProjectile: true }
      );
    });

    // Plant death
    this.events.on(EVENTS.PLANT_DIED, (plant) => {
      this.waveManager.removePlant(plant);

      // Drop brains
      this.spawnBrainPickup(
        plant.x,
        plant.y,
        Phaser.Math.Between(PLANT_KILL_BOUNTY.min, PLANT_KILL_BOUNTY.max)
      );
    });

    // Zombie death
    this.events.on(EVENTS.ZOMBIE_DIED, (zombie) => {
      // Nothing special yet, could add score penalty
    });

    // Zombie reached the house
    this.events.on(EVENTS.ZOMBIE_REACHED_END, (zombie) => {
      this.zombiesReached++;

      // Damage the house based on zombie type
      const dmg = zombie.damage * 2;
      this.damageHouse(dmg);
      this.showFloatingText(GRID_OFFSET_X / 2, GAME_HEIGHT / 2, `-${dmg}`, '#ff0000');

      zombie.die();

      // Screen shake for impact
      this.cameras.main.shake(200, 0.01);

      this.showMessage(`Zombie smashed the house! -${dmg} HP`, '#ff6b6b');
    });

    // Wave started
    this.events.on(EVENTS.WAVE_STARTED, (waveNum) => {
      this.showMessage(`Plant reinforcements incoming! (Wave ${waveNum})`, '#ffaa00');
    });

    this.events.on(EVENTS.WAVE_PLANTS_PREVIEW, ({ placements, delay }) => {
      this.showPlantSpawnPreview(placements, delay);
    });

    // All waves complete (player loses if house is still standing)
    this.events.on(EVENTS.ALL_WAVES_COMPLETE, () => {
      if (!this.isGameOver && this.houseHp > 0) {
        this.gameOver('Time ran out! The house still stands.');
      }
    });

    // Zombie type selection from UI
    this.events.on(EVENTS.SELECT_ZOMBIE_TYPE, (type) => {
      this.selectedZombieType = type;
    });
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  showMessage(text, color = '#ffffff') {
    const msg = this.add.text(GAME_WIDTH / 2, 30, text, {
      fontSize: '18px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: msg,
      y: msg.y - 30,
      alpha: 0,
      duration: 2000,
      onComplete: () => msg.destroy(),
    });
  }

  registerRowSpawn(row) {
    this.rowState[row].spawnCount += 1;
    while (this.rowState[row].spawnCount >= SIGNAL_FLARE.threshold) {
      this.rowState[row].spawnCount -= SIGNAL_FLARE.threshold;
      this.spawnSignalFlarePlants(row);
      this.showMessage(`Signal flare! Reinforcements in row ${row + 1}`, '#ff6b6b');
      this.audioManager.playSound('flare');
    }
  }

  spawnSignalFlarePlants(row) {
    const placed = this.waveManager.replaceRowWithPlan(
      row,
      SIGNAL_FLARE.plan,
      SIGNAL_FLARE.backColumns,
      { hardRemove: true }
    );

    if (placed === 0) {
      this.showMessage(`No room for reinforcements in row ${row + 1}`, '#cccccc');
    }
  }

  clearPlantSpawnPreview() {
    if (this.plantSpawnPreviewTimer) {
      this.plantSpawnPreviewTimer.remove(false);
      this.plantSpawnPreviewTimer = null;
    }
    if (this.plantSpawnPreview.length > 0) {
      this.plantSpawnPreview.forEach((obj) => obj.destroy());
      this.plantSpawnPreview = [];
    }
  }

  showPlantSpawnPreview(placements, duration = 0) {
    this.clearPlantSpawnPreview();

    placements.forEach(({ type, row, col }) => {
      const config = PLANT_TYPES[type];
      if (!config) return;

      const x = GRID_OFFSET_X + col * CELL_WIDTH + CELL_WIDTH / 2;
      const y = GRID_OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

      const highlight = this.add.rectangle(
        x,
        y,
        CELL_WIDTH - 20,
        CELL_HEIGHT - 20,
        0xffffff,
        0.08
      ).setStrokeStyle(2, 0xffffff, 0.5).setDepth(4);

      const ghost = this.add.image(x, y, config.key)
        .setAlpha(0.35)
        .setScale(0.9)
        .setDepth(5);

      this.plantSpawnPreview.push(highlight, ghost);
    });

    if (duration > 0) {
      this.plantSpawnPreviewTimer = this.time.delayedCall(duration, () => {
        this.clearPlantSpawnPreview();
      });
    }
  }

  showFloatingText(x, y, text, color = '#ffffff') {
    const txt = this.add.text(x, y - 20, text, {
      fontSize: '14px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(150);

    this.tweens.add({
      targets: txt,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  createExplosion(x, y, color) {
    // Main explosion particles with additive blend for glow
    const emitter = this.add.particles(x, y, 'particle_white', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.6, end: 0 },
      lifespan: 350,
      tint: color,
      frequency: -1,
      quantity: 8,
      blendMode: Phaser.BlendModes.ADD, // Additive blending for bright glow
    }).setDepth(20);

    emitter.explode();

    // Secondary particles with normal blend for contrast
    const secondaryEmitter = this.add.particles(x, y, 'particle_white', {
      speed: { min: 30, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.0, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 500,
      tint: color,
      frequency: -1,
      quantity: 4,
      blendMode: Phaser.BlendModes.NORMAL, // Normal blend for solid particles
    }).setDepth(19);

    secondaryEmitter.explode();

    // Cleanup after particles have faded
    this.time.delayedCall(1000, () => {
      emitter.destroy();
      secondaryEmitter.destroy();
    });
  }

  showBrainPopup() {
    const x = GAME_WIDTH - 80;
    const y = 30;
    const popup = this.add.text(x, y, `+${BRAIN_REGEN_AMOUNT} 🧠`, {
      fontSize: '16px',
      color: '#ff9ff3',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: popup,
      y: popup.y - 20,
      alpha: 0,
      duration: 1500,
      onComplete: () => popup.destroy(),
    });
  }

  spawnBrainPickup(x, y, amount) {
    const brain = this.add.image(x, y, 'brain').setInteractive({ useHandCursor: true }).setDepth(50);

    // Glow ring effect
    const glowRing = this.add.circle(x, y, 30, 0xff9ff3, 0.2).setDepth(49);
    
    // Floating animation
    this.tweens.add({
      targets: brain,
      y: y - 20,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Glow ring pulse animation
    this.tweens.add({
      targets: glowRing,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Rotation animation
    this.tweens.add({
      targets: brain,
      angle: 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Scale pulse animation
    this.tweens.add({
      targets: brain,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    brain.on('pointerdown', () => {
      this.brains += amount;
      this.events.emit(EVENTS.BRAINS_CHANGED, this.brains);
      this.audioManager.playSound('collect', { x: brain.x });

      // Collection particle burst
      const collectEmitter = this.add.particles(brain.x, brain.y, 'particle_white', {
        speed: { min: 50, max: 120 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 600,
        tint: 0xff9ff3,
        frequency: -1,
        quantity: 12,
        blendMode: Phaser.BlendModes.ADD, // Additive blending for bright glow
      }).setDepth(51);
      collectEmitter.explode();
      this.time.delayedCall(700, () => collectEmitter.destroy());

      // Enhanced popup text
      const popup = this.add.text(brain.x, brain.y, `+${amount} 🧠`, {
        fontSize: '20px',
        color: '#ff9ff3',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(100);

      this.tweens.add({
        targets: popup,
        y: popup.y - 40,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 1000,
        ease: 'Back.easeOut',
        onComplete: () => popup.destroy(),
      });

      // Cleanup
      glowRing.destroy();
      brain.destroy();
    });

    // Auto-expire after 10s
    this.time.delayedCall(10000, () => {
      if (brain.active) {
        this.tweens.add({
          targets: [brain, glowRing],
          alpha: 0,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 500,
          onComplete: () => {
            brain.destroy();
            if (glowRing.active) glowRing.destroy();
          },
        });
      }
    });
  }

  damageHouse(amount) {
    this.houseHp = Math.max(0, this.houseHp - amount);
    this.updateHouseHpBar();
    this.events.emit(EVENTS.HOUSE_HP_CHANGED, this.houseHp, this.houseMaxHp);

    // Flash the house red
    this.houseBg.setFillStyle(0xff0000, 0.8);
    this.time.delayedCall(150, () => {
      this.houseBg.setFillStyle(0x5d4037, 0.6);
    });

    // Check if house is destroyed
    if (this.houseHp <= 0) {
      this.houseEmoji.setText('💀');
      this.victory();
    }
  }

  updateHouseHpBar() {
    const ratio = Math.max(0, this.houseHp / this.houseMaxHp);
    const hpBarWidth = GRID_OFFSET_X - 40;
    this.houseHpBar.width = hpBarWidth * ratio;

    // Color based on HP
    if (ratio > 0.5) this.houseHpBar.setFillStyle(0x4caf50);
    else if (ratio > 0.25) this.houseHpBar.setFillStyle(0xffaa00);
    else this.houseHpBar.setFillStyle(0xff0000);

    this.houseHpText.setText(`${this.houseHp} / ${this.houseMaxHp}`);
  }

  victory() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.audioManager.playSound('win');
    if (this.musicManager) this.musicManager.fadeOut(2000);

    const hasNextStage = this.stageIndex < STAGES.length - 1;
    const subtitle = hasNextStage
      ? `Stage ${this.stageConfig.id} cleared! The horde marches on...`
      : 'All stages conquered! The horde reigns supreme!';
    this.showEndScreen('VICTORY!', subtitle, '#00ff00', hasNextStage);
  }

  gameOver(reason = 'The plants held their ground...') {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.audioManager.playSound('lose');
    if (this.musicManager) this.musicManager.fadeOut(2000);
    this.showEndScreen('DEFEATED', reason, '#ff6b6b', false);
  }

  showEndScreen(title, subtitle, color, showNextStage = false) {
    // Dim overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setDepth(1000);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, title, {
      fontSize: '56px',
      fontFamily: 'Georgia, serif',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, subtitle, {
      fontSize: '20px',
      color: '#cccccc',
    }).setOrigin(0.5).setDepth(1001);

    const buttonsY = GAME_HEIGHT / 2 + 90;

    if (showNextStage) {
      // --- Next Stage button ---
      const nextBg = this.add.rectangle(GAME_WIDTH / 2 - 100, buttonsY, 180, 44, 0x4caf50)
        .setInteractive({ useHandCursor: true })
        .setDepth(1001);

      this.add.text(GAME_WIDTH / 2 - 100, buttonsY, 'NEXT STAGE ▶', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1002);

      nextBg.on('pointerover', () => nextBg.setFillStyle(0x66bb6a));
      nextBg.on('pointerout', () => nextBg.setFillStyle(0x4caf50));
      nextBg.on('pointerdown', () => {
        this.scene.stop('UIScene');
        this.scene.restart({ stageIndex: this.stageIndex + 1 });
      });

      // --- Retry button ---
      const retryBg = this.add.rectangle(GAME_WIDTH / 2 + 100, buttonsY, 140, 44, 0xff6b6b)
        .setInteractive({ useHandCursor: true })
        .setDepth(1001);

      this.add.text(GAME_WIDTH / 2 + 100, buttonsY, 'RETRY', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1002);

      retryBg.on('pointerover', () => retryBg.setFillStyle(0xff8e8e));
      retryBg.on('pointerout', () => retryBg.setFillStyle(0xff6b6b));
      retryBg.on('pointerdown', () => {
        this.scene.stop('UIScene');
        this.scene.restart({ stageIndex: this.stageIndex });
      });
    } else {
      // --- Single retry / menu button ---
      const retryBg = this.add.rectangle(GAME_WIDTH / 2 - 80, buttonsY, 140, 44, 0xff6b6b)
        .setInteractive({ useHandCursor: true })
        .setDepth(1001);

      this.add.text(GAME_WIDTH / 2 - 80, buttonsY, 'RETRY', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1002);

      retryBg.on('pointerover', () => retryBg.setFillStyle(0xff8e8e));
      retryBg.on('pointerout', () => retryBg.setFillStyle(0xff6b6b));
      retryBg.on('pointerdown', () => {
        this.scene.stop('UIScene');
        this.scene.restart({ stageIndex: this.stageIndex });
      });

      // --- Menu button ---
      const menuBg = this.add.rectangle(GAME_WIDTH / 2 + 80, buttonsY, 140, 44, 0x444466)
        .setInteractive({ useHandCursor: true })
        .setDepth(1001);

      this.add.text(GAME_WIDTH / 2 + 80, buttonsY, 'MENU', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1002);

      menuBg.on('pointerover', () => menuBg.setFillStyle(0x555577));
      menuBg.on('pointerout', () => menuBg.setFillStyle(0x444466));
      menuBg.on('pointerdown', () => {
        this.scene.stop('UIScene');
        this.scene.start('MenuScene');
      });
    }
  }

  // ===========================================================================
  // Update Loop
  // ===========================================================================

  update(time, delta) {
    if (this.isGameOver) return;

    // Update zombies and bucket by row (reuse arrays to avoid GC churn)
    for (let i = 0; i < this.zombiesByRow.length; i++) {
      this.zombiesByRow[i].length = 0;
    }

    const zombieChildren = this.zombies.getChildren();
    for (let i = 0; i < zombieChildren.length; i++) {
      const zombie = zombieChildren[i];
      if (!zombie.isDead) {
        zombie.update(time);
        this.zombiesByRow[zombie.row].push(zombie);
      }
    }

    // Update plants (pass zombies in their row for targeting)
    const plantChildren = this.plants.getChildren();
    for (let i = 0; i < plantChildren.length; i++) {
      const plant = plantChildren[i];
      if (!plant.isDead) {
        plant.update(time, this.zombiesByRow[plant.row]);
      }
    }

    // Update projectiles explicitly (runChildUpdate on physics groups is unreliable)
    const plantProjs = this.projectileManager.getPlantProjectiles().getChildren();
    for (let i = plantProjs.length - 1; i >= 0; i--) {
      const p = plantProjs[i];
      if (p.active) p.update(time, delta);
    }
    const zombieProjs = this.projectileManager.getZombieProjectiles().getChildren();
    for (let i = zombieProjs.length - 1; i >= 0; i--) {
      const p = zombieProjs[i];
      if (p.active) p.update(time, delta);
    }
  }
}

