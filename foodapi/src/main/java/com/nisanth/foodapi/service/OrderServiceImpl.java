package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.io.OrderRequest;
import com.nisanth.foodapi.io.OrderResponse;
import com.nisanth.foodapi.repository.CartRepository;
import com.nisanth.foodapi.repository.OrderRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.AllArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service

public class OrderServiceImpl implements OrderService{

    @Autowired
    private  OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private  UserService userService;

    @Value("${razorpay_key}")
    private String RAZORPAY_KEY;

    @Value("${razorpay_secret}")
    private String RAZORPAY_SECRET;

    @Override
    public OrderResponse createOrderWithPayment(OrderRequest request) throws RazorpayException {

        // request to entity
      OrderEntity newOrder = convertToEntity(request);
     newOrder= orderRepository.save(newOrder);

     // create razorpay payment order using razorpay client
        RazorpayClient razorpayClient=new RazorpayClient(RAZORPAY_KEY,RAZORPAY_SECRET);
        JSONObject orderRequest=new JSONObject();
        orderRequest.put("amount",newOrder.getAmount());
        orderRequest.put("currency","INR");
        orderRequest.put("payment_capture",1);

        // create the order
       Order razorpayOrder= razorpayClient.orders.create(orderRequest);
       newOrder.setRazorpayOrderId(razorpayOrder.get("id"));

       // get the user id
       String loggedInUserId= userService.findByUserId();
       newOrder.setUserId(loggedInUserId);
      return convertToResponse(newOrder);
    }

    @Override
    public void verifyPayment(Map<String, String> paymentData, String status) {
       String razorpayOrderId= paymentData.get("razorpay_order_id");

       // get the respective order id
       OrderEntity exisitingOrder=orderRepository.findByRazorpayOrderId(razorpayOrderId)
               .orElseThrow(()->new RuntimeException("Order Not Found"));

       exisitingOrder.setPaymentStatus(status);
       exisitingOrder.setRazorPaySignature(paymentData.get("razorpay_signature"));
       exisitingOrder.setRazorpayPaymentId(paymentData.get("razorpay_payment_id"));
       orderRepository.save(exisitingOrder);

       if("paid".equalsIgnoreCase(status))
       {
           cartRepository.deleteByUserId(exisitingOrder.getUserId());
       }

    }

    @Override
    public List<OrderResponse> getUserOrders() {
        String loggedInUserId=userService.findByUserId();
      List<OrderEntity> list= orderRepository.findByUserId(loggedInUserId);
      return list.stream().map(entity->convertToResponse(entity)).collect(Collectors.toList());
    }

    @Override
    public void removeOrder(String orderId) {
        orderRepository.deleteById(orderId);

    }

    private OrderResponse convertToResponse(OrderEntity newOrder) {
       return OrderResponse.builder()
                .id(newOrder.getId())
                .amount(newOrder.getAmount())
                .userAddress(newOrder.getUserAddress())
                .userId(newOrder.getUserId())
                .razorpayOrderId(newOrder.getRazorpayOrderId())
                .paymentStatus(newOrder.getPaymentStatus())
                .orderStatus(newOrder.getOrderStatus())
               .email(newOrder.getEmail())
               .phoneNumber(newOrder.getPhoneNumber())
               .orderedItems(newOrder.getOrderedItems())
                .build();

    }

    private OrderEntity convertToEntity(OrderRequest request) {
       return OrderEntity.builder()
                .userAddress(request.getUserAddress())
                .amount(request.getAmount())
                .orderedItems(request.getOrderedItems())
               .phoneNumber(request.getPhoneNumber())
               .email(request.getEmail())
               .orderStatus(request.getOrderStatus())
                .build();
    }
}
