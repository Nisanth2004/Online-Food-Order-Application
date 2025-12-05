package com.nisanth.foodapi.entity;

import com.nisanth.foodapi.enumeration.OrderStatus;
import com.nisanth.foodapi.io.DeliveryMessage;
import com.nisanth.foodapi.io.OrderItem;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {

    @Id
    private String id;

    private String userId;
    private String userAddress;
    private String phoneNumber;
    private String email;

    @Builder.Default
    private List<OrderItem> orderedItems = new ArrayList<>();

    private double amount;

    // payment info
    private String paymentStatus;
    private String razorpayOrderId;
    private String razorPaySignature;
    private String razorpayPaymentId;

    // enum status
    private OrderStatus orderStatus;

    @CreatedDate
    private Instant createdDate;

    @Builder.Default
    private Boolean stockRestored = false;

    public boolean isStockRestored() {
        return stockRestored;
    }

    // courier info
    private String courierName;
    private String courierTrackingId;
    private String courierTrackUrl;

    // delivery timeline messages (used in UI)
    @Builder.Default
    private List<DeliveryMessage> deliveryMessages = new ArrayList<>();

    // orderStatus → timestamp (Placed, Packed, Shipped, OutForDelivery, Delivered)
    @Builder.Default
    private Map<String, LocalDateTime> statusTimestamps = new HashMap<>();
}
