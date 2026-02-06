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
    const w = 96;
    const h = 180;
    const pixelSize = 2;
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

    const zombiePattern = this.expandPattern(this.getZombiePattern(key), 3, 96, 180);
    this.drawPixelArt(g, zombiePattern, pixelSize, offsetX, offsetY, palette);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  generatePlantTexture(key, color) {
    const g = this.scene.make.graphics({ add: false });
    const w = 96;
    const h = 180;
    const pixelSize = 2;
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

    const plantPattern = this.expandPattern(this.getPlantPattern(key), 3, 96, 180);
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
    g.fillRoundedRect(0, (height / 2) - 4, width, 8, 4);

    // Core beam
    g.fillStyle(core, 1);
    g.fillRoundedRect(0, (height / 2) - 2, width, 4, 2);

    // Spark at the tip
    g.fillStyle(0xffffff, 1);
    g.fillRect(width - 4, (height / 2) - 2, 4, 4);

    g.generateTexture(key, width, height);
    g.destroy();
  }

  generateBrainTexture() {
    const g = this.scene.make.graphics({ add: false });
    const brainColor = 0xff9ff3;
    const brainDark = 0xff6bd5;
    const brainLight = 0xffb3f0;
    const brainCore = 0xffffff;
    
    // Outer glow (for pickup effect)
    g.fillStyle(brainLight, 0.3);
    g.fillCircle(30, 24, 24);
    
    // Base shape
    g.fillStyle(brainDark, 1);
    g.fillRoundedRect(6, 12, 48, 28, 10);
    
    // Two lobes with gradient effect
    g.fillStyle(brainColor, 1);
    g.fillCircle(18, 20, 14);
    g.fillCircle(42, 20, 14);
    
    // Overlap area
    g.fillRoundedRect(18, 12, 24, 16, 8);
    
    // Highlights on lobes
    g.fillStyle(brainLight, 0.8);
    g.fillCircle(18, 18, 6);
    g.fillCircle(42, 18, 6);
    
    // Core highlight
    g.fillStyle(brainCore, 0.6);
    g.fillCircle(30, 22, 4);
    
    // Texture details (wrinkles)
    g.lineStyle(2, brainDark, 0.4);
    g.beginPath();
    g.moveTo(12, 20);
    g.lineTo(20, 24);
    g.lineTo(16, 28);
    g.strokePath();
    
    g.beginPath();
    g.moveTo(48, 20);
    g.lineTo(40, 24);
    g.lineTo(44, 28);
    g.strokePath();
    
    g.generateTexture('brain', 60, 48);
    g.destroy();
  }

  getZombiePattern(key) {
    if (key === 'fast') {
      // Small, lean, compact runner zombie
      return [
        "................",  // pad top
        ".......hhh........",  // 15 -> 18
        "......hhhhh.......",  // 15 -> 18
        ".....hheeehh......",  // 15 -> 18
        "......hxxxxh......",  // 16 -> 18
        ".......bbb........",  // 15 -> 18
        "......bb.bb.......",  // 15 -> 18
        "....bbbbbbbb......",  // 15 -> 18
        "....bbbbbbbb......",  // 15 -> 18
        "....bbb..bbb......",  // 15 -> 18
        "....bb....bb......",  // 15 -> 18
        "...bb.bbbb.bb.....",  // 15 -> 18
        "..bb..bbbb..bb....",  // 15 -> 18
        "..bb..bbbb..bb....",  // 15 -> 18
        "..dd...d...dd.....",  // 15 -> 18
        "..ddd.ddd.ddd.....",  // 15 -> 18
        "...dd.sss.ssdd....",  // 15 -> 18
        "....s.sss.ss......",  // 15 -> 18
        "....s.sss.ss......",  // 15 -> 18
        "...ss.sss.ss......",  // 15 -> 18
        "..ss..sss..ss.....",  // 15 -> 18
        ".ss...sss...ss....",  // 15 -> 18
        "................",
        "................",
        "................",
      ];
    }

    if (key === 'tank') {
      // Massive, heavily armored zombie with huge body
      return [
        "..xxxxxxxxxxxxxx..",
        ".xxxhhhhhhhhhhxxx.",
        ".xxxhheeeehhhxxxx.",
        ".xxxhhhhhhhhhhxxx.",
        ".xxxbbbbbbbbbbxxx.",
        ".xxxbbxxxxxxbbxxx.",
        ".xxxbbbbbbbbbbxxx.",
        ".xxxbbbbbbbbbbxxx.",
        ".xxxbbbbbbbbbbxxx.",
        ".xxxbbbbbbbbbbxxx.",
        ".xxxbbbbb..bbbxxx.",
        ".xxxbbbbb..bbbxxx.",
        "..xxxbbbddddbbbxx.",
        "..xxxbbbddddbbbxx.",
        "..xxxbbbddbbbbbxx.",
        "..xxxddd..bbdddxx.",
        "..xxxddd..bbdddxx.",
        "..xxxxddbbbbddxxx.",
        "..xxxddssbbssddxx.",
        "..xxxddssbbssddxx.",
        "..xxxddssbbssddxx.",
        "...xxxss..bbssxxx.",
        "...xxxss..bbssxxx.",
        "................",
        "................",
      ];
    }

    if (key === 'spitter') {
      // Very small, compact spitter - half height with bloated head for spitting
      return [
        "................",  // pad top (8 rows)
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "......hhhhhh......",  // 14 -> 18
        ".....hhhhhhhh.....",  // 14 -> 18
        ".....hheeeehh.....",  // 14 -> 18
        "....hhhxxxxhhh....",  // 15 -> 18
        "...bbbbxxxxbbbb...",  // 15 -> 18
        "...bbbbbbbbbbbb...",  // 15 -> 18
        "...bbbbbbbbbbbb...",  // 14 -> 18
        "...bbbb..bbbbbb...",  // 14 -> 18
        "..bbbb..dd..bbbb..",  // 15 -> 18
        "...bbb.bbbb.bbb...",  // 15 -> 18
        "...ddd..dd..ddd...",  // 15 -> 18
        "..dddd..dd..dddd..",  // 15 -> 18
        "..ddss..ss..ssdd..",  // 15 -> 18
        "...ss....ss..ss...",  // 15 -> 18
        "................",  // pad bottom (3 rows)
        "................",
        "................",
      ];
    }

    if (key === 'jumper') {
      // Small crouched zombie with long arms, compact but powerful
      return [
        "................",  // pad top (2 rows)
        "................",
        "......hhhhhh......",  // 14 -> 18
        ".....hhhhhhhh.....",  // 14 -> 18
        ".....hheeehhh.....",  // 14 -> 18
        "....hhhwwhhhh.....",  // 15 -> 18
        "......bbbbbb......",  // 14 -> 18
        "....bbbb..bbbb....",  // 14 -> 18
        "...bbbbbbbbbbbb...",  // 14 -> 18
        "...bbbbbbbbbbbb...",  // 14 -> 18
        "...bbbb....bbbb...",  // 14 -> 18
        "....bbb....bbb....",  // 14 -> 18
        ".....bb..dd..bb...",  // 14 -> 18
        ".....bb..dd..bb...",  // 14 -> 18
        "....bbddddddbb....",  // 14 -> 18
        "...bb..dddd..bb...",  // 14 -> 18
        "...bb..dddd..bb...",  // 14 -> 18
        "...dd..ssss..dd...",  // 14 -> 18
        "....ss.ssss.ss....",  // 14 -> 18
        "....ss.ssss.ss....",  // 14 -> 18
        "...ss..ssss..ss...",  // 14 -> 18
        "..ss...ssss...ss..",  // 14 -> 18
        "................",
        "................",
        "................",
      ];
    }

    // basic default - small standard zombie
    return [
      "................",  // pad top (4 rows)
      "................",
      "................",
      "................",
      "......hhhhhh......",  // 14 -> 18
      ".....hhhhhhhh.....",  // 14 -> 18
      ".....hhe..ehh.....",  // 14 -> 18
      ".....hhhhhhhh.....",  // 14 -> 18
      "......bbbbbb......",  // 14 -> 18
      ".....bb..bbbb.....",  // 14 -> 18
      "....bbbbbbbbbb....",  // 14 -> 18
      "....bbbbbbbbbb....",  // 14 -> 18
      "...bbbdd..dbbb....",  // 15 -> 18
      "...bbbdd..dbbb....",  // 15 -> 18
      ".....bbb..bbb.....",  // 14 -> 18
      ".....bbb..bbb.....",  // 14 -> 18
      "....ddd.dd.ddd....",  // 14 -> 18
      "....dddddddddd....",  // 14 -> 18
      "....ddss..ssdd....",  // 14 -> 18
      ".....ss....ss.....",  // 14 -> 18
      ".....ss....ss.....",  // 14 -> 18
      "................",
      "................",
      "................",
      "................",
    ];
  }

  getPlantPattern(key) {
    if (key === 'super_sunflower') {
      // Massive double-layered flower head, very tall
      return [
        "..hhhhhhhhhhhhhh..",
        ".hhhhhhhhhhhhhhhh.",
        ".hhhhhwhhhhwhhhhh.",
        ".hhhhhhhhhhhhhhhh.",
        ".hhhhhhhhhhhhhhhh.",
        ".hhhhhhhhhhhhhhhh.",
        "..hhhhhwwwwhhhhh..",
        "..hhhhhwwwwhhhhh..",
        "..hhhhdhhhhhdhhh..",
        "..hhhhdhhhhhdhhh..",
        "...hhhhhhhhhhhh...",
        "...hhhhhhhhhhhh...",
        "......ssssss......",
        ".....ssssssss.....",
        ".....ssssssss.....",
        ".....ssssssss.....",
        "....pppppppppp....",
        "...pppppppppppp...",
        "..pppppppppppppp..",
        "..pppppppppppppp..",
        "..pppppppppppppp..",
        "..pppppppppppppp..",
        "....pppppppppp....",
        "................",
        "................",
      ];
    }

    if (key === 'sunflower') {
      // Classic sunflower with distinct petal pattern
      return [
        "................",  // pad top (3 rows)
        "................",
        "................",
        "...hhhhhhhhhhhh...",  // 16 -> 18
        "..hhhhhhhhhhhhhh..",  // 16 -> 18
        "..hhhwheeehwhehh..",  // 16 -> 18
        "..hhhhhwwwwhhhhh..",  // 16 -> 18
        "..hhhhhwwwwhhhhh..",  // 16 -> 18
        "...hhhdhhhhdhhh...",  // 16 -> 18
        "...hhhdhhhdhhhd...",  // 16 -> 18
        "...hhhdhhhdhhhd...",  // 16 -> 18
        "....hhhhhhhhhh....",  // 16 -> 18
        ".......ssss.......",  // 16 -> 18
        "......ssssss......",  // 16 -> 18
        "......ssssss......",  // 16 -> 18
        "......ssssss......",  // 16 -> 18
        ".....pppppppp.....",  // 16 -> 18
        "....pppppppppp....",  // 16 -> 18
        "...pppppppppppp...",  // 16 -> 18
        "...pppppppppppp...",  // 16 -> 18
        "...pppppppppppp...",  // 16 -> 18
        ".....pppppppp.....",  // 16 -> 18
        "................",
        "................",
        "................",
      ];
    }

    if (key === 'wallnut') {
      // Round, compact defensive nut - wider and shorter
      return [
        "................",  // pad top (5 rows)
        "................",
        "................",
        "................",
        "................",
        ".......dddd.......",  // 17 -> 18
        "......dddddd......",  // 17 -> 18
        ".....ddhhhhdd.....",  // 17 -> 18
        "....ddhhhhhhdd....",  // 17 -> 18
        "...dddhheeehddd...",  // 17 -> 18
        "..dddhhhhhhhhddd..",  // 17 -> 18
        "..dddhhhhhhhhddd..",  // 17 -> 18
        ".dddhhhhhhhhhhdd..",  // 17 -> 18
        ".ddhhhhhhhhhhhhdd.",  // 17 -> 18
        ".ddhhhhhhhhhhhhdd.",  // 17 -> 18
        ".ddhhhhhhhhhhhhdd.",  // 17 -> 18
        "..ddhhhhhhhhhhdd..",  // 17 -> 18
        "..ddhhhhhhhhhhdd..",  // 17 -> 18
        "..ddhhhhhhhhhhdd..",  // 17 -> 18
        "...ddhhhhhhhhdd...",  // 17 -> 18
        "....dddddddddd....",  // 17 -> 18
        "....dddddddddd....",  // 17 -> 18
        "....dddddddddd....",  // 17 -> 18
        "................",
        "................",
      ];
    }

    if (key === 'snowpea') {
      // Icy blue-tinted head, frosty appearance with icicle details (shortened by half)
      return [
        "................",  // pad top (13 rows)
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",  // 18 -> 18 (already correct width)
        ".....hhhhhhhh.....",  // 16 -> 18 (head)
        "....hhhhhhhhhh....",  // 16 -> 18
        "...hhheeeehhhh....",  // 16 -> 18
        "...hhhhwwwwhhhh...",  // 16 -> 18
        "...hhhwwwwhhhh....",  // 17 -> 18
        "....hhhwwhhhh.....",  // 17 -> 18
        "......ssssss......",  // 16 -> 18 (short stem)
        ".....pppppppp.....",  // 16 -> 18 (small pot)
        "....pppppppppp....",  // 16 -> 18
        "................",  // pad bottom (3 rows)
        "................",
        "................",
      ];
    }

    // peashooter default - classic shooter with mouth (shortened by half)
    return [
      "................",  // pad top (12 rows)
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",  // 18 -> 18 (already correct width)
      ".....hhhhhhhh.....",  // 16 -> 18 (head)
      "....hhhhhhhhhh....",  // 16 -> 18
      "...hhhe..ehhhh....",  // 16 -> 18
      "...hhhhhhhhhhh....",  // 16 -> 18
      "....hhdhhhdhh.....",  // 16 -> 18
      ".....hhh..hhh.....",  // 16 -> 18
      "......ss..ss......",  // 16 -> 18 (short stem)
      ".....pppppppp.....",  // 16 -> 18 (small pot)
      "....pppppppppp....",  // 16 -> 18
      "................",  // pad bottom (3 rows)
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

    // Scale rows horizontally (each char becomes `scale` chars)
    for (let y = 0; y < height; y++) {
      const row = pattern[y];
      let scaledRow = '';
      for (let x = 0; x < width; x++) {
        const ch = row[x] || '.';
        scaledRow += ch.repeat(scale);
      }
      // Scale rows vertically (repeat each row `scale` times)
      for (let sy = 0; sy < scale; sy++) {
        scaled.push(scaledRow);
      }
    }

    // Calculate target width in pattern characters (targetWidth pixels / pixelSize)
    // pixelSize is 2, so targetWidth pixels = targetWidth/2 pattern units
    // But since we've already scaled horizontally by `scale`, we need targetWidth/2 characters
    const targetWidthChars = targetWidth / 2;
    const emptyRow = '.'.repeat(targetWidthChars);
    
    // Ensure width matches target (pad each row to targetWidthChars)
    const finalRows = scaled.map((row) => row.padEnd(targetWidthChars, '.'));
    
    // Calculate target height in pattern rows (targetHeight pixels / pixelSize)
    const targetHeightRows = targetHeight / 2;
    
    // If scaled pattern is taller than target, truncate from top
    // Otherwise, pad at top to reach target height
    if (finalRows.length >= targetHeightRows) {
      // Take the last targetHeightRows rows (bottom portion)
      return finalRows.slice(-targetHeightRows);
    } else {
      // Pad at top
      const padRows = targetHeightRows - finalRows.length;
      return [
        ...Array(padRows).fill(emptyRow),
        ...finalRows,
      ];
    }
  }
}

