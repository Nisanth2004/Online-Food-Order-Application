package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.DeliveryBoy;
import com.nisanth.foodapi.repository.DeliveryBoyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/delivery-boy")
@RequiredArgsConstructor
public class DeliveryBoyAuthController {

    private final DeliveryBoyRepository deliveryBoyRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {

        DeliveryBoy boy = deliveryBoyRepo.findByEmail(req.get("email")).orElse(null);
        if (boy == null || !BCrypt.checkpw(req.get("password"), boy.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "id", boy.getId(),
                "name", boy.getName(),
                "hubName", boy.getHubName()
        ));
    }
}
