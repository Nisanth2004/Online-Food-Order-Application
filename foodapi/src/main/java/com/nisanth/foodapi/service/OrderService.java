package com.nisanth.foodapi.service;

import com.nisanth.foodapi.io.order.OrderRequest;
import com.nisanth.foodapi.io.order.OrderResponse;
import com.razorpay.RazorpayException;
import org.springframework.web.multipart.MultipartFile;

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

    void updateOrderAddress(String orderId, String newAddress);

    // in OrderService interface
    void setOrderStatusWithTimestamp(String orderId, String status, String actor, String message,String reason);
    List<OrderResponse> getOrdersForHub(String hubName);
    List<OrderResponse> getOrdersForDeliveryBoy(String deliveryBoyId);
    String savePodImage(String orderId, MultipartFile file) throws Exception;
    void assignDeliveryBoy(String orderId, String deliveryBoyId);




}
