package com.nisanth.foodapi.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "promotions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PromotionEntity {

    @Id
    private String id;
    private String title; // Big Indian Festival Sale
    private String bannerImage;
    private String type; // FESTIVAL | FLASH | COMBO


    private boolean active;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
