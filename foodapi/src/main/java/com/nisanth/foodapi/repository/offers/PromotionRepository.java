package com.nisanth.foodapi.repository.offers;

import com.nisanth.foodapi.entity.PromotionEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PromotionRepository extends MongoRepository<PromotionEntity,String> {
    List<PromotionEntity> findByActiveTrue();
}
