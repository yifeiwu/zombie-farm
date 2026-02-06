import { zzfxP } from '../utils/zzfx.js';
import { EVENTS, GAME_WIDTH } from '../config/constants.js';
import { SOUND_PARAMS, SOUND_COOLDOWNS } from './SoundLibrary.js';

export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.lastPlayTimes = new Map();
    this.setupListeners();
  }

  setupListeners() {
    this.scene.events.on(EVENTS.PLANT_SHOOT, (plant) => {
      const key = plant.piercing ? 'shoot_sun' : (plant.slowFactor ? 'shoot_snow' : 'shoot');
      this.playSound(key, { x: plant.x });
    });
    this.scene.events.on(EVENTS.ZOMBIE_SPIT, (zombie) => this.playSound('spit', { x: zombie.x }));
    this.scene.events.on(EVENTS.ZOMBIE_REACHED_END, (zombie) => this.playSound('crash', { x: zombie.x }));
    this.scene.events.on(EVENTS.PLANT_DIED, (plant) => this.playSound('plant_die', { x: plant.x }));
    this.scene.events.on(EVENTS.ZOMBIE_DIED, (zombie) => this.playSound('zombie_die', { x: zombie.x }));
    this.scene.events.on(EVENTS.WAVE_STARTED, (waveNum) => {
      const pitch = 1 + Math.min(0.6, waveNum * 0.03);
      this.playSound('wave', { pitch });
    });
    this.scene.events.on(EVENTS.ALL_WAVES_COMPLETE, () => this.playSound('final', { pitch: 1.1 }));
    this.scene.events.on(EVENTS.SELECT_ZOMBIE_TYPE, () => this.playSound('select'));
  }

  getPanFromX(x) {
    if (typeof x !== 'number') return 0;
    const normalized = (x / GAME_WIDTH) * 2 - 1;
    return Math.max(-1, Math.min(1, normalized));
  }

  playZzfx(params, { pan = 0, volume = 1, pitch = 1 } = {}) {
    const adjusted = params.slice();
    const baseVolume = adjusted[0] ?? 1;
    adjusted[0] = baseVolume * volume;
    const baseFreq = adjusted[2];
    adjusted[2] = (baseFreq ?? 220) * pitch;
    zzfxP(pan, ...adjusted);
  }

  playSound(key, options = {}) {
    const now = this.scene?.time?.now ?? performance.now();
    const minInterval = SOUND_COOLDOWNS[key] ?? 0;
    const last = this.lastPlayTimes.get(key) ?? -Infinity;
    if (now - last < minInterval) return;
    this.lastPlayTimes.set(key, now);

    const pan = options.pan ?? this.getPanFromX(options.x);
    const volumeJitter = 1 + (Math.random() * 2 - 1) * 0.08;
    const pitchJitter = 1 + (Math.random() * 2 - 1) * 0.03;
    const volume = (options.volume ?? 1) * volumeJitter;
    const pitch = (options.pitch ?? 1) * pitchJitter;

    const params = SOUND_PARAMS[key];
    if (!params) return;
    this.playZzfx(params, { pan, volume, pitch });

  }

}

