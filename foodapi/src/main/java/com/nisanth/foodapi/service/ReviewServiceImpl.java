package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.entity.Setting;
import com.nisanth.foodapi.io.review.ReviewRequest;
import com.nisanth.foodapi.io.review.ReviewResponse;
import com.nisanth.foodapi.repository.FoodRepository;
import com.nisanth.foodapi.repository.ReviewRepository;
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
    public ReviewEntity addReview(
            String foodId,
            ReviewRequest req,
            MultipartFile image
    ) {
        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            imageUrl = uploadFile(image);
        }

        ReviewEntity review = ReviewEntity.builder()
                .foodId(foodId)
                .user(req.getUser())
                .rating(req.getRating())
                .comment(req.getComment())
                .imageUrl(imageUrl)
                .helpful(0)
                .verifiedPurchase(false)
                .createdAt(Instant.now())
                .build();

        return reviewRepository.save(review);
    }

    @Override
    public List<ReviewResponse> getAllReviewsForAdmin() {
        return reviewRepository.findAll().stream().map(r -> {
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
                    .createdAt(
                            r.getCreatedAt() != null ? r.getCreatedAt().toString() : null
                    )
                    .verifiedPurchase(r.isVerifiedPurchase())
                    .imageUrl(r.getImageUrl())
                    .helpful(r.getHelpful())
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
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found")
                );

        review.setVerifiedPurchase(verified);
        return reviewRepository.save(review);
    }

    @Override
    public ReviewEntity incrementHelpful(String reviewId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found")
                );

        review.setHelpful(review.getHelpful() + 1);
        return reviewRepository.save(review);
    }

    private String uploadFile(MultipartFile file) {
        String extension = file.getOriginalFilename()
                .substring(file.getOriginalFilename().lastIndexOf(".") + 1);

        String key = UUID.randomUUID() + "." + extension;
        Setting setting = settingService.getSettings();

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(setting.getAwsBucket())
                    .key(key)
                    .contentType(file.getContentType())
                    .acl("public-read")
                    .build();

            PutObjectResponse response = s3Client.putObject(
                    request,
                    RequestBody.fromBytes(file.getBytes())
            );

            if (!response.sdkHttpResponse().isSuccessful()) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "S3 upload failed"
                );
            }

            return "https://" + setting.getAwsBucket() + ".s3.amazonaws.com/" + key;

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error uploading file"
            );
        }
    }
}
