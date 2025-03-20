package com.nisanth.foodapi.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;

@Document(collation = "foods") // collection name
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FoodEntity {


    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private String category;
    private Value.Str imageUrl;

}
