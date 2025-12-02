import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { calculateCartTotals } from '../../util/cartUtils';
import toast from "react-hot-toast";

const Cart = () => {
   const navigate = useNavigate();

   const { increaseQty, decreaseQty, quantities, foodList, removeFromCart, setQuantities } =
      useContext(StoreContext);

   const cartItems = foodList.filter((food) => quantities[food.id] > 0);

   const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities);

   // CLEAR CART FUNCTION
   const clearCart = () => {
      const updated = {};
      foodList.forEach(food => { updated[food.id] = 0; });
      setQuantities(updated);
      toast.success("Cart cleared");
   };

   return (
      <div className="container py-5 cart-page">

         <h1 className="cart-title text-center mb-5">
            <span className="gradient-text">Your Cart</span>
         </h1>

         <div className="row">

            {/* LEFT SIDE */}
            <div className="col-lg-8">

               {cartItems.length === 0 ? (
                  <div className="empty-cart text-center p-5 shadow-soft rounded-4">
                     <h4>Your cart is empty</h4>
                     <p className="text-muted">Add items to checkout faster!</p>
                     <Link to="/" className="btn btn-gradient mt-3">Start Shopping</Link>
                  </div>
               ) : (
                  <div className="card cart-card shadow-soft border-0 mb-4">
                     <div className="card-body">

                        {/* Clear Cart Button */}
                        <div className="d-flex justify-content-end mb-3">
                           <button className="clear-cart-btn" onClick={clearCart}>
                              Clear Cart
                           </button>
                        </div>

                        {cartItems.map((food) => (
                           <div key={food.id} className="row cart-item align-items-center mb-4">

                              {/* Image */}
                              <div className="col-4 col-md-3 text-center">
                                 <div className="img-wrapper">
                                    <img src={food.imageUrl} alt={food.name} className="cart-img zoom-img" />
                                 </div>
                              </div>

                              {/* Name */}
                              <div className="col-8 col-md-4">
                                 <h5 className="fw-semibold">{food.name}</h5>

                                 <div style={{ fontSize: 12, color: "#777" }}>
                                    {(food.categories || []).join(", ")}
                                 </div>
                              </div>

                              {/* Quantity + Stock */}
                              <div className="col-12 col-md-3 mt-3 mt-md-0">
                                 <div className="qty-stock-wrapper">

                                    {/* Quantity Box */}
                                    <div className="quantity-box animated-box">
                                       <button className="qty-btn" onClick={() => decreaseQty(food.id)}>−</button>
                                       <span className="qty-display">{quantities[food.id]}</span>
                                       <button
                                          className="qty-btn"
                                          onClick={() => {
                                             if (quantities[food.id] < food.stock) increaseQty(food.id);
                                             else toast.error(`Only ${food.stock} in stock`);
                                          }}
                                       >
                                          +
                                       </button>
                                    </div>

                                    {/* Stock Left */}
                                    <p className="text-muted small stock-left-text mb-0">
                                       Stock Left: {food.stock - quantities[food.id]}
                                    </p>

                                 </div>
                              </div>

                              {/* Price */}
                              <div className="col-12 col-md-2 text-center text-md-end mt-3 mt-md-0">
                                 <p className="fw-bold fs-5 price-animate">
                                    ₹{(food.price * quantities[food.id]).toFixed(2)}
                                 </p>
                                 <button
                                    className="btn btn-sm btn-remove"
                                    onClick={() => removeFromCart(food.id)}
                                 >
                                    Remove
                                 </button>
                              </div>

                           </div>
                        ))}

                     </div>
                  </div>
               )}

               <div className="text-start mb-4">
                  <Link to="/" className="btn btn-outline-secondary back-btn">
                     ← Continue Shopping
                  </Link>
               </div>
            </div>

            {/* RIGHT SIDE SUMMARY */}
            <div className="col-lg-4">
               <div className="card cart-summary shadow-soft border-0">
                  <div className="card-body">
                     
                     <h4 className="fw-bold mb-4">Order Summary</h4>

                <div className="summary-line">
   <span>Subtotal</span>
   <span>₹{subtotal.toFixed(2)}</span>
</div>

<div className="summary-line">
   <span>Shipping</span>
   <span>₹{shipping.toFixed(2)}</span>
</div>

<div className="summary-line">
   <span>Tax (5%)</span>
   <span>₹{tax.toFixed(2)}</span>
</div>

<hr />

<div className="summary-line total">
   <strong>Total</strong>
   <strong>₹{total.toFixed(2)}</strong>
</div>


                     <hr />

                     <div className="summary-line total">
                        <strong>Total</strong>
                        <strong>₹{subtotal === 0 ? 0.0 : total.toFixed(2)}</strong>
                     </div>

                     <button
                        className="btn btn-gradient w-100 mt-3"
                        disabled={cartItems.length === 0}
                        onClick={() => navigate('/order')}
                     >
                        Proceed to Checkout
                     </button>

                  </div>
               </div>
            </div>

         </div>

      </div>
   );
};

export default Cart;
