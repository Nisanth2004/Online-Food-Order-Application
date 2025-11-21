package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.Category;
import com.nisanth.foodapi.io.FoodRequest;
import com.nisanth.foodapi.io.FoodResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FoodService {

 String uploadFile(MultipartFile file);

 FoodResponse addFood(FoodRequest request, MultipartFile file);

 List<FoodResponse> readFoods();


 FoodResponse readFood(String id);


    Page<FoodResponse> getFoodsPaginated(int page, int size, String category, String search, String sort);

    boolean deleteFile(String filename);

 void deleteFood(String id);

 List<Category> getCategories();

   // adjust stock by delta (negative reduces, positive increases)
    void adjustStock(String foodId, int delta);
}
