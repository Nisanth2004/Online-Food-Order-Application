package com.nisanth.foodapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "flash_sales")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleEntity {
    @Id
    private String id;


    private String foodId; // FK → Food.id
    private double salePrice;


    private boolean active;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}