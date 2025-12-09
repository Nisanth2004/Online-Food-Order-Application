package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.entity.UserEntity;
import com.nisanth.foodapi.io.food.FoodResponse;
import com.nisanth.foodapi.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nisanth.foodapi.repository.UserRepsitory;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
   private UserRepsitory userRepo;

    @Autowired
    private FoodRepository foodRepo;
    @PostMapping("/add/{foodId}")
    public ResponseEntity<?> addToWishlist(@PathVariable String foodId, @RequestParam String userId) {
        UserEntity user = userRepo.findByEmail(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getWishlist().contains(foodId)) {
            user.getWishlist().add(foodId);
        }
        userRepo.save(user);

        return ResponseEntity.ok("Added to wishlist");
    }

    @GetMapping("/{userId}")
    public List<FoodResponse> getWishlist(@PathVariable String userId) {
        UserEntity user = userRepo.findByEmail(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FoodEntity> foods = foodRepo.findByIdIn(user.getWishlist());
        return foods.stream().map(FoodResponse::from).toList();
    }


    @DeleteMapping("/remove/{foodId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable String foodId, @RequestParam String userId) {

        UserEntity user = userRepo.findByEmail(userId).orElseThrow();
        user.getWishlist().remove(foodId);
        userRepo.save(user);

        return ResponseEntity.ok("Removed");
    }


}
