package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.PartnerLocation;
import com.nisanth.foodapi.io.LocationRequest;
import com.nisanth.foodapi.service.PartnerLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
public class PartnerLocationController {

    private final PartnerLocationService service;

    // Delivery partner sends GPS every 30 sec
    @PostMapping("/location")
    public String pushLocation(
            @RequestHeader("X-Partner-Id") String partnerId,
            @RequestParam(required = false) String orderId,
            @RequestBody LocationRequest req
    ) {
        service.saveLocation(partnerId, orderId, req);
        return "OK";
    }

    // Customer app can fetch live location
    @GetMapping("/location/latest")
    public PartnerLocation getLatest(
            @RequestParam String orderId
    ) {
        return service.getLatestLocationByOrder(orderId);
    }
}
