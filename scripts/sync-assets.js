#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dest = join(root, 'public', 'assets');
if (existsSync(join(root, 'assets'))) {
  mkdirSync(dest, { recursive: true });
  cpSync(join(root, 'assets'), dest, { recursive: true });
  console.log('Synced assets to public/assets');
}
