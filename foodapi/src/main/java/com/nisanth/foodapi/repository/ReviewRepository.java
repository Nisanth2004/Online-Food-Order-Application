package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.ReviewEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<ReviewEntity, String> {
    List<ReviewEntity> findByFoodId(String foodId);
}
