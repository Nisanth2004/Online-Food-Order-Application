package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.PartnerEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PartnerRepository extends MongoRepository<PartnerEntity, String> {
    Optional<PartnerEntity> findByPhone(String phone);
}
