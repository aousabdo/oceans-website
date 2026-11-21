// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

const theme = process.env.PUBLIC_THEME ?? 'mariner';

// /2026 (OCEANS, 2026 year in review) stays out of the sitemap until Danny's
// note is approved. See src/lib/year2026.ts.
const year2026 = JSON.parse(
  readFileSync(new URL('./src/data/year-2026.json', import.meta.url), 'utf8'),
);
const isUnreleased = (page) =>
  !year2026.noteApproved && /^\/2026\/?$/.test(new URL(page).pathname);

// https://astro.build/config
export default defineConfig({
  site: 'https://www.oceansllc.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.PUBLIC_THEME': JSON.stringify(theme),
    },
  },
  integrations: [mdx(), sitemap({ filter: (page) => !isUnreleased(page) })],
});
