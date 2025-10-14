package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.FoodEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends MongoRepository<FoodEntity, String> {

    // Count how many foods are linked to a specific categoryId
    long countByCategoryIdsContaining(String categoryId);

    // Find all foods that belong to a specific categoryId
    List<FoodEntity> findByCategoryIdsContaining(String categoryId);

    // Order foods: sponsored first, then featured, then others
    List<FoodEntity> findAllByOrderBySponsoredDescFeaturedDesc();

    Page<FoodEntity> findAllByOrderBySponsoredDescFeaturedDesc(Pageable pageable);
}
