'use strict';

const products = [
  { id: 'notebook', name: 'Notebook', price: 1250, quantity: 1 },
  { id: 'pen', name: 'Pen', price: 375, quantity: 1 },
];
const money = cents => `$${(cents / 100).toFixed(2)}`;
const productList = document.querySelector('#products');
const total = document.querySelector('#total');
const form = document.querySelector('#checkout');
const nameInput = document.querySelector('#customer-name');
const nameError = document.querySelector('#name-error');
const cartError = document.querySelector('#cart-error');
const confirmation = document.querySelector('#confirmation');
let ordered = false;

function updateTotal() {
  total.textContent = money(products.reduce((sum, product) => sum + product.price * product.quantity, 0));
}

function render() {
  productList.replaceChildren();
  for (const product of products) {
    const row = document.createElement('article');
    row.className = 'product';
    const details = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = product.name;
    const price = document.createElement('p');
    price.textContent = `${money(product.price)} each`;
    details.append(title, price);
    const controls = document.createElement('div');
    controls.className = 'controls';
    if (product.quantity > 0) {
      const label = document.createElement('label');
      label.textContent = 'Qty';
      label.htmlFor = `quantity-${product.id}`;
      const quantity = document.createElement('input');
      quantity.type = 'number';
      quantity.id = label.htmlFor;
      quantity.min = '1';
      quantity.max = '99';
      quantity.step = '1';
      quantity.value = product.quantity;
      quantity.setAttribute('aria-label', `${product.name} quantity`);
      const quantityError = document.createElement('span');
      quantityError.className = 'quantity-error';
      quantityError.id = `quantity-error-${product.id}`;
      quantityError.textContent = 'Enter a whole number from 1 to 99.';
      quantityError.hidden = true;
      quantity.setAttribute('aria-describedby', quantityError.id);
      quantity.addEventListener('input', () => {
        const value = Number(quantity.value);
        const valid = quantity.value.trim() !== '' && Number.isInteger(value) && value >= 1 && value <= 99;
        quantityError.hidden = valid;
        if (!valid) {
          quantity.setAttribute('aria-invalid', 'true');
          return;
        }
        quantity.removeAttribute('aria-invalid');
        product.quantity = value;
        line.textContent = money(product.price * product.quantity);
        line.setAttribute('aria-label', `${product.name} line total ${line.textContent}`);
        updateTotal();
      });
      quantity.addEventListener('blur', () => {
        if (!quantityError.hidden) {
          quantity.value = product.quantity;
          quantityError.hidden = true;
          quantity.removeAttribute('aria-invalid');
        }
      });
      const line = document.createElement('strong');
      line.textContent = money(product.price * product.quantity);
      line.setAttribute('aria-label', `${product.name} line total ${line.textContent}`);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'secondary';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${product.name}`);
      remove.addEventListener('click', () => { product.quantity = 0; render(); });
      controls.append(label, quantity, line, remove, quantityError);
    } else {
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'secondary';
      add.textContent = 'Add';
      add.setAttribute('aria-label', `Add ${product.name}`);
      add.addEventListener('click', () => { product.quantity = 1; cartError.hidden = true; render(); });
      controls.append(add);
    }
    row.append(details, controls);
    productList.append(row);
  }
  updateTotal();
}

nameInput.addEventListener('input', () => {
  if (nameInput.value.trim()) { nameError.hidden = true; nameInput.removeAttribute('aria-invalid'); }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (ordered) return;
  const empty = products.every(product => product.quantity === 0);
  const missingName = !nameInput.value.trim();
  cartError.hidden = !empty;
  nameError.hidden = !missingName;
  if (missingName) nameInput.setAttribute('aria-invalid', 'true');
  else nameInput.removeAttribute('aria-invalid');
  if (empty || missingName) {
    if (missingName) nameInput.focus();
    return;
  }
  ordered = true;
  const reference = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  confirmation.textContent = `Order confirmed! Reference: ${reference}`;
  form.hidden = true;
  productList.querySelectorAll('button, input').forEach(control => { control.disabled = true; });
  confirmation.hidden = false;
  confirmation.focus();
});
render();
