package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.*;
import com.nisanth.foodapi.io.food.FoodRequest;
import com.nisanth.foodapi.io.food.FoodResponse;
import com.nisanth.foodapi.repository.*;
import com.nisanth.foodapi.repository.offers.FlashSaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
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
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FoodServiceImpl implements FoodService {

    @Autowired
    private S3Client s3Client;

    @Autowired
    private StockLogRepository stockLogRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private SettingService settingService;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private FlashSaleRepository flashSaleRepository;

    @Override
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
    public FoodResponse updateFood(String id, FoodRequest req, MultipartFile file) {
        FoodEntity food = foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Food not found"));

        food.setName(req.getName());
        food.setDescription(req.getDescription());

        // 🔥 PRICING
        food.setMrp(req.getMrp());
        food.setSellingPrice(req.getSellingPrice());
        food.setOfferActive(req.isOfferActive());
        food.setOfferLabel(req.getOfferLabel());

        food.setCategoryIds(req.getCategoryIds());
        food.setSponsored(req.isSponsored());
        food.setFeatured(req.isFeatured());
        food.setStock(req.getStock());
        food.setLowStockThreshold(
                req.getLowStockThreshold() > 0 ? req.getLowStockThreshold() : 5);
        food.setOutOfStock(food.getStock() <= 0);

        if (file != null && !file.isEmpty()) {
            food.setImageUrl(uploadFile(file));
        }

        return convertToResponse(foodRepository.save(food));
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
                .orElseThrow(() -> new RuntimeException("Food not found"));

        int oldStock = food.getStock();
        int newStock = Math.max(0, oldStock + delta);

        food.setStock(newStock);
        food.setOutOfStock(newStock <= 0);
        foodRepository.save(food);

        logStockChange(foodId, food.getName(), oldStock, newStock, "system", "auto_adjust");
    }


    @Override
    public void setStock(String foodId, int newStock) {
        FoodEntity food = foodRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));

        int oldStock = food.getStock();

        food.setStock(newStock);
        food.setOutOfStock(newStock <= 0);
        foodRepository.save(food);

        logStockChange(foodId, food.getName(), oldStock, newStock, "admin", "manual_update");
    }


    @Override
    public Page<FoodResponse> getFoodsPaginated(
            int page, int size, String category, String search, String sort) {

        Pageable pageable = PageRequest.of(page, size);
        List<FoodEntity> foods = foodRepository.findAll();

        if (category != null && !"All".equalsIgnoreCase(category)) {
            foods = foods.stream()
                    .filter(f -> f.getCategoryIds() != null &&
                            f.getCategoryIds().contains(category))
                    .toList();
        }

        if (search != null && !search.isBlank()) {
            foods = foods.stream()
                    .filter(f -> f.getName()
                            .toLowerCase().contains(search.toLowerCase()))
                    .toList();
        }

        if ("priceLowHigh".equals(sort)) {
            foods.sort(Comparator.comparingDouble(FoodEntity::getSellingPrice));
        } else if ("priceHighLow".equals(sort)) {
            foods.sort(Comparator.comparingDouble(
                    FoodEntity::getSellingPrice).reversed());
        }

        int start = (int) pageable.getOffset();
        int end = Math.min(start + size, foods.size());

        List<FoodResponse> content = foods.subList(start, end)
                .stream()
                .map(this::convertToResponse)
                .toList();

        return new PageImpl<>(content, pageable, foods.size());
    }


    @Override
    public boolean deleteFile(String filename) {
        Setting s = settingService.getSettings();
        String bucketName = s.getAwsBucket();
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
    private FoodEntity convertToEntity(FoodRequest req) {
        int stock = Math.max(0, req.getStock());

        return FoodEntity.builder()
                .name(req.getName())
                .description(req.getDescription())
                .mrp(req.getMrp())
                .sellingPrice(req.getSellingPrice())
                .offerActive(req.isOfferActive())
                .offerLabel(req.getOfferLabel())
                .categoryIds(req.getCategoryIds())
                .sponsored(req.isSponsored())
                .featured(req.isFeatured())
                .stock(stock)
                .lowStockThreshold(
                        req.getLowStockThreshold() > 0
                                ? req.getLowStockThreshold()
                                : 5)
                .outOfStock(stock == 0)
                .soldCount(0L)
                .bestSeller(false)
                .build();
    }
    public FoodResponse convertToResponse(FoodEntity food) {

        FoodResponse res = new FoodResponse();

        // BASIC
        res.setId(food.getId());
        res.setName(food.getName());
        res.setDescription(food.getDescription());
        res.setImageUrl(food.getImageUrl());

        // PRICING
        res.setMrp(food.getMrp());

        Optional<FlashSaleEntity> flashSaleOpt =
                flashSaleRepository.findByFoodIdAndActiveTrueAndStartTimeBeforeAndEndTimeAfter(
                        food.getId(),
                        LocalDateTime.now(),
                        LocalDateTime.now()
                );

        double finalPrice;

        if (flashSaleOpt.isPresent()) {
            FlashSaleEntity fs = flashSaleOpt.get();

            finalPrice = fs.getSalePrice();
            res.setFlashSaleActive(true);
            res.setFlashSalePrice(fs.getSalePrice());
            res.setFlashSaleEndTime(fs.getEndTime());
            res.setOfferLabel("FLASH SALE");

        } else {
            finalPrice = pricingService.getEffectivePrice(food);
            res.setFlashSaleActive(false);
            res.setFlashSalePrice(null);
            res.setFlashSaleEndTime(null);
            res.setOfferLabel(food.getOfferLabel());
        }

        res.setSellingPrice(finalPrice);
        res.setPrice(finalPrice);

        // DISCOUNT %
        int discountPercentage = 0;
        if (food.getMrp() > 0 && finalPrice < food.getMrp()) {
            discountPercentage =
                    (int) (((food.getMrp() - finalPrice) / food.getMrp()) * 100);
        }
        res.setDiscountPercentage(discountPercentage);

        // FLAGS
        res.setSponsored(food.isSponsored());
        res.setFeatured(food.isFeatured());
        res.setSoldCount(food.getSoldCount());


        // STOCK
        res.setStock(food.getStock());
        res.setOutOfStock(food.isOutOfStock());
        res.setLowStock(food.getStock() <= food.getLowStockThreshold());

        // CATEGORIES
        List<String> categoryNames = Collections.emptyList();
        if (food.getCategoryIds() != null && !food.getCategoryIds().isEmpty()) {
            categoryNames = categoryRepository.findAllById(food.getCategoryIds())
                    .stream()
                    .map(Category::getName)
                    .collect(Collectors.toList());
        }
        res.setCategories(categoryNames);

        // REVIEWS
        List<ReviewEntity> reviews = reviewRepository.findByFoodId(food.getId());
        if (!reviews.isEmpty()) {
            double avg = reviews.stream().mapToInt(ReviewEntity::getRating).average().orElse(0);
            res.setAverageRating(avg);
            res.setReviewCount(reviews.size());
        } else {
            res.setAverageRating(0);
            res.setReviewCount(0);
        }

        // ORDERS
        res.setOrderCount(orderRepository.countByOrderedItemsFoodId(food.getId()));
        res.setBestSeller(food.isBestSeller());


        return res;
    }



    @Override
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Atomically decrement stock by qty if enough stock exists.
     * Returns true if reservation succeeded, false otherwise.
     */
    @Override
    public boolean tryReserveStock(String foodId, int qty) {
        if (qty <= 0) return false;

        FoodEntity food = foodRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));

        int oldStock = food.getStock();

        if (oldStock < qty) return false;

        int newStock = oldStock - qty;

        food.setStock(newStock);
        food.setOutOfStock(newStock <= 0);
        foodRepository.save(food);

        logStockChange(foodId, food.getName(), oldStock, newStock, "user", "order_reservation");

        return true;
    }


    /**
     * Release previously reserved stock (increment by qty).
     * If food not found, throws 404.
     */
    @Override
    public void releaseReservedStock(String foodId, int qty) {
        if (qty <= 0) return;

        FoodEntity food = foodRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));

        int oldStock = food.getStock();
        int newStock = oldStock + qty;

        food.setStock(newStock);
        food.setOutOfStock(false);
        foodRepository.save(food);

        logStockChange(foodId, food.getName(), oldStock, newStock, "system", "cancel_order_restore");
    }



    // logs
    private void logStockChange(String foodId, String foodName, int oldStock, int newStock, String updatedBy, String reason) {
        StockLogEntity log = StockLogEntity.builder()
                .foodId(foodId)
                .foodName(foodName)
                .oldStock(oldStock)
                .newStock(newStock)
                .change(newStock - oldStock)
                .updatedBy(updatedBy)
                .reason(reason)
                .timestamp(new Date())
                .build();

        stockLogRepository.save(log);
    }


    @Override
    public double getEffectivePrice(FoodEntity food) {

        return flashSaleRepository
                .findByFoodIdAndActiveTrueAndStartTimeBeforeAndEndTimeAfter(
                        food.getId(),
                        LocalDateTime.now(),
                        LocalDateTime.now()
                )
                .map(FlashSaleEntity::getSalePrice)
                .orElse(food.getSellingPrice());
    }

    @Override
    public List<FoodResponse> getBestSellers() {
        return foodRepository.findTop8ByBestSellerTrueOrderBySoldCountDesc()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public List<FoodResponse> getTopSellingFoods() {
        return foodRepository.findTop8ByOrderBySoldCountDesc()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public List<FoodResponse> getFeaturedFoods() {
        return foodRepository.findTop8ByFeaturedTrue()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public void increaseSoldCount(String foodId, int qty) {

        FoodEntity food = foodRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));

        long updatedSoldCount = food.getSoldCount() + qty;
        food.setSoldCount(updatedSoldCount);

        // ⭐ AUTO BEST SELLER LOGIC
        food.setBestSeller(updatedSoldCount >= 50);

        foodRepository.save(food);
    }






}
