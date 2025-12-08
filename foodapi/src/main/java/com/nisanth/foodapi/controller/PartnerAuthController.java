package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.PartnerEntity;
import com.nisanth.foodapi.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/partner/auth")
@RequiredArgsConstructor
public class PartnerAuthController {

    private final PartnerRepository repository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String phone = body.get("phone");
        String password = body.get("password");
        String role = body.get("role");

        PartnerEntity p = PartnerEntity.builder()
                .name(name)
                .phone(phone)
                .password(password)
                .role(role)
                .build();

        repository.save(p);

        return ResponseEntity.ok("Partner registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String password = body.get("password");

        PartnerEntity p = repository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Invalid phone"));

        if (!p.getPassword().equals(password))
            throw new RuntimeException("Invalid password");

        return ResponseEntity.ok(Map.of(
                "id", p.getId(),
                "name", p.getName(),
                "role", p.getRole()
        ));
    }
}
