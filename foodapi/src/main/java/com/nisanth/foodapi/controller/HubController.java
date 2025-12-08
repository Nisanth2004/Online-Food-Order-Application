package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.enumeration.OrderStatus;
import com.nisanth.foodapi.io.DeliveryMessage;
import com.nisanth.foodapi.io.HubUpdate;
import com.nisanth.foodapi.repository.OrderRepository;
import com.nisanth.foodapi.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/hub/order")
@RequiredArgsConstructor
public class HubController {

    private final OrderRepository orderRepo;

    private  final OrderService orderService;

    @PostMapping("/{orderId}/update")
    public ResponseEntity<?> addHubUpdate(
            @PathVariable String orderId,
            @RequestBody Map<String, String> req) {

        OrderEntity order = orderRepo.findById(orderId).orElse(null);
        if (order == null) return ResponseEntity.badRequest().body("Order not found");

        HubUpdate update = HubUpdate.builder()
                .hubName(req.get("hubName"))
                .staffName(req.get("staffName"))
                .message(req.get("message"))
                .time(LocalDateTime.now())
                .build();

        order.getHubHistory().add(update);

        // update main status
        order.setOrderStatus(com.nisanth.foodapi.enumeration.OrderStatus.ORDER_AT_HUB);

        orderRepo.save(order);

        return ResponseEntity.ok("Hub update added");
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrdersForHub(@RequestParam String hubName) {
        return ResponseEntity.ok(orderService.getOrdersForHub(hubName));
    }



}
