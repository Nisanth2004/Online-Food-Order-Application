package com.nisanth.foodapi.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nisanth.foodapi.entity.Category;
import com.nisanth.foodapi.io.food.FoodRequest;
import com.nisanth.foodapi.io.food.FoodResponse;
import com.nisanth.foodapi.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin("*")
public class FoodController {

    @Autowired
    private  FoodService foodService;


    // Build Add Food Rest API
    @PostMapping
    public FoodResponse addFood(@RequestPart("food") String foodString,
                                @RequestPart("file")MultipartFile file)
    {

        // convert to request
        ObjectMapper objectMapper=new ObjectMapper();
        FoodRequest request=null;
        try
        {
            request = objectMapper.readValue(foodString,FoodRequest.class);

        }catch (JsonProcessingException exception)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid JSON Format");

        }
        FoodResponse response=  foodService.addFood(request,file);
        return response;


    }

    @PutMapping("/{id}")
    public FoodResponse updateFood(
            @PathVariable String id,
            @RequestPart("food") String foodString,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {

        ObjectMapper objectMapper = new ObjectMapper();
        FoodRequest request;

        try {
            request = objectMapper.readValue(foodString, FoodRequest.class);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON format");
        }

        return foodService.updateFood(id, request, file);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFoods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort
    ) {

        Page<FoodResponse> foodPage = foodService.getFoodsPaginated(page, size, category, search, sort);

        Map<String, Object> response = new HashMap<>();
        response.put("foods", foodPage.getContent());
        response.put("currentPage", foodPage.getNumber());
        response.put("totalItems", foodPage.getTotalElements());
        response.put("totalPages", foodPage.getTotalPages());

        return ResponseEntity.ok(response);
    }




    // Build Get All  Food Rest API

    /*@GetMapping
    public List<FoodResponse> readFoods()
    {
       return foodService.readFoods();
    }*/

    // Build Get single food REST API

    @GetMapping("/{id}")
    public FoodResponse readFood(@PathVariable String id)
    {
        return foodService.readFood(id);
    }


    // Build Delete Food REST API

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFood(@PathVariable String id)
    {
        foodService.deleteFood(id);
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return foodService.getCategories();
    }

    // ----------------- NEW endpoints for stock management -----------------

    /**
     * Adjust stock by delta (positive to increase, negative to decrease).
     * Example: PATCH /api/foods/{id}/stock?delta=-3
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<String> adjustStock(@PathVariable String id,
                                              @RequestParam int delta) {
        foodService.adjustStock(id, delta);
        return ResponseEntity.ok("Stock adjusted by " + delta);
    }

    /**
     * Set stock to an absolute value.
     * Example: PUT /api/foods/{id}/stock?value=10
     */
    @PutMapping("/{id}/stock")
    public ResponseEntity<String> setStock(@PathVariable String id,
                                           @RequestParam int value) {
        foodService.setStock(id, value);
        return ResponseEntity.ok("Stock set to " + value);
    }


    @GetMapping("/best-sellers")
    public List<FoodResponse> bestSellers() {
        return foodService.getBestSellers();
    }

    @GetMapping("/top-selling")
    public List<FoodResponse> topSelling() {
        return foodService.getTopSellingFoods();
    }

    @GetMapping("/featured")
    public List<FoodResponse> featuredFoods() {
        return foodService.getFeaturedFoods();
    }

}
