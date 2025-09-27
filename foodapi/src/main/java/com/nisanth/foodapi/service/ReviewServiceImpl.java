package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.io.ReviewResponse;
import com.nisanth.foodapi.repository.ReviewRepository;
import com.nisanth.foodapi.repository.FoodRepository;
import com.nisanth.foodapi.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final FoodRepository foodRepository;

    @Override
    public List<ReviewEntity> getReviewsByFoodId(String foodId) {
        return reviewRepository.findByFoodId(foodId);
    }

    @Override
    public ReviewEntity addReview(String foodId, ReviewEntity review) {
        review.setFoodId(foodId);
        review.setCreatedAt(Instant.now());
        review.setVerifiedPurchase(false);
        return reviewRepository.save(review);
    }

    @Override
    public List<ReviewResponse> getAllReviewsForAdmin() {
        List<ReviewEntity> reviews = reviewRepository.findAll();

        return reviews.stream().map(r -> {
            String foodName = "Unknown";
            if (r.getFoodId() != null) {
                FoodEntity food = foodRepository.findById(r.getFoodId()).orElse(null);
                if (food != null) foodName = food.getName();
            }
            return ReviewResponse.builder()
                    .id(r.getId())
                    .foodId(r.getFoodId())
                    .foodName(foodName)
                    .user(r.getUser())
                    .rating(r.getRating())
                    .comment(r.getComment())
                    .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                    .verifiedPurchase(r.isVerifiedPurchase())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public void deleteReview(String id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found");
        }
        reviewRepository.deleteById(id);
    }

    @Override
    public ReviewEntity updateVerifiedStatus(String id, boolean verified) {
        ReviewEntity review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        review.setVerifiedPurchase(verified);
        return reviewRepository.save(review);
    }

}
