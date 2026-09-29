import { test, expect } from 'allure-playwright';
import { severity, epic, feature, Severity } from 'allure-js-commons';
import type { Page } from '@playwright/test';

const CREDENTIALS = {
  valid: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
  invalid: { username: 'standard_user', password: 'wrong_password' },
} as const;

const CUSTOMER = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: '12345',
} as const;

const BACKPACK = {
  slug: 'sauce-labs-backpack',
  name: 'Sauce Labs Backpack',
  price: '$29.99',
  subtotal: 'Item total: $29.99',
  tax: 'Tax: $2.40',
  total: 'Total: $32.39',
} as const;

const EPIC = {
  auth: 'Authentication',
  cart: 'Shopping cart',
  checkout: 'Checkout',
} as const;

interface AllureMeta {
  epic: string;
  feature: string;
  severity: Severity;
}

/**
 * Tags the running test for the Allure report. These calls resolve against the
 * allure-playwright reporter, so they are inert when the reporter is not enabled.
 * Must be awaited and called from inside the test body — there is no test context
 * at module or describe scope.
 */
async function allureMeta({ epic: e, feature: f, severity: sv }: AllureMeta): Promise<void> {
  await epic(e);
  await feature(f);
  await severity(sv);
}

async function login(page: Page, creds = CREDENTIALS.valid) {
  await page.goto('/');
  await expect(page.locator('[data-test="login-container"]')).toBeVisible();
  await page.locator('[data-test="username"]').fill(creds.username);
  await page.locator('[data-test="password"]').fill(creds.password);
  await page.locator('[data-test="login-button"]').click();
  // Anchor on the rendered catalog, not waitForURL: the SPA swaps the DOM after the
  // URL changes, so waitForURL alone would assert against the previous page.
  await expect(page.locator('[data-test="inventory-container"]')).toBeVisible();
}

async function addToCart(page: Page, slug: string) {
  await page.locator(`[data-test="add-to-cart-${slug}"]`).click();
}

async function openCart(page: Page) {
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page.locator('[data-test="cart-contents-container"]')).toBeVisible();
}

async function startCheckout(page: Page) {
  await page.locator('[data-test="checkout"]').click();
  await expect(page.locator('[data-test="checkout-info-container"]')).toBeVisible();
}

async function fillCustomerDetails(page: Page) {
  await page.locator('[data-test="firstName"]').fill(CUSTOMER.firstName);
  await page.locator('[data-test="lastName"]').fill(CUSTOMER.lastName);
  await page.locator('[data-test="postalCode"]').fill(CUSTOMER.postalCode);
}

test.describe('SauceDemo — login, cart and checkout', () => {
  test('completes a purchase as standard_user and confirms the order', async ({ page }) => {
    await allureMeta({
      epic: EPIC.checkout,
      feature: 'Purchase happy path',
      severity: Severity.BLOCKER,
    });

    await test.step('log in with valid credentials', async () => {
      await login(page);
      await expect(page).toHaveURL(/\/inventory\.html$/);
      await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
      await expect(page.locator('[data-test="title"]')).toHaveText('Products');
    });

    await test.step('add the backpack to the cart', async () => {
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
      await addToCart(page, BACKPACK.slug);
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
      // The button swaps data-test rather than only its label, so assert both halves.
      await expect(page.locator(`[data-test="remove-${BACKPACK.slug}"]`)).toHaveText('Remove');
      await expect(page.locator(`[data-test="add-to-cart-${BACKPACK.slug}"]`)).toHaveCount(0);
    });

    await test.step('open the cart and confirm the line item', async () => {
      await openCart(page);
      await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
      await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(BACKPACK.name);
      await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(BACKPACK.price);
      await expect(page.locator('[data-test="item-quantity"]')).toHaveText('1');
    });

    await test.step('enter the customer details', async () => {
      await startCheckout(page);
      await fillCustomerDetails(page);
      await expect(page.locator('[data-test="error"]')).toHaveCount(0);
      await page.locator('[data-test="continue"]').click();
      await expect(page.locator('[data-test="checkout-summary-container"]')).toBeVisible();
    });

    await test.step('verify the order summary and totals', async () => {
      await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
      await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(BACKPACK.name);
      await expect(page.locator('[data-test="subtotal-label"]')).toHaveText(BACKPACK.subtotal);
      await expect(page.locator('[data-test="tax-label"]')).toHaveText(BACKPACK.tax);
      await expect(page.locator('[data-test="total-label"]')).toHaveText(BACKPACK.total);
      await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
      await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText(
        'Free Pony Express Delivery!',
      );
    });

    await test.step('finish and confirm the order was placed', async () => {
      await page.locator('[data-test="finish"]').click();
      await expect(page.locator('[data-test="checkout-complete-container"]')).toBeVisible();
      await expect(page).toHaveURL(/\/checkout-complete\.html$/);
      await expect(page.locator('[data-test="complete-header"]')).toHaveText(
        'Thank you for your order!',
      );
      await expect(page.locator('[data-test="complete-text"]')).toContainText('pony');
    });

    await test.step('the cart is emptied once the order completes', async () => {
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
      await page.locator('[data-test="back-to-products"]').click();
      await expect(page.locator('[data-test="inventory-container"]')).toBeVisible();
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
    });
  });

  test('places an order containing several products', async ({ page }) => {
    await allureMeta({
      epic: EPIC.checkout,
      feature: 'Multi-item order',
      severity: Severity.CRITICAL,
    });

    await login(page);

    await test.step('add three products', async () => {
      await addToCart(page, 'sauce-labs-backpack');
      await addToCart(page, 'sauce-labs-bike-light');
      await addToCart(page, 'sauce-labs-onesie');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('3');
    });

    await test.step('the cart holds all three line items', async () => {
      await openCart(page);
      await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(3);
      await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
        'Sauce Labs Onesie',
      ]);
    });

    await test.step('the summary totals add up', async () => {
      await startCheckout(page);
      await fillCustomerDetails(page);
      await page.locator('[data-test="continue"]').click();
      await expect(page.locator('[data-test="checkout-summary-container"]')).toBeVisible();
      // 29.99 + 9.99 + 7.99 = 47.97, tax 8% = 3.84, total 51.81
      await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $47.97');
      await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $3.84');
      await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $51.81');
    });

    await test.step('finish the order', async () => {
      await page.locator('[data-test="finish"]').click();
      await expect(page.locator('[data-test="complete-header"]')).toHaveText(
        'Thank you for your order!',
      );
    });
  });
});

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('add to cart toggles to remove and back', async ({ page }) => {
    await allureMeta({
      epic: EPIC.cart,
      feature: 'Add to cart toggle',
      severity: Severity.NORMAL,
    });

    const addButton = page.locator(`[data-test="add-to-cart-${BACKPACK.slug}"]`);
    const removeButton = page.locator(`[data-test="remove-${BACKPACK.slug}"]`);

    await test.step('first click adds the item', async () => {
      await addButton.click();
      await expect(removeButton).toHaveText('Remove');
      await expect(addButton).toHaveCount(0);
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    });

    await test.step('second click removes it again', async () => {
      await removeButton.click();
      await expect(addButton).toHaveText('Add to cart');
      await expect(removeButton).toHaveCount(0);
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
    });
  });

  test('removing the last item empties the cart', async ({ page }) => {
    await allureMeta({
      epic: EPIC.cart,
      feature: 'Remove item',
      severity: Severity.CRITICAL,
    });

    await addToCart(page, BACKPACK.slug);
    await openCart(page);
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);

    await page.locator(`[data-test="remove-${BACKPACK.slug}"]`).click();

    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });

  test('continue shopping preserves the cart', async ({ page }) => {
    await allureMeta({
      epic: EPIC.cart,
      feature: 'Continue shopping',
      severity: Severity.NORMAL,
    });

    await addToCart(page, BACKPACK.slug);
    await addToCart(page, 'sauce-labs-onesie');
    await openCart(page);

    await page.locator('[data-test="continue-shopping"]').click();

    await expect(page.locator('[data-test="inventory-container"]')).toBeVisible();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
    await expect(page.locator(`[data-test="remove-${BACKPACK.slug}"]`)).toHaveText('Remove');
    await expect(page.locator('[data-test="remove-sauce-labs-onesie"]')).toHaveText('Remove');
  });

  test('cancel from checkout step one returns to the cart', async ({ page }) => {
    await allureMeta({
      epic: EPIC.checkout,
      feature: 'Cancel on step one',
      severity: Severity.NORMAL,
    });

    await addToCart(page, BACKPACK.slug);
    await openCart(page);
    await startCheckout(page);

    await page.locator('[data-test="cancel"]').click();

    await expect(page.locator('[data-test="cart-contents-container"]')).toBeVisible();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('cancel from checkout step two returns to the product list', async ({ page }) => {
    await allureMeta({
      epic: EPIC.checkout,
      feature: 'Cancel on step two',
      severity: Severity.NORMAL,
    });

    await addToCart(page, BACKPACK.slug);
    await openCart(page);
    await startCheckout(page);
    await fillCustomerDetails(page);
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="checkout-summary-container"]')).toBeVisible();

    await page.locator('[data-test="cancel"]').click();

    // Asymmetric with step one, which goes back to the cart — see checkout-tests.md CHECK-009.
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });
});

test.describe('Checkout validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addToCart(page, BACKPACK.slug);
    await openCart(page);
    await startCheckout(page);
  });

  test('blocks checkout when no details are provided', async ({ page }) => {
    await allureMeta({
      epic: EPIC.checkout,
      feature: 'Required field validation',
      severity: Severity.BLOCKER,
    });

    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');
    await expect(page.locator('[data-test="error-button"]')).toBeVisible();
  });

  test('requires the last name', async ({ page }) => {
    await allureMeta({
      epic: EPIC.checkout,
      feature: 'Required field validation',
      severity: Severity.CRITICAL,
    });

    await page.locator('[data-test="firstName"]').fill(CUSTOMER.firstName);
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');
  });

  test('requires the postal code', async ({ page }) => {
    await allureMeta({
      epic: EPIC.checkout,
      feature: 'Required field validation',
      severity: Severity.CRITICAL,
    });

    await page.locator('[data-test="firstName"]').fill(CUSTOMER.firstName);
    await page.locator('[data-test="lastName"]').fill(CUSTOMER.lastName);
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');
  });

  test('the error banner can be dismissed and the form retried', async ({ page }) => {
    await allureMeta({
      epic: EPIC.checkout,
      feature: 'Error banner',
      severity: Severity.MINOR,
    });

    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();

    await page.locator('[data-test="error-button"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);

    await test.step('submitting again re-raises the error', async () => {
      await page.locator('[data-test="continue"]').click();
      await expect(page.locator('[data-test="error"]')).toBeVisible();
    });

    await test.step('a complete form then succeeds', async () => {
      await fillCustomerDetails(page);
      await page.locator('[data-test="continue"]').click();
      await expect(page.locator('[data-test="checkout-summary-container"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    });
  });
});

test.describe('Login', () => {
  test('rejects invalid credentials and keeps the user on the login page', async ({ page }) => {
    await allureMeta({
      epic: EPIC.auth,
      feature: 'Invalid credentials',
      severity: Severity.BLOCKER,
    });

    await page.goto('/');
    await page.locator('[data-test="username"]').fill(CREDENTIALS.invalid.username);
    await page.locator('[data-test="password"]').fill(CREDENTIALS.invalid.password);
    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toHaveText(
      'Epic sadface: Username and password do not match any user in this service',
    );
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-test="inventory-container"]')).toHaveCount(0);
  });

  test('rejects a locked out account', async ({ page }) => {
    await allureMeta({
      epic: EPIC.auth,
      feature: 'Locked out account',
      severity: Severity.BLOCKER,
    });

    await page.goto('/');
    await page.locator('[data-test="username"]').fill(CREDENTIALS.lockedOut.username);
    await page.locator('[data-test="password"]').fill(CREDENTIALS.lockedOut.password);
    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.',
    );
    await expect(page.locator('[data-test="inventory-container"]')).toHaveCount(0);
  });

  test('requires a username before checking the password', async ({ page }) => {
    await allureMeta({
      epic: EPIC.auth,
      feature: 'Login validation',
      severity: Severity.CRITICAL,
    });

    await page.goto('/');
    await page.locator('[data-test="password"]').fill(CREDENTIALS.valid.password);
    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username is required');
  });

  test('redirects deep links to the login page when unauthenticated', async ({ page }) => {
    await allureMeta({
      epic: EPIC.auth,
      feature: 'Session guard',
      severity: Severity.CRITICAL,
    });

    await page.goto('/inventory.html');

    await expect(page.locator('[data-test="login-container"]')).toBeVisible();
    await expect(page.locator('[data-test="inventory-container"]')).toHaveCount(0);
  });

  test('logging out clears the session', async ({ page }) => {
    await allureMeta({
      epic: EPIC.auth,
      feature: 'Logout',
      severity: Severity.NORMAL,
    });

    await login(page);
    await addToCart(page, BACKPACK.slug);

    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="logout-sidebar-link"]').click();
    await expect(page.locator('[data-test="login-container"]')).toBeVisible();

    await test.step('the protected page is no longer reachable', async () => {
      await page.goto('/inventory.html');
      await expect(page.locator('[data-test="login-container"]')).toBeVisible();
    });
  });
});
