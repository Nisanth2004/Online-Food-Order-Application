package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.AccountEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AccountRepository extends MongoRepository<AccountEntity,String> {
    Optional<AccountEntity> findByEmail(String email);
}
