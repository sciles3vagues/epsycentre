# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor…) working in this repository. `CLAUDE.md` imports this file.

## Project

Epsycentre — French-language marketing/content site. Priorities, in order:

1. **Accessibility** — WCAG 2.2 AA and RGAA 4.1 compliance is a hard requirement, not a nice-to-have.
2. **Performance** — static HTML first, zero JS by default, Core Web Vitals in the green.
3. **SEO & agent discoverability** — semantic HTML, metadata, sitemap, `robots.txt`, `llms.txt`, structured data.

## Stack

- **Astro 7** (static output, Islands Architecture) — Node **26 LTS** (`.nvmrc`), **pnpm** (`packageManager` in `package.json`)
- **TypeScript 6** strict (`astro/tsconfigs/strict` + `noUncheckedIndexedAccess`). TS 7 is not yet supported by typescript-eslint / `astro check`.
- **Tailwind CSS 4** via `@tailwindcss/vite`; tokens in `src/styles/global.css` (`@theme`)
- **React 19** integration installed for future interactive islands — not used yet
- `@astrojs/sitemap`, ESLint 10 (flat config), Prettier 3, Husky + lint-staged + commitlint, Playwright + axe-core

## Commands

```bash
nvm use               # Node 26 LTS from .nvmrc
pnpm dev              # dev server on localhost:4321 (agents: `pnpm astro dev --background`, then `astro dev stop|status|logs`)
pnpm build            # astro check (types) + production build to dist/
pnpm preview          # serve dist/
pnpm check            # type-check .astro/.ts only
pnpm lint             # ESLint (incl. jsx-a11y strict on .astro and .tsx)
pnpm lint:fix
pnpm format           # Prettier (sorts imports + Tailwind classes)
pnpm format:check
pnpm test:e2e         # Playwright: axe WCAG A/AA scan + keyboard/SEO checks on the production build
pnpm validate         # everything CI runs
```

Before declaring work done, run `pnpm lint && pnpm build`; run `pnpm test:e2e` when markup, styles or routes change.

## Structure

```
src/
├── pages/        # file-based routes (.astro); robots.txt.ts and llms.txt.ts are generated endpoints
├── layouts/      # Layout.astro — <html lang>, <head>, skip link, <main id="contenu">
├── components/   # .astro (static) or .tsx (interactive islands only); Seo.astro = all meta tags
├── config/       # site.ts — site name, locale, default description/OG image
├── lib/          # framework-agnostic helpers (cn.ts)
├── styles/       # global.css — Tailwind import, @theme tokens, base a11y styles
└── assets/       # images processed by astro:assets
tests/            # Playwright specs (a11y.spec.ts — add each new route to ROUTES)
public/           # files served as-is (favicons, OG images, fonts)
```

Import from `src` with the `@/` alias (`@/components/Seo.astro`).

## Astro & performance rules

- Default to `.astro` components. They render to HTML with zero client JS.
- Use a React `.tsx` island **only** when state or interactivity is required. Choose the laziest directive that works: `client:visible` > `client:idle` > `client:load`. Use `client:only` only when SSR is impossible.
- For small DOM behaviour (toggle, disclosure), prefer a `<script>` in the `.astro` component over shipping React.
- Images: use `<Image />` / `<Picture />` from `astro:assets` with explicit `width`/`height` and meaningful `alt`. Add `loading="eager"` + `fetchpriority="high"` only on the LCP image.
- Fonts: self-host WOFF2 in `public/fonts/`, `font-display: swap`, preload only the critical one.
- No third-party scripts without discussion (analytics etc. must load after interaction or idle, and be consent-compliant under GDPR/CNIL).
- Prefetch is on (`prefetchAll`, hover). Don't add a client router unless asked.

## Accessibility rules (WCAG 2.2 AA / RGAA 4.1)

- One `<h1>` per page; heading levels never skip (RGAA 9.1).
- Use landmarks: `<header>`, `<nav aria-label="…">`, `<main>` (in Layout), `<footer>`. Keep the skip link as the first focusable element.
- Use native elements first: `<button>` for actions, `<a href>` for navigation. Never put click handlers on `div`/`span`. Never add `tabindex="0"` to elements that are already focusable. Never use a positive `tabindex`.
- Every form field needs a visible `<label>` (or `aria-labelledby`). Errors are announced with `aria-describedby`, plus `aria-live` when they appear dynamically. Required fields are marked in text, not by colour alone.
- Images: informative images get an `alt` that describes their purpose. Decorative images get `alt=""` (and `aria-hidden="true"` on inline SVG). Links and buttons with only an icon need an accessible name.
- Contrast ≥ 4.5:1 for text, ≥ 3:1 for large text and UI components. Never convey information by colour alone.
- Focus is always visible (`:focus-visible` base style). Don't remove outlines without a replacement. Target size ≥ 24×24 px (WCAG 2.5.8).
- Respect `prefers-reduced-motion` (handled globally). Nothing auto-plays or flashes.
- Text resizes to 200% without loss: use `rem`, never fixed heights on text containers.
- Change of language inside a page → `lang` attribute on that element (RGAA 8.7).
- Link text must make sense out of context. Links that open a new window say so.
- Use ARIA only when native HTML can't express the semantics, and follow WAI-ARIA APG patterns.

## SEO & agent-friendliness

- Every page passes `title` and a unique `description` (roughly 150–160 characters) to `Layout`. `Seo.astro` handles canonical, Open Graph and Twitter tags.
- `SITE_URL` env var sets `site` (see `.env.example`). It is required for correct canonical, sitemap and OG URLs in production builds.
- Add JSON-LD structured data (e.g. `MedicalClinic`/`LocalBusiness`, `BreadcrumbList`, `FAQPage`) via `<script type="application/ld+json" slot="head" set:html={JSON.stringify(data)} />`. Only serialise trusted data.
- Keep `src/pages/llms.txt.ts` in sync when adding important pages.
- Use clean, lowercase, French, hyphenated URLs, with no trailing slash (`trailingSlash: 'never'`).
- Write semantic, server-rendered content. Never hide primary content behind client-side JS.

## Design tokens (from Figma)

Source: Figma "Epsycentre" › Desktop (file `Y6gOus25wcsC40TNDZ85UL`, node `7:547`). All tokens live in `src/styles/global.css` — never hardcode hex values or px font sizes.

- **Colors**: `primary-50` (= `texte-clair`), `secondary`, `tertiary`, `mandarine`, `abricot`, `noir`, `fond` → `bg-fond`, `text-noir`, `border-tertiary`…
- **Contrast (pending designer review)**: `secondary`, `mandarine`, `primary-50` on light/orange backgrounds and `tertiary` for small text **fail WCAG AA**. For now, **develop with the designer colors as in Figma** — do NOT use the `*-strong` variants in components (they stay defined in `global.css` for the upcoming decision). Flag new low-contrast combinations in your summary instead of fixing them silently.
- **Fonts**: `font-heading` (Manrope 500/700), `font-sans` (Inter 400/600/700), self-hosted via Astro Fonts API (`astro.config.mjs` → `fonts`, `<Font />` in Layout). Adding a weight = add it to `weights` there.
- **Text styles**: `typo-titre` (48/50 bold), `typo-grand` (36/40 bold), `typo-bouton` (24/28 medium), `typo-nom` (24/26 semibold), `typo-corps` (20/26, body default), `typo-petit` (16/20).
- **Other**: `bg-gradient-tcce` (orange gradient), radii `rounded-card` (30px), `rounded-box` (20px), `rounded-pill` (40px).
- **Logos** (`src/assets/logo/`, `fill="currentColor"` → colour with tokens): `logo-epsycentre.svg` (symbol + brand name, 400×49) and `logo-symbole.svg` (symbol only, 49×49). Import as components: `import Logo from "@/assets/logo/logo-epsycentre.svg"`. Brand colours: `text-mandarine` on light backgrounds, `text-texte-clair` on the hero photo and orange gradient. In a home link: `<a href="/" aria-label="Epsycentre, accueil"><Logo aria-hidden="true" /></a>`; standalone: `<Logo role="img" aria-label="Epsycentre" />`. Favicons in `public/` are generated from the symbol.

## TypeScript & code style

- No `any` (use `unknown` + narrowing). No non-null `!` without a comment explaining why.
- `import type` for type-only imports (enforced). Import order and Tailwind class order are handled by Prettier — don't hand-sort.
- Prefer `interface` for object shapes, literal unions over `enum`, `as const` objects for constants.
- Use named exports for TS modules. Astro components are default-imported by filename.
- Explicit boolean checks in `.ts/.tsx` (`strict-boolean-expressions`): `items.length > 0`, not `items.length`.
- Use early returns and guard clauses. Use `const` by default. Use `===` only.
- Naming: components `PascalCase.astro/.tsx`, other files and folders `kebab-case`, variables/functions `camelCase`, true constants `SCREAMING_SNAKE_CASE`, booleans `isX/hasX/canX`, handlers `handleX`.
- Styling: Tailwind utilities. Use `cn()` from `@/lib/cn` for conditional classes. Use component-scoped `<style>` only when utilities can't express it. Mobile-first.

## React (when islands are introduced)

- Use function components with a typed `Props` interface. `import type { ReactNode } from 'react'`.
- Follow the hooks rules (enforced). Prefer derived state over `useEffect` + `setState`. Clean up effects.
- Use stable keys, never array indexes (enforced).
- Keep island props serialisable and minimal. Pass data, not functions, from `.astro` to islands.
- Don't add a state or data library (Zustand, TanStack Query…) until there's a concrete need.

## Git

- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`…) are enforced by commitlint on `commit-msg`.
- The pre-commit hook runs ESLint + Prettier on staged files. Never bypass hooks with `--no-verify`.

## Docs

- Astro: https://docs.astro.build — routing, components, framework components, styling, images, content collections, i18n
- RGAA 4.1: https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
- WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/patterns/
- Tailwind CSS 4: https://tailwindcss.com/docs
