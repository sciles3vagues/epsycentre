// @ts-check
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField, fontProviders } from 'astro/config';

// Required for sitemap, canonical and Open Graph URLs (see .env.example).
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Edge Functions aren't used; their local emulation needs a matching Deno install.
  adapter: netlify({ devFeatures: { edgeFunctions: false, images: true, environmentVariables: false } }),
  integrations: [
    react(),
    // The back office must never be advertised.
    sitemap({ filter: page => !new URL(page).pathname.startsWith('/backoffice') }),
  ],
  env: {
    schema: {
      // Shared back-office password (Netlify env var, `.env` locally). Optional so builds work without it;
      // login is refused when unset.
      ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  // Back-office session (Netlify Blobs driver, set by the adapter).
  session: {
    cookie: { name: 'epsy_admin', sameSite: 'strict', secure: true },
    ttl: 8 * 60 * 60,
  },
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
