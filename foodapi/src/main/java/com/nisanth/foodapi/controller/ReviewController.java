package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods/{foodId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewEntity>> getReviews(@PathVariable String foodId) {
        return ResponseEntity.ok(reviewService.getReviewsByFoodId(foodId));
    }

    @PostMapping
    public ResponseEntity<ReviewEntity> addReview(
            @PathVariable String foodId,
            @RequestBody ReviewEntity review) {
        return ResponseEntity.ok(reviewService.addReview(foodId, review));
    }
}
