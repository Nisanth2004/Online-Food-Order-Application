package com.nisanth.foodapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "coupons")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CouponEntity {
    @Id
    private String id;


    private String code; // SAVE20
    private int discountPercent;
    private double minOrderAmount;


    private boolean active;
    private LocalDateTime expiryDate;

    private String imageUrl;
}