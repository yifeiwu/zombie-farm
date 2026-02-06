// =============================================================================
// ZOMBIE FARM - Projectile Entity
// =============================================================================
import Phaser from 'phaser';
import { GRID_OFFSET_X, GRID_COLS, CELL_WIDTH } from '../config/constants.js';

const GRID_LEFT = GRID_OFFSET_X;
const GRID_RIGHT = GRID_OFFSET_X + GRID_COLS * CELL_WIDTH;

export class Projectile extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pea'); // Default texture, will change on fire
    // Note: Do NOT add to scene/physics here if using a Group with runChildUpdate
    // But since we use a custom pool manager, we might rely on the group to do it.
  }

  fire(x, y, textureKey, damage, velocityX, target, options = {}) {
    this.setTexture(textureKey);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    const scaleMultiplier = options.scaleMultiplier ?? 1;
    this.setScale(scaleMultiplier);
    if (options.originX !== undefined || options.originY !== undefined) {
      this.setOrigin(options.originX ?? 0.5, options.originY ?? 0.5);
    } else {
      this.setOrigin(0.5, 0.5);
    }

    this.damage = damage;
    this.target = target;
    this.slowFactor = options.slowFactor || 0;
    this.isZombieProjectile = options.isZombieProjectile || false;
    this.piercing = options.piercing || false;
    this.hitTargets = new Set();
    this.velocityX = velocityX;

    if (this.body) {
      this.body.reset(x, y);
      this.body.setVelocityX(velocityX);
      this.body.setCollideWorldBounds(false);
      this.body.enable = true;
      // Resize body to match current texture (important for long beams)
      // center=true auto-computes the correct offset for the sprite's origin
      this.body.setSize(this.displayWidth, this.displayHeight, true);
    }

    // Lifetime limit (kill after 5s)
    this.lifespan = 5000;
  }

  onHit(target) {
    if (!this.active) return;

    if (this.piercing) {
      if (this.hitTargets.has(target)) return;
      this.hitTargets.add(target);
    }

    target.takeDamage(this.damage);

    // Apply slow effect
    if (this.slowFactor && target.applySlow) {
      target.applySlow(this.slowFactor, 3000);
    }

    // Impact particle — use midpoint between projectile and target for accurate contact position
    if (this.scene.createExplosion) {
      const hitX = (this.x + target.x) / 2;
      const hitY = (this.y + target.y) / 2;
      this.scene.createExplosion(hitX, hitY, this.isZombieProjectile ? 0x8a3c5b : 0x4caf50);
    }

    if (this.scene.audioManager) {
      this.scene.audioManager.playSound('hit', { x: this.x });
    }

    // Instead of destroy, we disable (unless piercing)
    if (!this.piercing) {
      this.disable();
    }
  }

  disable() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.stop();
      this.body.enable = false;
    }
  }

  update(time, delta) {
    if (!this.active) return;

    // Enforce velocity every frame
    if (this.body) {
      this.body.setVelocityX(this.velocityX);
    }

    // Manual lifespan tracking
    this.lifespan -= delta;
    if (this.lifespan <= 0) {
      this.disable();
      return;
    }

    // Disable if projectile leaves the grid area
    if (this.x < GRID_LEFT - 20 || this.x > GRID_RIGHT + 20) {
      this.disable();
    }
  }
}

