package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.io.analytics.LowStockDTO;
import com.nisanth.foodapi.io.analytics.TopSellingDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

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
            "{ $unwind: '$orderedItems' }",
            "{ $lookup: { from: 'foods', localField: 'orderedItems.foodId', foreignField: '_id', as: 'food' } }",
            "{ $unwind: '$food' }",
            "{ $group: { " +
                    " _id: { id: '$food._id', name: '$food.name', imageUrl: '$food.imageUrl' }, " +
                    " totalQty: { $sum: '$orderedItems.quantity' } " +
                    "} }",
            "{ $sort: { totalQty: -1 } }",
            "{ $limit: 10 }"
    })
    List<TopSellingDTO> getTopSellingFoods();




    // LOW STOCK ITEMS
    @Aggregation(pipeline = {
            "{ $match: { stock: { $lte: 5 } } }",
            "{ $project: { _id: 0, id: '$_id', name: 1, stock: 1, imageUrl: 1 } }",
            "{ $sort: { stock: 1 } }"
    })
    List<LowStockDTO> getLowStockItems();

    List<FoodEntity> findByIdIn(List<String> ids);

    List<FoodEntity> findTop8ByBestSellerTrueOrderBySoldCountDesc();

    // 🔥 Top Selling
    List<FoodEntity> findTop8ByOrderBySoldCountDesc();

    // 🔥 Featured Only
    List<FoodEntity> findTop8ByFeaturedTrue();

}
