// @ts-check
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// Required for sitemap, canonical and Open Graph URLs (see .env.example).
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Edge Functions aren't used; their local emulation needs a matching Deno install.
  adapter: netlify({ devFeatures: { edgeFunctions: false, images: true, environmentVariables: false } }),
  integrations: [react(), sitemap()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      // Variable font so font-weight can animate (nav hover).
      weights: ['400 700'],
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
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
