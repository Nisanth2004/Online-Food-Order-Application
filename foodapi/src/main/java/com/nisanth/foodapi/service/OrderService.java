package com.nisanth.foodapi.service;

import com.nisanth.foodapi.io.OrderRequest;
import com.nisanth.foodapi.io.OrderResponse;
import com.razorpay.RazorpayException;

import java.util.List;
import java.util.Map;

public interface OrderService {

   OrderResponse createOrderWithPayment(OrderRequest request) throws RazorpayException;

   // once the complete the paymeny we had to verify that
  void verifyPayment(Map<String,String> paymentData,String status);

  // get list of orders
   List<OrderResponse> getUserOrders();

   // remove the order for the particular user id
  void   removeOrder(String orderId);

}
