package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.io.review.ReviewRequest;
import com.nisanth.foodapi.io.review.ReviewResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface ReviewService {

    List<ReviewEntity> getReviewsByFoodId(String foodId);

    ReviewEntity addReview(String foodId, ReviewRequest review, MultipartFile image);

    List<ReviewResponse> getAllReviewsForAdmin();

    void deleteReview(String id);

    ReviewEntity updateVerifiedStatus(String id, boolean verified);

    ReviewEntity incrementHelpful(String reviewId);
}
