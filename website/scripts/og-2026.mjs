#!/usr/bin/env node
/**
 * Render public/og-2026.png (1200 × 630), the share card for /2026.
 *
 * Same family as the brand pack's og-images (og-team, og-apps): night navy,
 * brass [~] top left, mono eyebrow, Cormorant headline, mono footer rule.
 * The sea on the right is the real holiday card: this script lifts the
 * card's server-rendered SVG out of the built page, so the OG image and
 * the page can't drift apart.
 *
 *     npm run build && node scripts/og-2026.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const built = readFileSync(`${root}dist/2026/index.html`, "utf8");
const svg = built.match(/<svg class="hc-art"[\s\S]*?<\/svg>/)?.[0];
if (!svg) throw new Error("Card SVG not found in dist/2026/index.html. Run `npm run build` first.");

// Exact mark paths from Logo.astro, via src/lib/mark.ts.
const mark = readFileSync(`${root}src/lib/mark.ts`, "utf8");
const path = (k) => mark.match(new RegExp(`${k}: "([^"]+)"`))[1];
const D_LEFT = path("D_LEFT");
const D_RIGHT = path("D_RIGHT");
const D_WAVE = path("D_WAVE");

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #050F1E; font-family: "Cormorant Garamond", Georgia, serif; }
  .bg { position: absolute; inset: 0; background:
      radial-gradient(60% 70% at 100% 100%, rgba(212,162,74,0.10), transparent 70%),
      linear-gradient(160deg, #071A31 0%, #04101F 100%); }
  .sea { position: absolute; top: 0; right: 0; width: 504px; height: 630px;
      -webkit-mask-image: linear-gradient(90deg, transparent 0, rgba(0,0,0,.35) 18%, #000 46%); mask-image: linear-gradient(90deg, transparent 0, rgba(0,0,0,.35) 18%, #000 46%); }
  .sea svg { width: 100%; height: 100%; display: block; }
  /* The card's finished frame (its scoped CSS doesn't travel with the SVG). */
  .m-br { opacity: 0; }
  .m-horizon { transform-box: fill-box; transform-origin: 50% 50%; transform: scaleY(0.32); }
  .mark { position: absolute; left: 80px; top: 72px; width: 72px; height: 45px; }
  .site { position: absolute; right: 80px; top: 84px; font: 500 14px "IBM Plex Mono", monospace; letter-spacing: .32em; color: #D4A24A; z-index: 2; }
  .copy { position: absolute; left: 80px; top: 150px; width: 640px; }
  .eyebrow { font: 500 14px "IBM Plex Mono", monospace; letter-spacing: .32em; text-transform: uppercase; color: #D4A24A; }
  h1 { margin-top: 18px; font-weight: 300; font-size: 100px; line-height: .92; color: #F1EDE2; letter-spacing: -.005em; }
  h1 em { color: #7FB8E0; }
  .sub { margin-top: 26px; width: 600px; text-wrap: balance; font-style: italic; font-size: 26px; line-height: 1.3; color: #D4A24A; }
  .foot { position: absolute; left: 80px; right: 80px; bottom: 76px; border-top: 1px solid rgba(235,227,208,.16); padding-top: 26px;
      display: flex; align-items: baseline; gap: 22px; }
  .word { font-weight: 600; font-size: 22px; letter-spacing: .16em; color: #F1EDE2; }
  .word span { color: #8A93A0; font-weight: 400; }
  .meta { font: 400 13px "IBM Plex Mono", monospace; letter-spacing: .26em; color: #B08A45; }
</style></head><body>
  <div class="bg"></div>
  <div class="sea">${svg}</div>
  <svg class="mark" viewBox="0 0 96 60" fill="none" stroke="#D4A24A" stroke-width="4">
    <path d="${D_LEFT}" stroke-linejoin="miter" stroke-linecap="square"/>
    <path d="${D_RIGHT}" stroke-linejoin="miter" stroke-linecap="square"/>
    <path d="${D_WAVE}" stroke-linecap="round"/>
  </svg>
  <div class="site">OCEANSLLC.COM/2026</div>
  <div class="copy">
    <p class="eyebrow">Year in review</p>
    <h1>OCEANS,<br><em>2026.</em></h1>
    <p class="sub">Five moments from our fourteenth year, and a card from all of us.</p>
  </div>
  <div class="foot"><span class="word">OCEANS <span>LLC</span></span><span class="meta">SDVOSB · JACKSONVILLE FL · EST. 2012</span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${root}public/og-2026.png` });
await browser.close();
console.log("wrote public/og-2026.png");
