export const calculateCartTotals = (cartItems, quantities) => {

   const subtotal = cartItems.reduce((acc, food) => {
      const qty = quantities[food.id] || 0;
      const price = food.price || 0;

      return acc + qty * price;
   }, 0);

   const shipping = subtotal > 0 ? 10 : 0;
   const tax = subtotal * 0.05;
   const total = subtotal + shipping + tax;

   return { subtotal, shipping, tax, total };
};
