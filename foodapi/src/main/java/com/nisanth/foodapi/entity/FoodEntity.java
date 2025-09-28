package com.nisanth.foodapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "foods") // collection name
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FoodEntity {

    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private List<String> categoryIds;
    private String imageUrl;
    private boolean sponsored;
    private boolean featured;


}
