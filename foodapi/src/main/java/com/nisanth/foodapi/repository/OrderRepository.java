package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.io.analytics.TopSellingDTO;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<OrderEntity,String> {

   List<OrderEntity> findByUserId(String userId);

   List<OrderEntity> findByPhoneNumber(String phoneNumber);

   Optional<OrderEntity> findByRazorpayOrderId(String razorpayOrderId);

   long countByOrderedItemsFoodId(String foodId);

   @Aggregation(pipeline = {
           "{ $unwind: '$orderedItems' }",
           "{ $lookup: { " +
                   "from: 'foods', " +
                   "let: { foodId: { $toObjectId: '$orderedItems.foodId' } }, " +
                   "pipeline: [ " +
                   "  { $match: { $expr: { $eq: ['$_id', '$$foodId'] } } } " +
                   "], " +
                   "as: 'food' " +
                   "} }",
           "{ $unwind: '$food' }",
           "{ $group: { " +
                   "_id: { id: '$food._id', name: '$food.name', imageUrl: '$food.imageUrl' }, " +
                   "totalQty: { $sum: '$orderedItems.quantity' } " +
                   "} }",
           "{ $sort: { totalQty: -1 } }",
           "{ $limit: 10 }"
   })
   List<TopSellingDTO> getTopSellingFoods();

   // For scheduler to fetch orders with tracking IDs
   List<OrderEntity> findByCourierTrackingIdNotNull();

   // For webhook to locate order via tracking id
   OrderEntity findByCourierTrackingId(String trackingId);



}
