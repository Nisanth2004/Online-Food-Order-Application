package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.FlashSaleEntity;
import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.repository.FoodRepository;
import com.nisanth.foodapi.repository.offers.FlashSaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/flash-sales")
public class FlashSaleController {

    @Autowired
    private FlashSaleRepository flashSaleRepository;

    @Autowired
    private FoodRepository foodRepository;

    // 🔹 GET ALL (ADMIN)
    @GetMapping
    public List<FlashSaleEntity> getAllFlashSales() {
        return flashSaleRepository.findAll();
    }

    // 🔹 GET ACTIVE (PUBLIC / ADMIN)
    @GetMapping("/active")
    public List<FlashSaleEntity> getActiveFlashSales() {
        LocalDateTime now = LocalDateTime.now();
        return flashSaleRepository
                .findByActiveTrueAndStartTimeBeforeAndEndTimeAfter(now, now);
    }

    // 🔹 CREATE
    @PostMapping
    public FlashSaleEntity create(@RequestBody FlashSaleEntity flashSale) {

        FoodEntity food = foodRepository.findById(flashSale.getFoodId())
                .orElseThrow(() -> new RuntimeException("Food not found"));

        // ✅ SET FOOD NAME HERE
        flashSale.setFoodName(food.getName());

        return flashSaleRepository.save(flashSale);
    }

    // 🔹 UPDATE
    @PutMapping("/{id}")
    public FlashSaleEntity update(
            @PathVariable String id,
            @RequestBody FlashSaleEntity updated
    ) {
        FlashSaleEntity existing = flashSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flash sale not found"));

        existing.setFoodId(updated.getFoodId());
        existing.setFoodName(updated.getFoodName());
        existing.setSalePrice(updated.getSalePrice());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setActive(updated.isActive());

        return flashSaleRepository.save(existing);
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        flashSaleRepository.deleteById(id);
    }
}
