package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.StockLogEntity;
import com.nisanth.foodapi.io.StockHistoryDTO;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StockLogRepository extends MongoRepository<StockLogEntity, String> {

    List<StockLogEntity> findByFoodIdOrderByTimestampDesc(String foodId);

    List<StockLogEntity> findAllByOrderByTimestampDesc();

    @Aggregation(pipeline = {
            "{ $group: { _id: { month: { $month: '$timestamp' }, year: { $year: '$timestamp' }, food: '$foodName' }, units: { $sum: '$change' } } }",
            "{ $project: { _id: 0, month: '$_id.month', year: '$_id.year', food: '$_id.food', units: 1 } }",
            "{ $sort: { year: 1, month: 1 } }"
    })
    List<StockHistoryDTO> getMonthlyStockHistory();

}
