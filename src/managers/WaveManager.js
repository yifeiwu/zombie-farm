// =============================================================================
// ZOMBIE FARM - Wave Manager
// =============================================================================
import Phaser from 'phaser';
import { PLANT_TYPES, PLANT_REACTION, GRID_ROWS, GRID_COLS, WAVE_CONFIG, CELL_WIDTH, CELL_HEIGHT, GRID_OFFSET_X, GRID_OFFSET_Y, EVENTS } from '../config/constants.js';
import { Plant } from '../entities/Plant.js';

export class WaveManager {
  constructor(scene, stageConfig) {
    this.scene = scene;
    this.stageConfig = stageConfig || null;
    this.currentWave = 0;

    // Use stage wave config if available, otherwise fall back to defaults
    const wc = this.stageConfig ? this.stageConfig.waveConfig : WAVE_CONFIG;
    this.maxWaves = wc.maxWaves;
    this.plantsPerWave = wc.plantsPerWave;
    this.waveScaling = wc.waveScaling;
    this.previewDelay = wc.previewDelay;

    // Max column plants can spawn in (stage-specific)
    this.maxPlantCol = this.stageConfig ? this.stageConfig.maxPlantCol : 5;

    // Plant unlock schedule from stage config
    this.plantUnlocks = this.stageConfig ? this.stageConfig.plantUnlocks : null;

    this.isSpawning = false;

    // Track occupied cells: grid[row][col] = plant or null
    this.grid = Array.from({ length: GRID_ROWS }, () =>
      Array(GRID_COLS).fill(null)
    );
  }

  /**
   * Start the initial plant placement using stage config.
   */
  spawnInitialPlants() {
    this.currentWave = 1;

    const placements = this.stageConfig
      ? this.stageConfig.initialPlacements
      : [
          { type: 'PEASHOOTER', row: 0, col: 2 },
          { type: 'PEASHOOTER', row: 2, col: 2 },
          { type: 'PEASHOOTER', row: 4, col: 2 },
          { type: 'PEASHOOTER', row: 1, col: 0 },
          { type: 'PEASHOOTER', row: 3, col: 0 },
          { type: 'WALLNUT', row: 2, col: 4 },
        ];

    for (const p of placements) {
      this.placePlant(p.type, p.row, p.col);
    }
  }

  /**
   * Get available plant types for the current wave based on the unlock schedule.
   */
  getAvailablePlantTypes() {
    if (!this.plantUnlocks) {
      // Legacy fallback (no stage config)
      const types = ['PEASHOOTER'];
      if (this.currentWave >= 2) types.push('SNOWPEA');
      if (this.currentWave >= 4) types.push('WALLNUT');
      if (this.currentWave >= 8) types.push('SUNFLOWER');
      return types;
    }

    const types = [];
    const unlockWaves = Object.keys(this.plantUnlocks)
      .map(Number)
      .sort((a, b) => a - b);

    for (const wave of unlockWaves) {
      if (this.currentWave >= wave) {
        types.push(...this.plantUnlocks[wave]);
      }
    }

    return types;
  }

  /**
   * Spawn the next wave of plant reinforcements.
   */
  spawnNextWave() {
    this.currentWave++;
    if (this.currentWave > this.maxWaves) {
      this.scene.events.emit(EVENTS.ALL_WAVES_COMPLETE);
      return;
    }

    const numPlants = this.plantsPerWave + (this.currentWave - 1) * this.waveScaling;

    this.scene.events.emit(EVENTS.WAVE_STARTED, this.currentWave);

    const availableTypes = this.getAvailablePlantTypes();
    const reactionBias = this.getPlantReactionBias(availableTypes, this.scene.rowState);
    const placements = this.buildWavePlacements(numPlants, availableTypes, reactionBias);

    this.scene.events.emit(EVENTS.WAVE_PLANTS_PREVIEW, {
      wave: this.currentWave,
      placements,
      delay: this.previewDelay,
    });

    this.scene.time.delayedCall(this.previewDelay, () => {
      placements.forEach(({ type, row, col }) => {
        if (!this.grid[row][col]) {
          this.placePlant(type, row, col);
        }
      });
    });
  }

  buildWavePlacements(numPlants, availableTypes, reactionBias = null) {
    const placements = [];
    let attempts = 0;
    let reactionRemaining = reactionBias ? reactionBias.count : 0;
    const maxCol = Math.min(this.maxPlantCol, GRID_COLS - 1);

    while (reactionRemaining > 0 && attempts < 80) {
      attempts++;
      const typeKey = Phaser.Utils.Array.GetRandom(reactionBias.types);
      const col = this.findOpenColumnInRow(reactionBias.row, placements);
      if (col !== null) {
        placements.push({ type: typeKey, row: reactionBias.row, col });
        reactionRemaining--;
      }
    }

    while (placements.length < numPlants && attempts < 200) {
      attempts++;
      const typeKey = Phaser.Utils.Array.GetRandom(availableTypes);
      const row = Phaser.Math.Between(0, GRID_ROWS - 1);
      const col = Phaser.Math.Between(0, maxCol);

      if (!this.grid[row][col] && !placements.some((p) => p.row === row && p.col === col)) {
        placements.push({ type: typeKey, row, col });
      }
    }

    return placements;
  }

  findOpenColumnInRow(row, placements) {
    const maxCol = Math.min(this.maxPlantCol, GRID_COLS - 1);
    const candidates = [];
    for (let col = 0; col <= maxCol; col++) {
      const occupied = this.grid[row][col] || placements.some((p) => p.row === row && p.col === col);
      if (!occupied) candidates.push(col);
    }

    if (candidates.length === 0) return null;
    return candidates[Phaser.Math.Between(0, candidates.length - 1)];
  }

  /**
   * Determine biased row placement based on overused zombie rows.
   */
  getPlantReactionBias(availableTypes, rowState) {
    if (!rowState || rowState.length === 0) return null;

    const maxCount = Math.max(...rowState.map((state) => state.spawnCount));
    if (maxCount < PLANT_REACTION.minSpawns) return null;

    const candidates = [];
    for (let i = 0; i < rowState.length; i++) {
      if (rowState[i].spawnCount === maxCount) candidates.push(i);
    }

    if (candidates.length === 0) return null;
    const row = candidates[Phaser.Math.Between(0, candidates.length - 1)];

    const preferred = PLANT_REACTION.preferredTypes.filter((type) => availableTypes.includes(type));
    if (preferred.length === 0) return null;

    // Consume the bias so it only applies to the next wave
    rowState[row].spawnCount = 0;

    return {
      row,
      types: preferred,
      count: PLANT_REACTION.count,
    };
  }

  /**
   * Replace an entire row, then place a fixed plan into specific columns.
   */
  replaceRowWithPlan(row, plan, columns, { hardRemove = true } = {}) {
    if (row < 0 || row >= GRID_ROWS) return 0;

    for (let col = 0; col < GRID_COLS; col++) {
      const existing = this.grid[row][col];
      if (existing && !existing.isDead) {
        this.removePlant(existing);
        if (hardRemove) {
          existing.isDead = true;
          existing.destroyHpBar();
          existing.destroy();
        } else {
          existing.die();
        }
      }
    }

    let placed = 0;
    for (let i = 0; i < plan.length && i < columns.length; i++) {
      const col = columns[i];
      if (col < 0 || col >= GRID_COLS) continue;
      const plant = this.placePlant(plan[i], row, col);
      if (plant) placed++;
    }

    return placed;
  }

  /**
   * Place a plant at a grid position.
   */
  placePlant(typeKey, row, col) {
    const config = PLANT_TYPES[typeKey];
    if (!config) return null;

    const x = GRID_OFFSET_X + col * CELL_WIDTH + CELL_WIDTH / 2;
    const y = GRID_OFFSET_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

    const plant = new Plant(this.scene, x, y, config, row, col);
    this.grid[row][col] = plant;

    // Pop-in animation
    plant.setScale(0);
    this.scene.tweens.add({
      targets: plant,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Register with scene
    this.scene.plants.add(plant);

    return plant;
  }

  /**
   * Remove a plant from the grid tracking.
   */
  removePlant(plant) {
    if (plant.row >= 0 && plant.col >= 0) {
      this.grid[plant.row][plant.col] = null;
    }
  }

  /**
   * Get all plants in a specific row.
   */
  getPlantsInRow(row) {
    return this.grid[row].filter((p) => p && !p.isDead);
  }

  /**
   * Check if all plants are dead.
   */
  allPlantsDestroyed() {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] && !this.grid[r][c].isDead) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Count remaining plants.
   */
  getRemainingPlantCount() {
    let count = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] && !this.grid[r][c].isDead) {
          count++;
        }
      }
    }
    return count;
  }
}
