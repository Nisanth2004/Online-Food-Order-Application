package com.nisanth.foodapi.service;

import com.nisanth.foodapi.io.OrderRequest;
import com.nisanth.foodapi.io.OrderResponse;
import com.razorpay.RazorpayException;

public interface OrderService {

   OrderResponse createOrderWithPayment(OrderRequest request) throws RazorpayException;
}
