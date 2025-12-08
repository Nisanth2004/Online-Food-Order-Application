package com.nisanth.foodapi.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("delivery_boys")
public class DeliveryBoy {

    @Id
    private String id;

    private String name;
    private String email;
    private String password; // hashed
    private String hubName;  // Assigned hub
}
