package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.Setting;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SettingRepository extends MongoRepository<Setting, String> {}
