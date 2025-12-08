package com.nisanth.foodapi.repository;


import com.nisanth.foodapi.entity.PartnerLocation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PartnerLocationRepository extends MongoRepository<PartnerLocation, String> {

    Optional<PartnerLocation> findTopByPartnerIdOrderByCreatedAtDesc(String partnerId);

    Optional<PartnerLocation> findTopByOrderIdOrderByCreatedAtDesc(String orderId);
}
