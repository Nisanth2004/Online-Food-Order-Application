package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public List<ReviewEntity> getReviewsByFoodId(String foodId) {
        return reviewRepository.findByFoodId(foodId);
    }

    public ReviewEntity addReview(String foodId, ReviewEntity review) {
        review.setFoodId(foodId);
        review.setCreatedAt(Instant.now());
        return reviewRepository.save(review);
    }
}
