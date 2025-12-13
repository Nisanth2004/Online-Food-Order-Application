package com.nisanth.foodapi.io.order;

import com.nisanth.foodapi.io.order.OrderItem;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OrderRequest {


    private List<OrderItem> orderedItems;
    private String userAddress;
    private double amount;
    private String email;
    private String phoneNumber;

    private String orderStatus;
    private String courierName;
    private String courierTrackingId;
    private String courierTrackUrl;

    private String couponCode;
    private Double discountAmount;





}
