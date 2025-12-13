package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.PromotionEntity;
import com.nisanth.foodapi.repository.offers.PromotionRepository;
import com.nisanth.foodapi.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@CrossOrigin // ✅ important for React
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    // this service is only used for upload file
    @Autowired
    private FoodService fileUploadService;

    // ✅ GET ALL
    @GetMapping
    public List<PromotionEntity> getAll() {
        return promotionRepository.findAll();
    }

    // ✅ GET BY ID
    @GetMapping("/{id}")
    public PromotionEntity getById(@PathVariable String id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
    }

    // ✅ CREATE (IMAGE UPLOAD)
    @PostMapping(consumes = "multipart/form-data")
    public PromotionEntity create(
            @RequestPart("data") PromotionEntity promotion,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        if (image != null && !image.isEmpty()) {
            String imageUrl = fileUploadService.uploadFile(image);
            promotion.setBannerImage(imageUrl);
        }
        return promotionRepository.save(promotion);
    }

    // ✅ UPDATE (IMAGE OPTIONAL)
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public PromotionEntity update(
            @PathVariable String id,
            @RequestPart("data") PromotionEntity promotion,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        promotion.setId(id);

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileUploadService.uploadFile(image);
            promotion.setBannerImage(imageUrl);
        }

        return promotionRepository.save(promotion);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        promotionRepository.deleteById(id);
    }

    // ✅ ACTIVE PROMOTIONS
    @GetMapping("/active")
    public List<PromotionEntity> getActivePromotions() {
        return promotionRepository.findByActiveTrue();
    }
}
