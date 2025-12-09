package com.nisanth.foodapi.io.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private String id;
    private String foodId;
    private String foodName;       // fetched from FoodEntity
    private String user;
    private int rating;
    private String comment;
    private String createdAt;     // ISO string
    private boolean verifiedPurchase;
}
