# Back office — architecture

The hidden `/backoffice` page lets the clinic edit **L’équipe** (members, photos, booking details) and
**Les groupes** (name, description). Content lives in **Netlify Blobs**, never in git. The public site stays fully
static: it is rebuilt only when an admin clicks **Publier les modifications**.

For the client-facing how-to (in French), see [guide-backoffice.md](guide-backoffice.md).

## Overview

```
Admin browser ─► /backoffice (on-demand)  ─► Astro Actions (session-checked, Zod-validated)
                                                   │
                                                   ▼
                                             Netlify Blobs
                                             ├─ content: draft/{team,groupes}, published/{team,groupes}, meta/published-at
                                             ├─ photos:  <uuid> → image bytes + { contentType }
                                             ├─ auth:    login/<sha256(ip)> → { failures, resetAt }
                                             └─ astro-sessions (Astro Sessions driver, set by the adapter)
                                                   │
« Publier » ─► copy draft/* → published/*, delete unused photos, POST Netlify build hook
                                                   │
Netlify build ─► publishedLoader GET ${URL}/contenu/{equipe,groupes}.json ─► static HTML
Visitors      ─► static pages; photos via /media/<uuid> through the Netlify Image CDN
```

Only these routes run on demand (Netlify Functions): `/backoffice`, `/contenu/[collection].json`,
`/media/[key]` and the actions (`/_actions/admin.*`). Everything else is prerendered.

## Content and storage

- **Schemas** — `src/lib/content-schemas.ts` is the single source of truth: it validates admin input, stored
  entries and the build-time fetch, and types the public components. Text fields are trimmed with length limits;
  booking lines are a phone number, a real email or an `https` link (max 5 per member).
- **Drafts vs published** — **Enregistrer** writes `draft/<collection>` (the whole list, `order` set from the list
  position). **Publier** copies drafts over `published/*`, clears the drafts and records the date. A code deploy
  never publishes unfinished edits, because the build only reads `published/*`. No draft means "same as
  published"; **Annuler les modifications** deletes the drafts.
- **Consistency** — content and photos use Blobs' strong consistency, so the rebuild triggered right after
  publishing reads the new version.
- **Photos** — uploads are checked by magic bytes (JPEG, PNG, WebP; 5 MB max) and stored under a random UUID that
  is never reused, so `/media/<uuid>` is cached forever. On publish, photos referenced by neither the previous nor
  the new published version are deleted (the live site keeps its images until the rebuild is online).
- **Backups** — Blobs has no history. **Exporter** downloads drafts and published content as JSON.

Code: `src/lib/content-store.ts`, `src/lib/photo-store.ts`, `src/lib/rebuild.ts`.

## Public site

- `src/content/published-loader.ts` feeds the `team` and `groupes` collections:
  - **Netlify builds** can't read Blobs (no Blobs context during the build), so the loader fetches the published
    JSON from the live site: `${URL}/contenu/<slug>.json` (`URL` is Netlify's production URL).
  - **Elsewhere** (local dev, CI) it reads Blobs directly; `astro dev` emulates them.
  - There is no placeholder data. If content can't be read, the build logs an error and each section shows
    « … n’est pas disponible pour le moment ». A failed fetch during a production build therefore publishes that
    message rather than keeping the previous version.
- `/contenu/[collection].json` only returns **published** data (already public on the site), `no-store`,
  `noindex`. Drafts are never exposed.
- `team/MemberPhoto.astro` renders `/media/<key>` through the Image CDN, cropped to the card's portrait ratio
  (`fit="cover"`), alt « Photo de {name} »; the placeholder image is used when there is no photo.

## Back office

- **Page** — `src/pages/backoffice.astro` with `layouts/BackofficeLayout.astro`: `noindex, nofollow` (meta and
  `X-Robots-Tag`), `Cache-Control: no-store`, `frame-ancestors 'none'`. Excluded from the sitemap
  (`astro.config.mjs`), the navigation and `llms.txt`; not listed in `robots.txt` (that would advertise it).
  The path is public: the password is the protection.
- **Login** — one shared password in `ADMIN_PASSWORD`, compared in constant time
  (`src/lib/admin-session.ts`). Form action, works without JavaScript, post/redirect/get. Five failures per IP
  in 15 minutes lock the login (`src/lib/login-rate-limit.ts`, IPs stored hashed).
- **Session** — Astro Sessions backed by Blobs. Cookie `epsy_admin`: `HttpOnly`, `SameSite=Strict`, `Secure` in
  production (left to Astro so Safari keeps it on `http://localhost`), 8 h TTL, new id at login. The session holds a
  fingerprint of the password, so changing `ADMIN_PASSWORD` logs everyone out.
- **Actions** — `src/actions/admin/*`; every content action calls `requireAdmin` first (401 otherwise). Astro's
  origin check rejects cross-site posts.

| Action                     | Purpose                                                                          |
| -------------------------- | -------------------------------------------------------------------------------- |
| `login` / `logout`         | Open / destroy the session                                                       |
| `getDrafts`                | Draft (or published) lists, unpublished-changes flag, last publish date          |
| `saveTeam` / `saveGroupes` | Validate and store the whole list as a draft                                     |
| `uploadPhoto`              | Validate and store a photo, return its key                                       |
| `publish`                  | Drafts → published, photo cleanup, build hook; returns whether a rebuild started |
| `discardDrafts`            | Back to the published version                                                    |
| `exportJson`               | Drafts + published as JSON                                                       |

- **Editor** — React island `src/components/admin/AdminApp.tsx` (initial data loaded on the server):
  status and Publier / Annuler / Exporter, then one section per collection with Modifier, Monter, Descendre,
  Supprimer and an add button. Every change is saved immediately as a draft. Confirmations use a native modal
  `<dialog>` (`useConfirm.tsx`); outcomes are announced in a status region; focus moves to the form heading on open
  and back to the entry's « Modifier » button afterwards.

## Environment variables

| Variable                 | Where                   | Purpose                                                                 |
| ------------------------ | ----------------------- | ----------------------------------------------------------------------- |
| `ADMIN_PASSWORD`         | Netlify, `.env` locally | Shared back-office password (optional: login refused when unset)        |
| `NETLIFY_BUILD_HOOK_URL` | Netlify                 | Build hook on `main`, called by **Publier** (unset locally: no rebuild) |
| `SITE_URL`               | Netlify, CI             | Canonical, sitemap and Open Graph URLs                                  |

Both back-office variables are declared as `astro:env` server secrets in `astro.config.mjs`.

## Netlify setup

1. Site connected to the GitHub repo, build command `pnpm build`, Node 26.
2. Environment variables above.
3. Build hook: Site configuration › Build & deploy › Build hooks, branch `main` → `NETLIFY_BUILD_HOOK_URL`.
4. The Free plan allows a single Git contributor on **private** repos: the repo is public during development.
   Before launch, keep it public, upgrade, or deploy from GitHub Actions with the Netlify CLI.
5. Each production deploy costs 15 credits (300/month on the Free plan, site paused when exhausted). Publishing
   batches changes into one deploy; consider the Personal plan once live.

## Local development

- Put `ADMIN_PASSWORD=…` in `.env` (gitignored) and restart `astro dev`; open `http://localhost:4321/backoffice`.
- `astro dev` emulates Blobs in `.netlify/blobs-serve/` (gitignored). Publishing locally works but skips the
  rebuild; restart the dev server to see published content on the home page (loaders run at startup).
- `astro preview` isn't supported by the Netlify adapter: Playwright runs on `astro dev`.

## Trade-offs

- Shared credential: no per-person audit; rotate `ADMIN_PASSWORD` when someone leaves.
- Until the first **Publier** in production, the team and groups sections show the "unavailable" message.
- A failed build-time fetch in production publishes the "unavailable" message instead of failing the build.
- Changes go live 1–2 minutes after **Publier** (Netlify build).
