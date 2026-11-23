import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Add every public route here (or generate the list from the sitemap as the site grows).
const ROUTES = ['/'];

// WCAG 2.0/2.1/2.2 A + AA — the baseline RGAA 4.1 maps to.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// TODO: re-enable once the designer settles the brand colour contrast (see the *-strong tokens in global.css).
const DISABLED_RULES = ['color-contrast'];

for (const route of ROUTES) {
  test.describe(`page ${route}`, () => {
    test('has no detectable WCAG A/AA violations', async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).disableRules(DISABLED_RULES).analyze();
      expect(results.violations).toEqual([]);
    });

    test('has lang, title, a single h1 and a working skip link', async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('lang', /^fr/);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('h1')).toHaveCount(1);

      await page.keyboard.press('Tab');
      const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' });
      await expect(skipLink).toBeFocused();
      await skipLink.press('Enter');
      await expect(page.locator('main')).toBeFocused();
    });

    test('exposes SEO metadata', async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//);
    });
  });
}
