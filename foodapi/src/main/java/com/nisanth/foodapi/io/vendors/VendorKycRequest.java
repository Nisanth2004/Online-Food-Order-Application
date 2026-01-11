package com.nisanth.foodapi.io.vendors;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class VendorKycRequest {

    private String gstNumber;
    private String panNumber;
    private String businessType;

    private String bankAccountName;
    private String bankName;
    private String bankAccountNumber;
    private String ifscCode;
    
}

