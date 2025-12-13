package com.nisanth.foodapi.io.food;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FoodRequest {

    private String name;
    private String description;

    // 🔥 PRICING
    private double mrp;
    private double sellingPrice;
    private boolean offerActive;
    private String offerLabel;

    private List<String> categoryIds;
    private boolean sponsored;
    private boolean featured;
    private int stock;
    private int lowStockThreshold;
}

