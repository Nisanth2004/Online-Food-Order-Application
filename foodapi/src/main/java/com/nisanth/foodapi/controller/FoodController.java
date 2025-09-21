package com.nisanth.foodapi.controller;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nisanth.foodapi.io.FoodRequest;
import com.nisanth.foodapi.io.FoodResponse;
import com.nisanth.foodapi.service.FoodService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

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

    // Build Get All  Food Rest API

    @GetMapping
    public List<FoodResponse> readFoods()
    {
       return foodService.readFoods();
    }

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
    public List<String> getCategories() {
        return foodService.getCategories();
    }


}
