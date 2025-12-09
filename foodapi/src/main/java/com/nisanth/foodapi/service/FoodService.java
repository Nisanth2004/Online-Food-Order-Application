package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.Category;
import com.nisanth.foodapi.io.food.FoodRequest;
import com.nisanth.foodapi.io.food.FoodResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FoodService {

 String uploadFile(MultipartFile file);

 FoodResponse addFood(FoodRequest request, MultipartFile file);

    FoodResponse updateFood(String id, FoodRequest request, MultipartFile file);

    List<FoodResponse> readFoods();


 FoodResponse readFood(String id);


    Page<FoodResponse> getFoodsPaginated(int page, int size, String category, String search, String sort);

    boolean deleteFile(String filename);

 void deleteFood(String id);

 List<Category> getCategories();


    // Stock operations
    /**
     * Adjusts stock by delta (can be negative to deduct).
     * Ensures stock does not go below zero and updates outOfStock/lowStock flags.
     */
    void adjustStock(String foodId, int delta);

    /**
     * Set stock to an absolute value (>=0).
     * Ensures outOfStock/lowStock flags are updated.
     */
    void setStock(String foodId, int newStock);

    /**
     * Try to reserve `qty` units of a food item atomically.
     * Returns true if reservation succeeded (stock decremented).
     * Returns false if insufficient stock.
     */
    boolean tryReserveStock(String foodId, int qty);

    /**
     * Release previously reserved quantity (increment stock by qty).
     * Use when order is cancelled or payment fails.
     */
    void releaseReservedStock(String foodId, int qty);

}
