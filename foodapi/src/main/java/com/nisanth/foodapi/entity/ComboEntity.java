package com.nisanth.foodapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "combos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComboEntity {
    @Id
    private String id;


    private String name; // Burger + Fries Combo
    private List<String> foodIds; // FK → Food.id


    private double originalPrice;
    private double comboPrice;


    private boolean active;
    private String promotionId;

    // ✅ REQUIRED for festival / flash logic
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String imageUrl;
}