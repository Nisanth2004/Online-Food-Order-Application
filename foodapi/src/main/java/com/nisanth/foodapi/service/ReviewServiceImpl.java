package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.entity.Setting;
import com.nisanth.foodapi.io.review.ReviewResponse;
import com.nisanth.foodapi.repository.ReviewRepository;
import com.nisanth.foodapi.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final FoodRepository foodRepository;

    private final SettingService settingService;
    private final S3Client s3Client;


    @Override
    public List<ReviewEntity> getReviewsByFoodId(String foodId) {
        return reviewRepository.findByFoodId(foodId);
    }

    @Override
    public ReviewEntity addReview(String foodId, ReviewEntity review, MultipartFile image) {

        review.setFoodId(foodId);
        review.setCreatedAt(Instant.now());
        review.setVerifiedPurchase(false);

        // If image uploaded → upload to S3
        if (image != null && !image.isEmpty()) {
            String imageUrl = uploadFile(image);
            review.setImageUrl(imageUrl);
        }

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


    public String uploadFile(MultipartFile file) {
        String fileNameExtension = file.getOriginalFilename()
                .substring(file.getOriginalFilename().lastIndexOf(".") + 1);

        String key = UUID.randomUUID().toString() + "." + fileNameExtension;
        Setting s = settingService.getSettings();
        String bucketName = s.getAwsBucket();

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .acl("public-read")
                    .contentType(file.getContentType())
                    .build();

            PutObjectResponse response = s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromBytes(file.getBytes())
            );

            if (response.sdkHttpResponse().isSuccessful()) {
                return "https://" + bucketName + ".s3.amazonaws.com/" + key;
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File Upload failed");
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error uploading file");
        }
    }
    @Override
    public ReviewEntity incrementHelpful(String reviewId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        review.setHelpful(review.getHelpful() + 1);
        return reviewRepository.save(review);
    }

}
