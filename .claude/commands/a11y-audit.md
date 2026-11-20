---
description: WCAG 2.2 AA / RGAA 4.1 accessibility audit of a route or component (static review + axe run).
argument-hint: [route like /contact | file path] (default: all routes)
---

# Accessibility audit

Target: $ARGUMENTS (if empty: every route in `src/pages`)

1. **Static review.** Read the target's `.astro`/`.tsx` sources and the components they use. Check them against the "Accessibility rules" section of `AGENTS.md`. Map each finding to its RGAA 4.1 criterion (e.g. RGAA 1.2, 3.2, 9.1, 10.7, 11.1, 12.7) and its WCAG 2.2 success criterion.
2. **Automated scan.** Make sure the route is listed in `tests/a11y.spec.ts` `ROUTES`, then run `pnpm test:e2e -- --grep "<route>"`. Report any axe violations with the node selector.
3. **Manual checks** in the browser preview (axe can't do these):
   - keyboard only: tab order is logical, focus is visible everywhere, no traps, Escape closes overlays, focus returns to the trigger
   - zoom to 200% and a 320px viewport: no loss of content, no horizontal scroll (WCAG 1.4.10)
   - text spacing override (WCAG 1.4.12)
   - accessible names in the accessibility tree match the visible labels (WCAG 2.5.3)
   - reduced motion respected
4. **Report.** Show a table of criterion | status (conforme / non conforme / non applicable) | evidence (`path:line` or selector) | fix. Fix the issues only if the user asks.

Remember: automated tools catch roughly 30–40% of issues. The manual steps are not optional.
