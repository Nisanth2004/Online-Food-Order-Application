package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.DeliveryBoy;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DeliveryBoyRepository extends MongoRepository<DeliveryBoy, String> {
    Optional<DeliveryBoy> findByEmail(String email);
}
