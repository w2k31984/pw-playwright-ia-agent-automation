# Cart & Checkout Test Scenarios — SauceDemo (Swag Labs)

> **Target:** https://www.saucedemo.com
> **Selectors:** harvested live from the DOM on 2026-09-28 (see the reference tables below).
> **Priority legend:** P0 = blocking, P1 = high, P2 = medium.
> **Standard login:** `standard_user` / `secret_sauce`

---

## 1. Selector reference

### 1.1 Cart link & badge (present on every authenticated page)

| data-test | id | notes |
|---|---|---|
| `shopping-cart-link` | — | anchor in `#shopping_cart_container` |
| `shopping-cart-badge` | — | **only in the DOM when the cart is non-empty**; innerText is the item count |
| — | `shopping_cart_container` | wrapper |

### 1.2 Product list — `inventory.html`

| data-test | id | notes |
|---|---|---|
| `inventory-container` | `inventory_container` | readiness anchor for this page |
| `inventory-list` | — | holds the items |
| `inventory-item` | — | 6 nodes; also reused on cart & step-two pages |
| `inventory-item-name` | — | product title text |
| `inventory-item-desc` | — | product description |
| `inventory-item-price` | — | e.g. `$29.99` |
| `inventory-item-description` | — | wraps title/desc/price/add-button |
| `item-N-title-link` | `item_N_title_link` | link to detail; N is the **catalog index, not display order** |
| `item-N-img-link` | `item_N_img_link` | image link to detail |
| `inventory-item-<slug>-img` | — | image itself, slug = lowercase, spaces→`-` |
| `add-to-cart-<slug>` | `add-to-cart-<slug>` | re-keyed to `remove-<slug>` once the item is in the cart — see CART-003 |
| `product-sort-container` | — | `<select>` sort control |
| `active-option` | — | currently selected sort label |
| `title` | — | `Products` |

**Catalog index ↔ slug map (stable, verified):**

| Index | Product | Price | Slug |
|---|---|---|---|
| `item-0` | Sauce Labs Bike Light | $9.99 | `sauce-labs-bike-light` |
| `item-1` | Sauce Labs Bolt T-Shirt | $15.99 | `sauce-labs-bolt-t-shirt` |
| `item-2` | Sauce Labs Onesie | $7.99 | `sauce-labs-onesie` |
| `item-3` | Test.allTheThings() T-Shirt (Red) | $15.99 | `test.allthethings()-t-shirt-(red)` |
| `item-4` | Sauce Labs Backpack | $29.99 | `sauce-labs-backpack` |
| `item-5` | Sauce Labs Fleece Jacket | $49.99 | `sauce-labs-fleece-jacket` |

> The add-to-cart slugs are **not** sanitised — `item-3` yields
> `add-to-cart-test.allthethings()-t-shirt-(red)`, which contains parentheses and dots.
> Any slug→selector helper must not assume `[^a-z0-9-]`.

### 1.3 Product detail — `inventory-item.html?id=N`

| data-test | id | notes |
|---|---|---|
| `inventory-container` | `inventory_item_container` | note the **underscores** here, unlike the list page's `inventory_container` |
| `inventory-item-name` | — | single product title |
| `inventory-item-desc` | — | full description |
| `inventory-item-price` | — | price |
| `item-<slug>-img` | — | e.g. `item-sauce-labs-backpack-img` |
| `add-to-cart` | `add-to-cart` | **generic**, no slug here |
| `back-to-products` | `back-to-products` | returns to `/inventory.html` |

### 1.4 Cart — `cart.html`

| data-test | id | notes |
|---|---|---|
| `cart-contents-container` | `cart_contents_container` | readiness anchor |
| `cart-list` | — | |
| `cart-quantity-label` | — | `QTY` header |
| `cart-desc-label` | — | `Description` header |
| `inventory-item` | — | one per line item |
| `item-quantity` | — | always `1` in this app |
| `item-N-title-link` | `item_N_title_link` | index matches the catalog map above |
| `remove-<slug>` | `remove-<slug>` | also `id` |
| `continue-shopping` | `continue-shopping` | |
| `checkout` | `checkout` | `<button>`; **stays enabled on an empty cart** |

### 1.5 Checkout step 1 — `checkout-step-one.html`

| data-test | id | notes |
|---|---|---|
| `checkout-info-container` | `checkout_info_container` | readiness anchor |
| `firstName` | `first-name` | |
| `lastName` | `last-name` | |
| `postalCode` | `postal-code` | |
| `continue` | `continue` | `<input type="submit">` |
| `cancel` | `cancel` | returns to `/cart.html` |
| `error` | — | `<h3>` banner, only in the DOM on validation failure |
| `error-button` | — | dismisses the banner |

**Exact validation messages (verbatim):**

| Missing field | Message |
|---|---|
| First Name | `Error: First Name is required` |
| Last Name | `Error: Last Name is required` |
| Postal Code | `Error: Postal Code is required` |

All three are validated together, and the **first** missing field wins.

### 1.6 Checkout step 2 — `checkout-step-two.html`

| data-test | id | notes |
|---|---|---|
| `checkout-summary-container` | `checkout_summary_container` | readiness anchor |
| `cart-list`, `cart-quantity-label`, `cart-desc-label` | — | read-only item list (**no remove buttons here**) |
| `inventory-item`, `item-quantity`, `item-N-title-link`, `inventory-item-name` | — | line items |
| `payment-info-label` / `payment-info-value` | — | value is always `SauceCard #31337` |
| `shipping-info-label` / `shipping-info-value` | — | value is always `Free Pony Express Delivery!` |
| `total-info-label` | — | `Order Total` |
| `subtotal-label` | — | `Item total: $29.99` |
| `tax-label` | — | `Tax: $2.40` (8%) |
| `total-label` | — | `Total: $32.39` |
| `finish` | `finish` | completes the order |
| `cancel` | `cancel` | returns to **`/inventory.html`** (not the cart) |

### 1.7 Order complete — `checkout-complete.html`

| data-test | id | notes |
|---|---|---|
| `checkout-complete-container` | `checkout_complete_container` | readiness anchor |
| `complete-header` | — | `Thank you for your order!` |
| `complete-text` | — | `Your order has been dispatched, and will arrive just as fast as the pony can get there!` |
| `pony-express` | — | confirmation image |
| `back-to-products` | `back-to-products` | |
| `generate-pdf-order` | `generate-pdf-order` | — no `data-test` on the download output was reachable; assert the click does not throw |

---

## 2. Cart scenarios

### CART-001 — Add a single product from the list — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Log in, land on `inventory.html` | 6 `[data-test="inventory-item"]`, no badge |
| 2 | Click `[data-test="add-to-cart-sauce-labs-backpack"]` | button label becomes `Remove` |
| 3 | — | `[data-test="shopping-cart-badge"]` appears with innerText `1` |

---

### CART-002 — Add several products; badge tracks the count — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Add `sauce-labs-backpack` | badge `1` |
| 2 | Add `sauce-labs-bike-light` | badge `2` |
| 3 | Add `sauce-labs-onesie` | badge `3` |
| 4 | Click `[data-test="shopping-cart-link"]` | `cart.html`; 3 `[data-test="inventory-item"]` |
| 5 | — | every `item-quantity` is `1`; the 3 expected slugs are present |

---

### CART-003 — Add-to-cart toggles to Remove — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Click `[data-test="add-to-cart-sauce-labs-backpack"]` | `[data-test="remove-sauce-labs-backpack"]` appears with text `Remove` |
| 2 | — | `[data-test="add-to-cart-sauce-labs-backpack"]` is **gone from the DOM** (count 0) |
| 3 | — | badge is `1` |
| 4 | Click `[data-test="remove-sauce-labs-backpack"]` | the `add-to-cart-*` button returns with text `Add to cart`; the `remove-*` node is gone |
| 5 | — | badge is absent from the DOM |
| 6 | Click again | `remove-*` returns, badge is `1` |

> **The `data-test` itself swaps on the list page** — the button is re-keyed from
> `add-to-cart-<slug>` to `remove-<slug>` rather than only changing its label. Verified
> in the browser: before the click `add-to-cart-*` matches 1 node and `remove-*` matches
> 0; afterwards the counts are 0 and 1. The same `remove-<slug>` value is also used on
> the cart page, so the two are distinguished by page context, not by selector.

---

### CART-004 — Remove one item from the cart — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Cart with 2 items (backpack + bike light), badge `2` | — |
| 2 | Click `[data-test="remove-sauce-labs-backpack"]` | that row disappears; 1 item remains |
| 3 | — | badge updates to `1` |

---

### CART-005 — Remove the last item empties the cart — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Cart with 1 item, badge `1` | — |
| 2 | Click its `remove-<slug>` | 0 `[data-test="inventory-item"]` rows |
| 3 | — | `[data-test="shopping-cart-badge"]` is **absent from the DOM** (not merely `0`) |
| 4 | — | `[data-test="checkout"]` is still present — see CHECK-002 |

---

### CART-006 — Remove an item from step two is impossible — P2
*Behaviour worth pinning down.*

| # | Step | Expected result |
|---|---|---|
| 1 | Reach `checkout-step-two.html` with 2 items | — |
| 2 | Inspect the summary list | 0 `remove-*` elements — the summary is read-only |
| 3 | To change the cart, click `[data-test="cancel"]` | lands on `/inventory.html`; go back to the cart to edit |

---

### CART-007 — Continue shopping returns to the list with the cart intact — P1

| # | Step | Expected result |
|---|---|---|
| 1 | On `cart.html` with 2 items, click `[data-test="continue-shopping"]` | `/inventory.html`, badge still `2` |
| 2 | — | the 2 added products still show `Remove` |

---

### CART-008 — Cart survives in-app navigation — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Add 2 items | badge `2` |
| 2 | Open detail page, come back, open/close the side menu, then open the cart | badge `2` throughout |
| 3 | — | the cart is not reset by navigation |

---

### CART-009 — Add from the product detail page — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Click `[data-test="item-4-title-link"]` | `inventory-item.html?id=4`; name `Sauce Labs Backpack`, price `$29.99` |
| 2 | Click `[data-test="add-to-cart"]` (generic, no slug) | badge `1` |
| 3 | Click `[data-test="back-to-products"]` | `/inventory.html`; the backpack shows `Remove` |
| 4 | Open the cart | 1 line item, backpack |

---

### CART-010 — Sorting reorders the list but preserves the cart — P2

| # | Step | Expected result |
|---|---|---|
| 1 | Add `sauce-labs-backpack` (item-4) | badge `1` |
| 2 | Sort by `Name (Z to A)` via `[data-test="product-sort-container"]` | order changes; `[data-test="active-option"]` reads `Name (Z to A)` |
| 3 | — | 6 items still rendered |
| 4 | Open the cart | still exactly the backpack — cart is keyed by product, not by list position |

> Because `item-N-*` indices are **catalog indices**, they do not follow the display
> order after sorting. Never locate a cart row by display position.

---

## 3. Checkout scenarios

### CHECK-001 — Happy path: full purchase — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Log in, add `sauce-labs-backpack`, open the cart | badge `1` |
| 2 | Click `[data-test="checkout"]` | `checkout-step-one.html`, `[data-test="checkout-info-container"]` visible |
| 3 | Fill `firstName`=`Ada`, `lastName`=`Lovelace`, `postalCode`=`12345` | no error banner |
| 4 | Click `[data-test="continue"]` | `checkout-step-two.html`, `[data-test="checkout-summary-container"]` visible |
| 5 | — | 1 line item: `Sauce Labs Backpack`, qty `1`, `$29.99` |
| 6 | — | `subtotal-label` = `Item total: $29.99`, `tax-label` = `Tax: $2.40`, `total-label` = `Total: $32.39` |
| 7 | — | `payment-info-value` = `SauceCard #31337`, `shipping-info-value` = `Free Pony Express Delivery!` |
| 8 | Click `[data-test="finish"]` | `checkout-complete.html` |
| 9 | — | `complete-header` = `Thank you for your order!` |
| 10 | — | cart badge is gone; `[data-test="complete-text"]` mentions the pony |

---

### CHECK-002 — Checkout from an empty cart is not blocked — P0
**Confirmed defect.** Recorded so the current behaviour is pinned, not because it is correct.

| # | Step | Expected result |
|---|---|---|
| 1 | Log in with an empty cart, `goto('/cart.html')` | 0 `[data-test="inventory-item"]` rows |
| 2 | — | `[data-test="checkout"]` is present and **enabled** (no `disabled` attribute) |
| 3 | Click it | **navigates to `checkout-step-one.html`** |
| 4 | — | **no** `[data-test="error"]` is shown — the user is not stopped |

*Expected (recommended) fix:* disable `checkout` on an empty cart, or show an error.

---

### CHECK-003 — Completing the flow with an empty cart still "succeeds" — P0
**Confirmed defect, consequence of CHECK-002.**

| # | Step | Expected result |
|---|---|---|
| 1 | Empty cart → `checkout` → step one | step one reachable |
| 2 | Fill valid `firstName` / `lastName` / `postalCode` | — |
| 3 | Click `continue` | `checkout-step-two.html` renders with **0** line items |
| 4 | — | totals are `$0.00` |
| 5 | Click `[data-test="finish"]` | `checkout-complete.html` — the app reports `Thank you for your order!` for an order that had nothing in it |

---

### CHECK-004 — Incomplete checkout: all fields empty — P0
*The "checkout incompleto" scenario.*

| # | Step | Expected result |
|---|---|---|
| 1 | Cart with 1 item → `checkout` → step one | fields empty, no error yet |
| 2 | Click `[data-test="continue"]` **without typing anything** | **stays on** `checkout-step-one.html` — no navigation |
| 3 | — | `[data-test="error"]` = `Error: First Name is required` |
| 4 | — | `[data-test="error-button"]` is present |
| 5 | — | the cart is **not** lost: badge still `1` and the item is still there after navigating back |

---

### CHECK-005 — Incomplete checkout: only First Name — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Fill `firstName`=`Ada` only, click `continue` | stays on step one |
| 2 | — | error = `Error: Last Name is required` |

---

### CHECK-006 — Incomplete checkout: only Postal Code missing — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Fill `firstName`=`Ada`, `lastName`=`Lovelace`, leave `postalCode` empty | — |
| 2 | Click `continue` | stays on step one |
| 3 | — | error = `Error: Postal Code is required` |
| 4 | Fill `postalCode`=`12345`, click `continue` | advances to step two |

> Validation is all-at-once and reports only the first failure — filling fields in
> reverse order surfaces a different message each time (CHECK-004/005/006).

---

### CHECK-007 — Validation error is dismissible and retryable — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Trigger `Error: First Name is required` | banner + `error-button` visible |
| 2 | Click `[data-test="error-button"]` | banner removed from the DOM |
| 3 | Click `continue` again with the field still empty | banner reappears |
| 4 | Fill all three fields, click `continue` | advances to step two; no banner |

---

### CHECK-008 — Cancel from step one returns to the cart — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Reach step one with 2 items | badge `2` |
| 2 | Click `[data-test="cancel"]` | lands on `cart.html` — **not** the product list |
| 3 | — | both items still in the cart, badge `2` |
| 4 | — | the fields are cleared on returning to step one |

---

### CHECK-009 — Cancel from step two returns to the product list — P1
*Asymmetric with CHECK-008 — worth confirming with product.*

| # | Step | Expected result |
|---|---|---|
| 1 | Reach step two with items | badge `2` |
| 2 | Click `[data-test="cancel"]` | lands on **`/inventory.html`** (verified) — not `cart.html` |
| 3 | — | cart is preserved: badge still `2`, items can be re-checked |
| 4 | — | order is not placed; `/checkout-complete.html` is not shown |

---

### CHECK-010 — Multi-item totals are correct — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Add `sauce-labs-backpack` ($29.99), `sauce-labs-bike-light` ($9.99), `sauce-labs-onesie` ($7.99) | badge `3` |
| 2 | Proceed to step two | 3 line items, each qty `1` |
| 3 | — | `subtotal-label` = `Item total: $47.97` |
| 4 | — | `tax-label` = `Tax: $3.84` (8% of 47.97 = 3.8376 → 3.84) |
| 5 | — | `total-label` = `Total: $51.81` |

---

### CHECK-011 — Order completion clears the cart — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Complete a 3-item order (CHECK-010) | on `checkout-complete.html` |
| 2 | — | `[data-test="shopping-cart-badge"]` is absent from the DOM |
| 3 | Click `[data-test="back-to-products"]` | `/inventory.html`; badge still absent |
| 4 | Open the cart | 0 items |

---

### CHECK-012 — Return to products from the completion page — P2

| # | Step | Expected result |
|---|---|---|
| 1 | On `checkout-complete.html`, click `[data-test="back-to-products"]` | `/inventory.html`, 6 items listed |
| 2 | — | all add-to-cart buttons read `Add to cart` again — no stale `Remove` state |

---

### CHECK-013 — `generate-pdf-order` is clickable — P3

| # | Step | Expected result |
|---|---|
| 1 | On `checkout-complete.html`, click `[data-test="generate-pdf-order"]` | the click does not throw and the page stays on the completion screen |
| 2 | — | the app exposes no `data-test` on the generated file, so assert only non-error behaviour |

---

### CHECK-014 — Deep link to checkout without authentication is refused — P0
*Cross-reference: LOGIN-016.*

| # | Step | Expected result |
|---|---|---|
| 1 | Fresh context, `goto('/checkout-step-one.html')` | redirected to the login page |
| 2 | Fresh context, `goto('/checkout-step-two.html')` | redirected to the login page |

---

### CHECK-015 — Deep link to checkout with an empty cart is **not** refused — P1
**Confirmed defect.** The guard in CHECK-014 works, but there is no cart guard.

| # | Step | Expected result |
|---|---|---|
| 1 | Log in with an empty cart, `goto('/checkout-step-one.html')` | **stays** on `checkout-step-one.html`; step one renders |
| 2 | — | no `[data-test="error"]`; the user can type an address for a nonexistent order |
| 3 | In a **second** tab, `goto('/checkout-step-two.html')` | step two renders with 0 items and no error |
| 4 | — | consistent with CHECK-002/003 — the missing guard is the empty cart, not the route |

---

### CHECK-016 — `problem_user` degrades during checkout — P2
*Documented oddity of the seeded account; assert so a change is noticed.*

| # | Step | Expected result |
|---|---|---|
| 1 | Log in as `problem_user` / `secret_sauce` | on `inventory.html` |
| 2 | Add an item, go to step two, click `[data-test="finish"]` | the order is **not** completed reliably — the app misbehaves for this account |
| 3 | — | pin the observed behaviour rather than asserting success |

---

## 4. Open issues found while exploring

1. **Empty cart is not guarded.** `checkout` stays enabled, and both checkout steps are
   reachable by direct URL, ending in a "thank you" for a $0.00 order
   (CHECK-002, CHECK-003, CHECK-015). Highest-value fix.
2. **No read-only indicator on the step-two list.** Users cannot tell the summary is
   non-editable; there is no remove affordance and no hint to use `cancel`
   (CART-006).
3. **`cancel` is inconsistent.** Step one returns to the cart, step two returns to the
   product list (CHECK-008 vs CHECK-009).
4. **Validation reports only the first missing field** with no field-level highlighting
   (CHECK-004/005/006).
5. **`item-N-*` indices are catalog indices, not display positions** — they do not
   follow sorting, which makes position-based locators fragile (CART-010).
6. **The add-to-cart `data-test` mutates.** It is re-keyed to `remove-<slug>` on click,
   so a locator captured before the click silently stops matching afterwards (CART-003).
   Prefer re-resolving the locator after each state change.
7. **`id` casing is inconsistent between sibling pages**: `inventory_container` on the
   list vs `inventory_item_container` on the detail page. Prefer `data-test`.

---

## 5. Suggested implementation notes

- Read `data-test` first, `id` only as a fallback. Section 1.6/1.7 shows why.
- Build slug→locator helpers from a static map (section 1.2) rather than slugifying at
  runtime — `item-3`'s slug contains `.`, `(` and `)`.
- Use `.first()` on `inventory-item` / `inventory-item-name`: they match 6 nodes on the
  list page and will otherwise throw a strict-mode violation.
- The SPA re-renders asynchronously — `page.waitForURL()` resolves **before** the DOM
  updates. Always wait on a page-specific anchor
  (`inventory-container`, `cart-contents-container`, `checkout-info-container`,
  `checkout-summary-container`, `checkout-complete-container`) before asserting.
  This bit during exploration and silently shifted every page's assertions by one.
- Start each test in a fresh `browser.newContext()`; auth and cart live in
  `localStorage` and leak across otherwise-independent tests.
