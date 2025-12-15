package com.nisanth.foodapi.controller;


import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.io.review.ReviewRequest;
import com.nisanth.foodapi.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ReviewEntity> addReview(
            @PathVariable String foodId,
            @ModelAttribute ReviewRequest review,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return ResponseEntity.ok(
                reviewService.addReview(foodId, review, image)
        );
    }


    @PutMapping("/{reviewId}/helpful")
    public ResponseEntity<ReviewEntity> markHelpful(
            @PathVariable String reviewId
    ) {
        return ResponseEntity.ok(
                reviewService.incrementHelpful(reviewId)
        );
    }
}
