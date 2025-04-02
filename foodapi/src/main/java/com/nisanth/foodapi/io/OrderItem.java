package com.nisanth.foodapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
public class OrderItem {

    private String foodId;
    private int qunatity;
    private double price;
    private String category;
    private String imageUrl;
    private String description;
    private String name;
}
