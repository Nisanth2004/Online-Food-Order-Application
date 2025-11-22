package com.nisanth.foodapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private double price;
    private List<String> categories;
    private boolean sponsored;
    private boolean featured;
    private double averageRating;
    private int reviewCount;

    private long orderCount;

    private int stock;
    private boolean outOfStock;
    private int lowStockThreshold;
    // NEW: true when stock <= lowStockThreshold (helps UI for low-stock alerts)
    private boolean lowStock;
}
