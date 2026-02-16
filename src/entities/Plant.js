// =============================================================================
// ZOMBIE FARM - Plant Entity (Enemy)
// =============================================================================
import Phaser from 'phaser';
import { EVENTS } from '../config/constants.js';
import { LivingEntity } from './LivingEntity.js';

export class Plant extends LivingEntity {
  constructor(scene, x, y, config, row, col) {
    const texture = config.atlasTexture || config.key;
    const frame = config.atlasFrame;
    super(scene, x, y, texture, config.hp, frame);

    // Stats
    this.plantType = config.key;
    this.usesAtlas = !!config.atlasTexture;
    this.idleAnimKey = config.atlasTexture ? `${config.atlasTexture}_idle` : null;
    this.attackAnimKey = config.atlasTexture ? `${config.atlasTexture}_attack` : null;
    this.damage = config.damage;
    this.attackSpeed = config.attackSpeed;
    this.range = config.range;
    this.slowFactor = config.slowFactor || 0;
    this.piercing = config.piercing || false;
    this.projectileSpeed = config.projectileSpeed || 200;
    this.canAttack = config.damage > 0;

    this.damageTint = 0xffffff;
    this.damageTextColor = '#ffaa00';

    // Grid position
    this.row = row;
    this.col = col;

    // State
    this.lastAttackTime = 0;
    this.attackTween = null;

    // Physics
    this.body.setImmovable(true);
    if (this.usesAtlas) {
      this.displayScale = 0.32;
      this.setScale(this.displayScale);
      this.body.setSize(140, 160);
      this.body.setOffset(105, 120);
    } else {
      this.displayScale = 1;
      this.body.setSize(64, 96);
      this.body.setOffset(16, 24);
    }

    // Gentle sway animation (skip for atlas plants; they use sprite anims)
    if (!this.usesAtlas) {
      scene.tweens.add({
      targets: this,
      angle: Phaser.Math.Between(-3, 3),
      duration: 1000 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    } else {
      this.play(this.idleAnimKey, true);
    }
  }

  die() {
    super.die();
    this.scene.events.emit(EVENTS.PLANT_DIED, this);
  }

  update(time, zombiesInRow) {
    if (this.isDead) return;
    super.update();

    // Shooting logic
    if (!this.canAttack) return;
    if (time - this.lastAttackTime < this.attackSpeed) return;

    // Check for zombies in this row to the right
    const target = this.findTarget(zombiesInRow);
    if (target) {
      this.lastAttackTime = time;
      this.playAttackTween();
      this.scene.events.emit(EVENTS.PLANT_SHOOT, this, target);
    }
  }

  playAttackTween() {
    if (this.usesAtlas && this.attackAnimKey) {
      this.play(this.attackAnimKey);
      this.once('animationcomplete', () => {
        this.play(this.idleAnimKey, true);
      });
      return;
    }

    if (this.attackTween) {
      this.attackTween.stop();
      this.attackTween = null;
    }

    // Quick backswing for a shot (procedural plants only)
    this.attackTween = this.scene.tweens.add({
      targets: this,
      angle: -6,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.attackTween = null;
      },
    });
  }

  findTarget(zombiesInRow) {
    if (!zombiesInRow || zombiesInRow.length === 0) return null;

    let closest = null;
    let closestDist = Infinity;

    for (const zombie of zombiesInRow) {
      if (zombie.isDead) continue;
      // Plants shoot to the RIGHT (toward incoming zombies)
      const dist = zombie.x - this.x;
      if (dist > 0 && dist < this.range && dist < closestDist) {
        closest = zombie;
        closestDist = dist;
      }
    }

    return closest;
  }
}

