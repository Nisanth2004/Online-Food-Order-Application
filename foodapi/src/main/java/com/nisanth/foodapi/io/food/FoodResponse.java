package com.nisanth.foodapi.io.food;

import com.nisanth.foodapi.entity.FoodEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;

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
    private java.util.List<String> categories;
    private boolean sponsored;
    private boolean featured;
    private double averageRating;
    private int reviewCount;
    private long orderCount;
    private int stock;
    private boolean outOfStock;
    private int lowStockThreshold;
    private boolean lowStock;

    // NEW: Static mapper method
    public static FoodResponse from(FoodEntity entity) {
        if (entity == null) return null;

        return FoodResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .price(entity.getPrice())
                .categories(entity.getCategoryIds() != null ? entity.getCategoryIds() : Collections.emptyList())
                .sponsored(entity.isSponsored())
                .featured(entity.isFeatured())
                .stock(entity.getStock())
                .lowStockThreshold(entity.getLowStockThreshold())
                .outOfStock(entity.getStock() <= 0)
                .lowStock(entity.getStock() > 0 && entity.getStock() <= entity.getLowStockThreshold())
                .build();
    }
}
