package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.io.analytics.MonthlySalesDTO;
import com.nisanth.foodapi.io.analytics.StockHistoryDTO;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AnalyticsRepository extends MongoRepository<OrderEntity, String> {

    // ------------------------------
    // MONTHLY STOCK HISTORY
    // ------------------------------
    @Aggregation(pipeline = {
            "{ $unwind: '$items' }",
            "{ $group: { _id: { month: { $month: '$createdDate' }, year: { $year: '$createdDate' }, food: '$items.name' }, units: { $sum: '$items.quantity' } } }",
            "{ $project: { _id: 0, month: '$_id.month', year: '$_id.year', food: '$_id.food', units: 1 } }",
            "{ $sort: { year: 1, month: 1 } }"
    })
    List<StockHistoryDTO> getMonthlyStockHistory();


    // ------------------------------
    // MONTHLY SALES
    // ------------------------------
    @Aggregation(pipeline = {
            "{ $match: { paymentStatus: 'paid' } }",
            "{ $group: { _id: { month: { $month: '$createdDate' }, year: { $year: '$createdDate' } }, total: { $sum: '$amount' } } }",
            "{ $project: { _id: 0, month: '$_id.month', year: '$_id.year', total: 1 } }",
            "{ $sort: { year: 1, month: 1 } }"
    })
    List<MonthlySalesDTO> getMonthlySales();
}
