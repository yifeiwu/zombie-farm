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
    const barW = 320;
    const barH = 20;
    const barX = (GAME_WIDTH - barW) / 2;
    const barY = (GAME_HEIGHT - barH) / 2;

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, barW + 4, barH + 4, 0x444444);
    const bar = this.add.rectangle(barX + 2, barY + 2, 0, barH, 0xff6b6b).setOrigin(0, 0);

    const loadingText = this.add.text(GAME_WIDTH / 2, barY - 30, 'Raising the dead...', {
      fontSize: '18px',
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
    spriteFactory.generateCircleTexture('pea', 0x4caf50, 6);
    spriteFactory.generateLaserTexture('sunbeam', 0xffd54f, GAME_WIDTH, 6);
    spriteFactory.generateCircleTexture('snowpea_projectile', 0x03a9f4, 6);
    spriteFactory.generateCircleTexture('spit', 0x8a3c5b, 8);

    // --- Brain (currency) pickup ---
    spriteFactory.generateBrainTexture();

    // --- UI icons ---
    spriteFactory.generateCircleTexture('brain_icon', 0xff9ff3, 12);

    // --- Particle (white circle for tinting) ---
    spriteFactory.generateCircleTexture('particle_white', 0xffffff, 6);
  }

}

