// =============================================================================
// ZOMBIE FARM - Zombie Entity
// =============================================================================
import Phaser from 'phaser';
import { CELL_WIDTH, GRID_OFFSET_X, GRID_OFFSET_Y, CELL_HEIGHT, EVENTS } from '../config/constants.js';
import { LivingEntity } from './LivingEntity.js';

export class Zombie extends LivingEntity {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.key, config.hp);

    // Stats from config
    this.zombieType = config.key;
    this.speed = config.speed;
    this.damage = config.damage;
    this.attackSpeed = config.attackSpeed;
    this.isSpitter = config.key === 'spitter';
    this.isJumper = config.key === 'jumper';
    this.spitRange = 4 * CELL_WIDTH; // spitter stops this far from target
    this.projectileSpeed = config.projectileSpeed || 0;
    this.hasJumped = false;
    this.isJumping = false;
    this.jumpTweens = [];  // track active jump tweens for cleanup
    this.jumpShadow = null;

    this.damageTint = 0xff0000;
    this.damageTextColor = '#ff0000';

    // State
    this.isAttacking = false;
    this.attackTarget = null;
    this.lastAttackTime = 0;
    this.row = 0;
    this.slowTimer = 0;
    this.currentSpeed = this.speed;

    // Physics body setup - zombies move LEFT (toward the plants' house)
    this.body.setSize(32, 48);
    this.body.setOffset(8, 12);

    // Subtle shuffle animation (visual only)
    this.shuffleTween = scene.tweens.add({
      targets: this,
      angle: Phaser.Math.Between(-2, 2),
      duration: 900 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Start moving left (after body is fully set up)
    this.startMoving();
  }

  startMoving() {
    if (this.body) {
      this.body.setVelocityX(-this.currentSpeed);
    }
  }

  stopMoving() {
    if (this.body) {
      this.body.setVelocityX(0);
    }
  }

  attack(plant) {
    if (this.isDead) return;

    this.isAttacking = true;
    this.attackTarget = plant;
    this.stopMoving();
  }

  stopAttacking() {
    this.isAttacking = false;
    this.attackTarget = null;
    this.startMoving();
  }

  applySlow(factor, duration) {
    this.currentSpeed = this.speed * factor;
    this.setTint(0x88ccff);

    if (this.slowTimer) {
      this.scene.time.removeEvent(this.slowTimer);
    }

    this.slowTimer = this.scene.time.delayedCall(duration || 3000, () => {
      this.currentSpeed = this.speed;
      if (!this.isDead) this.clearTint();
      if (!this.isAttacking) this.startMoving();
    });

    if (!this.isAttacking) {
      this.startMoving();
    }
  }

  die() {
    this.isJumping = false;

    // Stop jump tweens and destroy shadow if mid-jump
    if (this.jumpTweens.length > 0) {
      this.jumpTweens.forEach((t) => { if (t && t.isPlaying) t.stop(); });
      this.jumpTweens = [];
    }
    if (this.jumpShadow) {
      this.jumpShadow.destroy();
      this.jumpShadow = null;
    }

    if (this.attackTween) {
      this.attackTween.stop();
      this.attackTween = null;
    }
    if (this.shuffleTween) {
      this.shuffleTween.stop();
      this.shuffleTween = null;
    }
    if (this.slowTimer) {
      this.scene.time.removeEvent(this.slowTimer);
      this.slowTimer = null;
    }
    super.die();
    // Emit event for game scene
    this.scene.events.emit(EVENTS.ZOMBIE_DIED, this);
  }

  // =========================================================================
  // Jumper: leap to the nearest plant in the row
  // =========================================================================

  /**
   * Find the closest plant in this row (anywhere on the grid).
   */
  findJumpTarget() {
    if (!this.scene || !this.scene.plants) return null;

    let closest = null;
    let closestDist = Infinity;

    this.scene.plants.getChildren().forEach((plant) => {
      if (plant.isDead || plant.row !== this.row) return;
      const dist = this.x - plant.x; // plant is to the left
      if (dist > 0 && dist < closestDist) {
        closest = plant;
        closestDist = dist;
      }
    });

    return closest;
  }

  performJump(target) {
    this.isJumping = true;
    this.hasJumped = true;
    this.stopMoving();

    // Land just to the right of the target so melee collision triggers
    const landX = target.x + CELL_WIDTH * 0.5;
    const landY = this.y;
    const dist = this.x - landX;
    const duration = Math.min(800, Math.max(400, dist * 2));
    const peakHeight = 120; // arc height in px

    // Shadow on the ground (tracked for cleanup)
    this.jumpShadow = this.scene.add.ellipse(this.x, this.y + 28, 30, 10, 0x000000, 0.3);

    // Disable physics body during the jump so we don't collide mid-air
    if (this.body) this.body.enable = false;

    // Clear previous jump tweens
    this.jumpTweens = [];

    // Horizontal tween
    const hTween = this.scene.tweens.add({
      targets: [this, this.jumpShadow],
      x: landX,
      duration,
      ease: 'Sine.easeInOut',
    });
    this.jumpTweens.push(hTween);

    // Vertical arc tween (up then down)
    const vTween = this.scene.tweens.add({
      targets: this,
      y: this.y - peakHeight,
      duration: duration / 2,
      ease: 'Sine.easeOut',
      yoyo: true,
      onUpdate: () => {
        // Keep HP bars with us during the jump
        if (!this.isDead) this.updateHpBar();
      },
      onComplete: () => {
        // Clean up shadow
        if (this.jumpShadow) {
          this.jumpShadow.destroy();
          this.jumpShadow = null;
        }
        this.jumpTweens = [];
        this.isJumping = false;

        // Bail out if zombie died mid-jump
        if (this.isDead) return;

        // Re-enable physics
        if (this.body) {
          this.body.enable = true;
          this.body.reset(landX, landY);
        }
        this.setPosition(landX, landY);

        // Small landing shake
        if (this.scene) {
          this.scene.cameras.main.shake(100, 0.005);
          if (this.scene.audioManager) {
            this.scene.audioManager.playSound('hit', { x: this.x });
          }
        }

        // Resume walking if the target died mid-jump
        if (!target || target.isDead) {
          this.startMoving();
        }
      },
    });
    this.jumpTweens.push(vTween);
  }

  /**
   * Spitter: find the closest plant in this row within spit range.
   */
  findRangedTarget() {
    if (!this.scene || !this.scene.plants) return null;

    let closest = null;
    let closestDist = Infinity;

    this.scene.plants.getChildren().forEach((plant) => {
      if (plant.isDead || plant.row !== this.row) return;
      const dist = this.x - plant.x; // plant is to the left
      if (dist > 0 && dist <= this.spitRange && dist < closestDist) {
        closest = plant;
        closestDist = dist;
      }
    });

    return closest;
  }

  update(time) {
    if (this.isDead) return;
    super.update();

    // Skip normal movement/combat while mid-jump
    if (this.isJumping) return;

    // Ensure zombie is moving left when not attacking
    if (!this.isAttacking && this.body) {
      this.body.setVelocityX(-this.currentSpeed);
    }

    // Jumper: leap to the nearest plant (one-time)
    if (this.isJumper && !this.hasJumped && !this.isAttacking) {
      const jumpTarget = this.findJumpTarget();
      if (jumpTarget) {
        this.performJump(jumpTarget);
        return;
      }
    }

    // Spitter: scan for ranged targets while walking
    if (this.isSpitter && !this.isAttacking) {
      const rangedTarget = this.findRangedTarget();
      if (rangedTarget) {
        this.attack(rangedTarget);
      }
    }

    // Handle attacking
    if (this.isAttacking && this.attackTarget) {
      if (this.attackTarget.isDead) {
        this.stopAttacking();
        return;
      }

      if (time - this.lastAttackTime > this.attackSpeed) {
        this.lastAttackTime = time;

        if (this.isSpitter) {
          // Ranged attack - fire projectile
          this.playAttackTween();
          this.scene.events.emit(EVENTS.ZOMBIE_SPIT, this, this.attackTarget);
        } else {
          // Melee attack
          this.playAttackTween();
          this.attackTarget.takeDamage(this.damage);
        }
      }
    }

    // Check if zombie reached the left edge (victory for this lane!)
    if (this.x < GRID_OFFSET_X - 40) {
      this.scene.events.emit(EVENTS.ZOMBIE_REACHED_END, this);
    }
  }

  playAttackTween() {
    if (this.attackTween) {
      this.attackTween.stop();
      this.attackTween = null;
    }

    const steps = [
      { x: this.x + 4, duration: 60, ease: 'Sine.easeOut' },
      { x: this.x - 6, duration: 80, ease: 'Sine.easeIn' },
      { x: this.x, duration: 40, ease: 'Sine.easeOut' },
    ];

    const runStep = (index) => {
      if (index >= steps.length || !this.scene || this.isDead) {
        this.attackTween = null;
        return;
      }

      const config = steps[index];
      this.attackTween = this.scene.tweens.add({
        targets: this,
        x: config.x,
        duration: config.duration,
        ease: config.ease,
        onComplete: () => runStep(index + 1),
        onStop: () => {
          this.attackTween = null;
        },
      });
    };

    // Backswing then lunge forward
    runStep(0);
  }
}

