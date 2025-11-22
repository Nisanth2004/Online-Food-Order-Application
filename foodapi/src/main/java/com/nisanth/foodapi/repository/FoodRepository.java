package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.FoodEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface FoodRepository extends MongoRepository<FoodEntity, String> {

    // Count how many foods are linked to a specific categoryId
    long countByCategoryIdsContaining(String categoryId);

    // Find all foods that belong to a specific categoryId
    List<FoodEntity> findByCategoryIdsContaining(String categoryId);

    // Order foods: sponsored first, then featured, then others
    List<FoodEntity> findAllByOrderBySponsoredDescFeaturedDesc();

    Page<FoodEntity> findAllByOrderBySponsoredDescFeaturedDesc(Pageable pageable);


    //  TOP SELLING FOODS
    @Aggregation(pipeline = {
            "{ $lookup: { from: 'orders', localField: '_id', foreignField: 'items.foodId', as: 'orderItems' } }",
            "{ $unwind: '$orderItems' }",
            "{ $group: { _id: { id: '$_id', name: '$name', imageUrl: '$imageUrl' }, totalQty: { $sum: '$orderItems.items.qty' } } }",
            "{ $sort: { totalQty: -1 } }",
            "{ $limit: 10 }"
    })
    List<Map<String, Object>> getTopSellingFoods();

    // LOW STOCK ITEMS
    @Aggregation(pipeline = {
            "{ $match: { stock: { $lte: 5 } } }",
            "{ $project: { _id: 1, name: 1, stock: 1, imageUrl: 1 } }",
            "{ $sort: { stock: 1 } }"
    })
    List<Map<String, Object>> getLowStockItems();
}
