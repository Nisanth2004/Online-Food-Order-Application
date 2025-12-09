package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.entity.UserEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepsitory extends MongoRepository<UserEntity,String> {

    Optional<UserEntity> findByEmail(String email);
    List<FoodEntity> findByIdIn(List<String> ids);
}
