package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.VendorEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VendorRepository extends MongoRepository<VendorEntity,String> {
    Optional<VendorEntity> findByAccountId(String accountId);
}
