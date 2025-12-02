package com.nisanth.foodapi.io;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class OrderResponse {
    private String id;
    private String userId;
    private String userAddress;
    private String phoneNumber;
    private String email;

    private double amount;
    private String paymentStatus;
    private String razorpayOrderId;

    private String orderStatus;
    private List<OrderItem> orderedItems;
    private String createdDate; // Add this
    private String courierName;
    private String courierTrackingId;

    private String courierTrackUrl;
    private List<DeliveryMessage> deliveryMessages;


    private double subtotal;
    private double tax;
    private double taxRate;

    private double shipping;
    private double grandTotal;
    // ✅ Add statusTimestamps to response
    private Map<String, LocalDateTime> statusTimestamps;


}
