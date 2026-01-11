package com.nisanth.foodapi.io.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VendorRegisterRequest {

    private String companyName;
    private String email;
    private String password;
    private String phone;
}