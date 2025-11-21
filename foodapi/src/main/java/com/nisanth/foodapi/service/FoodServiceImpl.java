package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.Category;
import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.io.FoodRequest;
import com.nisanth.foodapi.io.FoodResponse;
import com.nisanth.foodapi.repository.CategoryRepository;
import com.nisanth.foodapi.repository.FoodRepository;
import com.nisanth.foodapi.repository.OrderRepository;
import com.nisanth.foodapi.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.IOException;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FoodServiceImpl implements FoodService {

    @Autowired
    private S3Client s3Client;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Value("${aws.s3.bucketname}")
    private String bucketName;

    @Override
    public String uploadFile(MultipartFile file) {
        String fileNameExtension = file.getOriginalFilename()
                .substring(file.getOriginalFilename().lastIndexOf(".") + 1);

        String key = UUID.randomUUID().toString() + "." + fileNameExtension;
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
    public FoodResponse addFood(FoodRequest request, MultipartFile file) {
        FoodEntity newFoodEntity = convertToEntity(request);
        String imageUrl = uploadFile(file);
        newFoodEntity.setImageUrl(imageUrl);

        // Ensure stock and outOfStock flags are consistent
        if (newFoodEntity.getStock() <= 0) {
            newFoodEntity.setOutOfStock(true);
        } else {
            newFoodEntity.setOutOfStock(false);
        }
        newFoodEntity = foodRepository.save(newFoodEntity);
        return convertToResponse(newFoodEntity);
    }

    @Override
    public List<FoodResponse> readFoods() {
        return foodRepository.findAllByOrderBySponsoredDescFeaturedDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FoodResponse readFood(String id) {
        FoodEntity food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found with id: " + id));
        return convertToResponse(food);
    }

    @Override
    public void adjustStock(String foodId, int delta) {
        FoodEntity food = foodRepository.findById(foodId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found"));
        int newStock = food.getStock() + delta;
        food.setStock(Math.max(newStock, 0));
        food.setOutOfStock(food.getStock() <= 0);
        foodRepository.save(food);
    }
    @Override
    public Page<FoodResponse> getFoodsPaginated(int page, int size, String category, String search, String sort) {

        Pageable pageable = PageRequest.of(page, size);

        List<FoodEntity> foods = foodRepository.findAllByOrderBySponsoredDescFeaturedDesc();

        // FILTER BY CATEGORY
        if (category != null && !category.equals("All")) {
            foods = foods.stream()
                    .filter(f -> f.getCategoryIds() != null && f.getCategoryIds()
                            .stream()
                            .anyMatch(c -> c.equalsIgnoreCase(category)))
                    .collect(Collectors.toList());
        }

        // SEARCH FILTER
        if (search != null && !search.isEmpty()) {
            foods = foods.stream()
                    .filter(f -> f.getName().toLowerCase().contains(search.toLowerCase()))
                    .collect(Collectors.toList());
        }

        // SORTING
        if ("highlyOrdered".equals(sort)) {
            foods.sort(Comparator.comparingLong((FoodEntity f) -> orderRepository.countByOrderedItemsFoodId(f.getId())).reversed());
        } else if ("priceLowHigh".equals(sort)) {
            foods.sort(Comparator.comparingDouble(FoodEntity::getPrice));
        } else if ("priceHighLow".equals(sort)) {
            foods.sort(Comparator.comparingDouble(FoodEntity::getPrice).reversed());
        }

        // PAGINATE manually because we now have a filtered list
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), foods.size());
        List<FoodResponse> pageContent = foods.subList(start, end)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(pageContent, pageable, foods.size());
    }


    @Override
    public boolean deleteFile(String filename) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(filename)
                .build();
        s3Client.deleteObject(deleteObjectRequest);
        return true;
    }

    @Override
    public void deleteFood(String id) {
        FoodResponse response = readFood(id);
        String imageUrl = response.getImageUrl();
        String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        boolean isFileDeleted = deleteFile(filename);

        if (isFileDeleted) {
            foodRepository.deleteById(response.getId());
        }
    }
    private FoodEntity convertToEntity(FoodRequest request) {
        int stock = Math.max(0, request.getStock()); // prevent negative stock
        int threshold = request.getLowStockThreshold() > 0
                ? request.getLowStockThreshold()
                : 5; // default fallback

        return FoodEntity.builder()
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .categoryIds(request.getCategoryIds())
                .sponsored(request.isSponsored())
                .featured(request.isFeatured())
                .stock(stock)
                .lowStockThreshold(threshold)
                .outOfStock(stock == 0)
                .build();
    }


    public FoodResponse convertToResponse(FoodEntity food) {
        FoodResponse res = new FoodResponse();
        res.setId(food.getId());
        res.setName(food.getName());
        res.setDescription(food.getDescription());
        res.setImageUrl(food.getImageUrl());
        res.setPrice(food.getPrice());
        res.setSponsored(food.isSponsored());
        res.setFeatured(food.isFeatured());
        res.setStock(food.getStock());
        res.setOutOfStock(food.isOutOfStock());
        res.setLowStockThreshold(food.getLowStockThreshold());

        // categories, reviews and orderCount logic unchanged...
        // ... (same as before)
        List<String> categoryNames = Collections.emptyList();
        if (food.getCategoryIds() != null && !food.getCategoryIds().isEmpty()) {
            categoryNames = categoryRepository.findAllById(food.getCategoryIds())
                    .stream()
                    .map(Category::getName)
                    .collect(Collectors.toList());
        }
        res.setCategories(categoryNames);

        List<ReviewEntity> reviews = reviewRepository.findByFoodId(food.getId());
        if (!reviews.isEmpty()) {
            double avg = reviews.stream()
                    .mapToInt(ReviewEntity::getRating)
                    .average()
                    .orElse(0.0);
            res.setAverageRating(avg);
            res.setReviewCount(reviews.size());
        } else {
            res.setAverageRating(0.0);
            res.setReviewCount(0);
        }
        long orderCount = orderRepository.countByOrderedItemsFoodId(food.getId());
        res.setOrderCount(orderCount);

        return res;
    }

    @Override
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }
}
