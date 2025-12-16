package com.nisanth.foodapi.io.order;

import lombok.*;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItem {

    // 🔥 REQUIRED
    private String type; // FOOD or COMBO

    private String foodId;   // used if FOOD
    private String comboId;  // used if COMBO

    private Integer quantity;

    // 🔥 pricing snapshot
    private Double mrp;
    private Double sellingPrice;

    @Builder.Default
    private Integer discountPercentage = 0;
    private String offerLabel;

    @Builder.Default
    private Double price = 0.0;


    private String category;
    private String imageUrl;
    private String description;
    private String name;
}

