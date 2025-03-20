package com.nisanth.foodapi.service;

import com.nisanth.foodapi.io.FoodRequest;
import com.nisanth.foodapi.io.FoodResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FoodService {

 String uploadFile(MultipartFile file);

 FoodResponse addFood(FoodRequest request, MultipartFile file);

 List<FoodResponse> readFoods();


 FoodResponse readFood(String id);


 boolean deleteFile(String filename);

 void deleteFood(String id);
}
