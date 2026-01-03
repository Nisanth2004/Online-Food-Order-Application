package com.nisanth.foodapi.repository;


import com.nisanth.foodapi.entity.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findByName(String name);
    boolean existsByName(String name);

    Optional<Category> findByNameIgnoreCase(String category);
}
