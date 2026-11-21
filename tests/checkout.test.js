'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

let browser;
const url = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
before(async () => {
  browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
});
after(async () => { if (browser) await browser.close(); });

async function withPage(run) {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(url);
    await run(page);
  } finally { await context.close(); }
}

test('a valid checkout displays one confirmation and reference', () => withPage(async page => {
  await page.getByLabel('Name').fill('Avery Patel');
  await page.getByRole('button', { name: 'Place order' }).click();
  const confirmation = page.getByRole('status');
  await confirmation.waitFor({ state: 'visible' });
  assert.match(await confirmation.innerText(), /^Order confirmed! Reference: ORD-[A-Z0-9]+-[A-Z0-9]+$/);
  assert.equal(await page.getByRole('status').count(), 1);
  assert.equal(await page.getByRole('button', { name: 'Place order' }).count(), 0);
}));

test('a missing name blocks checkout and preserves the cart', () => withPage(async page => {
  await page.getByRole('button', { name: 'Place order' }).click();
  assert.equal(await page.getByText('Please enter your name.').isVisible(), true);
  assert.equal(await page.getByRole('status').count(), 0);
  assert.equal(await page.locator('#total').innerText(), '$16.25');
  assert.equal(await page.getByLabel('Notebook quantity').inputValue(), '1');
}));

test('changing quantity updates the exact line and order totals', () => withPage(async page => {
  await page.getByLabel('Notebook quantity').fill('3');
  assert.equal(await page.getByLabel('Notebook line total $37.50').innerText(), '$37.50');
  assert.equal(await page.locator('#total').innerText(), '$41.25');
}));

test('an empty cart blocks checkout and preserves the name', () => withPage(async page => {
  await page.getByLabel('Name').fill('Avery Patel');
  await page.getByRole('button', { name: 'Remove Notebook' }).click();
  await page.getByRole('button', { name: 'Remove Pen' }).click();
  assert.equal(await page.locator('#total').innerText(), '$0.00');
  await page.getByRole('button', { name: 'Place order' }).click();
  assert.equal(await page.getByText('Your cart is empty. Add an item before placing your order.').isVisible(), true);
  assert.equal(await page.getByLabel('Name').inputValue(), 'Avery Patel');
  assert.equal(await page.getByRole('status').count(), 0);
}));

test('a rapid double-click results in one confirmation', () => withPage(async page => {
  await page.getByLabel('Name').fill('Avery Patel');
  await page.getByRole('button', { name: 'Place order' }).dblclick();
  const confirmation = page.getByRole('status');
  await confirmation.waitFor({ state: 'visible' });
  assert.equal(await confirmation.count(), 1);
  assert.match(await confirmation.innerText(), /^Order confirmed! Reference: ORD-/);
  assert.equal(await page.getByRole('button', { name: 'Place order' }).count(), 0);
}));


test('quantity stays at the minimum and the control remains focused after changes', () => withPage(async page => {
  const quantity = page.getByLabel('Notebook quantity');
  await quantity.focus();
  await quantity.press('ArrowDown');
  await quantity.press('ArrowDown');
  assert.equal(await quantity.inputValue(), '1');
  await quantity.press('ArrowUp');
  assert.equal(await quantity.inputValue(), '2');
  assert.equal(await quantity.evaluate(element => element === document.activeElement), true);
  await quantity.press('ArrowDown');
  assert.equal(await quantity.inputValue(), '1');
  assert.equal(await page.locator('#total').innerText(), '$16.25');
}));


test('invalid typed quantity shows an error and restores the last valid value', () => withPage(async page => {
  const quantity = page.getByLabel('Notebook quantity');
  await quantity.fill('3');
  await quantity.fill('100');
  assert.equal(await page.locator('#quantity-error-notebook').isVisible(), true);
  assert.equal(await page.locator('#total').innerText(), '$41.25');
  await quantity.blur();
  assert.equal(await quantity.inputValue(), '3');
  assert.equal(await page.locator('#quantity-error-notebook').isVisible(), false);
}));
