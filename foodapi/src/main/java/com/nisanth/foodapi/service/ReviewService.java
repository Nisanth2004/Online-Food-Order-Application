package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.io.ReviewResponse;

import java.util.List;

public interface ReviewService {
    List<ReviewEntity> getReviewsByFoodId(String foodId);
    ReviewEntity addReview(String foodId, ReviewEntity review);
    List<ReviewResponse> getAllReviewsForAdmin();
    void deleteReview(String id);
    ReviewEntity updateVerifiedStatus(String id, boolean verified);
}
