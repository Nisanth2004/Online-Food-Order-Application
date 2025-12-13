package com.nisanth.foodapi.repository.offers;

import com.nisanth.foodapi.entity.CouponEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CouponRepository
        extends MongoRepository<CouponEntity, String> {

    Optional<CouponEntity> findByCodeAndActiveTrue(String code);

    List<CouponEntity> findByActiveTrue();

    List<CouponEntity>
    findByActiveTrueAndExpiryDateAfter(LocalDateTime now);
}
