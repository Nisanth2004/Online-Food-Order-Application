package com.nisanth.foodapi.io.admin;


import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AccessRequest {
    private String email;
    private String password;
}