import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';

const mediaDir = path.join(process.cwd(), 'docs', 'media');

const onePixelJpeg = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGf/9k=',
  'base64',
);

async function openSignedOut(page: Page, route: string) {
  await page.goto(route);
}

test.describe('English web', () => {
  test.use({
    locale: 'en-CA',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });

  test('sign-in shows the brand, the code path, and the trust lines', async ({ page }) => {
    await openSignedOut(page, '/sign-in');
    await expect(page.getByTestId('auth-brand')).toBeVisible();
    await expect(page.getByText('Your home upgrade plan and rebates, in one place')).toBeVisible();
    await expect(page.getByTestId('auth-or-divider')).toBeVisible();
    await expect(page.getByTestId('auth-email')).toBeVisible();
    await expect(page.getByTestId('auth-trust')).toContainText('No password: we send you a code');
    await expect(page.getByTestId('auth-trust')).toContainText('Your data is never sold');
    await expect(page.getByTestId('auth-trust')).toContainText('No hidden commissions');
    await page.screenshot({ path: path.join(mediaDir, 'auth-sign-in-en.png') });
    await page.getByTestId('auth-email').fill('ada@example.com');
    await page.getByRole('button', { name: 'Email me a code' }).click();
    await expect(page.getByText('A connection is required to continue.')).toBeVisible();
  });

  test('the OTP screen accepts six digits without a backend', async ({ page }) => {
    await openSignedOut(page, '/verify?email=ada@example.com');
    await expect(page.getByText('ada@example.com')).toBeVisible();
    await expect(page.getByTestId('auth-otp-5')).toBeVisible();
    await page.screenshot({ path: path.join(mediaDir, 'auth-otp-en.png') });
    await page.getByTestId('auth-otp-0').fill('123456');
    await expect(page.getByText('A connection is required to continue.')).toBeVisible();
    await expect(page.getByTestId('auth-change-email')).toBeVisible();
  });

  test('the welcome screen shows the bilingual start', async ({ page }) => {
    await openSignedOut(page, '/');
    await expect(page.getByText('Describe your home')).toBeVisible();
    await page.screenshot({ path: path.join(mediaDir, 'auth-welcome-en.png') });
  });

  test('the province picker suggests Nova Scotia from a postal code', async ({ page }) => {
    await openSignedOut(page, '/e2e');
    await expect(page.getByTestId('e2e-harness')).toBeVisible();
    const postal = page.getByTestId('profile-postal-code');
    await postal.fill('b3h');
    await expect(postal).toHaveValue('B3H');
    await expect(page.getByTestId('profile-first-name')).toHaveValue('');
    await postal.fill('BB3');
    await expect(postal).toHaveValue('B3');
    await postal.fill('B3H');
    await expect(page.getByTestId('profile-province')).toContainText('Nova Scotia');
    await expect(page.getByTestId('profile-coverage-badge')).toHaveText('Fully covered');
    await expect(page.getByTestId('profile-utility-note')).toHaveCount(0);
    await expect(page.getByTestId('profile-waitlist')).toHaveCount(0);
    await page.screenshot({ path: path.join(mediaDir, 'auth-province-en.png') });
    await page.getByTestId('profile-province').click();
    await page.getByTestId('profile-province-search').fill('Ontario');
    await page.getByTestId('profile-province-ON').click();
    await expect(page.getByTestId('profile-coverage-badge')).toHaveText('Federal programs only');
    await expect(page.getByTestId('profile-waitlist')).toBeVisible();
    await expect(page.getByTestId('profile-utility-note')).toBeVisible();
  });

  test('a photo file chosen from the shutter becomes the preview', async ({ page }) => {
    await openSignedOut(page, '/e2e-photo');
    const shutter = page.getByTestId('photo-shutter');
    await shutter.scrollIntoViewIfNeeded();
    const chooser = page.waitForEvent('filechooser');
    await shutter.click();
    await (
      await chooser
    ).setFiles({
      name: 'window.jpg',
      mimeType: 'image/jpeg',
      buffer: onePixelJpeg,
    });
    await expect(page.getByTestId('photo-preview')).toBeVisible();
  });
});

test.describe('French web', () => {
  test.use({
    locale: 'fr-CA',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });

  test('sign-in and the province picker use French copy', async ({ page }) => {
    await openSignedOut(page, '/sign-in');
    await expect(
      page.getByText('Votre plan de rénovation et vos subventions, au même endroit'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuer avec Google' })).toBeVisible();
    await page.screenshot({ path: path.join(mediaDir, 'auth-sign-in-fr.png') });
    await page.goto('/');
    await expect(page.getByText('Décrivez votre maison')).toBeVisible();
    await page.screenshot({ path: path.join(mediaDir, 'auth-welcome-fr.png') });
    await page.goto('/e2e');
    const postal = page.getByTestId('profile-postal-code');
    await postal.fill('b3h');
    await expect(postal).toHaveValue('B3H');
    await expect(page.getByTestId('profile-first-name')).toHaveValue('');
    await expect(page.getByTestId('profile-coverage-badge')).toHaveText('Entièrement couvert');
    await expect(page.getByTestId('profile-utility-note')).toHaveCount(0);
    await expect(page.getByTestId('profile-waitlist')).toHaveCount(0);
    await page.screenshot({ path: path.join(mediaDir, 'auth-province-fr.png') });
  });

  test('the OTP screen and the shutter use French copy', async ({ page }) => {
    await openSignedOut(page, '/verify?email=ada@example.com');
    await expect(page.getByText('Code à 6 chiffres')).toBeVisible();
    await page.screenshot({ path: path.join(mediaDir, 'auth-otp-fr.png') });
    await page.goto('/e2e-photo');
    await expect(page.getByTestId('photo-shutter')).toContainText('Déclencher');
  });
});
