/**
 * @typedef {{ plant: any, target: any }} PlantShootPayload
 * @typedef {{ wave: number, placements: Array<{type: string, row: number, col: number}>, delay: number }} WavePreviewPayload
 */
export const EVENTS = {
  BRAINS_CHANGED: 'brainsChanged',
  SCORE_CHANGED: 'scoreChanged',
  HOUSE_HP_CHANGED: 'houseHpChanged',
  WAVE_STARTED: 'waveStarted',
  WAVE_PLANTS_PREVIEW: 'wavePlantsPreview',
  ALL_WAVES_COMPLETE: 'allWavesComplete',
  ZOMBIE_DIED: 'zombieDied',
  ZOMBIE_REACHED_END: 'zombieReachedEnd',
  ZOMBIE_SPIT: 'zombieSpit',
  PLANT_DIED: 'plantDied',
  PLANT_SHOOT: 'plantShoot',
  SELECT_ZOMBIE_TYPE: 'selectZombieType',
};

