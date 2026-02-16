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
    // --- Tile-based zombie atlases (load image + JSON for color-key processing) ---
    this.load.image('zombie_normal_src', 'assets/normal.png');
    this.load.json('zombie_normal_data', 'assets/normal.json');
    this.load.image('zombie_fast_src', 'assets/fast_zombie.png');
    this.load.json('zombie_fast_data', 'assets/fast_zombie.json');
    this.load.image('zombie_spitter_src', 'assets/spitter.png');
    this.load.json('zombie_spitter_data', 'assets/spitter.json');
    this.load.image('zombie_jumper_src', 'assets/jumper.png');
    this.load.json('zombie_jumper_data', 'assets/jumper.json');
    this.load.image('zombie_shield_src', 'assets/shield.png');
    this.load.json('zombie_shield_data', 'assets/shield.json');

    // --- Tile-based plant atlases ---
    this.load.image('plant_peashooter_src', 'assets/peashooter.png');
    this.load.json('plant_peashooter_data', 'assets/peashooter.json');
    this.load.image('plant_sunflower_src', 'assets/sunflower.png');
    this.load.json('plant_sunflower_data', 'assets/sunflower.json');
    this.load.image('plant_wallnut_src', 'assets/wallnut.png');
    this.load.json('plant_wallnut_data', 'assets/wallnut.json');
    this.load.image('plant_supersunflower_src', 'assets/supersunflower.png');
    this.load.json('plant_supersunflower_data', 'assets/supersunflower.json');
    this.load.image('plant_snowpea_src', 'assets/snowpea.png');
    this.load.json('plant_snowpea_data', 'assets/snowpea.json');

    // --- Misc assets (brain pickup, brain icon, house sprites per level) ---
    this.load.image('misc_src', 'assets/misc.png');
    this.load.json('misc_data', 'assets/misc.json');

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
    this.createColorKeyAtlas('zombie_normal_src', 'zombie_normal_data', 'zombie_normal');
    this.createColorKeyAtlas('zombie_fast_src', 'zombie_fast_data', 'zombie_fast');
    this.createColorKeyAtlas('zombie_spitter_src', 'zombie_spitter_data', 'zombie_spitter');
    this.createColorKeyAtlas('zombie_jumper_src', 'zombie_jumper_data', 'zombie_jumper');
    this.createColorKeyAtlas('zombie_shield_src', 'zombie_shield_data', 'zombie_shield');
    this.createColorKeyAtlas('plant_peashooter_src', 'plant_peashooter_data', 'plant_peashooter');
    this.createColorKeyAtlas('plant_sunflower_src', 'plant_sunflower_data', 'plant_sunflower');
    this.createColorKeyAtlas('plant_wallnut_src', 'plant_wallnut_data', 'plant_wallnut');
    this.createColorKeyAtlas('plant_supersunflower_src', 'plant_supersunflower_data', 'plant_supersunflower');
    this.createColorKeyAtlas('plant_snowpea_src', 'plant_snowpea_data', 'plant_snowpea');
    this.createColorKeyAtlas('misc_src', 'misc_data', 'misc');
    this.generateTextures();
    this.scene.start('MenuScene');
  }

  /**
   * Load image, color-key white to transparent, then add as atlas.
   */
  createColorKeyAtlas(srcKey, dataKey, atlasKey) {
    const img = this.textures.get(srcKey).getSourceImage(0);
    const json = this.cache.json.get(dataKey);
    const w = img.width;
    const h = img.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const threshold = 240; // Pixels with R,G,B all above this become transparent

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r >= threshold && g >= threshold && b >= threshold) {
        data[i + 3] = 0; // Set alpha to transparent
      }
    }
    ctx.putImageData(imageData, 0, 0);

    this.textures.addAtlasJSONHash(atlasKey, canvas, json);
    this.textures.remove(srcKey);
  }

  generateTextures() {
    const spriteFactory = new SpriteFactory(this);

    // --- Zombie textures (skip types that use tile atlases) ---
    const atlasZombieKeys = ['basic', 'fast', 'spitter', 'jumper', 'tank'];
    for (const type of Object.values(ZOMBIE_TYPES)) {
      if (!atlasZombieKeys.includes(type.key)) {
        spriteFactory.generateZombieTexture(type.key, type.color);
      }
    }

    // --- Plant textures (skip types that use tile atlases) ---
    const atlasPlantKeys = ['peashooter', 'sunflower', 'wallnut', 'super_sunflower', 'snowpea'];
    for (const type of Object.values(PLANT_TYPES)) {
      if (!atlasPlantKeys.includes(type.key)) {
        spriteFactory.generatePlantTexture(type.key, type.color);
      }
    }

    // --- Projectile ---
    spriteFactory.generateCircleTexture('pea', 0x4caf50, 12);
    spriteFactory.generateLaserTexture('sunbeam', 0xffd54f, GAME_WIDTH, 12);
    spriteFactory.generateCircleTexture('snowpea_projectile', 0x03a9f4, 12);
    spriteFactory.generateCircleTexture('spit', 0x8a3c5b, 16);

    // --- Brain (currency) pickup & UI icon ---
    // Use misc atlas brain sprite; skip procedural generation
    // spriteFactory.generateBrainTexture();
    // spriteFactory.generateCircleTexture('brain_icon', 0xff9ff3, 24);

    // --- Particle (white circle for tinting) ---
    spriteFactory.generateCircleTexture('particle_white', 0xffffff, 12);

    // --- Animations for tile-based zombies ---
    const zombieAnims = [
      { atlas: 'zombie_normal', prefix: 'normal', walkRate: 8, attackRate: 12 },
      { atlas: 'zombie_fast', prefix: 'fast', walkRate: 12, attackRate: 16 },
      { atlas: 'zombie_spitter', prefix: 'spit', walkRate: 10, attackRate: 14 },
      { atlas: 'zombie_jumper', prefix: 'jumper', walkRate: 8, attackRate: 12 },
      { atlas: 'zombie_shield', prefix: 'shield', walkRate: 6, attackRate: 10 },
    ];
    for (const { atlas, prefix, walkRate, attackRate } of zombieAnims) {
      this.anims.create({
        key: `${atlas}_walk`,
        frames: this.anims.generateFrameNames(atlas, { prefix: `${prefix}_walk`, start: 1, end: 4, zeroPad: 0 }),
        frameRate: walkRate,
        repeat: -1,
      });
      this.anims.create({
        key: `${atlas}_attack`,
        frames: this.anims.generateFrameNames(atlas, { prefix: `${prefix}_attack`, start: 1, end: 4, zeroPad: 0 }),
        frameRate: attackRate,
        repeat: 0,
      });
    }

    // --- Animations for tile-based plants ---
    const plantAnims = [
      { atlas: 'plant_peashooter', prefix: 'peashooter', idleRate: 6, attackRate: 12 },
      { atlas: 'plant_sunflower', prefix: 'sunflower', idleRate: 6, attackRate: 12 },
      { atlas: 'plant_wallnut', prefix: 'wallnut', idleRate: 6, attackRate: null },
      { atlas: 'plant_supersunflower', prefix: 'supersunflower', idleRate: 6, attackRate: 12 },
      { atlas: 'plant_snowpea', prefix: 'snowpea', idleRate: 6, attackRate: 12 },
    ];
    for (const { atlas, prefix, idleRate, attackRate } of plantAnims) {
      this.anims.create({
        key: `${atlas}_idle`,
        frames: this.anims.generateFrameNames(atlas, { prefix: `${prefix}_walk`, start: 1, end: 4, zeroPad: 0 }),
        frameRate: idleRate,
        repeat: -1,
      });
      if (attackRate !== null) {
        this.anims.create({
          key: `${atlas}_attack`,
          frames: this.anims.generateFrameNames(atlas, { prefix: `${prefix}_attack`, start: 1, end: 4, zeroPad: 0 }),
          frameRate: attackRate,
          repeat: 0,
        });
      }
    }
  }

}

