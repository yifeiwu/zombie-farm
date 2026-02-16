// =============================================================================
// ZOMBIE FARM - Stage Definitions
// =============================================================================

export const STAGES = [
  // -------------------------------------------------------------------------
  // Stage 1 — "The Garden Patch" (Easy)
  // Basic peashooters only, plants confined to left columns, slow waves.
  // -------------------------------------------------------------------------
  {
    id: 1,
    name: 'The Garden Patch',
    description: 'A small garden with light defenses.',
    houseHp: 300,
    startingBrains: 500,
    waveConfig: {
      timeBetweenWaves: 15000,
      plantsPerWave: 1,
      waveScaling: 1,
      maxWaves: 8,
      previewDelay: 8000,
    },
    maxPlantCol: 3,
    plantUnlocks: {
      1: ['PEASHOOTER'],
      3: ['WALLNUT'],
    },
    initialPlacements: [
      { type: 'PEASHOOTER', row: 0, col: 1 },
      { type: 'PEASHOOTER', row: 2, col: 1 },
      { type: 'PEASHOOTER', row: 4, col: 1 },
    ],
  },

  // -------------------------------------------------------------------------
  // Stage 2 — "The Backyard" (Medium)
  // Snow peas join the fight, plants spread further, faster waves.
  // -------------------------------------------------------------------------
  {
    id: 2,
    name: 'The Backyard',
    description: 'More plant types and tighter wave timing.',
    houseHp: 600,
    startingBrains: 400,
    waveConfig: {
      timeBetweenWaves: 15000,
      plantsPerWave: 1,
      waveScaling: 1,
      maxWaves: 12,
      previewDelay: 8000,
    },
    maxPlantCol: 4,
    plantUnlocks: {
      1: ['PEASHOOTER'],
      2: ['SNOWPEA'],
      4: ['WALLNUT'],
    },
    initialPlacements: [
      { type: 'PEASHOOTER', row: 0, col: 2 },
      { type: 'PEASHOOTER', row: 2, col: 2 },
      { type: 'PEASHOOTER', row: 4, col: 2 },
      { type: 'WALLNUT', row: 1, col: 3 },
      { type: 'WALLNUT', row: 3, col: 3 },
    ],
  },

  // -------------------------------------------------------------------------
  // Stage 3 — "The Fortress" (Hard)
  // All plant types, deep defenses, aggressive reinforcements.
  // -------------------------------------------------------------------------
  {
    id: 3,
    name: 'The Fortress',
    description: 'Full arsenal. Sunbeams, walls, and relentless waves.',
    houseHp: 1500,
    startingBrains: 400,
    waveConfig: {
      timeBetweenWaves: 6000,
      plantsPerWave: 1,
      waveScaling: 1,
      maxWaves: 20,
      previewDelay: 6000,
    },
    maxPlantCol: 6,
    plantUnlocks: {
      1: ['PEASHOOTER'],
      2: ['SNOWPEA'],
      4: ['WALLNUT'],
      6: ['SUNFLOWER'],
    },
    initialPlacements: [
      { type: 'PEASHOOTER', row: 0, col: 2 },
      { type: 'PEASHOOTER', row: 2, col: 2 },
      { type: 'PEASHOOTER', row: 4, col: 2 },
      { type: 'PEASHOOTER', row: 1, col: 0 },
      { type: 'PEASHOOTER', row: 3, col: 0 },
      { type: 'WALLNUT', row: 2, col: 4 },
    ],
  },
];

