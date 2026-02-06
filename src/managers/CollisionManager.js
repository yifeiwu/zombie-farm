// =============================================================================
// ZOMBIE FARM - Collision Manager
// =============================================================================

export class CollisionManager {
  constructor(scene, projectileManager, zombieGroup, plantGroup) {
    this.scene = scene;
    this.projectileManager = projectileManager;
    this.zombies = zombieGroup;
    this.plants = plantGroup;

    this.setupCollisions();
  }

  setupCollisions() {
    // Plant projectiles hit zombies
    this.scene.physics.add.overlap(
      this.projectileManager.getPlantProjectiles(),
      this.zombies,
      (proj, zombie) => {
        if (proj.active && zombie.active && !zombie.isDead) {
          proj.onHit(zombie);
        }
      }
    );

    // Zombie projectiles hit plants
    this.scene.physics.add.overlap(
      this.projectileManager.getZombieProjectiles(),
      this.plants,
      (proj, plant) => {
        if (proj.active && plant.active && !plant.isDead) {
          proj.onHit(plant);
        }
      }
    );

    // Zombies collide with plants (melee range)
    this.scene.physics.add.overlap(
      this.zombies,
      this.plants,
      (zombie, plant) => {
        if (zombie.isDead || plant.isDead) return;
        if (!zombie.isAttacking) {
          zombie.attack(plant);
        }
      }
    );
  }
}

