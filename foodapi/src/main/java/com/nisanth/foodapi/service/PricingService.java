package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.FoodEntity;

public interface PricingService {
    double getEffectivePrice(FoodEntity food);
}
