// =============================================================================
// ZOMBIE FARM - Living Entity Base Class
// =============================================================================
import Phaser from 'phaser';

export class LivingEntity extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, textureKey, hp) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = hp;
    this.maxHp = hp;
    this.isDead = false;

    // HP Bar Setup
    this.hpBarOffset = { x: 0, y: -36 };
    this.hpBarWidth = 36;
    this.hpBarHeight = 4;
    
    this.hpBar = scene.add.rectangle(x, y + this.hpBarOffset.y, this.hpBarWidth, this.hpBarHeight, 0x00ff00).setOrigin(0.5, 0.5);
    this.hpBarBg = scene.add.rectangle(x, y + this.hpBarOffset.y, this.hpBarWidth, this.hpBarHeight, 0x333333).setOrigin(0.5, 0.5);
    this.hpBarBg.setDepth(9);
    this.hpBar.setDepth(10);
  }

  takeDamage(amount) {
    if (this.isDead) return;

    this.hp -= amount;

    // Show damage text
    if (this.scene.showFloatingText) {
      // Color depends on type (subclass can override, or we pass it)
      const color = this.damageTextColor || '#ffffff';
      this.scene.showFloatingText(this.x, this.y, `-${amount}`, color);
    }

    // Flash effect
    this.setTint(this.damageTint || 0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.clearTint();
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    if (this.body) this.body.stop();

    // Death animation/tween
    this.scene.tweens.add({
      targets: [this, this.hpBar, this.hpBarBg],
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 400,
      onComplete: () => {
        this.destroyHpBar();
        this.destroy();
      },
    });
  }

  destroyHpBar() {
    if (this.hpBar) this.hpBar.destroy();
    if (this.hpBarBg) this.hpBarBg.destroy();
  }

  updateHpBar() {
    this.hpBar.x = this.x + this.hpBarOffset.x;
    this.hpBar.y = this.y + this.hpBarOffset.y;
    this.hpBarBg.x = this.x + this.hpBarOffset.x;
    this.hpBarBg.y = this.y + this.hpBarOffset.y;

    const hpRatio = Math.max(0, this.hp / this.maxHp);
    this.hpBar.width = this.hpBarWidth * hpRatio;

    if (hpRatio > 0.5) this.hpBar.setFillStyle(0x00ff00);
    else if (hpRatio > 0.25) this.hpBar.setFillStyle(0xffaa00);
    else this.hpBar.setFillStyle(0xff0000);
  }

  // Subclasses should call this in their update loop
  update() {
    if (this.isDead) return;
    this.updateHpBar();
  }
}

