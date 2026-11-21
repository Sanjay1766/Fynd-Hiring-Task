# Test plan and results

Date: 21 November 2026. Test browser: Google Chrome, headless, driven by Playwright. All automated cases start with a new browser context and the default cart (one Notebook at $12.50 and one Pen at $3.75).

| Priority / risk | Check and expected result | Result |
| --- | --- | --- |
| P0: order cannot be placed | Enter a name and place the order. One confirmation and an order reference appear. | PASS — automated |
| P0: invalid order | Leave the name blank and place the order. A name message appears, no confirmation appears, and the cart remains intact. | PASS — automated |
| P0: wrong charge | Set Notebook quantity to 3 and leave the field. Its line total is $37.50 and the order total is $41.25. | PASS — automated |
| P0: empty order | Enter a name, remove both products, and place the order. Total is $0.00, the empty-cart message appears, the name remains, and there is no confirmation. | PASS — automated; manual check not performed |
| P0: duplicate order | Enter a name and rapidly double-click Place order. Exactly one confirmation appears and the button is no longer available. | PASS — automated double-click; manual check not performed |

## Manual checks still needed

The interactive browser available in the execution environment blocked opening the local file, so the two requested checks were **not manually performed**. To complete them, open the page as described in the README and follow the empty-cart and double-click steps above. Record the browser, date, and observed results here. The automated cases are supporting evidence, not a substitute for reporting manual testing accurately.

## Defects

### Quantity arrow unexpectedly increases the value — fixed

- Reported steps: Set a product quantity to 1 and repeatedly click the lower arrow.
- Expected: The quantity stays at its minimum of 1.
- Actual: The user reported that the quantity increased after repeated clicks.
- Fix: Updating a quantity now updates the totals without replacing the input control. A regression test checks the minimum, focus retention, and totals; it passed. The original mouse interaction was reported by the user and was not independently reproduced before the fix.

The first attempt to launch Chrome failed because of the execution sandbox; rerunning with browser execution permitted passed. That infrastructure issue was not a checkout defect.
