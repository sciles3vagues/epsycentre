// @ts-check
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// Canonical production URL — required for sitemap, canonical links and Open Graph.
// Override per environment with SITE_URL (see .env.example).
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  // Prefetch internal links on hover/focus for instant navigations, zero JS cost until interaction.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [react(), sitemap()],
  // Self-hosted at build time (no runtime request to a third party → faster + GDPR-friendly),
  // with metric-matched fallbacks to minimise layout shift. Weights match the Figma text styles.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
      fallbacks: ['sans-serif'],
    },
  ],
  build: {
    // Inline small stylesheets to avoid render-blocking requests.
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
