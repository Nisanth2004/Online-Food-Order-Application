package com.nisanth.foodapi.service;

import com.nisanth.foodapi.io.cart.CartRequest;
import com.nisanth.foodapi.io.cart.CartResponse;

public interface CartService {

   CartResponse addToCart(CartRequest request);

   CartResponse getCart();

   void clearCart();

   CartResponse removeFromCart(CartRequest cartRequest);
}
