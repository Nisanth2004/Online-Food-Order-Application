package com.nisanth.foodapi.entity;

import com.nisanth.foodapi.enumeration.OrderStatus;
import com.nisanth.foodapi.io.util.DeliveryMessage;
import com.nisanth.foodapi.io.order.OrderItem;
import com.nisanth.foodapi.io.HubUpdate;
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
    private boolean stockRestored = false;

    // courier info
    private String courierName;
    private String courierTrackingId;
    private String courierTrackUrl;

    // delivery timeline messages (used in UI)
    @Builder.Default
    private List<DeliveryMessage> deliveryMessages = new ArrayList<>();

    // hub history
    @Builder.Default
    private List<HubUpdate> hubHistory = new ArrayList<>();

    // orderStatus → timestamp (Placed, Packed, Shipped, OutForDelivery, Delivered)
    @Builder.Default
    private Map<String, LocalDateTime> statusTimestamps = new HashMap<>();

    // POD images (URLs)
    @Builder.Default
    private List<String> podImageUrls = new ArrayList<>();

    // delivery boy assigned id
    private String assignedDeliveryBoyId;

    @Builder.Default
    private boolean podVerified = false;
    public void addMessage(String message, LocalDateTime time, String actor, String reason) {
        if (this.deliveryMessages == null) this.deliveryMessages = new ArrayList<>();

        this.deliveryMessages.add(
                DeliveryMessage.builder()
                        .message(message)
                        .timestamp(time)
                        .actor(actor)
                        .reason(reason)
                        .build()
        );
    }

}
