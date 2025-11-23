package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.io.CourierUpdateRequest;
import com.nisanth.foodapi.io.OrderRequest;
import com.nisanth.foodapi.io.OrderResponse;
import com.razorpay.RazorpayException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

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

  // admin panel-  retrive all orders
   List<OrderResponse> getOrdersOfAllUsers();

   // update the order status
   void  updateOrderStatus(String orderId,String status);

   void cancelOrder(String orderId);

    void requestCancelOrder(String orderId);       // customer requests cancel
    void approveCancelOrder(String orderId);      // admin approves cancel


    OrderResponse getOrderById(String orderId);

    List<OrderResponse>  getOrdersFiltered(String userId, String phone);

    void updateCourierDetails(String orderId, String courierName, String trackingId);



}
