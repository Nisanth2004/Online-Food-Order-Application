export const calculateCartTotals=(cartItems ,quantities)=>{
        // calculating

    const subtotal=cartItems.reduce((acc,food)=>acc+food.price * quantities[food.id],0);

    // calculating shiping charge
    const shipping=subtotal===0?0.0:10;
    const tax=subtotal*0.05 // 5%
    const total=subtotal+shipping+tax;

    return {subtotal ,shipping,tax,total};
}