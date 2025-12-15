package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.CouponEntity;
import com.nisanth.foodapi.repository.offers.CouponRepository;
import com.nisanth.foodapi.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private FoodService fileUploadService;

    // ✅ GET ALL
    @GetMapping
    public List<CouponEntity> getAllCoupons() {
        return couponRepository.findAll();
    }

    // ✅ GET BY ID
    @GetMapping("/{id}")
    public CouponEntity getById(@PathVariable String id) {
        return couponRepository.findById(id).orElseThrow();
    }

    // ✅ CREATE WITH IMAGE
    @PostMapping(consumes = "multipart/form-data")
    public CouponEntity createCoupon(
            @RequestPart("data") CouponEntity coupon,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        if (image != null && !image.isEmpty()) {
            String imageUrl = fileUploadService.uploadFile(image);
            coupon.setImageUrl(imageUrl);
        }
        return couponRepository.save(coupon);
    }

    // ✅ UPDATE WITH IMAGE
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public CouponEntity updateCoupon(
            @PathVariable String id,
            @RequestPart("data") CouponEntity coupon,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        coupon.setId(id);

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileUploadService.uploadFile(image);
            coupon.setImageUrl(imageUrl);
        }

        return couponRepository.save(coupon);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        couponRepository.deleteById(id);
    }

    // ✅ ACTIVE COUPONS (for slider)
    @GetMapping("/active")
    public List<CouponEntity> getActiveCoupons() {
        return couponRepository.findByActiveTrue();
    }

    @PostMapping("/apply")
    public Map<String, Object> applyCoupon(
            @RequestParam String code,
            @RequestParam double subtotal
    ) {
        CouponEntity coupon = couponRepository
                .findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Invalid or inactive coupon"));

        if (coupon.getExpiryDate() != null &&
                coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Coupon expired");
        }

        if (subtotal < coupon.getMinOrderAmount()) {
            throw new RuntimeException(
                    "Minimum order value ₹" + coupon.getMinOrderAmount()
            );
        }

        double discount = subtotal * coupon.getDiscountPercent() / 100;

        Map<String, Object> res = new HashMap<>();
        res.put("discount", discount);
        res.put("code", coupon.getCode());
        res.put("discountPercent", coupon.getDiscountPercent());

        return res;
    }



}
