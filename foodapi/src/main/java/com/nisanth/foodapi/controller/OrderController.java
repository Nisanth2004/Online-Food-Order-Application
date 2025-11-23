package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.io.OrderRequest;
import com.nisanth.foodapi.io.OrderResponse;
import com.nisanth.foodapi.service.OrderService;
import com.nisanth.foodapi.service.SmsService;
import com.nisanth.foodapi.util.MessageUtil;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final SmsService smsService;

    private final MessageUtil messageUtil;

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

            // Fetch order
            OrderResponse order = orderService.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.status(404).body("Order not found");
            }

            // Fetch courier base tracking URL


            // Build tracking link
            String fullTrackingUrl =order.getCourierTrackUrl() + trackingId;

            // Update DB
            orderService.updateCourierDetails(orderId, courierName, trackingId);

            // SMS message
            String smsMessage =
                    "Your order has been shipped!\n" +
                            "Courier: " + courierName + "\n" +
                            "Tracking ID: " + trackingId + "\n\n" +
                            "Track here: " + fullTrackingUrl;

            // Format phone number
            String phone = "+91" + order.getPhoneNumber();

            // Send SMS via AWS SNS
            messageUtil.sendMessage(phone, smsMessage);

            return ResponseEntity.ok(Map.of(
                    "message", "Courier updated & SMS sent",
                    "status", "OUT_FOR_DELIVERY"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to update courier details");
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
}
