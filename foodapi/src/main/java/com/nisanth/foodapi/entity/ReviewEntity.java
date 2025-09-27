package com.nisanth.foodapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "reviews")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewEntity {

    @Id
    private String id;
    private String foodId;
    private String user;
    private int rating;
    private String comment;
    private Instant createdAt;
    private boolean verifiedPurchase;
}
