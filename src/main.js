// =============================================================================
// ZOMBIE FARM - Main Entry Point
// =============================================================================
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, UIScene],
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
  },
  input: {
    activePointers: 2,
    touch: {
      capture: true,
    },
  },
};

const game = new Phaser.Game(config);

// Suspend audio when the tab is hidden, resume when visible
import { zzfxX } from './utils/zzfx.js';
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    zzfxX.suspend();
  } else {
    zzfxX.resume();
  }
});

export default game;

