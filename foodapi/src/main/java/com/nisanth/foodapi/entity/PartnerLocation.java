package com.nisanth.foodapi.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document("partner_locations")
public class PartnerLocation {

    @Id
    private String id;

    private String partnerId;   // who is delivering
    private String orderId;     // optional – attach when OUT_FOR_DELIVERY

    private double latitude;
    private double longitude;

    @Indexed(expireAfterSeconds = 300) // auto-delete after 5 minutes
    private Instant createdAt;
}
