package com.nisanth.foodapi.io;

import lombok.Data;

@Data
public class LocationRequest {
    private double latitude;
    private double longitude;
    private String timestamp;
}