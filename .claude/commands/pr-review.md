---
description: Review a PR or files against Epsycentre rules (a11y, perf, SEO, TS, Astro). Posts to GitHub only after confirmation, or automatically with --ci.
argument-hint: <PR number | file paths> [--ci]
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh api:*), Bash(gh pr comment:*), Bash(git diff:*), Bash(git log:*), Read, Grep, Glob
---

# Epsycentre code review

Target: $ARGUMENTS

- **PR number** (`12`, `#12`): fetch with `gh pr view <n> --json title,body,author,baseRefName,headRefName,additions,deletions,files,commits` and `gh pr diff <n>`.
- **`--ci` flag**: non-interactive. Post the review directly (GitHub Actions, `GITHUB_TOKEN`).
- **File paths**: review those files and print the report only. Never post.
- **Nothing given**: review `git diff main...HEAD` plus uncommitted changes, and print only.

Review the changed lines in `src/**`, `tests/**`, the config files and `public/**`, using the rules in `AGENTS.md` as the source of truth. Read the surrounding code before flagging anything. Only report real, verifiable problems, each with a concrete fix.

## Checklist (by priority)

1. **Accessibility — WCAG 2.2 AA / RGAA 4.1** (blocking)
   - semantic elements and landmarks; one `h1`; heading order
   - native `button`/`a`; no click handlers on non-interactive elements; no `tabindex` > 0 and no redundant `tabindex="0"`
   - accessible names (labels, `alt`, icon-only controls); form errors linked via `aria-describedby`
   - contrast, focus visibility, target size ≥ 24px, reduced motion, information not conveyed by colour alone
   - `lang` on language changes; link purpose clear; ARIA used correctly (APG patterns)
2. **Security** — `set:html` / `dangerouslySetInnerHTML` only with trusted data; no secrets; env vars through `import.meta.env`; `rel="noopener"` on `target="_blank"`
3. **Bugs / types** — no `any`, no unchecked index access, no floating promises, explicit boolean checks
4. **Performance** — `.astro` by default; island directive as lazy as possible; `astro:assets` images with dimensions; no render-blocking third parties; no unnecessary client JS
5. **SEO / agents** — unique `title` and `description`, canonical, JSON-LD validity, new route added to `llms.txt.ts` and to `tests/a11y.spec.ts` `ROUTES`
6. **Conventions** — naming, `@/` imports, `cn()`, Tailwind-first, file placement

## Output

Print a report grouped by severity — **Critical** (a11y blockers, security, breaking bugs), **Major**, **Minor**, **Suggestion**. Each item gives `path:line`, the issue, a fix (code), and why it matters (cite the WCAG/RGAA criterion when relevant). End with a verdict: Approve / Needs changes / Blocked.

## Posting (PR mode)

Interactive: show the full report and ask "Post these N comments?". Accept "yes", "no", or "except 2, 5". In `--ci` mode, post without asking.

```bash
gh api repos/{owner}/{repo}/pulls/{n}/reviews --method POST \
  -f event=COMMENT -f body="<summary>" \
  -f 'comments[][path]=src/x.astro' -F 'comments[][line]=10' -f 'comments[][body]=<comment>'
```

Comments may only reference lines that are part of the diff.
