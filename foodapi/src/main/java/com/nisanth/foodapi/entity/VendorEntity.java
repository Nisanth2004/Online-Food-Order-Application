package com.nisanth.foodapi.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "vendors")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorEntity {

    @Id
    private String id;

    private String accountId;

    // BUSINESS
    private String companyName;
    private String brandName;
    private String contactPerson;
    private String phone;

    // ADDRESS
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String country;

    // OPERATIONAL
    private String redirectUrl;
}
