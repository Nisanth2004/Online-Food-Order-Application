package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.HubStaff;
import com.nisanth.foodapi.repository.HubStaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/hub")
@RequiredArgsConstructor
public class HubAuthController {

    private final HubStaffRepository hubStaffRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String hub = request.get("hubName");
        String pin = request.get("pin");

        return hubStaffRepo.findByHubNameAndPin(hub, pin)
                .map(staff -> ResponseEntity.ok(Map.of(
                        "status", "success",
                        "hubName", staff.getHubName(),
                        "staffName", staff.getStaffName()
                )))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid PIN")));
    }
}
