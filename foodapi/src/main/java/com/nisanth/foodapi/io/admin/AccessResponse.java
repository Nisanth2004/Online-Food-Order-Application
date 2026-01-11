package com.nisanth.foodapi.io.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AccessResponse {
    private String token;
    private String role;
    private String status;
}
