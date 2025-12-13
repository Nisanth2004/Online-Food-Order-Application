package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.repository.offers.FlashSaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nisanth.foodapi.entity.*;
import java.time.LocalDateTime;

@Service
public class PricingServiceImpl implements PricingService {

    @Autowired
    private FlashSaleRepository flashSaleRepository;

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
}
