package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.io.OrderRequest;
import com.nisanth.foodapi.io.OrderResponse;
import com.nisanth.foodapi.repository.OrderRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.AllArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service

public class OrderServiceImpl implements OrderService{

    @Autowired
    private  OrderRepository orderRepository;
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
