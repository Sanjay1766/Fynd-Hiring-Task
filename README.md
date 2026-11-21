# Mini Checkout

A small, client-side checkout for two fictional products. No backend, payment, or order storage is involved. Refreshing the page starts a new cart; the reference is a demo identifier and is not a durable order record.

## Run the page

Open `index.html` in a modern browser, or from this directory run:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. Both items start in the cart. Change a quantity (1–99), remove or re-add a product, enter a name, and place the order. Valid quantity changes update totals as you type; invalid values show a message and revert to the last valid quantity when you leave the field.

## Run browser tests

Install Node.js 18 or newer and npm, then run:

```sh
npm install
npx playwright install chromium
npm test
```

Playwright runs Chromium headlessly. Each test creates a fresh browser context and opens the local page, so no server is required. If using a locally installed Chrome instead of Playwright's Chromium, set `CHROME_PATH` to its executable before `npm test`. See [TEST_PLAN.md](TEST_PLAN.md) for cases and actual results.

## Design notes

Prices are stored as integer cents and formatted only for display. Validation trims the name, preserves the customer's input, and reports both errors if the cart and name are empty. Successful submission sets an in-memory lock synchronously, hides the form, and disables cart controls. This prevents duplicate confirmations within the current page session; a real store would also need server-side idempotency and durable order storage.
