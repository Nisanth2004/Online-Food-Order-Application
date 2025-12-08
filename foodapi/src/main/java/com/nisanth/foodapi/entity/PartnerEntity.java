package com.nisanth.foodapi.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document("delivery_partners")
public class PartnerEntity {

    @Id
    private String id;

    private String name;
    private String phone;
    private String password;

    private String role; // DELIVERY_BOY or HUB_STAFF
}
