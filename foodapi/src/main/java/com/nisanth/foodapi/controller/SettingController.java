package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.Setting;
import com.nisanth.foodapi.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService service;


    @GetMapping
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(service.getSettings());
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody Setting setting) {
        try {
            Setting saved = service.updateSettings(setting);
            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException e) {
            // Validation errors
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));

        } catch (Exception e) {
            // Unknown server issues
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Server error: " + e.getMessage()
            ));
        }
    }


    @GetMapping("/single")
    public ResponseEntity<?> getSingleSetting() {
        Setting settings = service.getSettings();
        // Return only the keys you want the frontend to see
        Map<String, String> response = new HashMap<>();
        response.put("razorpayKey", settings.getRazorpayKey());
        return ResponseEntity.ok(response);
    }



        @GetMapping("/tax")
        public ResponseEntity<?> getcarUtils() {
            Setting setting = service.getSettings();

            return ResponseEntity.ok(Map.of(
                    "taxPercentage", setting.getTaxPercentage(),
                    "shippingCharge", setting.getShippingCharge()
            ));
        }



}
