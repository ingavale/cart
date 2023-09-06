yarn add
npm install 

import { ShopifyCart } ;

const shopifyCart = new ShopifyCart();
const shopifyCart = new ShopifyCart(settings);

shopifyCart
  .getState()
  .then(state => console.log(state))

console.log(shopifyCart.state)

shopifyCart
  .addItem({id: 39766656254012})
  .then(lineItems => console.log(lineItems))

shopifyCart
  .addItem([
    {id: 39766656254012},
    {id: 39766656254013}
  ])
  .then(lineItems => console.log(lineItems))


<form>
  <input type="hidden" name="id" value="39766656254012">
  <input type="hidden" name="quantity" value="1">
</form>

const form = document.querySelector("form")

form.addEventListener("submit", () => {
  shopifyCart
    .addItemFromForm(form)
    .then(lineItems => console.log(lineItems))
});

  shopifyCart
    .clearAttributes()
    .then(state => console.log(state))

  shopifyCart
    .clearItems()
    .then(state => console.log(state))

  shopifyCart
    .clearNote()
    .then(state => console.log(state))

  shopifyCart
    .removeItem({id: 39766656254012})
    .then(state => console.log(state))

  shopifyCart
    .removeItem({line: 0})
    .then(state => console.log(state))

  shopifyCart
    .updateAttributes({'gift wrap': 'true'})
    .then(state => console.log(state))

  shopifyCart
    .updateItem({id: 39766656254012, quantity: 3})
    .then(state => console.log(state))

shopifyCart
    .updateNote("updated note")
    .then(state => console.log(state))

document.addEventListener('cart:ready', (event) => {
  const { cart, route } = event.details
})

document.addEventListener('cart:requestStarted', (event) => {
  const { cart, route } = event.details
})

document.addEventListener('cart:requestComplete', (event) => {
  const { cart, route } = event.details
})

