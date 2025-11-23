package com.nisanth.foodapi.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "couriers")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Courier {
    @Id
    private String id;

    private String name;       // DTDC, ST Courier, Blue Dart...
    private String trackUrl;   // base website URL
}
