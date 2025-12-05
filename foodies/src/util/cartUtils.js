export const calculateCartTotals = (cartItems, quantities, taxRate, shippingCharge) => {

  const subtotal = cartItems.reduce((acc, food) => {
    const qty = quantities[food.id] || 0;
    const price = food.price || 0;
    return acc + qty * price;
  }, 0);

  const shipping = subtotal > 0 ? shippingCharge : 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + shipping + tax;

  return { subtotal, shipping, tax, total };
};
