package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.StockLogEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StockLogRepository extends MongoRepository<StockLogEntity, String> {

    List<StockLogEntity> findByFoodIdOrderByTimestampDesc(String foodId);

    List<StockLogEntity> findAllByOrderByTimestampDesc();
}
