package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.CouponEntity;
import com.nisanth.foodapi.repository.offers.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    // ✅ GET ALL (ADMIN)
    @GetMapping
    public List<CouponEntity> getAllCoupons() {
        return couponRepository.findAll();
    }

    // ✅ GET BY ID
    @GetMapping("/{id}")
    public CouponEntity getById(@PathVariable String id) {
        return couponRepository.findById(id).orElseThrow();
    }

    // ✅ CREATE
    @PostMapping
    public CouponEntity create(@RequestBody CouponEntity coupon) {
        return couponRepository.save(coupon);
    }

    // ✅ UPDATE
    @PutMapping("/{id}")
    public CouponEntity update(
            @PathVariable String id,
            @RequestBody CouponEntity coupon
    ) {
        coupon.setId(id);
        return couponRepository.save(coupon);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        couponRepository.deleteById(id);
    }


    @GetMapping("/active")
    public List<CouponEntity> getActiveCoupons() {
        return couponRepository.findByActiveTrue();
    }
}
