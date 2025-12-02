package com.nisanth.foodapi.io;

import lombok.Data;

@Data
public class DeliveryMessage {
    private String message;
    private String timestamp;

    public DeliveryMessage() {
        this.message = message;
        this.timestamp = timestamp;
    }
}
