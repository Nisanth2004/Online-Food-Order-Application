package com.nisanth.foodapi.service;

import com.nisanth.foodapi.io.CartRequest;
import com.nisanth.foodapi.io.CartResponse;

public interface CartService {

   CartResponse addToCart(CartRequest request);
}
