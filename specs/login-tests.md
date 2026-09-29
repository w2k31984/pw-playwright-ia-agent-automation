# Login & Authentication Test Scenarios — SauceDemo (Swag Labs)

> **Target:** https://www.saucedemo.com
> **Selectors:** harvested live from the DOM on 2026-09-28 (see the reference tables below).
> **Priority legend:** P0 = blocking, P1 = high, P2 = medium.
> **Test data:** password for every account is `secret_sauce`.

---

## 1. Selector reference — Login page

`https://www.saucedemo.com/`

| data-test | id | name | tag | notes |
|---|---|---|---|---|
| `login-container` | — | — | div | root of the login card; good readiness anchor |
| `username` | `user-name` | `user-name` | input | `type="text"` |
| `password` | `password` | `password` | input | `type="password"` |
| `login-button` | `login-button` | `login-button` | input | `type="submit"` |
| `login-credentials-container` | — | — | div | wraps the accepted-credentials hint |
| `login-credentials` | `login_credentials` | — | div | lists valid usernames |
| `login-password` | — | — | div | shows the shared password |
| `error` | — | — | h3 | error banner, only in DOM when an error is showing |
| `error-button` | — | — | button | "×" to dismiss the error banner |
| — | `login_button_container` | — | div | |
| — | `root` / `page_wrapper` / `contents_wrapper` | — | div | app shell ids |

### Accepted accounts (rendered on the page)

| Username | Password | Expected behaviour |
|---|---|---|
| `standard_user` | `secret_sauce` | normal access |
| `locked_out_user` | `secret_sauce` | **locked out** — login refused |
| `problem_user` | `secret_sauce` | logs in, but cart/checkout misbehaves |
| `performance_user` | `secret_sauce` | logs in, slow responses |
| `performance glitch user` | `secret_sauce` | logs in, very slow responses |

### Exact error strings (verbatim from the live app)

| Trigger | Message |
|---|---|
| Bad username **or** bad password | `Epic sadface: Username and password do not match any user in this service` |
| `locked_out_user` | `Epic sadface: Sorry, this user has been locked out.` |
| Empty username (checked first) | `Epic sadface: Username is required` |
| Empty password, username filled | `Epic sadface: Password is required` |

---

## 2. Scenarios

### LOGIN-001 — Happy path: standard_user logs in — P0
**Preconditions:** not authenticated, on `https://www.saucedemo.com`

| # | Step | Expected result |
|---|---|---|
| 1 | Open `https://www.saucedemo.com` | `[data-test="login-container"]` visible; no `[data-test="error"]` |
| 2 | Type `standard_user` into `[data-test="username"]` | field value is `standard_user` |
| 3 | Type `secret_sauce` into `[data-test="password"]` | value is masked (`type="password"`) |
| 4 | Click `[data-test="login-button"]` | navigates to `/inventory.html` |
| 5 | — | `[data-test="inventory-container"]` visible, title `Products`, 6 `[data-test="inventory-item"]` rendered |
| 6 | — | no `[data-test="error"]` in the DOM |

---

### LOGIN-002 — Login with each accepted user (data-driven) — P1
**Preconditions:** fresh context per iteration (no shared localStorage)

| # | Step | Expected result |
|---|---|---|
| 1 | For each of `standard_user`, `problem_user`, `performance_user`, `performance glitch user` | login succeeds → `/inventory.html` |
| 2 | For `locked_out_user` | stays on `/`, error `Epic sadface: Sorry, this user has been locked out.` |

> Keep each iteration in its own `browser.newContext()` — the app persists auth in
> localStorage, so a shared context leaks a previous user's session.

---

### LOGIN-003 — Wrong password — P0
**Preconditions:** not authenticated

| # | Step | Expected result |
|---|---|---|
| 1 | Username `standard_user`, password `wrong_password` | — |
| 2 | Click `[data-test="login-button"]` | stays on `/`, no navigation |
| 3 | — | `[data-test="error"]` visible with `Epic sadface: Username and password do not match any user in this service` |
| 4 | — | both fields retain their values so the user can retry |
| 5 | Correct only the password, click login again | login succeeds → `/inventory.html` |

---

### LOGIN-004 — Unknown username — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Username `no_such_user`, password `secret_sauce` | — |
| 2 | Click login | stays on `/` |
| 3 | — | error `Epic sadface: Username and password do not match any user in this service` |

> The message is intentionally identical to the wrong-password case — it must **not**
> leak whether the username exists.

---

### LOGIN-005 — Both fields wrong — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Username `foo`, password `bar` | — |
| 2 | Click login | stays on `/`, same `...do not match any user in this service` message |

---

### LOGIN-006 — Empty username (username validation takes precedence) — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Leave username empty, type `secret_sauce` in password | — |
| 2 | Click login | stays on `/` |
| 3 | — | error `Epic sadface: Username is required` |
| 4 | — | password field is **not** cleared and no password-specific error is shown |

---

### LOGIN-007 — Empty password — P0

| # | Step | Expected result |
|---|---|---|
| 1 | Type `standard_user`, leave password empty | — |
| 2 | Click login | stays on `/` |
| 3 | — | error `Epic sadface: Password is required` |

---

### LOGIN-008 — Both fields empty — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Submit with both fields empty | stays on `/` |
| 2 | — | error is `Epic sadface: Username is required` — username is validated first, so the user is never told the password is also missing |

---

### LOGIN-009 — Locked-out user — P0
**Also the "usuario bloqueado" scenario.**

| # | Step | Expected result |
|---|---|---|
| 1 | Username `locked_out_user`, password `secret_sauce` | — |
| 2 | Click login | stays on `/`, **no** navigation to `/inventory.html` |
| 3 | — | error `Epic sadface: Sorry, this user has been locked out.` |
| 4 | Wait ~5s, submit again | error persists — there is **no** lockout timer or unlock path in this app |
| 5 | — | account is not brute-forceable *within the session*, but the app also never rate-limits — see Open Issues |

---

### LOGIN-010 — Wrong password for a locked-out user — P1
*Edge case: which message wins?*

| # | Step | Expected result |
|---|---|---|
| 1 | Username `locked_out_user`, password `wrong_password` | — |
| 2 | Click login | stays on `/` |
| 3 | — | expect the generic `...do not match any user in this service` message, **not** the lockout message — the lockout must not confirm the account exists |

---

### LOGIN-011 — Username is case-sensitive — P2

| # | Step | Expected result |
|---|---|---|
| 1 | Username `Standard_User`, password `secret_sauce` | — |
| 2 | Click login | **fails** with `...do not match any user in this service` |

---

### LOGIN-012 — Leading/trailing whitespace is not trimmed — P2
*Common real-world expectation gap.*

| # | Step | Expected result |
|---|---|---|
| 1 | Username `"  standard_user  "`, password `secret_sauce` | — |
| 2 | Click login | **fails** — the app does not trim input. Product decision: should it? |

---

### LOGIN-013 — Password field is masked — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Type `secret_sauce` into `[data-test="password"]` | attribute `type` is `password` |
| 2 | — | the value is never rendered as visible text |
| 3 | — | no password appears in the page's accessible text content |

---

### LOGIN-014 — Error banner is dismissible and does not persist — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Trigger a failed login | `[data-test="error"]` and `[data-test="error-button"]` visible |
| 2 | Click `[data-test="error-button"]` | error banner is removed from the DOM |
| 3 | Fix the credentials and click login | login succeeds — the dismissed banner does not reappear |
| 4 | — | `[data-test="error"]` absent from the DOM on `/inventory.html` |

---

### LOGIN-015 — Submit via the Enter key — P2

| # | Step | Expected result |
|---|---|---|
| 1 | Focus `[data-test="username"]`, fill both fields | — |
| 2 | Press `Enter` | form submits (no JS click needed) → `/inventory.html` |
| 3 | Repeat pressing `Enter` while focused in `[data-test="password"]` | same result |

---

### LOGIN-016 — Session guard: deep link without authentication — P0
*Security-relevant.*

| # | Step | Expected result |
|---|---|---|
| 1 | In a fresh context, `goto('https://www.saucedemo.com/inventory.html')` | app redirects to the login page; `[data-test="login-container"]` visible |
| 2 | Repeat for `/cart.html` | redirected to login |
| 3 | Repeat for `/checkout-step-one.html` | redirected to login |
| 4 | Repeat for `/checkout-step-two.html` | redirected to login |
| 5 | Repeat for `/checkout-complete.html` | redirected to login |
| 6 | Repeat for `/inventory-item.html?id=4` | redirected to login |

> Because this is a client-side SPA, `goto` alone does not prove server-side protection —
> flag it for manual verification of the network layer.

---

### LOGIN-017 — Authenticated session survives a reload — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Log in as `standard_user` | on `/inventory.html` |
| 2 | `page.reload()` | still on `/inventory.html`, catalog rendered — session is in `localStorage` |
| 3 | — | the user is **not** bounced back to the login form |

---

### LOGIN-018 — Logout from the side menu — P1

| # | Step | Expected result |
|---|---|---|
| 1 | Log in, open `#react-burger-menu-btn` | side menu expands |
| 2 | — | links visible: `inventory-sidebar-link`, `dynamic-catalog-sidebar-link`, `about-sidebar-link`, `logout-sidebar-link`, `reset-sidebar-link` |
| 3 | Click `[data-test="logout-sidebar-link"]` | returns to `/`, `[data-test="login-container"]` visible |
| 4 | `goto('/inventory.html')` | redirected back to login — session was genuinely cleared |

---

### LOGIN-019 — Cart is cleared on logout — P2
*State-leak check between users.*

| # | Step | Expected result |
|---|---|---|
| 1 | Log in, add 2 items, note badge = `2` | `[data-test="shopping-cart-badge"]` innerText `2` |
| 2 | Log out, then log back in as `standard_user` | cart badge absent, cart is empty |
| 3 | — | no items carried over from the previous session |

---

### LOGIN-020 — "Reset App State" clears the session and cart — P2

| # | Step | Expected result |
|---|---|---|
| 1 | Log in, add items | badge visible |
| 2 | Open menu, click `[data-test="reset-sidebar-link"]` | app resets — menu closes, cart emptied |
| 3 | — | user is returned to the login page |

---

### LOGIN-021 — Active side-menu item is marked — P2

| # | Step | Expected result |
|---|---|---|
| 1 | On `/inventory.html`, open the side menu | `[data-test="inventory-sidebar-link"]` carries the `active-option` class |
| 2 | Navigate to `/cart.html`, open the menu | `inventory-sidebar-link` no longer active |

---

## 3. Open issues found while exploring

1. **No lockout enforcement.** `locked_out_user` is refused, but repeated failed attempts
   are never throttled or captcha'd (LOGIN-009).
2. **Whitespace is not trimmed** on the username field, so a stray space breaks a valid
   login (LOGIN-012).
3. **Single-message validation.** Submitting both fields empty only reports the username
   (LOGIN-008) — acceptable, but it should be a conscious decision.
4. **Client-side-only auth guard.** Routing is enforced in the SPA; verify server-side
   authorisation independently (LOGIN-016).
