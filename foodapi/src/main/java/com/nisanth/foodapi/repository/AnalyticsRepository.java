package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.OrderEntity;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Map;

public interface AnalyticsRepository extends MongoRepository<OrderEntity, String> {

    // ------------------------------
    // MONTHLY SALES
    // ------------------------------
    @Aggregation(pipeline = {
            "{ $group: { _id: { month: { $month: '$timestamp' }, year: { $year: '$timestamp' } }, units: { $sum: '$change' } } }",
            "{ $project: { _id: 0, month: '$_id.month', year: '$_id.year', units: 1 } }",
            "{ $sort: { year: 1, month: 1 } }"
    })
    List<Map<String, Object>> getMonthlyStockHistory();



    // ------------------------------
    // MONTHLY STOCK HISTORY
    // ------------------------------
    @Aggregation(pipeline = {
            "{ $match: { paymentStatus: 'paid' } }",
            "{ $group: { _id: { month: { $month: '$createdDate' }, year: { $year: '$createdDate' } }, total: { $sum: '$amount' } } }",
            "{ $project: { _id: 0, month: '$_id.month', year: '$_id.year', total: 1 } }",
            "{ $sort: { year: 1, month: 1 } }"
    })
    List<Map<String, Object>> getMonthlySales();

}
