package com.nisanth.foodapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "foods")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FoodEntity {

    @Id
    private String id;

    private String name;
    private String description;

    // 🔥 PRICING (PHASE 1)
    private double mrp;            // original price
    private double sellingPrice;   // discounted price
    private boolean offerActive;
    private String offerLabel;     // "23% OFF", "Deal of the Day"

    private List<String> categoryIds;
    private String imageUrl;

    private boolean sponsored;
    private boolean featured;

    private int stock;
    private int lowStockThreshold = 5;
    private boolean outOfStock;
}
