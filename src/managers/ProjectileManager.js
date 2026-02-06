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
      if (!proj.body) {
         // If fresh from the pool and hasn't been enabled for physics yet
         this.scene.physics.add.existing(proj);
      }
      if (!proj.scene) {
        this.scene.add.existing(proj);
      }
      proj.fire(x, y, textureKey, damage, velocityX, target, options);
    }
  }

  spawnZombieProjectile(x, y, textureKey, damage, velocityX, target, options) {
    let proj = this.zombieProjectiles.get(x, y);
    if (proj) {
      if (!proj.body) {
        this.scene.physics.add.existing(proj);
      }
      if (!proj.scene) {
        this.scene.add.existing(proj);
      }
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

