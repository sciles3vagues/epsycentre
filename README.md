# Epsycentre

Static Astro site — fast, accessible (WCAG 2.2 AA / RGAA 4.1), SEO and AI-agent friendly.

## Requirements

- Node **26 LTS** (`nvm use` reads `.nvmrc`)
- pnpm (version pinned in `package.json` → `packageManager`)

## Getting started

```bash
nvm use
pnpm install
cp .env.example .env   # set SITE_URL
pnpm dev               # http://localhost:4321
```

## Scripts

| Command         | Action                                                   |
| --------------- | -------------------------------------------------------- |
| `pnpm dev`      | Dev server                                               |
| `pnpm build`    | Type-check (`astro check`) + production build to `dist/` |
| `pnpm preview`  | Serve the production build                               |
| `pnpm lint`     | ESLint (TypeScript, Astro, React, jsx-a11y strict)       |
| `pnpm format`   | Prettier (imports + Tailwind classes sorted)             |
| `pnpm test:e2e` | Playwright + axe accessibility/SEO checks                |
| `pnpm validate` | Everything CI runs                                       |

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (enforced by commitlint). Staged files are linted and formatted on commit.

See [AGENTS.md](AGENTS.md) for architecture, conventions and accessibility rules.
