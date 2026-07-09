// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const theme = process.env.PUBLIC_THEME ?? 'mariner';

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
  integrations: [mdx(), sitemap()],
});
