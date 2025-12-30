package com.nisanth.foodapi.io.food;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodResponse {

    private String id;
    private String name;
    private String description;
    private String imageUrl;

    // 🔥 Pricing
    private double mrp;
    private double sellingPrice;
    private int discountPercentage;
    private String offerLabel;

    // ⚡ FLASH SALE
    private boolean flashSaleActive;
    private Double flashSalePrice;
    private LocalDateTime flashSaleEndTime;

    // ⭐ Ratings
    private double averageRating;
    private int reviewCount;

    // 📦 Orders
    private long orderCount;

    // 🏷 Categories
    private List<String> categories;

    // 🚀 Flags
    private boolean sponsored;
    private boolean featured;

    // 📊 Stock
    private int stock;
    private boolean outOfStock;
    private boolean lowStock;

    // ⚠️ backward compatibility
    private double price;
    private long soldCount;
    private boolean bestSeller;



}

