package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.Courier;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CourierRepository extends MongoRepository<Courier,String> {
    Optional<Courier> findByName(String courierName);
}
