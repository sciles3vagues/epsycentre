# Back office

`/backoffice` lets the clinic edit **L’équipe** (team members) and **Les groupes**. Content lives in Netlify Blobs,
never in git. The site is rebuilt only when an admin clicks **Publier**. Client how-to (French):
[guide-backoffice.md](guide-backoffice.md).

## Flow

```
Admin ─► /backoffice ─► Astro Actions (requireAdmin, Zod) ─► Netlify Blobs
  Enregistrer  → draft/<collection>
  Publier      → published/<collection>, delete unused photos, POST build hook
Netlify build ─► published-loader reads published/<collection> from Blobs ─► static HTML
```

Only `/backoffice`, `/contenu/[collection].json`, `/media/[key]` and `/_actions/admin.*` run on demand. Everything
else is prerendered.

## Where things are

- `src/lib/content-schemas.ts`: the single source of truth for entries (admin input, stored data, build fetch).
- `src/lib/content-store.ts`: draft / published reads and writes, publish, discard.
- `src/lib/photo-store.ts`: photo upload (JPEG, PNG, WebP, 5 MB, magic bytes checked), served at `/media/<uuid>`.
- `src/lib/rebuild.ts`: Netlify build hook.
- `src/actions/admin/*`: every action calls `requireAdmin` first.
- `src/components/admin/AdminApp.tsx`: the React editor, the only island in the back office.
- `src/content/published-loader.ts`: feeds the `team` and `groupes` collections on the public site.
- `src/pages/backoffice.astro`: `noindex`, excluded from the sitemap, navigation and `llms.txt`.

## Rules to keep

- Drafts and published are separate. The build reads only published content, so a code deploy never publishes
  unfinished edits. No draft means "same as published".
- Team members need a name, a job title, the three description texts (`publics`, `problematiques`, `modalites`)
  and at most 5 booking lines (phone, https link or email). `description` is optional.
- Entry ids are kebab-case and unique; the server sets `order` from the list position.
- Photos get a random UUID that is never reused, so `/media/<uuid>` is cached forever. A member without a photo
  shows an empty block, not a placeholder image.
- No placeholder content. If published content can't be read, the build logs an error and the section shows its
  "unavailable" message.

## Public loader

- **Netlify builds** read the published entries straight from Blobs. Fetching the site's own URL fails when Netlify
  site protection is on (401).
- **Local dev** fetches from `PUBLISHED_SITE_URL` when it is set; otherwise it reads Blobs, which `astro dev`
  emulates in `.netlify/blobs-serve/` (gitignored).

## Environment variables

| Variable                 | Where                   | Purpose                                                                     |
| ------------------------ | ----------------------- | --------------------------------------------------------------------------- |
| `ADMIN_PASSWORD`         | Netlify, `.env` locally | Shared back-office password. Login is refused when unset.                   |
| `NETLIFY_BUILD_HOOK_URL` | Netlify                 | Build hook on `main`, called by **Publier**. Unset locally: no rebuild.     |
| `NETLIFY_BLOBS_TOKEN`    | Netlify (Builds scope)  | Personal access token: lets the build read Blobs (it has no Blobs context). |
| `SITE_URL`               | Netlify, CI             | Canonical, sitemap and Open Graph URLs.                                     |
| `PUBLISHED_SITE_URL`     | `.env` locally          | Live site whose published content local dev fetches.                        |

The first two are `astro:env` server secrets, declared in `astro.config.mjs`.

## Local development

- Set `ADMIN_PASSWORD` and, to see real content, `PUBLISHED_SITE_URL` in `.env`, then restart `astro dev`. Loaders
  run at startup, so restart after every publish to see it on the home page.
- Open `http://localhost:4321/backoffice`. Publishing locally skips the rebuild.
- Playwright runs on `astro dev`: `astro preview` is not supported by the Netlify adapter.

## Known trade-offs

- One shared password: no per-person audit. Rotate `ADMIN_PASSWORD` when someone leaves.
- Blobs keeps no history. **Exporter** downloads a JSON backup.
- A failed build-time fetch publishes the "unavailable" message rather than failing the build.
- Changes go live 1–2 minutes after **Publier** (Netlify build).
