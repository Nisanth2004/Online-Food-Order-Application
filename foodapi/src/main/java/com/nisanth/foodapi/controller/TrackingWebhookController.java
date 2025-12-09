package com.nisanth.foodapi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.enumeration.OrderStatus;
import com.nisanth.foodapi.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/webhook/shiptracker")
@RequiredArgsConstructor
public class TrackingWebhookController {
    private final OrderRepository repo;

    @PostMapping
    public ResponseEntity<?> webhook(@RequestBody JsonNode body) {
        String trackingId = body.get("trackingId").asText();
        String status = body.get("status").asText();
        String timestamp = body.get("timestamp").asText();

        OrderEntity order = repo.findByCourierTrackingId(trackingId);
        if(order==null) return ResponseEntity.ok().build();

        order.addMessage(status, LocalDateTime.parse(timestamp), "courier", null);
        if(status.equalsIgnoreCase("Delivered")) order.setOrderStatus(OrderStatus.DELIVERED);

        repo.save(order);
        return ResponseEntity.ok().build();
    }
}

