package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.UserEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepsitory extends MongoRepository<UserEntity,String> {

    Optional<UserEntity> findByEmail(String email);
}
