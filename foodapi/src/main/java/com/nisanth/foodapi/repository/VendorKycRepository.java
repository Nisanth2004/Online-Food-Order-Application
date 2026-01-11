package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.VendorKycEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VendorKycRepository extends MongoRepository<VendorKycEntity,String> {
    Optional<VendorKycEntity> findByVendorId(String id);
}
