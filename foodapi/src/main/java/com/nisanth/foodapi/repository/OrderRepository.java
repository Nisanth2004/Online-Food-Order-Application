package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.OrderEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<OrderEntity,String> {

   List<OrderEntity> findByUserId(String userId);

   List<OrderEntity> findByPhoneNumber(String phoneNumber);

   Optional<OrderEntity> findByRazorpayOrderId(String razorpayOrderId);

   long countByOrderedItemsFoodId(String foodId);


}
