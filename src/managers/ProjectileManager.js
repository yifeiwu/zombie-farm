// =============================================================================
// ZOMBIE FARM - Projectile Manager (Object Pooling)
// =============================================================================
import { Projectile } from '../entities/Projectile.js';

export class ProjectileManager {
  constructor(scene) {
    this.scene = scene;

    // Separate groups for collision logic
    // Note: runChildUpdate disabled — projectiles are updated explicitly in GameScene.update()
    this.plantProjectiles = scene.physics.add.group({
      classType: Projectile,
      runChildUpdate: false,
      maxSize: 50
    });

    this.zombieProjectiles = scene.physics.add.group({
      classType: Projectile,
      runChildUpdate: false,
      maxSize: 50
    });
  }

  spawnPlantProjectile(x, y, textureKey, damage, velocityX, target, options) {
    let proj = this.plantProjectiles.get(x, y);
    if (proj) {
      // Phaser.Physics.Arcade.Sprite automatically has a body and is added to scene
      // by physics.add.group(), so we can directly fire it
      proj.fire(x, y, textureKey, damage, velocityX, target, options);
    }
  }

  spawnZombieProjectile(x, y, textureKey, damage, velocityX, target, options) {
    let proj = this.zombieProjectiles.get(x, y);
    if (proj) {
      // Phaser.Physics.Arcade.Sprite automatically has a body and is added to scene
      // by physics.add.group(), so we can directly fire it
      proj.fire(x, y, textureKey, damage, velocityX, target, options);
    }
  }

  getPlantProjectiles() {
    return this.plantProjectiles;
  }

  getZombieProjectiles() {
    return this.zombieProjectiles;
  }
}

