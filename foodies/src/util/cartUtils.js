export const calculateCartTotals = (
  cartItems,
  quantities,
  taxRate,
  shippingCharge,
  combos = []
) => {
  let subtotal = 0;

  // FOOD ITEMS
  cartItems.forEach(item => {
    subtotal += item.price * quantities[item.id];
  });

  // COMBOS
  combos.forEach(combo => {
    subtotal += combo.comboPrice;
  });

  const tax = (subtotal * taxRate) / 100;
  const shipping = shippingCharge;

  return {
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping
  };
};
