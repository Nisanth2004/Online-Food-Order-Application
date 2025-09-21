package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.FoodEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends MongoRepository<FoodEntity,String> {
    long countByCategory(String category);
    List<FoodEntity> findByCategory(String category);
    List<FoodEntity> findAllByOrderBySponsoredDescFeaturedDesc();
}
