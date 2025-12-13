package com.nisanth.foodapi.io.order;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItem {

    private String foodId;
    private Integer quantity;

    // 🔥 pricing snapshot
    private double mrp;
    private double sellingPrice;
    private int discountPercentage;
    private String offerLabel;

    private double price; // final unit price

    private String category;
    private String imageUrl;
    private String description;
    private String name;
}
