import { expect, test } from '@playwright/test';

const isDesktop = (width: number): boolean => width >= 1280;

test.describe('header', () => {
  test('exposes a single banner with a labelled main navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('banner').getByRole('link', { name: 'Epsycentre, accueil' })).toBeVisible();
  });

  test('desktop: navigation links are visible', async ({ page, viewport }) => {
    test.skip(!isDesktop(viewport?.width ?? 0), 'desktop only');
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navigation principale' });
    await expect(nav.getByRole('link')).toHaveCount(6);
    await expect(nav.getByRole('link', { name: 'Les TCCE' })).toHaveAccessibleName('Les TCCE');
    await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toBeHidden();
  });

  test('mobile: menu dialog is keyboard and screen-reader friendly', async ({ page, viewport }) => {
    test.skip(isDesktop(viewport?.width ?? 0), 'mobile only');
    await page.goto('/');

    const burger = page.getByRole('button', { name: 'Ouvrir le menu' });
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(dialog).toBeHidden();

    await burger.click();
    await expect(dialog).toBeVisible();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: 'Fermer le menu' })).toBeFocused();
    await expect(dialog.getByRole('link')).toHaveCount(7); // logo + 6 sections
    await expect(dialog.getByRole('link', { name: 'Les membres de l’équipe' })).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(burger).toBeFocused();
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');

    await burger.click();
    await page.getByRole('button', { name: 'Fermer le menu' }).click();
    await expect(dialog).toBeHidden();
  });
});
