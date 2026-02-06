// =============================================================================
// ZOMBIE FARM - Sprite Factory (Procedural Pixel Art)
// =============================================================================
import Phaser from 'phaser';

export class SpriteFactory {
  constructor(scene) {
    this.scene = scene;
  }

  generateZombieTexture(key, color) {
    const g = this.scene.make.graphics({ add: false });
    const w = 48;
    const h = 64;
    const pixelSize = 1;
    const offsetX = 0;
    const offsetY = 0;

    const head = Phaser.Display.Color.IntegerToColor(color).lighten(20).color;
    const body = color;
    const dark = Phaser.Display.Color.IntegerToColor(color).darken(20).color;

    const palette = {
      h: head,       // head
      b: body,       // body
      d: dark,       // pants
      e: 0xff0000,   // eyes
      s: 0x4a3b2f,   // shoes
      x: 0x222222,   // extra details
      w: 0xffffff,   // highlights
    };

    const zombiePattern = this.expandPattern(this.getZombiePattern(key), 3, 48, 64);
    this.drawPixelArt(g, zombiePattern, pixelSize, offsetX, offsetY, palette);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  generatePlantTexture(key, color) {
    const g = this.scene.make.graphics({ add: false });
    const w = 48;
    const h = 64;
    const pixelSize = 1;
    const offsetX = 0;
    const offsetY = 0;

    const head = color;
    const stem = 0x4a7c3f;
    const pot = 0x8d6e63;
    const dark = Phaser.Display.Color.IntegerToColor(color).darken(20).color;

    const palette = {
      h: head,       // bloom
      d: dark,       // bloom shadow
      s: stem,       // stem
      p: pot,        // pot
      e: 0x000000,   // eyes/mouth
      w: 0xffffff,   // highlights
    };

    const plantPattern = this.expandPattern(this.getPlantPattern(key), 3, 48, 64);
    this.drawPixelArt(g, plantPattern, pixelSize, offsetX, offsetY, palette);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  generateCircleTexture(key, color, radius) {
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(color, 1);
    g.fillCircle(radius, radius, radius);
    g.generateTexture(key, radius * 2, radius * 2);
    g.destroy();
  }

  generateLaserTexture(key, color, width, height) {
    const g = this.scene.make.graphics({ add: false });
    const glow = Phaser.Display.Color.IntegerToColor(color).lighten(30).color;
    const core = Phaser.Display.Color.IntegerToColor(color).lighten(10).color;

    // Outer glow
    g.fillStyle(glow, 0.8);
    g.fillRoundedRect(0, (height / 2) - 2, width, 4, 2);

    // Core beam
    g.fillStyle(core, 1);
    g.fillRoundedRect(0, (height / 2) - 1, width, 2, 1);

    // Spark at the tip
    g.fillStyle(0xffffff, 1);
    g.fillRect(width - 2, (height / 2) - 1, 2, 2);

    g.generateTexture(key, width, height);
    g.destroy();
  }

  generateBrainTexture() {
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(0xff9ff3, 1);
    // Two lobes
    g.fillCircle(10, 10, 8);
    g.fillCircle(20, 10, 8);
    // Base
    g.fillRoundedRect(4, 8, 22, 12, 4);
    g.generateTexture('brain', 30, 24);
    g.destroy();
  }

  getZombiePattern(key) {
    if (key === 'fast') {
      return [
        "......hhhh......",
        ".....hhhhhh.....",
        "....hhe..ehh....",
        ".....hxxxxh.....",
        "......bbbb......",
        ".....bb..bb.....",
        "...bbbbbbbbbb...",
        "...bbbbb..bbb...",
        "...bbbb....bb...",
        "...bbb......b...",
        "..bbb.bbb..bb...",
        ".bb..bbbb..bb...",
        ".dd....d....dd..",
        ".ddd..ddd..ddd..",
        "..dd..ss..ssdd..",
        "...s..ss..ss....",
        "...s..ss..ss....",
        "..ss........ss..",
        ".ss..........ss.",
        "................",
        "................",
        "................",
        "................",
        "................",
      ];
    }

    if (key === 'tank') {
      return [
        "..xxxxxxxxxxxx..",
        ".xxhhhhhhhhhhxx.",
        ".xxhhe..ehhhxxx.",
        ".xxhhhhhhhhhhxx.",
        ".xxbbbbbbbbbbxx.",
        ".xxbbxxxxxxbbxx.",
        ".xxbbbbbbbbbbxx.",
        ".xxbbbbbbbbbbxx.",
        ".xxbbbbb..bbbxx.",
        ".xxbbbddddbbbxx.",
        "..bbbddddddbbb..",
        "..bbbddbbddbbb..",
        "..ddd..bb..ddd..",
        "..ddddbbbbdddd..",
        "..ddssbbbbssdd..",
        "..ddssbbbbssdd..",
        "...ss..bb..ss...",
        "...ss..bb..ss...",
        "................",
        "................",
      ];
    }

    if (key === 'spitter') {
      return [
        "....hhhhhhhh....",
        "...hhhhhhhhhh...",
        "...hhe..e.hh....",
        "...hhxxxxxxhh...",
        "...bbxxxxxxbb...",
        "..bbbxxxxxxbbb..",
        "..bbbbbbbbbbbb..",
        ".bbbbbb..bbbbbb.",
        ".bbb..d..d..bbb.",
        ".bbb..dddd..bbb.",
        "..bbb..dd..bbb..",
        "..bbb.bbbbbb....",
        "..ddd..ddd......",
        ".dddd..dddd.....",
        ".ddss..ssdd.....",
        "..ss....ss......",
        "..ss....ss......",
        "................",
        "................",
        "................",
      ];
    }

    if (key === 'jumper') {
      // Crouched legs, long arms — ready to leap
      return [
        "....hhhhhhhh....",
        "...hhhhhhhhhh...",
        "...hhe..ehhhh...",
        "...hhhwwhhhhh...",
        "....bbbbbbbb....",
        "..bbbbb..bbbbb..",
        ".bbbbbbbbbbbbb..",
        ".bbbb......bbbb.",
        "..bbb......bbb..",
        "...bb..dd..bb...",
        "...bb..dd..bb...",
        "..bbddddddddbb.",
        ".bb..dddddd..bb.",
        ".dd..ssssss..dd.",
        "..ss..ssss..ss..",
        "..ss........ss..",
        ".ss..........ss.",
        "ss............ss",
        "................",
        "................",
      ];
    }

    // basic default
    return [
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "...hhe..e.hh....",
      "...hhhhhhhhhh...",
      "....bbbbbbbb....",
      "...bb....bbbb...",
      "..bbbbbbbbbbbb..",
      "..bbbbbbbbbbbb..",
      "..bbbdd..ddbbb..",
      "..bbbdd..ddbbb..",
      "...bbb....bbb...",
      "...bbb....bbb...",
      "..ddd..dd..ddd..",
      "..dddddddddddd..",
      "..ddss....ssdd..",
      "...ss......ss...",
      "................",
      "................",
      "................",
      "................",
    ];
  }

  getPlantPattern(key) {
    if (key === 'super_sunflower') {
      return [
        "..hhhhhhhhhhhh..",
        ".hhhhhhhhhhhhhh.",
        ".hhhhwhhhwhhhhh.",
        ".hhhhhhhhhhhhhh.",
        ".hhhhhhhhhhhhhh.",
        "..hhhhwwhhhhhh..",
        "..hhhdhhhhdhhh..",
        "..hhhdhhhdhhhd..",
        "...hhhhhhhhhh...",
        "...hhhhhhhhhh...",
        "......ssss......",
        ".....ss..ss.....",
        ".....ss..ss.....",
        "....pppppppp....",
        "...pppppppppp...",
        "..pppppppppppp..",
        "..pppppppppppp..",
        "....pppppppp....",
        "................",
        "................",
      ];
    }

    if (key === 'sunflower') {
      return [
        "..hhhhhhhhhhhh..",
        ".hhhhhhhhhhhhhh.",
        ".hhhwheeehwhehh.",
        ".hhhhhhhhhhhhhh.",
        ".hhhhhhwwhhhhhh.",
        "..hhhdhhhhdhhh..",
        "..hhhdhhhdhhhd..",
        "...hhhhhhhhhh...",
        "......ssss......",
        ".....ss..ss.....",
        ".....ss..ss.....",
        "....pppppppp....",
        "...pppppppppp...",
        "..pppppppppppp..",
        "..pppppppppppp..",
        "....pppppppp....",
        "................",
        "................",
        "................",
        "................",
      ];
    }

    if (key === 'wallnut') {
      return [
        ".......dd.......",
        "......dddd......",
        ".....ddhhdd.....",
        "....ddhhhhdd....",
        "...dddhhehddd...",
        "..dddhhhhhhddd..",
        "..dddhhhhhhddd..",
        ".dddhhddhhddhdd.",
        ".ddhhhhhhhhhhdd.",
        ".ddhhhhhhhhhhdd.",
        "..ddhhhhhhhhdd..",
        "..ddhhh..hhhdd..",
        "..ddhhh..hhhdd..",
        "...ddhhhhhhdd...",
        "....dddddddd....",
        "................",
        "................",
        "................",
        "................",
        "................",
      ];
    }

    if (key === 'snowpea') {
      return [
        "................",
        "....hhhhhhhh....",
        "...hhhhhhhhhh...",
        "..hhhe..ehhhh...",
        "..hhhhwwhhhhh...",
        "...hhdhhhdhh....",
        ".....ss..ss.....",
        ".....ss..ss.....",
        ".....ss..ss.....",
        "......ssss......",
        "......ssss......",
        ".....ss..ss.....",
        "....pppppppp....",
        "...pppppppppp...",
        "..pppppppppppp..",
        "..pppppppppppp..",
        "....pppppppp....",
        "................",
        "................",
        "................",
      ];
    }

    // peashooter default
    return [
      "................",
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "..hhhe..ehhhh...",
      "..hhhhhhhhhhh...",
      "...hhdhhhdhh....",
      ".....ss..ss.....",
      ".....ss..ss.....",
      "......ssss......",
      "......ssss......",
      ".....ss..ss.....",
      ".....ss..ss.....",
      "....pppppppp....",
      "...pppppppppp...",
      "..pppppppppppp..",
      "..pppppppppppp..",
      "....pppppppp....",
      "................",
      "................",
      "................",
    ];
  }

  drawPixelArt(graphics, pattern, pixelSize, offsetX, offsetY, palette) {
    for (let y = 0; y < pattern.length; y++) {
      const row = pattern[y];
      for (let x = 0; x < row.length; x++) {
        const code = row[x];
        if (code === '.' || !palette[code]) continue;
        graphics.fillStyle(palette[code], 1);
        graphics.fillRect(
          offsetX + x * pixelSize,
          offsetY + y * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }

  expandPattern(pattern, scale, targetWidth, targetHeight) {
    // Scale up the base pattern by `scale` and then pad to target size.
    const scaled = [];
    const width = pattern[0].length;
    const height = pattern.length;

    // Scale rows
    for (let y = 0; y < height; y++) {
      const row = pattern[y];
      let scaledRow = '';
      for (let x = 0; x < width; x++) {
        const ch = row[x] || '.';
        scaledRow += ch.repeat(scale);
      }
      for (let sy = 0; sy < scale; sy++) {
        scaled.push(scaledRow);
      }
    }

    // Pad to target size (centered vertically)
    const padRows = Math.max(0, targetHeight - scaled.length);
    const padTop = Math.floor(padRows / 2);
    const padBottom = padRows - padTop;
    const emptyRow = '.'.repeat(targetWidth);

    // Ensure width matches target
    const finalRows = scaled.map((row) => row.padEnd(targetWidth, '.'));

    return [
      ...Array(padTop).fill(emptyRow),
      ...finalRows,
      ...Array(padBottom).fill(emptyRow),
    ];
  }
}

