package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.enumeration.AttemptReason;
import com.nisanth.foodapi.enumeration.OrderStatus;
import com.nisanth.foodapi.io.DeliveryMessage;
import com.nisanth.foodapi.repository.OrderRepository;
import com.nisanth.foodapi.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/delivery/actions")
@RequiredArgsConstructor
public class DeliveryActionsController {

    private final OrderRepository orderRepo;

    private final OrderService orderService;

    @PostMapping("/{orderId}/out-for-delivery")
    public ResponseEntity<?> markOutForDelivery(@PathVariable String orderId) {
        OrderEntity order = orderRepo.findById(orderId).orElse(null);
        if (order == null) return ResponseEntity.badRequest().body("Order not found");

        order.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.getDeliveryMessages().add(
                DeliveryMessage.builder()
                        .message("Order is out for delivery")
                        .timestamp(LocalDateTime.now())
                        .build()
        );

        orderRepo.save(order);
        return ResponseEntity.ok("Marked as Out for delivery");
    }

    @PostMapping("/{orderId}/attempt")
    public ResponseEntity<?> attemptedDelivery(
            @PathVariable String orderId,
            @RequestBody Map<String, String> req) {

        String reasonStr = req.getOrDefault("reason", "OTHER");
        AttemptReason reason = AttemptReason.fromString(reasonStr);

        String message = "Attempted delivery: " + reason.name().replace("_", " ");
        orderService.setOrderStatusWithTimestamp(orderId, "OUT_FOR_DELIVERY", "delivery-boy", message, reason.name());

        return ResponseEntity.ok(Map.of("message", "Attempt recorded", "reason", reason.name()));
    }

    @PostMapping("/{orderId}/delivered")
    public ResponseEntity<?> markDelivered(
            @PathVariable String orderId,
            @RequestBody Map<String, String> req) {

        OrderEntity order = orderRepo.findById(orderId).orElse(null);
        if (order == null) return ResponseEntity.badRequest().body("Order not found");

        order.setOrderStatus(OrderStatus.DELIVERED);

        order.getDeliveryMessages().add(
                DeliveryMessage.builder()
                        .message("Order delivered by " + req.get("deliveryBoy"))
                        .timestamp(LocalDateTime.now())
                        .build()
        );

        orderRepo.save(order);
        return ResponseEntity.ok("Delivered");
    }

    @PostMapping("/{orderId}/cancel-request")
    public ResponseEntity<?> requestCancel(@PathVariable String orderId, @RequestBody Map<String,String> req) {
        String actor = req.getOrDefault("actor","user");
        String reason = req.getOrDefault("reason","Not specified");

        orderService.setOrderStatusWithTimestamp(orderId, "CANCEL_REQUESTED", actor, reason, reason);

        return ResponseEntity.ok(Map.of("message","Cancel request recorded"));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> approveCancel(@PathVariable String orderId, @RequestBody Map<String,String> req) {
        String actor = req.getOrDefault("actor","admin");
        String reason = req.getOrDefault("reason","Cancelled by admin");

        orderService.setOrderStatusWithTimestamp(orderId, "CANCELLED", actor, reason, reason);

        return ResponseEntity.ok(Map.of("message","Order cancelled"));
    }

    @PostMapping("/verify-pod/{orderId}")
    public ResponseEntity<?> verifyPod(@PathVariable String orderId, @RequestBody Map<String,String> req) {
        String verifiedBy = req.getOrDefault("verifiedBy", "admin");

        OrderEntity order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getPodImageUrls() == null || order.getPodImageUrls().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error","No POD uploaded"));
        }

        order.setPodVerified(true);
        order.getDeliveryMessages().add(
                DeliveryMessage.builder()
                        .message("POD verified by " + verifiedBy)
                        .timestamp(LocalDateTime.now())
                        .build()
        );

        // Once verified, mark order as delivered automatically
        order.setOrderStatus(OrderStatus.DELIVERED);
        order.getStatusTimestamps().put("DELIVERED", LocalDateTime.now());

        orderRepo.save(order);

        return ResponseEntity.ok(Map.of("message","POD verified, order marked delivered"));
    }

}
