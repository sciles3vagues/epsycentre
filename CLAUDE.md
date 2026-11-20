# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- Start the dev server in the background (`pnpm astro dev --background`), or use the `dev` entry in `.claude/launch.json` for the preview pane. Stop it when you're done (`pnpm astro dev stop`).
- Verify UI changes in the browser preview at mobile (375px) and desktop widths. Check keyboard navigation (Tab / Shift+Tab / Enter / Escape) and that focus stays visible.
- Project commands:
  - `/pr-review <PR# | files> [--ci]` — review against this project's rules (posts to GitHub only after confirmation)
  - `/a11y-audit [route | file]` — WCAG 2.2 AA / RGAA 4.1 audit of a page or component
- Content and UI copy are in **French**. Code, comments, commits and docs are in English.
- Don't add dependencies without saying why. Check that they support Astro 7 / ESLint 10 / TS 6 first.
