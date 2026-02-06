// =============================================================================
// ZOMBIE FARM - Projectile Entity
// =============================================================================
import Phaser from 'phaser';
import { GRID_OFFSET_X, GRID_COLS, CELL_WIDTH } from '../config/constants.js';

const GRID_LEFT = GRID_OFFSET_X;
const GRID_RIGHT = GRID_OFFSET_X + GRID_COLS * CELL_WIDTH;

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pea'); // Default texture, will change on fire
    // Note: When used with physics.add.group(), Phaser automatically adds
    // the sprite to the scene and creates the physics body
    this.trailEmitter = null;
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

    // Create particle trail
    this.createTrail(textureKey, options);
  }

  createTrail(textureKey, options) {
    // Clean up existing trail if any
    if (this.trailEmitter) {
      this.trailEmitter.destroy();
      this.trailEmitter = null;
    }

    // Determine trail color based on projectile type
    let trailColor = 0x4caf50; // Default green for peas
    if (this.isZombieProjectile) {
      trailColor = 0x8a3c5b; // Purple/pink for zombie projectiles
    } else if (textureKey === 'snowpea_projectile') {
      trailColor = 0x03a9f4; // Blue for snow peas
    } else if (textureKey === 'sunbeam') {
      trailColor = 0xffd54f; // Yellow for sunbeams
    }

    // Determine trail angle based on movement direction
    // Trail goes backward (opposite of movement direction)
    // velocityX < 0 means moving left, so trail goes right (around 0 degrees)
    // velocityX > 0 means moving right, so trail goes left (around 180 degrees)
    const isMovingLeft = this.velocityX < 0;
    // Wider angle range for a visible trail (60 degree spread)
    const baseAngle = isMovingLeft ? 0 : 180;
    const angleMin = baseAngle - 30; // 30 degrees spread on each side
    const angleMax = baseAngle + 30;

    // Create trail emitter that follows the projectile
    // Initialize at projectile position, then manually update each frame for accuracy
    // Particles need to move MUCH slower than the projectile to form a visible trail
    this.trailEmitter = this.scene.add.particles(this.x, this.y, 'particle_white', {
      speed: { min: 5, max: 15 }, // Very slow speed so particles lag behind the fast-moving projectile
      angle: { min: angleMin, max: angleMax }, // Wider angle for visible trail
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800, // Long lifespan so particles persist and form a visible trail
      tint: trailColor,
      frequency: 100, // Emit infrequently (every 100ms) to space particles out along the path
      blendMode: Phaser.BlendModes.ADD, // Additive blending for glow effect
    }).setDepth(15); // Behind the projectile but above background
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
    
    // Clean up trail emitter
    if (this.trailEmitter) {
      // Stop emitting new particles but let existing ones fade out
      this.trailEmitter.stop();
      this.scene.time.delayedCall(300, () => {
        if (this.trailEmitter) {
          this.trailEmitter.destroy();
          this.trailEmitter = null;
        }
      });
    }
  }

  update(time, delta) {
    if (!this.active) return;

    // Enforce velocity every frame
    if (this.body) {
      this.body.setVelocityX(this.velocityX);
    }

    // Update trail emitter position to match projectile
    if (this.trailEmitter && this.trailEmitter.active) {
      this.trailEmitter.setPosition(this.x, this.y);
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

