package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.enumeration.OrderStatus;
import com.nisanth.foodapi.io.util.DeliveryMessage;
import com.nisanth.foodapi.io.order.OrderRequest;
import com.nisanth.foodapi.io.user.OrderResponse;
import com.nisanth.foodapi.repository.OrderRepository;
import com.nisanth.foodapi.service.CourierService;
import com.nisanth.foodapi.service.OrderService;
import com.nisanth.foodapi.service.SmsService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final SmsService smsService;



    private final CourierService courierServiceAdmin;

    private final OrderRepository orderRepository;
    // ✅ Create order and initiate Razorpay payment
    @PostMapping("/create")
    public ResponseEntity<OrderResponse> createOrderWithPayment(@RequestBody OrderRequest request) throws RazorpayException {
        OrderResponse response = orderService.createOrderWithPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ✅ Verify Razorpay payment
    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody Map<String, String> paymentData) {
        orderService.verifyPayment(paymentData, "paid");
        return ResponseEntity.ok("Payment verified successfully");
    }

    // ✅ User: Get single order for tracking
    @GetMapping("/track/{orderId}")
    public ResponseEntity<OrderResponse> getUserOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    // ✅ Get all orders for logged-in user
    @GetMapping("/user")
    public ResponseEntity<List<OrderResponse>> getUserOrders() {
        return ResponseEntity.ok(orderService.getUserOrders());
    }

    @GetMapping("/admin/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    // ✅ Delete a specific order (user or admin)
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String orderId) {
        orderService.removeOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    // ✅ Admin: Get orders filtered by userId or phone
    @GetMapping("/filter")
    public ResponseEntity<List<OrderResponse>> filterOrders(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String phone
    ) {
        return ResponseEntity.ok(orderService.getOrdersFiltered(userId, phone));
    }


    // ✅ Admin: Get all orders across all users
    @GetMapping("/all")
    public ResponseEntity<List<OrderResponse>> getOrdersOfAllUsers() {
        return ResponseEntity.ok(orderService.getOrdersOfAllUsers());
    }

    // ✅ Admin: Update order status (e.g., DISPATCHED, DELIVERED, CANCELLED)
    @PatchMapping("/status/{orderId}")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status) {

        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok("Order status updated to " + status);
    }





    @PutMapping("/admin/courier/{orderId}")
    public ResponseEntity<?> updateCourierDetails(
            @PathVariable String orderId,
            @RequestBody Map<String, String> courierData) {

        try {
            String courierName = courierData.get("courierName");
            String trackingId = courierData.get("courierTrackingId");

            if (courierName == null || courierName.isBlank()) {
                return ResponseEntity.badRequest().body("Courier name cannot be empty");
            }
            if (trackingId == null || trackingId.isBlank()) {
                return ResponseEntity.badRequest().body("Tracking ID cannot be empty");
            }

            // Fetch order before update
            OrderResponse beforeUpdate = orderService.getOrderById(orderId);
            if (beforeUpdate == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
            }

            // Update courier info in DB (service sets ORDER_PACKED + timestamp)
            orderService.updateCourierDetails(orderId, courierName, trackingId);

            // Fetch updated order (now contains courierTrackUrl)
            OrderResponse updatedOrder = orderService.getOrderById(orderId);

            // Construct final tracking URL (guard against nulls)
            String baseUrl = updatedOrder.getCourierTrackUrl() != null ? updatedOrder.getCourierTrackUrl() : "";
            String finalTrackingUrl = baseUrl.endsWith("/") ? baseUrl + trackingId : baseUrl + trackingId;

            String smsMessage =
                    "Hi " + updatedOrder.getUserId() + ", your " + "Cocogrand Organics" +
                            " order has been shipped.\n" +
                            "Courier: " + courierName + "\n" +
                            "Tracking ID: " + trackingId + "\n" +
                            "Track here: " + finalTrackingUrl + "\n" +
                            "Thank you for choosing us!";


            // Normalize phone: if number already starts with '+' assume good, else prepend +91
            String rawPhone = updatedOrder.getPhoneNumber() == null ? "" : updatedOrder.getPhoneNumber().trim();
            String phone = rawPhone.startsWith("+") ? rawPhone : ("+91" + rawPhone);

            // Try sending SMS via Twilio-backed SmsService
            try {
                smsService.sendSms(phone, smsMessage);
            } catch (Exception smsEx) {
                // Log and return a response indicating SMS failed but DB update succeeded
                smsEx.printStackTrace();
                return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(Map.of(
                        "message", "Courier updated but SMS sending failed",
                        "trackingUrl", finalTrackingUrl,
                        "status", "ORDER_PACKED",
                        "smsError", smsEx.getMessage()
                ));
            }

            // Success - DB updated and SMS sent
            return ResponseEntity.ok(Map.of(
                    "message", "Courier updated & SMS sent",
                    "trackingUrl", finalTrackingUrl,
                    "status", "ORDER_PACKED"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update courier details");
        }
    }


    // ✅ User: Directly cancel their own order
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable String orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok("Order cancelled successfully");
    }

    // ✅ User: Request cancellation
    @PatchMapping("/{orderId}/request-cancel")
    public ResponseEntity<String> requestCancelOrder(@PathVariable String orderId) {
        orderService.requestCancelOrder(orderId);
        return ResponseEntity.ok("Cancellation request sent");
    }

    // ✅ Admin: Approve cancellation
    @PatchMapping("/approve-cancel/{orderId}")
    public ResponseEntity<String> approveCancelOrder(@PathVariable String orderId) {
        orderService.approveCancelOrder(orderId);
        return ResponseEntity.ok("Order cancellation approved");
    }


    @PostMapping("/partner/{id}/message")
    public ResponseEntity<?> addDeliveryMessage(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        String message = body.get("message");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message required");
        }

        OrderEntity order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.status(404).body("Order not found");
        }

        if (order.getDeliveryMessages() == null) {
            order.setDeliveryMessages(new ArrayList<>());
        }

        // Use builder to create DeliveryMessage
        DeliveryMessage deliveryMessage = DeliveryMessage.builder()
                .message(message)
                .timestamp(LocalDateTime.now())
                .actor(body.getOrDefault("actor", "partner")) // optional
                .reason(body.getOrDefault("reason", null))    // optional
                .build();

        order.getDeliveryMessages().add(deliveryMessage);
        orderRepository.save(order);

        return ResponseEntity.ok("Message saved");
    }

    @GetMapping("/orders/{orderId}/messages")
    public ResponseEntity<?> getDeliveryMessages(@PathVariable String orderId) {
        OrderEntity order = orderRepository.findById(orderId).orElse(null);

        if (order == null) {
            return ResponseEntity.status(404).body("Order not found");
        }

        return ResponseEntity.ok(order.getDeliveryMessages());
    }


    @PutMapping("/update-address/{orderId}")
    public ResponseEntity<String> updateAddress(
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {

        orderService.updateOrderAddress(orderId, body.get("address"));
        return ResponseEntity.ok("Address updated");
    }

    @PutMapping("/update-phone/{id}")
    public ResponseEntity<?> updatePhone(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        String newPhone = body.get("phone");
        if (newPhone == null || newPhone.isBlank()) {
            return ResponseEntity.badRequest().body("Phone number cannot be empty");
        }

        Optional<OrderEntity> optional = orderRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }

        OrderEntity order = optional.get();

        // Block editing after SHIPPED
        if (order.getOrderStatus().ordinal() >= OrderStatus.SHIPPED.ordinal()) {
            return ResponseEntity.badRequest().body("Phone cannot be updated after shipping");
        }

        order.setPhoneNumber(newPhone);
        orderRepository.save(order);

        return ResponseEntity.ok("Phone updated");
    }

    // ✅ Delivery Partner: Get single hub order (ORDER_AT_HUB or OUT_FOR_DELIVERY)
    @GetMapping("/hub/{orderId}")
    public ResponseEntity<?> getHubOrderById(@PathVariable String orderId) {

        OrderResponse order = orderService.getOrderById(orderId);

        if (order == null) {
            return ResponseEntity.status(404).body("Order not found");
        }

        // Delivery partner should only see hub-level and delivery-level orders
        if (!order.getOrderStatus().equals(OrderStatus.ORDER_AT_HUB.toString()) &&
                !order.getOrderStatus().equals(OrderStatus.OUT_FOR_DELIVERY.toString())) {
            System.out.println("STATUS FROM DB = " + order.getOrderStatus());
            System.out.println("COMPARE 1 = " + OrderStatus.ORDER_AT_HUB.toString());
            System.out.println("COMPARE 2 = " + OrderStatus.OUT_FOR_DELIVERY.toString());

            return ResponseEntity.status(403).body("Not allowed. Order not yet at hub.");



        }

        return ResponseEntity.ok(order);
    }




}
