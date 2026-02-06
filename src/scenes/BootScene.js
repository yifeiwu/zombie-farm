// =============================================================================
// ZOMBIE FARM - Boot Scene (Asset Loading & Generation)
// =============================================================================
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, ZOMBIE_TYPES, PLANT_TYPES, CELL_WIDTH, CELL_HEIGHT } from '../config/constants.js';
import { SpriteFactory } from '../sprites/SpriteFactory.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Show loading bar
    const barW = 640;
    const barH = 40;
    const barX = (GAME_WIDTH - barW) / 2;
    const barY = (GAME_HEIGHT - barH) / 2;

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, barW + 8, barH + 8, 0x444444);
    const bar = this.add.rectangle(barX + 4, barY + 4, 0, barH, 0xff6b6b).setOrigin(0, 0);

    const loadingText = this.add.text(GAME_WIDTH / 2, barY - 60, 'Raising the dead...', {
      fontSize: '36px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (val) => {
      bar.width = barW * val;
    });
  }

  create() {
    this.generateTextures();
    this.scene.start('MenuScene');
  }

  generateTextures() {
    const spriteFactory = new SpriteFactory(this);

    // --- Zombie textures ---
    for (const type of Object.values(ZOMBIE_TYPES)) {
      spriteFactory.generateZombieTexture(type.key, type.color);
    }

    // --- Plant textures ---
    for (const type of Object.values(PLANT_TYPES)) {
      spriteFactory.generatePlantTexture(type.key, type.color);
    }

    // --- Projectile ---
    spriteFactory.generateCircleTexture('pea', 0x4caf50, 12);
    spriteFactory.generateLaserTexture('sunbeam', 0xffd54f, GAME_WIDTH, 12);
    spriteFactory.generateCircleTexture('snowpea_projectile', 0x03a9f4, 12);
    spriteFactory.generateCircleTexture('spit', 0x8a3c5b, 16);

    // --- Brain (currency) pickup ---
    spriteFactory.generateBrainTexture();

    // --- UI icons ---
    spriteFactory.generateCircleTexture('brain_icon', 0xff9ff3, 24);

    // --- Particle (white circle for tinting) ---
    spriteFactory.generateCircleTexture('particle_white', 0xffffff, 12);
  }

}

