package com.nisanth.foodapi.io.vendors;



import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VendorProfileUpdateRequest {

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
}

