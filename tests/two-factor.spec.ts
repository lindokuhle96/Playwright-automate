
import { test, expect, type Page } from '@playwright/test';

const username = 'tomsmith';
const password = 'SuperSecretPassword!';

// Reusable helper to complete the first login step
async function enterValidCredentials(page: Page): Promise<void> {
  await page.goto('/two_factor');

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Next' }).click();
}

// Reusable helper to read the OTP displayed on the page
async function getOneTimeCode(page: Page): Promise<string> {
  const bodyText = await page.locator('body').innerText();

  const code = bodyText.match(/\b\d{6}\b/)?.[0];

  expect(
    code,
    'One-time code should be displayed on the page'
  ).toBeTruthy();

  return code!;
}

// TEST 1: Verify Username and Password fields exist and have labels
test('Verify Username and Password fields', async ({ page }) => {
  await page.goto('/two_factor');

  await expect(page.getByLabel('Username')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

// TEST 2: Attempt invalid credentials
test('Verify error message for invalid credentials', async ({ page }) => {
  await page.goto('/two_factor');

  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');

  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.locator('#flash'))
    .toContainText('Your username or password is invalid!');
});

// TEST 3: Login with valid credentials and correct OTP
test('Login successfully using valid credentials and OTP', async ({ page }) => {
  await enterValidCredentials(page);

  const code = await getOneTimeCode(page);

  await page.getByLabel('One-time code').fill(code);
  await page.getByRole('button', { name: 'Verify' }).click();

  await expect(page.locator('#flash'))
    .toContainText('You logged in with two-factor authentication!');

  await expect(page.locator('h2')).toContainText('Secure Area');
});

// TEST 4: Submit an incorrect OTP
test('Verify error message for incorrect OTP', async ({ page }) => {
  await enterValidCredentials(page);

  const correctCode = await getOneTimeCode(page);

  // Generate a different six-digit code
  const wrongCode = correctCode === '000000' ? '000001' : '000000';

  await page.getByLabel('One-time code').fill(wrongCode);
  await page.getByRole('button', { name: 'Verify' }).click();

  await expect(page.locator('#flash'))
    .toContainText('Your code is invalid!');
});

// TEST 5: Verify secure area cannot be accessed without authentication
test('Verify secure area is protected', async ({ page }) => {
  await page.goto('/secure');

  await expect(page).not.toHaveURL(/\/secure$/);
  await expect(page.locator('h2')).not.toContainText('Secure Area');
});

// TEST 6: Verify logout ends the session
test('Verify logout ends the session', async ({ page }) => {
  await enterValidCredentials(page);

  const code = await getOneTimeCode(page);

  await page.getByLabel('One-time code').fill(code);
  await page.getByRole('button', { name: 'Verify' }).click();

  await expect(page.locator('h2')).toContainText('Secure Area');

  await page.getByRole('link', { name: 'Logout' }).click();

  await expect(page.locator('#flash'))
    .toContainText('You logged out of the secure area!');

  // Verify secure area cannot be accessed after logout
  await page.goto('/secure');

  await expect(page).not.toHaveURL(/\/secure$/);
});

// TEST 7: Verify OTP expires after 3 minutes
test.skip('Verify OTP expires after 3 minutes', async ({ page }) => {

  test.setTimeout(240000);

  await enterValidCredentials(page);

  const code = await getOneTimeCode(page);

  // Wait 3 minutes
  await page.waitForTimeout(180000);

  await page.getByLabel('One-time code').fill(code);
  await page.getByRole('button', { name: 'Verify' }).click();

  await expect(page.locator('#flash'))
    .toContainText('Your code is invalid!');
});