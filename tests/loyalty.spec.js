const { test, expect } = require('../src/node_modules/@playwright/test');

test.describe('Loyalty Rewards Flow', () => {
  const baseURL = process.env.APP_URL || 'http://localhost:30156';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test('should load the storefront and show the PR-456 preview banner', async ({ page }) => {
    await expect(page).toHaveTitle(/Frontend App/);
    await expect(page.locator('h1')).toContainText('Frontend App - Loyalty Rewards Preview');
    const prInfo = page.locator('.pr-info');
    await expect(prInfo).toContainText('PR #456');
    await expect(prInfo).toContainText('feature/pr-456');
  });

  test('should add gear items to the cart', async ({ page }) => {
    await page.click('text=Add to Cart >> nth=0');
    await expect(page.locator('#cart-items')).not.toContainText('Cart is empty');
    await expect(page.locator('#cart-items')).toContainText('Trailhead Solar Charger');
    await expect(page.locator('#cart-total')).toContainText('60.00');
    await page.click('text=Add to Cart >> nth=2');
    await expect(page.locator('#cart-items')).toContainText('Canyon Insulated Bottle');
    await expect(page.locator('#cart-total')).toContainText('85.00');
  });

  test('should remove an item from the cart', async ({ page }) => {
    await page.click('text=Add to Cart >> nth=0');
    await page.click('text=Add to Cart >> nth=2');
    await expect(page.locator('#cart-items')).toContainText('Trailhead Solar Charger');
    await expect(page.locator('#cart-items')).toContainText('Canyon Insulated Bottle');
    await page.click('text=Remove >> nth=0');
    await expect(page.locator('#cart-items')).not.toContainText('Trailhead Solar Charger');
    await expect(page.locator('#cart-items')).toContainText('Canyon Insulated Bottle');
    await expect(page.locator('#cart-total')).toContainText('25.00');
  });

  test('should show the free-shipping progress message and qualify once past the threshold', async ({ page }) => {
    await expect(page.locator('#shipping-progress-msg')).toContainText('Add $80.00 to get free shipping');
    await page.click('text=Add to Cart >> nth=2');
    await expect(page.locator('#shipping-progress-msg')).toContainText('Add $55.00');
    await page.click('text=Add to Cart >> nth=1');
    await expect(page.locator('#shipping-progress-msg')).toContainText('Add $15.00');
    await page.click('text=Add to Cart >> nth=0');
    await expect(page.locator('#shipping-progress-msg')).toContainText('You qualify for free shipping');
  });

  test('should enroll a member into the Peak Club loyalty program', async ({ page }) => {
    await page.fill('#member-name', 'Riley Forest');
    await page.fill('#member-email', 'riley.forest@example.com');
    await page.click('#loyalty-signup');
    await expect(page.locator('#loyalty-status')).toContainText('Enrolled');
    await expect(page.locator('#points-balance')).toContainText('500');
  });

  test('should earn Peak Points when gear is added', async ({ page }) => {
    await page.fill('#member-name', 'Riley Forest');
    await page.fill('#member-email', 'riley.forest@example.com');
    await page.click('#loyalty-signup');
    await expect(page.locator('#points-balance')).toContainText('500');
    await page.click('text=Add to Cart >> nth=0');
    await expect(page.locator('#points-balance')).toContainText('620');
  });

  test('should apply GOLD15 coupon and refresh the discount row', async ({ page }) => {
    await page.click('text=Add to Cart >> nth=1');
    await page.click('text=Add to Cart >> nth=0');
    await expect(page.locator('#summary-subtotal')).toContainText('100.00');
    await page.fill('#promo-code', 'GOLD15');
    await page.click('#apply-promo');
    await expect(page.locator('#promo-status')).toContainText('Promo applied');
    await expect(page.locator('#summary-promo')).toContainText('15.00');
  });

  test('should redeem Peak Points and refresh the order summary', async ({ page }) => {
    await page.fill('#member-name', 'Riley Forest');
    await page.fill('#member-email', 'riley.forest@example.com');
    await page.click('#loyalty-signup');
    await page.click('text=Add to Cart >> nth=0');
    await expect(page.locator('#points-balance')).toContainText('620');
    await page.fill('#redeem-points', '100');
    await page.click('#redeem-button');
    await expect(page.locator('#summary-points')).toContainText('10.00');
    await expect(page.locator('#points-balance')).toContainText('520');
  });

  test('should limit points redemption to half of the subtotal', async ({ page }) => {
    await page.fill('#member-name', 'Riley Forest');
    await page.fill('#member-email', 'riley.forest@example.com');
    await page.click('#loyalty-signup');
    await page.click('text=Add to Cart >> nth=1');
    await expect(page.locator('#points-balance')).toContainText('580');
    await page.fill('#redeem-points', '400');
    await page.click('#redeem-button');
    await expect(page.locator('#summary-points')).toContainText('20.00');
  });

  test('should calculate tax after discount and redemption (pricing rule)', async ({ page }) => {
    await page.fill('#member-name', 'Riley Forest');
    await page.fill('#member-email', 'riley.forest@example.com');
    await page.click('#loyalty-signup');
    await page.click('text=Add to Cart >> nth=0');
    await page.click('text=Add to Cart >> nth=1');
    await page.fill('#promo-code', 'GOLD15');
    await page.click('#apply-promo');
    await page.fill('#redeem-points', '100');
    await page.click('#redeem-button');
    // taxable = 100.00 - 15.00 promo - 10.00 points = 75.00 -> tax = 6.00
    await expect(page.locator('#summary-tax')).toContainText('6.00');
  });

  test('should complete checkout and surface the confirmation panel', async ({ page }) => {
    await page.click('text=Add to Cart >> nth=2');
    await page.fill('#name', 'Jordan Peak');
    await page.fill('#email', 'jordan.peak@example.com');
    await page.fill('#address', '88 Ridgeview Pass, Trail City');
    await page.fill('#card', '5555444433332222');
    await page.click('#submit-button');
    await expect(page.locator('#checkout-success')).toBeVisible();
    const orderId = await page.locator('#order-id').textContent();
    expect(orderId).toMatch(/^LYL-[A-Z0-9]+/);
  });

  test('should reject an empty checkout form via field validation', async ({ page }) => {
    await page.click('#submit-button');
    const nameInput = page.locator('#name');
    const validationMessage = await nameInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});

test.describe('API Health Checks', () => {
  const baseURL = process.env.APP_URL || 'http://localhost:30156';

  test('should answer homepage requests with status 200', async ({ request }) => {
    const response = await request.get(baseURL);
    expect(response.status()).toBe(200);
  });

  test('should serve content with an html content type', async ({ request }) => {
    const response = await request.get(baseURL);
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('should serve the homepage consistently on repeat requests', async ({ request }) => {
    const first = await request.get(baseURL);
    const second = await request.get(baseURL);
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
  });
});
