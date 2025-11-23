package com.nisanth.foodapi.io;

import lombok.Data;

@Data
public class CourierUpdateRequest {
    private String courierId;
    private String trackingId;
}
