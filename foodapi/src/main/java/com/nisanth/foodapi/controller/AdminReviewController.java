package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.io.ReviewResponse;
import com.nisanth.foodapi.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviewsForAdmin());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}/verify")
    public ResponseEntity<ReviewEntity> updateVerified(
            @PathVariable String id,
            @RequestParam boolean verified
    ) {
        return ResponseEntity.ok(reviewService.updateVerifiedStatus(id, verified));
    }
}
