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
pnpm check            # type-check .astro/.ts only
pnpm lint             # ESLint (incl. jsx-a11y strict on .astro and .tsx)
pnpm lint:fix
pnpm format           # Prettier (sorts imports + Tailwind classes)
pnpm format:check
pnpm test:e2e         # Playwright: axe WCAG A/AA scan + keyboard/SEO + header checks on the dev server (the Netlify adapter has no `astro preview`)
pnpm validate         # everything CI runs
```

Before declaring work done, run `pnpm lint && pnpm build`; run `pnpm test:e2e` when markup, styles or routes change.

## Structure

```
src/
├── pages/        # file-based routes (.astro); robots.txt.ts and llms.txt.ts are generated endpoints
├── layouts/      # Layout.astro — <html lang>, <head>, skip link, <main id="contenu">
├── components/   # .astro (static) or .tsx (interactive islands only); Seo.astro = all meta tags
├── config/       # site.ts (name, locale, booking URL…), navigation.ts (nav links), breakpoints.ts (media queries shared with scripts)
├── lib/          # framework-agnostic helpers (cn.ts, dom.ts, on-scroll-frame.ts)
├── scripts/      # client-side behaviour as TS modules (dialog.ts, header/*) — imported by a one-line <script> in components
├── styles/       # global.css — Tailwind import, @theme tokens, base a11y styles
└── assets/       # images processed by astro:assets
tests/            # Playwright specs (a11y.spec.ts — add each new route to ROUTES; header.spec.ts)
public/           # files served as-is (favicons, OG images, fonts)
```

Import from `src` with the `@/` alias (`@/components/Seo.astro`).

## Astro & performance rules

- Default to `.astro` components. They render to HTML with zero client JS.
- Use a React `.tsx` island **only** when state or interactivity is required. Choose the laziest directive that works: `client:visible` > `client:idle` > `client:load`. Use `client:only` only when SSR is impossible.
- For small DOM behaviour (toggle, disclosure), prefer a TS module in `src/scripts/` (loaded by a `<script>` in the component) over shipping React.
- Images: use `<Image />` / `<Picture />` from `astro:assets` with explicit `width`/`height` and meaningful `alt`. Add `loading="eager"` + `fetchpriority="high"` only on the LCP image.
- Fonts: self-hosted through the Astro Fonts API (`astro.config.mjs` → `fonts`), `font-display: swap`, preload only the critical weights.
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
- **Contrast (pending designer review)**: `secondary`, `mandarine`, `primary-50` on light/orange backgrounds and `tertiary` for small text **fail WCAG AA**. For now, **develop with the designer colors as in Figma** — do NOT use the `*-strong` variants in components (they stay defined in `global.css` for the upcoming decision). Flag new low-contrast combinations in your summary instead of fixing them silently. The axe `color-contrast` rule is disabled in `tests/a11y.spec.ts` until then — re-enable it with the fix.
- **Note**: axe (tests and DevTools) and Lighthouse cannot measure contrast on gradient/image backgrounds — check those combinations manually.
- **Fonts**: `font-heading` (Manrope, variable 400–700), `font-sans` (Inter 400/600/700), self-hosted via Astro Fonts API (`astro.config.mjs` → `fonts`, `<Font />` in Layout). Adding a weight = add it to `weights` there.
- **Text styles**: `typo-titre` (48/50 bold), `typo-grand` (36/40 bold), `typo-bouton` (24/28 medium), `typo-nom` (24/26 semibold), `typo-corps` (20/26, body default), `typo-petit` (16/20). Mobile (< md): `text-titre-mobile` (34/36, section titles), `text-hero-mobile` (24/28), `text-corps-mobile` (18/20), `text-bouton-mobile` (16/16).
- **Other**: `bg-gradient-tcce` (orange gradient), radii `rounded-card` (30px), `rounded-box` (20px), `rounded-pill` (40px).

## Components

- `src/components/ui/` holds the reusable building blocks (CTA, section, sheet/dialog, icon button…) — **check there before creating a component** (props are typed in each component's `Props`). Page sections go in `src/components/sections/`. Logos are in `src/assets/logo/` (`currentColor`, coloured with tokens).
- **Rules**: markup only in `.astro`; behaviour in `src/scripts/*.ts` (one responsibility per file), loaded by a one-line `<script>` import. Tailwind first; CSS Modules (`Component.module.css`) only for what utilities can't express — no `<style>` blocks. Keep components DRY/KISS/SRP.
- **Section invariants**: every full-width block (sections, hero, footer, page wrappers) declares its background with `data-section-bg="white|fond|gradient"` (`ui/Section.astro` sets it), and section `id`s match the nav hrefs in `src/config/navigation.ts`. The fixed header copies that background and picks its text tone from it (peach on gradient, mandarine otherwise) — a missing attribute breaks it silently.
- **Scroll reveal**: add `data-reveal="fade|pop|wipe"` (optional `style="--reveal-delay: 200ms"` to stagger) and import `initReveal` from `src/scripts/reveal.ts` in the component. Content stays visible without JS and with reduced motion (CSS in `global.css`).
- **Pinned scroll screens** (Les TCCE): `data-scroll-steps` on the section + `data-step` per screen (`tcce/TcceScreen.astro`), driven by `src/scripts/scroll-steps.ts`. The section starts one viewport early behind the previous section (which needs `relative z-10`) for the curtain entrance. It falls back to normal flow with reduced motion, short viewports, or any screen taller than the viewport. Each screen gets half a viewport of scroll (`STEP_SCROLL`).
- **Team & groupes** (L’équipe, Les groupes): `team` and `groupes` content collections (schemas in `src/lib/content-schemas.ts`). Real content is published from the back office into Netlify Blobs and never committed; `src/content/published-loader.ts` fetches it from the live site (`/contenu/{equipe,groupes}.json`) on Netlify builds and uses the fake data in `src/content/fixtures/` everywhere else. Team cards in `team/MemberCard.astro`, details in `team/MemberModal.astro` (`ui/Modal.astro`); groups in `groupes/GroupPill.astro`.
- **Modals**: reuse `ui/Sheet.astro` + `src/scripts/dialog.ts` (including for the booking modal). Page scroll lock while a modal is open is global (`global.css`).

## TypeScript & code style

- No `any` (use `unknown` + narrowing). No non-null `!` without a comment explaining why.
- `import type` for type-only imports (enforced). Import order and Tailwind class order are handled by Prettier — don't hand-sort.
- Prefer `interface` for object shapes, literal unions over `enum`, `as const` objects for constants.
- Use named exports for TS modules. Astro components are default-imported by filename.
- Explicit boolean checks in `.ts/.tsx` (`strict-boolean-expressions`): `items.length > 0`, not `items.length`.
- Use early returns and guard clauses. Use `const` by default. Use `===` only.
- Naming: components `PascalCase.astro/.tsx`, other files and folders `kebab-case`, variables/functions `camelCase`, true constants `SCREAMING_SNAKE_CASE`, booleans `isX/hasX/canX`, handlers `handleX`.
- Styling: Tailwind utilities. Use `cn()` from `@/lib/cn` for conditional classes. Mobile-first.
- Comments: only when they explain something the code can't (a constraint, a workaround, a pending decision). No comments restating props or obvious code.

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
