package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.PartnerLocation;
import com.nisanth.foodapi.io.LocationRequest;
import com.nisanth.foodapi.repository.PartnerLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PartnerLocationService {

    private final PartnerLocationRepository repo;

    public void saveLocation(String partnerId, String orderId, LocationRequest req) {
        PartnerLocation loc = PartnerLocation.builder()
                .partnerId(partnerId)
                .orderId(orderId)
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .createdAt(Instant.now())
                .build();

        repo.save(loc);
    }

    public PartnerLocation getLatestLocationByPartner(String partnerId) {
        return repo.findTopByPartnerIdOrderByCreatedAtDesc(partnerId).orElse(null);
    }

    public PartnerLocation getLatestLocationByOrder(String orderId) {
        return repo.findTopByOrderIdOrderByCreatedAtDesc(orderId).orElse(null);
    }
}
