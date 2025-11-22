package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.io.OrderRequest;
import com.nisanth.foodapi.io.OrderResponse;
import com.nisanth.foodapi.service.OrderService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

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

    // ✅ Delete a specific order (user or admin)
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String orderId) {
        orderService.removeOrder(orderId);
        return ResponseEntity.noContent().build();
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
