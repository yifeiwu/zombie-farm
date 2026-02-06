# Zombie Farm

A reverse **Plants vs Zombies** — you command the zombie horde.

Plants defend their house with peashooters, snow peas, sunflowers, and wall-nuts. Your job is to pick the right zombies, deploy them strategically, and overwhelm the garden's defenses before reinforcements arrive.

## Zombie Types

| Zombie | Cost | Description |
|--------|------|-------------|
| **Green** | 50 | Basic zombie. Slow but steady. |
| **Runner** | 50 | Fast zombie. Fragile but quick. |
| **Brute** | 150 | Tanky zombie. Absorbs punishment. |
| **Spitter** | 100 | Ranged zombie. Attacks from a distance. |
| **Jumper** | 125 | Leaps to the nearest plant. Bypasses the front line. |

## Stages

1. **The Garden Patch** — A small garden with light defenses (8 waves)
2. **The Backyard** — More plant types and tighter wave timing (12 waves)
3. **The Fortress** — Full arsenal. Sunbeams, walls, and relentless waves (15 waves)

## How to Play

- Earn **brains** passively and by destroying plants
- Select a zombie type from the panel and click a row to deploy
- Destroy the house before the plants overwhelm your horde
- Plants get reinforcements each wave — act fast

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Built with [Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/).

