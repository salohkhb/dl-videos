// Usage: node render.mjs <outDir> [fps] [t1,t2,...]
// With a time list, writes stills only; otherwise renders every frame.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(process.argv[2] || 'frames');
const fps = +(process.argv[3] || 30);
const stills = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + resolve('index.html'));
await page.evaluate(() => document.fonts.ready);
const total = await page.evaluate(() => TOTAL);

const times = stills ?? Array.from({ length: Math.round(total * fps) }, (_, i) => i / fps);
for (let i = 0; i < times.length; i++) {
  await page.evaluate(t => window.render(t), times[i]);
  const name = stills ? `still_${times[i].toFixed(2)}.png` : `f${String(i).padStart(5, '0')}.png`;
  await page.screenshot({ path: `${out}/${name}` });
  if (!stills && i % 150 === 0) console.log(`${i}/${times.length}`);
}
await browser.close();
