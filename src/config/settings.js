// Display
export const GAME_WIDTH = 2048;
export const GAME_HEIGHT = 1200;

// Grid layout (5 rows x 9 columns, like PvZ)
export const GRID_ROWS = 5;
export const GRID_COLS = 9;
export const CELL_WIDTH = 160;
export const CELL_HEIGHT = 160;
export const GRID_OFFSET_X = 440; // left margin to the grid
export const GRID_OFFSET_Y = 160;  // top margin to the grid

// Gameplay
export const STARTING_BRAINS = 300;     // currency (like sun, but brains)
export const BRAIN_REGEN_RATE = 3000;   // ms between passive brain gains
export const BRAIN_REGEN_AMOUNT = 40;
export const PLANT_KILL_BOUNTY = { min: 200, max: 500 };
export const HOUSE_MAX_HP = 1000;        // house the plants are defending
export const SIGNAL_FLARE = {
  threshold: 9,            // spawns in same row to trigger
  plan: ['PEASHOOTER', 'WALLNUT', 'WALLNUT', 'SUPER_SUNFLOWER'],
  backColumns: [0, 1, 2, 3],
};
export const PLANT_REACTION = {
  minSpawns: 3,             // row overuse to trigger bias
  preferredTypes: ['WALLNUT', 'SNOWPEA'],
  count: 1,                 // extra biased placements per wave
};

// Wave configuration
export const WAVE_CONFIG = {
  timeBetweenWaves: 10000,    // ms before plants get reinforcements
  plantsPerWave: 2,           // starting plants placed per wave
  waveScaling: 1,             // extra plants per wave increase
  maxWaves: 15,
  previewDelay: 8000,         // ms to preview placements before spawning
};

// Colors
export const COLORS = {
  GRASS_LIGHT: 0x7ec850,
  GRASS_DARK: 0x5da639,
  SIDEBAR: 0x3d2b1f,
  UI_BG: 0x2c2c3e,
  UI_TEXT: '#ffffff',
  UI_ACCENT: '#ff6b6b',
  BRAIN_COLOR: '#ff9ff3',
};

